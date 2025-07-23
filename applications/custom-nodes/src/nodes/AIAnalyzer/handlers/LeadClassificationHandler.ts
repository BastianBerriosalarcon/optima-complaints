
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IAnalysisHandler } from './BaseAnalysisHandler';

export class LeadClassificationHandler implements IAnalysisHandler {
    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const leadData = context.getNodeParameter('leadData', 0) as any;
        const messageContent = leadData.mensaje_inicial || '';

        if (!leadData) {
            return { success: false, error: 'Lead data is required for classification' };
        }

        const classification = {
            calidad: this.classifyLeadQuality(messageContent, leadData),
            tipo_interes: this.classifyInterestType(messageContent),
            urgencia: this.classifyUrgency(messageContent),
            probabilidad_conversion: this.calculateConversionProbability(messageContent, leadData),
            categoria_producto: this.classifyProductCategory(messageContent),
            nivel_conocimiento: this.assessKnowledgeLevel(messageContent)
        };

        const totalScore = this.calculateTotalScore(classification);
        const recommendations = this.generateRecommendations({ ...classification, puntuacion_total: totalScore });

        const result = {
            lead_id: leadData.id || `temp_${Date.now()}`,
            clasificacion,
            puntuacion_total: totalScore,
            recomendaciones,
            analisis_detallado: {
                palabras_clave_positivas: this.extractPositiveKeywords(messageContent),
                senales_compra: this.detectBuyingSignals(messageContent),
                objeciones_potenciales: this.detectPotentialObjections(messageContent)
            }
        };

        return { success: true, data: result };
    }

    private classifyLeadQuality(message: string, leadData: any): string {
        let score = 0;
        if (message.includes('comprar')) score += 3;
        if (message.includes('precio')) score += 2;
        if (leadData.telefono_cliente) score += 1;
        if (score >= 4) return 'alta';
        if (score >= 2) return 'media';
        return 'baja';
    }

    private classifyInterestType(message: string): string {
        if (message.toLowerCase().includes('nuevo')) return 'vehiculo_nuevo';
        if (message.toLowerCase().includes('usado')) return 'vehiculo_usado';
        return 'general';
    }

    private classifyUrgency(message: string): string {
        const urgentWords = ['urgente', 'hoy', 'ahora'];
        if (urgentWords.some(word => message.toLowerCase().includes(word))) return 'alta';
        return 'baja';
    }

    private calculateConversionProbability(message: string, leadData: any): number {
        let probability = 0.3;
        if (message.includes('comprar')) probability += 0.3;
        if (leadData.telefono_cliente) probability += 0.1;
        return Math.min(1.0, probability);
    }

    private classifyProductCategory(message: string): string {
        if (message.toLowerCase().includes('suv')) return 'suv';
        if (message.toLowerCase().includes('sedan')) return 'sedan';
        return 'general';
    }

    private assessKnowledgeLevel(message: string): string {
        const technicalTerms = ['cilindrada', 'transmisión'];
        if (technicalTerms.some(term => message.toLowerCase().includes(term))) return 'alto';
        return 'basico';
    }

    private calculateTotalScore(classification: any): number {
        let score = 0;
        if (classification.calidad === 'alta') score += 30;
        if (classification.calidad === 'media') score += 20;
        score += classification.probabilidad_conversion * 40;
        if (classification.urgencia === 'alta') score += 20;
        return Math.round(score);
    }

    private generateRecommendations(classification: any): any {
        const recommendations = { prioridad_atencion: 'media', acciones_sugeridas: [] };
        if (classification.puntuacion_total >= 70) {
            recommendations.prioridad_atencion = 'alta';
            recommendations.acciones_sugeridas.push('contacto_inmediato');
        }
        return recommendations;
    }

    private extractPositiveKeywords(message: string): string[] {
        const keywords = ['interesado', 'comprar', 'perfecto'];
        return keywords.filter(keyword => message.toLowerCase().includes(keyword));
    }

    private detectBuyingSignals(message: string): string[] {
        const signals = [];
        if (message.toLowerCase().includes('cuando puedo')) signals.push('urgencia_temporal');
        if (message.toLowerCase().includes('precio final')) signals.push('negociacion_precio');
        return signals;
    }

    private detectPotentialObjections(message: string): string[] {
        const objections = [];
        if (message.toLowerCase().includes('muy caro')) objections.push('precio_alto');
        if (message.toLowerCase().includes('no estoy seguro')) objections.push('indecision');
        return objections;
    }
}
