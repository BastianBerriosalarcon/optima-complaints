export const responseType = {
    displayName: 'Response Type',
    name: 'responseType',
    type: 'options',
    options: [
        { name: 'Auto (Smart)', value: 'auto' },
        { name: 'Informational', value: 'informativo' },
        { name: 'Sales Focused', value: 'ventas' },
        { name: 'Customer Service', value: 'servicio_cliente' },
        { name: 'Appointment Booking', value: 'agendamiento' },
    ],
    default: 'auto',
    displayOptions: {
        show: {
            operation: ['generateResponse'],
        },
    },
    description: 'Type of response to generate',
};