export const filters = {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
        show: {
            operation: ['getAvailableAdvisors'],
        },
    },
    options: [
        {
            displayName: 'Specialty',
            name: 'specialty',
            type: 'options',
            options: [
                { name: 'New Vehicle Sales', value: 'ventas_nuevos' },
                { name: 'Used Vehicle Sales', value: 'ventas_usados' },
                { name: 'Post-Sales Service', value: 'post_venta' },
                { name: 'Financing', value: 'financiamiento' },
            ],
            default: '',
            description: 'Filter by advisor specialty',
        },
        {
            displayName: 'Max Workload',
            name: 'maxWorkload',
            type: 'number',
            default: 10,
            description: 'Maximum current leads per advisor',
        },
        {
            displayName: 'Only Available',
            name: 'onlyAvailable',
            type: 'boolean',
            default: true,
            description: 'Only show currently available advisors',
        },
        {
            displayName: 'Min Performance Rating',
            name: 'minRating',
            type: 'number',
            typeOptions: {
                minValue: 1,
                maxValue: 5,
                numberStepSize: 0.1,
            },
            default: 4.0,
            description: 'Minimum performance rating (1-5)',
        },
    ],
};