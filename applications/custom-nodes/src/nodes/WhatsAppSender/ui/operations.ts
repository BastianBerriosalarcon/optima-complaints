export const operations = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
        {
            name: 'Send Message',
            value: 'sendMessage',
            description: 'Send a text message',
            action: 'Send text message',
        },
        {
            name: 'Send Template',
            value: 'sendTemplate',
            description: 'Send a pre-approved template message',
            action: 'Send template message',
        },
        {
            name: 'Send Media',
            value: 'sendMedia',
            description: 'Send image, video, audio, or document',
            action: 'Send media message',
        },
        {
            name: 'Send Interactive',
            value: 'sendInteractive',
            description: 'Send interactive message with buttons',
            action: 'Send interactive message',
        },
        {
            name: 'Mark as Read',
            value: 'markAsRead',
            description: 'Mark a received message as read',
            action: 'Mark message as read',
        },
        {
            name: 'Get Delivery Status',
            value: 'getDeliveryStatus',
            description: 'Check message delivery status',
            action: 'Get delivery status',
        },
    ],
    default: 'sendMessage',
};