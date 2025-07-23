
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IAnalysisHandler } from './BaseAnalysisHandler';

export class ResponseGenerationHandler implements IAnalysisHandler {
    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const messageContent = context.getNodeParameter('messageContent', 0) as string;
        const responseType = context.getNodeParameter('responseType', 0, 'auto') as string;
        const customerContext = context.getNodeParameter('customerContext', 0, {}) as any;

        if (!messageContent) {
            return { success: false, error: 'Message content is required for response generation' };
        }

        const responseGeneration = {
            respuesta_generada: this.generateAutomaticResponse(messageContent, responseType, customerContext),
            tipo_respuesta: responseType,
            requiere_revision_humana: this.requiresHumanReview(messageContent),
            alternativas: this.generateAlternativeResponses(messageContent, responseType),
        };

        return { success: true, data: responseGeneration };
    }

    private generateAutomaticResponse(message: string, type: string, context: any): string {
        const intent = this.detectPrimaryIntent(message, 'automotive');
        const responses = {
            intencion_compra: '¡Gracias por tu interés! ¿Tienes algún modelo en mente?',
            solicitud_informacion: 'Con gusto te doy más información. ¿Qué modelo te interesa?',
            agendar_cita: 'Perfecto, podemos coordinar una cita. ¿Cuándo te acomoda?',
            consulta_general: '¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?',
        };
        return responses[intent] || responses.consulta_general;
    }

    private requiresHumanReview(message: string): boolean {
        const complexKeywords = ['reclamo', 'problema', 'insatisfecho'];
        return complexKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    private generateAlternativeResponses(message: string, type: string): string[] {
        return [
            'Respuesta alternativa 1: Enfoque más personal',
            'Respuesta alternativa 2: Enfoque más técnico',
        ];
    }

    private detectPrimaryIntent(message: string, context: string): string {
        const lowerMessage = message.toLowerCase();
        if (context === 'automotive') {
            if (lowerMessage.includes('comprar') || lowerMessage.includes('precio')) return 'intencion_compra';
            if (lowerMessage.includes('información') || lowerMessage.includes('detalles')) return 'solicitud_informacion';
            if (lowerMessage.includes('cita') || lowerMessage.includes('visita')) return 'agendar_cita';
        }
        return 'consulta_general';
    }
}
