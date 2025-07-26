
import { ServiceResponse, WorkflowContext } from '../../../types/core';
import { IAIService } from '../../interfaces/IExternalServices';

export class EntityExtractionHandler {
    constructor(private aiService: IAIService) {}

    async extractEntities(messageText: string, context: WorkflowContext): Promise<ServiceResponse<any>> {
        try {
            const entityTypes = ['nombre', 'email', 'vehiculo', 'presupuesto', 'fecha'];
            return await this.aiService.extractEntities(messageText, entityTypes, context);
        } catch (error) {
            return { success: false, error: `Error extrayendo entidades: ${error instanceof Error ? error.message : 'Error desconocido'}` };
        }
    }
}
