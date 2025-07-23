
import { ServiceResponse, Lead, WorkflowContext } from '../../../types/core';
import { IAdvisorRepository } from '../../interfaces/IDataService';

export class AdvisorSuggester {
    constructor(private advisorRepository: IAdvisorRepository) {}

    async suggestAdvisor(lead: Lead, context: WorkflowContext): Promise<ServiceResponse<string>> {
        try {
            let specialty = 'ventas';
            if (lead.intencion_detectada === 'servicio') {
                specialty = 'post_venta';
            }

            const advisors = await this.advisorRepository.findAvailableAdvisors(
                lead.concesionario_id,
                specialty,
                context
            );

            if (!advisors.success || !advisors.data?.length) {
                return { success: false, error: 'No hay asesores disponibles' };
            }

            const selectedAdvisor = advisors.data.sort((a, b) => a.leads_asignados - b.leads_asignados)[0];

            return { success: true, data: selectedAdvisor.id };
        } catch (error) {
            return { success: false, error: `Error sugiriendo asesor: ${error.message}` };
        }
    }
}
