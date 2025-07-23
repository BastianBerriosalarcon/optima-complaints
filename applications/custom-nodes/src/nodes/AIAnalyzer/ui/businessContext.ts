export const businessContext = {
    displayName: 'Business Context',
    name: 'businessContext',
    type: 'options',
    options: [
        { name: 'Automotive', value: 'automotive' },
        { name: 'Real Estate', value: 'real_estate' },
        { name: 'Insurance', value: 'insurance' },
        { name: 'General', value: 'general' },
    ],
    default: 'automotive',
    displayOptions: {
        show: {
            operation: ['analyzeIntent'],
        },
    },
    description: 'Business context for intent analysis',
};