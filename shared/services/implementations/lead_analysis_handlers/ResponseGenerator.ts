
import { ServiceResponse, AIAnalysis, Lead, WorkflowContext } from '../../../types/core';
import { IAIService } from '../../interfaces/IExternalServices';

export class ResponseGenerator {
    constructor(private aiService: IAIService) {}

    async generateResponse(
        analysis: AIAnalysis,
        leadContext: Lead,
        context: WorkflowContext
    ): Promise<ServiceResponse<string>> {
        try {
            const templateName = `response_${analysis.intencion}`;
            const template = await this.aiService.getPromptTemplate(templateName, 'ventas');

            if (!template.success) {
                return { success: false, error: 'Template de respuesta no encontrado' };
            }

            const responsePrompt = this.aiService.renderPrompt(template.data, {
                cliente_nombre: leadContext.nombre_cliente || 'Cliente',
                vehiculo_interes: leadContext.vehiculo_interes || 'vehículo',
                nivel_interes: analysis.nivel_interes,
                entidades: analysis.entidades_extraidas
            });

            const response = await this.aiService.generateResponse(responsePrompt, { lead: leadContext }, context);
            return response;
        } catch (error) {
            return { success: false, error: `Error generando respuesta: ${error.message}` };
        }
    }
}
