import { google } from 'googleapis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Example function to search YouTube
export async function searchVideo(query: string) {
    try {
        const youtube = getYoutubeClient();
        const response = await youtube.search.list({
            part: ['snippet'],
            q: query,
            maxResults: 5,
            type: ['video']
        });

        // Returns array of video results with basic info
        return response.data.items?.map(item => ({
            title: item.snippet?.title,
            videoId: item.id?.videoId,
            thumbnail: item.snippet?.thumbnails?.default?.url,
            channelTitle: item.snippet?.channelTitle
        }));
    } catch (error) {
        console.error('Error searching YouTube:', error);
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