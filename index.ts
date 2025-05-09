import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { commands } from './commands';
import { searchVideo } from './search-handler';
import {youtube} from "googleapis/build/src/apis/youtube";

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
        
        // console.log('Starting to clear old commands...');
        //
        // // Clear all commands by setting an empty array
        // await rest.put(
        //     Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
        //     { body: [] }
        // );
        //
        // console.log('Successfully deleted all old commands');
        //
        // // Clear global commands if needed
        // await rest.put(
        //     Routes.applicationCommands(process.env.CLIENT_ID!),
        //     { body: [] }
        // );
        //
        // console.log('Successfully deleted all global commands');
        //
        // // Register new commands
        // await rest.put(
        //     Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
        //     { body: commands }
        // );
        //
        // console.log('Successfully registered new commands');

        var gotten_guild_commands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId));
        console.log('Guild Commands: ', gotten_guild_commands);
        var gotten_global_commands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID!));
        console.log('Global Commands: ', gotten_global_commands);


    } catch (error) {
        console.error(error);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'youtube':
                const videoLink = interaction.options.getString('url', true);
                console.log('Looking for ', videoLink);
                await interaction.reply(`Fetching video...`);
                await interaction.editReply(`Fetching video.....`);
                const videoInfo = await searchVideo(videoLink);
                await interaction.reply(`Got response...`);
                if (videoInfo === null) {
                    console.log('Video info is null for URL:', videoLink);
                    await interaction.reply('Invalid URL or video not found. Please check the URL and try again.');
                    return;
                } else {
                    console.log('Video info is valid for URL:', videoLink);
                    await interaction.reply(`Found video: ${videoInfo?.at(0)}`);
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