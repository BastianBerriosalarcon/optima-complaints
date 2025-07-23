
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IAnalysisHandler } from './BaseAnalysisHandler';

export class IntentAnalysisHandler implements IAnalysisHandler {
    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const messageContent = context.getNodeParameter('messageContent', 0) as string;
        const businessContext = context.getNodeParameter('businessContext', 0, 'automotive') as string;

        if (!messageContent) {
            return { success: false, error: 'Message content is required for intent analysis' };
        }

        const intentAnalysis = {
            mensaje_original: messageContent,
            intencion_principal: this.detectPrimaryIntent(messageContent, businessContext),
            intenciones_secundarias: this.detectSecondaryIntents(messageContent),
            nivel_certeza: this.calculateConfidenceLevel(messageContent),
            entidades_detectadas: this.detectBasicEntities(messageContent),
            urgencia: this.detectUrgency(messageContent),
            tono_emocional: this.detectEmotionalTone(messageContent),
            contexto_negocio: businessContext,
        };

        return { success: true, data: intentAnalysis };
    }

    private detectPrimaryIntent(message: string, context: string): string {
        const lowerMessage = message.toLowerCase();
        if (context === 'automotive') {
            if (lowerMessage.includes('comprar') || lowerMessage.includes('precio')) return 'intencion_compra';
            if (lowerMessage.includes('información') || lowerMessage.includes('detalles')) return 'solicitud_informacion';
            if (lowerMessage.includes('cita') || lowerMessage.includes('visita')) return 'agendar_cita';
            if (lowerMessage.includes('servicio') || lowerMessage.includes('mantención')) return 'servicio_postventa';
            if (lowerMessage.includes('financiamiento') || lowerMessage.includes('crédito')) return 'consulta_financiamiento';
        }
        return 'consulta_general';
    }

    private detectSecondaryIntents(message: string): string[] {
        const intents = [];
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('urgente')) intents.push('urgencia');
        if (lowerMessage.includes('descuento')) intents.push('busca_promocion');
        if (lowerMessage.includes('comparar')) intents.push('comparacion');
        return intents;
    }

    private calculateConfidenceLevel(message: string): number {
        let confidence = 0.5;
        if (message.length > 50) confidence += 0.2;
        if (message.length > 100) confidence += 0.1;
        const specificWords = ['modelo', 'año', 'precio', 'financiamiento', 'color'];
        specificWords.forEach(word => {
            if (message.toLowerCase().includes(word)) confidence += 0.05;
        });
        return Math.min(1.0, confidence);
    }

    private detectBasicEntities(message: string): any {
        return {
            emails: message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
            phones: message.match(/(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}/g) || [],
        };
    }

    private detectUrgency(message: string): string {
        const urgentWords = ['urgente', 'rápido', 'pronto', 'hoy', 'ahora'];
        if (urgentWords.some(word => message.toLowerCase().includes(word))) return 'alta';
        return 'baja';
    }

    private detectEmotionalTone(message: string): string {
        const positiveWords = ['excelente', 'perfecto', 'genial'];
        const negativeWords = ['terrible', 'malo', 'problema'];
        const positiveCount = positiveWords.filter(word => message.toLowerCase().includes(word)).length;
        const negativeCount = negativeWords.filter(word => message.toLowerCase().includes(word)).length;
        if (positiveCount > negativeCount) return 'positivo';
        if (negativeCount > positiveCount) return 'negativo';
        return 'neutral';
    }
}
