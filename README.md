# Olgierd's HotSlicer YT Bot

A Discord bot project built with TypeScript that integrates Discord.js, OpenAI, and Google APIs functionality.

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (Comes with Node.js)

## Installation

1. Clone the repository:
   git clone <repository-url>
   cd hotslicer-olgierd-examination-project

2. Install dependencies:
   npm install

3. Create a `.env` file in the root directory and add your environment variables:
- CLIENT_ID=[discord guild ID for the server to run on]
- DISCORD_TOKEN=[ID to the bot to use]
- YOUTUBE_API_KEY=[YouTube API Key (such as a V3 burner token)]
- OPENAI_API_KEY=[API key to OpenAI's services]

## Development

To run the bot in development mode with hot-reload:
npm run dev

## Project Structure

The project is built using TypeScript and includes the following main dependencies:
- discord.js (v14.19.3) - For Discord bot functionality
- openai (v4.98.0) - For OpenAI API integration
- googleapis (v148.0.0) - For Google APIs integration
- dotenv (v16.5.0) - For environment variable management

## Scripts

- `npm run dev` - Runs the bot in development mode with nodemon for auto-reloading

## License

Private project - All rights reserved

## Contributing

This is a private project and contributions are not currently accepted.