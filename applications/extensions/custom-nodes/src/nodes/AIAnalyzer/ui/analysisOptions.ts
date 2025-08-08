export const analysisOptions = {
    displayName: 'Analysis Options',
    name: 'analysisOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
        {
            displayName: 'Include Confidence Scores',
            name: 'includeConfidence',
            type: 'boolean',
            default: true,
            description: 'Include confidence scores in results',
        },
        {
            displayName: 'Include Alternatives',
            name: 'includeAlternatives',
            type: 'boolean',
            default: false,
            description: 'Include alternative interpretations',
        },
        {
            displayName: 'Detailed Analysis',
            name: 'detailedAnalysis',
            type: 'boolean',
            default: true,
            description: 'Provide detailed analysis breakdown',
        },
        {
            displayName: 'Language',
            name: 'language',
            type: 'options',
            options: [
                { name: 'Spanish', value: 'es' },
                { name: 'English', value: 'en' },
                { name: 'Portuguese', value: 'pt' },
            ],
            default: 'es',
            description: 'Language for analysis',
        },
    ],
};