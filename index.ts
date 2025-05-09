import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { commands } from './commands';
import {getVideoComments, searchVideo} from './search-handler';
import {youtube} from "googleapis/build/src/apis/youtube";
import {analyzeVideo} from "./ai-handler";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
// Add debug logging
client.on('debug', console.log);
client.on('error', console.error);


// Register slash commands
async function deployCommands() {
    try {
        const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
        const guildId = '1327803191739416606'; // Replace with your server's ID
        
        console.log('Starting to clear old commands...');

        // Clear all commands by setting an empty array
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
            { body: [] }
        );

        console.log('Successfully deleted all old commands');

        // Clear global commands if needed
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: [] }
        );

        console.log('Successfully deleted all global commands');

        // Register new commands
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
            { body: commands }
        );

        console.log('Successfully registered new commands');

        var gotten_guild_commands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId));
        console.log('Guild Commands: ', gotten_guild_commands);
        var gotten_global_commands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID!));
        console.log('Global Commands: ', gotten_global_commands);

        console.log('All processes finished');
    } catch (error) {
        console.error(error);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            // In your command handler (index.ts), modify the youtube case:
            case 'youtube':
                const videoLink = interaction.options.getString('video', true);
                const infoType = interaction.options.getString('info') || 'everything'; // Default to 'everything'

                console.log('Looking for:', videoLink);

                await interaction.reply('Fetching video...');

                try {
                    const videoInfo = await searchVideo(videoLink);

                    if (videoInfo === null) {
                        await interaction.editReply('Invalid URL or video not found. Please check the URL and try again.');
                        return;
                    }

                    const video = videoInfo[0];

                    // Basic info message (always show this)
                    let basicInfo = `Found video: ${video.title}\n` +
                        `Channel: ${video.channelTitle}\n` +
                        `Link: https://youtube.com/watch?v=${video.videoId}`;

                    await interaction.editReply(basicInfo);

                    // Only proceed with additional info based on infoType
                    if (infoType === 'everything' || infoType === 'video') {
                        // Stats info
                        let statsInfo = '';
                        if (video.views) statsInfo += `Views: ${parseInt(video.views).toLocaleString()}\n`;
                        if (video.likes) statsInfo += `Likes: ${parseInt(video.likes).toLocaleString()}\n`;
                        if (video.duration) statsInfo += `Duration: ${video.duration}\n`;

                        if (statsInfo) {
                            await interaction.followUp('**Stats:**\n' + statsInfo);
                        }

                        // Get and show comments
                        const comments = await getVideoComments(video.videoId!);
                        if (comments) {
                            const commentsInfo = comments
                                .slice(0, 3)
                                .map(comment => `${comment.authorName}: ${comment.text}`)
                                .join('\n\n');
                            await interaction.followUp('**Top Comments:**\n' + commentsInfo);
                        }

                        // Show description
                        if (video.description) {
                            const descriptionInfo = video.description.length > 500
                                ? video.description.substring(0, 500) + '...'
                                : video.description;
                            await interaction.followUp('**Description:**\n' + descriptionInfo);
                        }
                    }

                    // Show AI analysis if requested
                    if (infoType === 'everything' || infoType === 'ai') {
                        const comments = await getVideoComments(video.videoId!);
                        if (comments && video.description) {
                            const analysisInfo = await analyzeVideo(
                                video.title!,
                                video.description!,
                                comments.map(c => c.text!).slice(0, 5)
                            );
                            await interaction.followUp('**AI Analysis:**\n' + analysisInfo);
                        }
                    }

                } catch (error) {
                    console.error('Error:', error);
                    await interaction.editReply('An error occurred while processing the video.');
                }
                break;
            default:
                await interaction.reply({ content: 'Unknown command!', ephemeral: true });
        }
    } catch (error) {
        console.error('Error handling command:', error);
        if (!interaction.replied) {
            await interaction.reply({ 
                content: 'There was an error executing this command!', 
                ephemeral: true 
            });
        }
    }
});

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    deployCommands();
});

client.login(process.env.DISCORD_TOKEN);