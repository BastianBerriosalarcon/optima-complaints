export const templateMessageFields = [
    {
        displayName: 'Template Name',
        name: 'templateName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['sendTemplate'],
            },
        },
        description: 'Name of the approved template',
        placeholder: 'welcome_message',
    },
    {
        displayName: 'Template Language',
        name: 'templateLanguage',
        type: 'options',
        options: [
            { name: 'Spanish', value: 'es' },
            { name: 'English', value: 'en' },
            { name: 'Portuguese', value: 'pt' },
        ],
        default: 'es',
        displayOptions: {
            show: {
                operation: ['sendTemplate'],
            },
        },
        description: 'Language code for the template',
    },
    {
        displayName: 'Template Parameters',
        name: 'templateParams',
        type: 'fixedCollection',
        placeholder: 'Add Parameter',
        default: { parameters: [] },
        displayOptions: {
            show: {
                operation: ['sendTemplate'],
            },
        },
        options: [
            {
                name: 'parameters',
                displayName: 'Parameters',
                values: [
                    {
                        displayName: 'Value',
                        name: 'value',
                        type: 'string',
                        default: '',
                        description: 'Parameter value to substitute in template',
                    },
                ],
            },
        ],
    },
];