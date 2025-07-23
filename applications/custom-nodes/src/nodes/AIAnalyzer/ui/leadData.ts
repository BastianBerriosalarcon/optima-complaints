export const leadData = {
    displayName: 'Lead Data',
    name: 'leadData',
    type: 'collection',
    placeholder: 'Add Lead Field',
    default: {},
    displayOptions: {
        show: {
            operation: ['classifyLead'],
        },
    },
    options: [
        {
            displayName: 'Lead ID',
            name: 'id',
            type: 'string',
            default: '',
            description: 'Unique identifier for the lead',
        },
        {
            displayName: 'Phone Number',
            name: 'telefono_cliente',
            type: 'string',
            default: '',
            description: 'Customer phone number',
        },
        {
            displayName: 'Email',
            name: 'email_cliente',
            type: 'string',
            default: '',
            description: 'Customer email',
        },
        {
            displayName: 'Initial Message',
            name: 'mensaje_inicial',
            type: 'string',
            typeOptions: {
                alwaysOpenEditWindow: true,
            },
            default: '',
            description: 'The initial message from the customer',
        },
        {
            displayName: 'Source',
            name: 'origen',
            type: 'options',
            options: [
                { name: 'WhatsApp', value: 'whatsapp' },
                { name: 'Phone', value: 'telefono' },
                { name: 'Email', value: 'email' },
                { name: 'Web', value: 'web' },
                { name: 'Referral', value: 'referido' },
            ],
            default: 'whatsapp',
        },
    ],
};