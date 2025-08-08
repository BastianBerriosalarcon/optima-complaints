
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IAnalysisHandler } from './BaseAnalysisHandler';

export class SentimentAnalysisHandler implements IAnalysisHandler {
    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const messageContent = context.getNodeParameter('messageContent', 0) as string;

        if (!messageContent) {
            return { success: false, error: 'Message content is required for sentiment analysis' };
        }

        const sentimentAnalysis = {
            sentimiento: {
                polaridad: this.analyzePolarityBasic(messageContent),
                intensidad: this.analyzeIntensity(messageContent),
                emociones_detectadas: this.detectEmotions(messageContent),
            },
            indicadores: {
                palabras_positivas: this.countPositiveWords(messageContent),
                palabras_negativas: this.countNegativeWords(messageContent),
                emojis: this.extractEmojis(messageContent),
            },
            contexto_negocio: {
                satisfaccion_cliente: this.inferCustomerSatisfaction(messageContent),
                probabilidad_queja: this.calculateComplaintProbability(messageContent),
            },
        };

        return { success: true, data: sentimentAnalysis };
    }

    private analyzePolarityBasic(message: string): string {
        const positiveWords = ['excelente', 'genial', 'perfecto', 'bueno'];
        const negativeWords = ['terrible', 'malo', 'pésimo', 'problema'];
        const positiveCount = positiveWords.filter(word => message.toLowerCase().includes(word)).length;
        const negativeCount = negativeWords.filter(word => message.toLowerCase().includes(word)).length;
        if (positiveCount > negativeCount) return 'positivo';
        if (negativeCount > positiveCount) return 'negativo';
        return 'neutral';
    }

    private analyzeIntensity(message: string): number {
        let intensity = 0.5;
        if (message.includes('!')) intensity += 0.2;
        if (message.toUpperCase() === message) intensity += 0.3;
        return Math.min(1.0, intensity);
    }

    private detectEmotions(message: string): string[] {
        const emotions = [];
        if (message.toLowerCase().includes('feliz')) emotions.push('alegria');
        if (message.toLowerCase().includes('molesto')) emotions.push('enojo');
        return emotions;
    }

    private countPositiveWords(message: string): number {
        const positiveWords = ['excelente', 'genial', 'perfecto', 'bueno', 'gracias'];
        return positiveWords.filter(word => message.toLowerCase().includes(word)).length;
    }

    private countNegativeWords(message: string): number {
        const negativeWords = ['terrible', 'malo', 'pésimo', 'problema'];
        return negativeWords.filter(word => message.toLowerCase().includes(word)).length;
    }

    private extractEmojis(message: string): string[] {
        const emojiRegex = /[\u{1F600}-\u{1F64F}]/gu;
        return message.match(emojiRegex) || [];
    }

    private inferCustomerSatisfaction(message: string): string {
        const polarity = this.analyzePolarityBasic(message);
        return polarity === 'positivo' ? 'alta' : polarity === 'negativo' ? 'baja' : 'media';
    }

    private calculateComplaintProbability(message: string): number {
        const complaintWords = ['reclamo', 'problema', 'molesto'];
        return complaintWords.some(word => message.toLowerCase().includes(word)) ? 0.8 : 0.1;
    }
}
