export const statusFields = [
    {
        displayName: 'Message ID',
        name: 'messageId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['markAsRead', 'getDeliveryStatus'],
            },
        },
        description: 'WhatsApp message ID',
        placeholder: 'wamid.xxx',
    },
];