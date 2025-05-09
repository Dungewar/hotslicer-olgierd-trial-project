import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeVideo(title: string, description: string | undefined, comments: string[]) {
    // If no OpenAI API key or insufficient funds, use basic analysis
    if (!process.env.OPENAI_API_KEY) {
        return basicAnalysis(title, description, comments);
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an overly professional assistant that's trying to give a descriptive summary of a YouTube video. " +
                        "You will be extremely and aggressively professional and verbose, and will judge all videos as if they are the peak of what can possibly be professionally achieved."
                },
                {
                    role: "user",
                    content: `Analyze this YouTube video:
                    Title: ${title}
                    Description: ${description || 'No description available'}
                    Comments: ${comments.length > 0 ? comments.join('\n') : 'No comments available'}
                    
                    Provide a brief summary and sentiment analysis.`
                }
            ]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error with OpenAI:', error);
        // Fallback to basic analysis if OpenAI fails
        return basicAnalysis(title, description, comments);
    }
}

function basicAnalysis(title: string, description: string | undefined, comments: string[]): string {
    let analysis = `Analysis of "${title}"\n\n`;

    // Simple sentiment analysis based on keywords
    const positiveWords = ['amazing', 'great', 'awesome', 'good', 'love', 'excellent', 'best'];
    const negativeWords = ['bad', 'worst', 'terrible', 'hate', 'awful', 'poor'];

    let positiveCount = 0;
    let negativeCount = 0;

    // Analyze title and description
    const contentToAnalyze = [title, description || '', ...comments].join(' ').toLowerCase();

    positiveWords.forEach(word => {
        positiveCount += (contentToAnalyze.match(new RegExp(word, 'gi')) || []).length;
    });

    negativeWords.forEach(word => {
        negativeCount += (contentToAnalyze.match(new RegExp(word, 'gi')) || []).length;
    });

    // Generate basic summary
    analysis += `Summary:\n`;
    analysis += description
        ? `Video has a ${description.length} character description.\n`
        : `No description available.\n`;
    analysis += `There are ${comments.length} comments available.\n\n`;

    // Add sentiment analysis
    analysis += `Sentiment Analysis:\n`;
    if (positiveCount > negativeCount) {
        analysis += `Overall positive sentiment (${positiveCount} positive vs ${negativeCount} negative mentions)`;
    } else if (negativeCount > positiveCount) {
        analysis += `Overall negative sentiment (${positiveCount} positive vs ${negativeCount} negative mentions)`;
    } else {
        analysis += `Neutral sentiment (${positiveCount} positive vs ${negativeCount} negative mentions)`;
    }

    return analysis;
}