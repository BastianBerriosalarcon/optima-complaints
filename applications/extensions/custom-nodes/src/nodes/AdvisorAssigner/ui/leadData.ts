export const leadData = {
    displayName: 'Lead Data',
    name: 'leadData',
    type: 'collection',
    placeholder: 'Add Lead Field',
    default: {},
    displayOptions: {
        show: {
            operation: ['assignAdvisor'],
        },
    },
    options: [
        {
            displayName: 'Lead ID',
            name: 'id',
            type: 'string',
            default: '',
            required: true,
            description: 'Unique identifier for the lead',
        },
        {
            displayName: 'Customer Name',
            name: 'nombre_cliente',
            type: 'string',
            default: '',
            description: 'Customer name',
        },
        {
            displayName: 'Phone Number',
            name: 'telefono_cliente',
            type: 'string',
            default: '',
            description: 'Customer phone number',
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
        {
            displayName: 'Lead Quality',
            name: 'calidad',
            type: 'options',
            options: [
                { name: 'High', value: 'alta' },
                { name: 'Medium', value: 'media' },
                { name: 'Low', value: 'baja' },
            ],
            default: 'media',
        },
    ],
};