export const validationOptions = {
    displayName: 'Phone Validation',
    name: 'phoneValidation',
    type: 'collection',
    placeholder: 'Add Validation Option',
    default: {},
    options: [
        {
            displayName: 'Validate Phone Numbers',
            name: 'validatePhoneNumbers',
            type: 'boolean',
            default: true,
            description: 'Validate phone number format before sending',
        },
        {
            displayName: 'Auto Format Phone',
            name: 'autoFormatPhone',
            type: 'boolean
            default: true,
            description: 'Automatically format phone numbers',
        },
        {
            displayName: 'Default Country Code',
            name: 'defaultCountryCode',
            type: 'options',
            options: [
                { name: 'Chile (+56)', value: '56' },
                { name: 'Argentina (+54)', value: '54' },
                { name: 'Peru (+51)', value: '51' },
                { name: 'Colombia (+57)', value: '57' },
            ],
            default: '56',
            description: 'Default country code for phone numbers',
        },
    ],
};