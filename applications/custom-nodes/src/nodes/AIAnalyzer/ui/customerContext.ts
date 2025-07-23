export const customerContext = {
    displayName: 'Customer Context',
    name: 'customerContext',
    type: 'collection',
    placeholder: 'Add Context',
    default: {},
    displayOptions: {
        show: {
            operation: ['generateResponse'],
        },
    },
    options: [
        {
            displayName: 'Customer Name',
            name: 'customerName',
            type: 'string',
            default: '',
            description: 'Customer name for personalization',
        },
        {
            displayName: 'Previous Interactions',
            name: 'previousInteractions',
            type: 'number',
            default: 0,
            description: 'Number of previous interactions',
        },
        {
            displayName: 'Interest Level',
            name: 'interestLevel',
            type: 'options',
            options: [
                { name: 'Low', value: 'bajo' },
                { name: 'Medium', value: 'medio' },
                { name: 'High', value: 'alto' },
            ],
            default: 'medio',
        },
        {
            displayName: 'Preferred Products',
            name: 'preferredProducts',
            type: 'string',
            default: '',
            description: 'Customer preferred vehicle types or models',
        },
    ],
};