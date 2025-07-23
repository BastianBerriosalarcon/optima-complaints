
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IAnalysisHandler } from './BaseAnalysisHandler';

export class EntityExtractionHandler implements IAnalysisHandler {
    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const messageContent = context.getNodeParameter('messageContent', 0) as string;
        const entityTypes = context.getNodeParameter('entityTypes', 0, []) as string[];

        if (!messageContent) {
            return { success: false, error: 'Message content is required for entity extraction' };
        }

        let extractedEntities = {
            personas: this.extractPersonNames(messageContent),
            vehiculos: this.extractVehicleInfo(messageContent),
            precios: this.extractPrices(messageContent),
            fechas: this.extractDates(messageContent),
            contacto: this.extractContactInfo(messageContent),
            ubicaciones: this.extractLocations(messageContent),
            marcas_modelos: this.extractCarBrands(messageContent)
        };

        if (entityTypes.length > 0) {
            const filteredEntities = {};
            entityTypes.forEach(type => {
                if (extractedEntities[type]) {
                    filteredEntities[type] = extractedEntities[type];
                }
            });
            extractedEntities = filteredEntities;
        }

        return { success: true, data: { mensaje_original: messageContent, entidades: extractedEntities } };
    }

    private extractPersonNames(message: string): string[] {
        return message.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g) || [];
    }

    private extractVehicleInfo(message: string): any {
        const brands = ['toyota', 'nissan', 'chevrolet', 'ford', 'hyundai', 'kia', 'mazda'];
        const foundBrands = brands.filter(brand => message.toLowerCase().includes(brand));
        return { marcas: foundBrands };
    }

    private extractPrices(message: string): string[] {
        return message.match(/\$?[\d.,]+/g) || [];
    }

    private extractDates(message: string): string[] {
        return message.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    }

    private extractContactInfo(message: string): any {
        return {
            emails: message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
            phones: message.match(/(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}/g) || []
        };
    }

    private extractLocations(message: string): string[] {
        const locations = ['santiago', 'valparaíso', 'concepción', 'viña del mar', 'las condes', 'providencia'];
        return locations.filter(loc => message.toLowerCase().includes(loc));
    }

    private extractCarBrands(message: string): string[] {
        const brands = ['toyota', 'nissan', 'chevrolet', 'ford', 'hyundai', 'kia', 'mazda', 'bmw', 'mercedes', 'audi'];
        return brands.filter(brand => message.toLowerCase().includes(brand));
    }
}
