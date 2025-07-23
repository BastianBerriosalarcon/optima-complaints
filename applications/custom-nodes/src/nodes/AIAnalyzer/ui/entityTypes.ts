export const entityTypes = {
    displayName: 'Entity Types',
    name: 'entityTypes',
    type: 'multiOptions',
    options: [
        { name: 'Persons', value: 'personas' },
        { name: 'Vehicles', value: 'vehiculos' },
        { name: 'Prices', value: 'precios' },
        { name: 'Dates', value: 'fechas' },
        { name: 'Contact Info', value: 'contacto' },
        { name: 'Locations', value: 'ubicaciones' },
        { name: 'Car Brands/Models', value: 'marcas_modelos' },
    ],
    default: [],
    displayOptions: {
        show: {
            operation: ['extractEntities'],
        },
    },
    description: 'Types of entities to extract (leave empty for all)',
};