import { SlashCommandBuilder } from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Gets the info of a youtube video')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Link to the video')
                .setRequired(true))
].map(command => command.toJSON());  // This is important!