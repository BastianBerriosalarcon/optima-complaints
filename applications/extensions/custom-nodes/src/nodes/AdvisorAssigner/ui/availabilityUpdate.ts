export const availabilityUpdate = [
    {
        displayName: 'Is Available',
        name: 'isAvailable',
        type: 'boolean',
        default: true,
        required: true,
        displayOptions: {
            show: {
                operation: ['updateAvailability'],
            },
        },
        description: 'Set advisor availability status',
    },
    {
        displayName: 'Reason',
        name: 'reason',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                operation: ['updateAvailability'],
            },
        },
        description: 'Reason for availability change',
    },
    {
        displayName: 'Duration (minutes)',
        name: 'duration',
        type: 'number',
        default: 0,
        displayOptions: {
            show: {
                operation: ['updateAvailability'],
                isAvailable: [false],
            },
        },
        description: 'Auto-restore availability after this many minutes (0 = manual restore)',
    },
];