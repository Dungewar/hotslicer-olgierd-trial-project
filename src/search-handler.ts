import {google, youtube_v3} from 'googleapis';
import * as dotenv from 'dotenv';
import {decodeHtmlEntities} from "./utils";

// Load environment variables
dotenv.config();

// Update the interface to make all fields optional since they might be undefined
interface VideoResult {
    title: string;            // Required
    videoId: string;          // Required
    channelTitle: string;     // Required
    thumbnail?: string;       // Optional
    description?: string;     // Optional
    views?: string;           // Optional
    duration?: string;        // Optional
    likes?: string;          // Optional
}

// Create YouTube client as a function to ensure env is loaded
function getYoutubeClient() {
    if (!process.env.YOUTUBE_API_KEY) {
        throw new Error('YouTube API key not found in environment variables');
    }
    return google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
    });
}

// In search-handler.ts
function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i, // Standard and shortened URLs
        /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export async function searchVideo(query: string): Promise<VideoResult[] | null> {
    function verifiedInfo(videoInfo: youtube_v3.Schema$Video | undefined) {
        if (!videoInfo?.snippet?.title || !videoInfo.id || !videoInfo.snippet?.channelTitle) {
            return null;
        }

        const result: VideoResult = {
            title: videoInfo.snippet.title,
            videoId: videoInfo.id,
            channelTitle: videoInfo.snippet.channelTitle,
            thumbnail: videoInfo.snippet.thumbnails?.default?.url ?? undefined,
            description: videoInfo.snippet.description ?? undefined,
            views: videoInfo.statistics?.viewCount ?? undefined,
            duration: videoInfo.contentDetails?.duration ?? undefined,
            likes: videoInfo.statistics?.likeCount ?? undefined
        };

        return [result];
    }

    try {
        const videoId = extractVideoId(query);
        const youtube = getYoutubeClient();

        if (videoId) {
            // Direct video ID lookup
            const videoInfo = await getVideoInfo(videoId);


            return verifiedInfo(videoInfo);
        } else {
            // Search query
            const searchResponse = await youtube.search.list({
                part: ['snippet'],
                q: query,
                maxResults: 5,
                type: ['video']
            });

            if (!searchResponse.data.items?.[0]?.id?.videoId) {
                return null;
            }

            const videoInfo = await getVideoInfo(searchResponse.data.items[0].id.videoId);
            return verifiedInfo(videoInfo);
        }
    } catch (error) {
        console.error('Error with YouTube operation:', error);
        throw error;
    }
}

// Example function to get video details
export async function getVideoInfo(videoId: string) {
    try {
        const youtube = getYoutubeClient();
        const response = await youtube.videos.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: [videoId]
        });

        return response.data.items?.[0];
    } catch (error) {
        console.error('Error getting video info:', error);
        throw error;
    }
}

// In search-handler.ts

export async function getVideoComments(videoId: string, maxResults: number = 10) {
    try {
        const youtube = getYoutubeClient();
        const response = await youtube.commentThreads.list({
            part: ['snippet'],
            videoId: videoId,
            maxResults: maxResults,
            order: 'relevance'  // Can be 'time' or 'relevance'
        });

        if (!response.data.items || response.data.items.length === 0) {
            return null;
        }

        return response.data.items.map(item => ({
            authorName: item.snippet?.topLevelComment?.snippet?.authorDisplayName ?? undefined,
            text: item.snippet?.topLevelComment?.snippet?.textDisplay 
                ? decodeHtmlEntities(item.snippet.topLevelComment.snippet.textDisplay)
                : undefined,
            likeCount: item.snippet?.topLevelComment?.snippet?.likeCount ?? undefined,
            publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt ?? undefined
        })).filter(comment =>
            comment.authorName !== undefined &&
            comment.text !== undefined
        );
    } catch (error) {
        console.error('Error fetching video comments:', error);
        throw error;
    }
}