export const recipientPhone = {
    displayName: 'Recipient Phone',
    name: 'recipientPhone',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessage', 'sendTemplate', 'sendMedia', 'sendInteractive'],
        },
    },
    description: 'Phone number of the recipient (with country code)',
    placeholder: '+56912345678',
};