export const operations = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
        {
            name: 'Analyze Intent',
            value: 'analyzeIntent',
            description: 'Analyze customer message intent',
            action: 'Analyze message intent',
        },
        {
            name: 'Extract Entities',
            value: 'extractEntities',
            description: 'Extract entities from message',
            action: 'Extract entities',
        },
        {
            name: 'Classify Lead',
            value: 'classifyLead',
            description: 'Classify lead quality and characteristics',
            action: 'Classify lead',
        },
        {
            name: 'Generate Response',
            value: 'generateResponse',
            description: 'Generate automatic response suggestions',
            action: 'Generate response',
        },
        {
            name: 'Sentiment Analysis',
            value: 'sentimentAnalysis',
            description: 'Analyze message sentiment and emotions',
            action: 'Analyze sentiment',
        },
    ],
    default: 'analyzeIntent',
};