
import { ServiceResponse, AIAnalysis, IntentionType } from '../../../types/core';

export class InterestLevelCalculator {
    async calculateInterestLevel(analysis: AIAnalysis, leadHistory: any[]): Promise<ServiceResponse<number>> {
        try {
            let interestLevel = 5; // Base

            switch (analysis.intencion) {
                case IntentionType.COMPRA:
                    interestLevel = 8;
                    break;
                case IntentionType.INFORMACION:
                    interestLevel = 6;
                    break;
                case IntentionType.SERVICIO:
                    interestLevel = 4;
                    break;
                default:
                    interestLevel = 3;
            }

            if (analysis.entidades_extraidas.presupuesto) {
                interestLevel += 1;
            }
            if (analysis.entidades_extraidas.vehiculo_mencionado) {
                interestLevel += 1;
            }
            if (analysis.entidades_extraidas.fecha_visita) {
                interestLevel += 2;
            }

            if (leadHistory.length > 3) {
                interestLevel += 1;
            }

            interestLevel = Math.min(10, Math.max(1, interestLevel));

            return { success: true, data: interestLevel };
        } catch (error) {
            return { success: false, error: `Error calculando nivel de interés: ${error.message}` };
        }
    }
}
