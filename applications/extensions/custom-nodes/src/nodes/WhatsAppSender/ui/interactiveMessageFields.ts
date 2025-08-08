export const interactiveMessageFields = [
    {
        displayName: 'Interactive Type',
        name: 'interactiveType',
        type: 'options',
        options: [
            { name: 'Button', value: 'button' },
            { name: 'List', value: 'list' },
        ],
        default: 'button',
        displayOptions: {
            show: {
                operation: ['sendInteractive'],
            },
        },
        description: 'Type of interactive message',
    },
    {
        displayName: 'Header Text',
        name: 'headerText',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                operation: ['sendInteractive'],
            },
        },
        description: 'Header text for the interactive message (optional)',
    },
    {
        displayName: 'Body Text',
        name: 'bodyText',
        type: 'string',
        typeOptions: {
            alwaysOpenEditWindow: true,
        },
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['sendInteractive'],
            },
        },
        description: 'Main body text of the interactive message',
    },
    {
        displayName: 'Footer Text',
        name: 'footerText',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                operation: ['sendInteractive'],
            },
        },
        description: 'Footer text for the interactive message (optional)',
    },
    {
        displayName: 'Buttons',
        name: 'buttons',
        type: 'fixedCollection',
        placeholder: 'Add Button',
        default: { buttons: [] },
        displayOptions: {
            show: {
                operation: ['sendInteractive'],
                interactiveType: ['button'],
            },
        },
        options: [
            {
                name: 'buttons',
                displayName: 'Buttons',
                values: [
                    {
                        displayName: 'Button ID',
                        name: 'id',
                        type: 'string',
                        default: '',
                        description: 'Unique ID for the button',
                    },
                    {
                        displayName: 'Button Title',
                        name: 'title',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Text displayed on the button (max 20 chars)',
                    },
                ],
            },
        ],
    },
];