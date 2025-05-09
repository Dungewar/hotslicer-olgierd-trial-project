export const commands = [
    {
        name: 'youtube',
        description: 'Get information about a YouTube video',
        options: [
            {
                name: 'video',
                description: 'Either the URL or title of the video to search for',
                type: 3, // STRING type
                required: true
            },
            {
                name: 'info',
                description: 'What information to show, by default it will show everything',
                type: 3, // STRING type
                required: false,
                choices: [
                    {
                        name: 'Everything',
                        value: 'everything'
                    },
                    {
                        name: 'AI Analysis',
                        value: 'ai'
                    },
                    {
                        name: 'Video Info',
                        value: 'video'
                    }
                ]
            }
        ]
    }
];

