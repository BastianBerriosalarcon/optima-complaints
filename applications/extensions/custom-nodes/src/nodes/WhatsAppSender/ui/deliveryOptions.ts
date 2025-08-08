export const deliveryOptions = {
    displayName: 'Delivery Options',
    name: 'deliveryOptions',
    type: 'collection',
    placeholder: 'Add Delivery Option',
    default: {},
    options: [
        {
            displayName: 'Enable Delivery Tracking',
            name: 'enableDeliveryTracking',
            type: 'boolean',
            default: true,
            description: 'Track message delivery status',
        },
        {
            displayName: 'Retry Failed Messages',
            name: 'retryFailedMessages',
            type: 'boolean',
            default: false,
            description: 'Automatically retry failed messages',
        },
        {
            displayName: 'Max Retry Attempts',
            name: 'maxRetryAttempts',
            type: 'number',
            default: 3,
            displayOptions: {
                show: {
                    retryFailedMessages: [true],
                },
            },
            description: 'Maximum number of retry attempts',
        },
        {
            displayName: 'Retry Delay (seconds)',
            name: 'retryDelay',
            type: 'number',
            default: 60,
            displayOptions: {
                show: {
                    retryFailedMessages: [true],
                },
            },
            description: 'Delay between retry attempts',
        },
    ],
};