export const strategyOptions = {
    displayName: 'Strategy Options',
    name: 'strategyOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
        {
            displayName: 'Assignment Strategy',
            name: 'assignmentStrategy',
            type: 'options',
            options: [
                { name: 'Balanced Workload', value: 'balanced_workload' },
                { name: 'Specialty Match', value: 'specialty_match' },
                { name: 'Best Performance', value: 'best_performance' },
                { name: 'Round Robin', value: 'round_robin' },
            ],
            default: 'balanced_workload',
            description: 'Default assignment strategy',
        },
        {
            displayName: 'Consider Specialty',
            name: 'considerSpecialty',
            type: 'boolean',
            default: true,
            description: 'Factor in advisor specialty when assigning',
        },
        {
            displayName: 'Consider Availability',
            name: 'considerAvailability',
            type: 'boolean',
            default: true,
            description: 'Only assign to available advisors',
        },
        {
            displayName: 'Workload Balancing Weight',
            name: 'workloadWeight',
            type: 'number',
            typeOptions: {
                minValue: 0,
                maxValue: 1,
                numberStepSize: 0.1,
            },
            default: 0.4,
            description: 'Weight of workload balancing in selection (0-1)',
        },
    ],
};