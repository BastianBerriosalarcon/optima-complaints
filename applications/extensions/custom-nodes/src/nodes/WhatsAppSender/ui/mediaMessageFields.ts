export const mediaMessageFields = [
    {
        displayName: 'Media Type',
        name: 'mediaType',
        type: 'options',
        options: [
            { name: 'Image', value: 'image' },
            { name: 'Video', value: 'video' },
            { name: 'Audio', value: 'audio' },
            { name: 'Document', value: 'document' },
        ],
        default: 'image',
        required: true,
        displayOptions: {
            show: {
                operation: ['sendMedia'],
            },
        },
        description: 'Type of media to send',
    },
    {
        displayName: 'Media Source',
        name: 'mediaSource',
        type: 'options',
        options: [
            { name: 'URL', value: 'url' },
            { name: 'Uploaded Media ID', value: 'id' },
        ],
        default: 'url',
        displayOptions: {
            show: {
                operation: ['sendMedia'],
            },
        },
        description: 'Source of the media file',
    },
    {
        displayName: 'Media URL',
        name: 'mediaUrl',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['sendMedia'],
                mediaSource: ['url'],
            },
        },
        description: 'Public URL of the media file',
        placeholder: 'https://example.com/image.jpg',
    },
    {
        displayName: 'Media ID',
        name: 'mediaId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['sendMedia'],
                mediaSource: ['id'],
            },
        },
        description: 'ID of previously uploaded media',
    },
    {
        displayName: 'Caption',
        name: 'caption',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                operation: ['sendMedia'],
                mediaType: ['image', 'video', 'document'],
            },
        },
        description: 'Caption for the media (not available for audio)',
    },
];