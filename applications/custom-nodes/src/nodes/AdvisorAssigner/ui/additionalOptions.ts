export const additionalOptions = {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
        {
            displayName: 'Enable Logging',
            name: 'enableLogging',
            type: 'boolean',
            default: true,
            description: 'Enable detailed logging for debugging',
        },
        {
            displayName: 'Timeout (seconds)',
            name: 'timeout',
            type: 'number',
            default: 30,
            description: 'Timeout for operations in seconds',
        },
        {
            displayName: 'Retry Count',
            name: 'retryCount',
            type: 'number',
            default: 3,
            description: 'Number of retries for failed operations',
        },
        {
            displayName: 'Auto Notify Advisor',
            name: 'autoNotifyAdvisor',
            type: 'boolean',
            default: true,
            description: 'Automatically notify advisor of new assignment',
        },
    ],
};