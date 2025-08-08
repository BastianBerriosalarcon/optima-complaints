export const reassignmentFields = [
    {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['reassignLead'],
            },
        },
        description: 'ID of the lead to reassign',
    },
    {
        displayName: 'Current Advisor ID',
        name: 'currentAdvisorId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['reassignLead'],
            },
        },
        description: 'ID of the current advisor assigned to the lead',
    },
    {
        displayName: 'Reassignment Reason',
        name: 'reassignmentReason',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                operation: ['reassignLead'],
            },
        },
        description: 'Reason for reassigning the lead',
    },
];