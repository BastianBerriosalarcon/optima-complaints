export const additionalOptions = {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
        {
            displayName: 'Enable Logging',
            name: 'enableLogging',
            type: 'boolean',
            default: true,
            description: 'Enable detailed logging for debugging',
        },
        {
            displayName: 'Timeout (seconds)',
            name: 'timeout',
            type: 'number',
            default: 30,
            description: 'Timeout for API calls in seconds',
        },
        {
            displayName: 'Rate Limit (messages/minute)',
            name: 'rateLimit',
            type: 'number',
            default: 80,
            description: 'Maximum messages per minute (WhatsApp limit is 80)',
        },
        {
            displayName: 'Store Message History',
            name: 'storeHistory',
            type: 'boolean',
            default: true,
            description: 'Store sent messages in history for tracking',
        },
    ],
};