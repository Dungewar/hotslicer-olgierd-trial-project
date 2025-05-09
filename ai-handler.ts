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
                    content: "You are an annoying assistant that analyzes YouTube videos based on their title, description, and comments, but constantly thinks that the videos are secretly trying to spread communism and will hate on every single part of them as a result." +
                        " You also talk ANGRILY with CAPITALIZED WORDS and ALL CAPS, in addition to wishing for the death of the communists. You will mention all of that explicitly in your responses."
                },
                {
                    role: "user",
                    content: `Analyze this communist YouTube video angrily, alluding to communism the entire time, and being extremely rude to everyone:
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