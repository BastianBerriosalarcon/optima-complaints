
import { ServiceResponse, Lead, WorkflowContext } from '../../types/core';
import { IAdvisorRepository, ILeadRepository } from '../interfaces/IDataService';

export class AdvisorAssignmentHelper {
    constructor(
        private advisorRepository: IAdvisorRepository,
        private leadRepository: ILeadRepository
    ) {}

    async assignAdvisorToLead(leadId: string, advisorId: string, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
        const advisor = await this.advisorRepository.findById(advisorId, context);
        if (!advisor.success || !advisor.data) {
            return { success: false, error: 'Asesor no encontrado' };
        }

        const result = await this.leadRepository.update(leadId, { asesor_asignado_id: advisorId }, context);

        if (result.success) {
            await this.advisorRepository.updateLeadCount(advisorId, 1, context);
        }

        return result;
    }
}
