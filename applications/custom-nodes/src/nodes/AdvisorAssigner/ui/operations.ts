export const operations = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
        {
            name: 'Assign Advisor',
            value: 'assignAdvisor',
            description: 'Assign the best available advisor to a lead',
            action: 'Assign advisor to lead',
        },
        {
            name: 'Get Available Advisors',
            value: 'getAvailableAdvisors',
            description: 'Get list of available advisors with workload info',
            action: 'Get available advisors',
        },
        {
            name: 'Reassign Lead',
            value: 'reassignLead',
            description: 'Reassign a lead to a different advisor',
            action: 'Reassign lead',
        },
        {
            name: 'Get Advisor Workload',
            value: 'getAdvisorWorkload',
            description: 'Get current workload for advisor(s)',
            action: 'Get advisor workload',
        },
        {
            name: 'Update Availability',
            value: 'updateAvailability',
            description: 'Update advisor availability status',
            action: 'Update advisor availability',
        },
    ],
    default: 'assignAdvisor',
};