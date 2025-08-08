export const messageContent = {
    displayName: 'Message Content',
    name: 'messageContent',
    type: 'string',
    typeOptions: {
        alwaysOpenEditWindow: true,
    },
    default: '',
    required: true,
    displayOptions: {
        show: {
            operation: ['analyzeIntent', 'extractEntities', 'generateResponse', 'sentimentAnalysis'],
        },
    },
    description: 'The message content to analyze',
};