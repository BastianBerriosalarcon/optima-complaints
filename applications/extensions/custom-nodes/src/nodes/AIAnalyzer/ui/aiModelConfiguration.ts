export const aiModelConfiguration = {
    displayName: 'AI Model Configuration',
    name: 'aiConfig',
    type: 'collection',
    placeholder: 'Add AI Config',
    default: {},
    options: [
        {
            displayName: 'Model',
            name: 'aiModel',
            type: 'options',
            options: [
                { name: 'GPT-4', value: 'gpt-4' },
                { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                { name: 'Rule-based', value: 'rule_based' },
            ],
            default: 'gpt-4',
            description: 'AI model to use for analysis',
        },
        {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            typeOptions: {
                minValue: 0,
                maxValue: 2,
                numberStepSize: 0.1,
            },
            default: 0.7,
            description: 'Creativity level for AI responses (0-2)',
        },
        {
            displayName: 'Max Tokens',
            name: 'maxTokens',
            type: 'number',
            default: 500,
            description: 'Maximum tokens for AI response',
        },
        {
            displayName: 'Enable Context Memory',
            name: 'enableContextMemory',
            type: 'boolean',
            default: true,
            description: 'Use conversation history for better analysis',
        },
    ],
};