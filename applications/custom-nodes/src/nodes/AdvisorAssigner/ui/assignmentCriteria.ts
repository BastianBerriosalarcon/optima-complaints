export const assignmentCriteria = {
    displayName: 'Assignment Criteria',
    name: 'assignmentCriteria',
    type: 'collection',
    placeholder: 'Add Criteria',
    default: {},
    displayOptions: {
        show: {
            operation: ['assignAdvisor'],
        },
    },
    options: [
        {
            displayName: 'Assignment Strategy',
            name: 'strategy',
            type: 'options',
            options: [
                { name: 'Balanced Workload', value: 'balanced_workload' },
                { name: 'Specialty Match', value: 'specialty_match' },
                { name: 'Best Performance', value: 'best_performance' },
                { name: 'Round Robin', value: 'round_robin' },
            ],
            default: 'balanced_workload',
            description: 'Strategy for selecting the best advisor',
        },
        {
            displayName: 'Preferred Specialty',
            name: 'preferredSpecialty',
            type: 'options',
            options: [
                { name: 'New Vehicle Sales', value: 'ventas_nuevos' },
                { name: 'Used Vehicle Sales', value: 'ventas_usados' },
                { name: 'Post-Sales Service', value: 'post_venta' },
                { name: 'Financing', value: 'financiamiento' },
            ],
            default: 'ventas_nuevos',
            description: 'Preferred advisor specialty for this lead',
        },
        {
            displayName: 'Max Workload',
            name: 'maxWorkload',
            type: 'number',
            default: 8,
            description: 'Maximum current workload for advisor selection',
        },
        {
            displayName: 'Consider Performance',
            name: 'considerPerformance',
            type: 'boolean',
            default: true,
            description: 'Factor in advisor performance metrics',
        },
    ],
};