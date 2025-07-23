export const workloadAndAvailability = [
    {
        displayName: 'Advisor ID',
        name: 'advisorId',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                operation: ['getAdvisorWorkload', 'updateAvailability'],
            },
        },
        description: 'Specific advisor ID (leave empty for all advisors in workload operation)',
    },
    {
        displayName: 'Include Details',
        name: 'includeDetails',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                operation: ['getAdvisorWorkload'],
            },
        },
        description: 'Include detailed lead and schedule information',
    },
];