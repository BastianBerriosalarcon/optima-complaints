export const textMessageFields = [
    {
        displayName: 'Message Text',
        name: 'messageText',
        type: 'string',
        typeOptions: {
            alwaysOpenEditWindow: true,
        },
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['sendMessage'],
            },
        },
        description: 'The text message to send',
    },
    {
        displayName: 'Message Options',
        name: 'messageOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
            show: {
                operation: ['sendMessage'],
            },
        },
        options: [
            {
                displayName: 'Enable Preview',
                name: 'enablePreview',
                type: 'boolean',
                default: false,
                description: 'Enable URL preview in the message',
            },
        ],
    },
];