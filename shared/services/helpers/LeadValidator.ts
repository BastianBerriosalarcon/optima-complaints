
import { CreateLeadDto, UpdateLeadDto } from '../interfaces/ILeadService';
import { ServiceResponse, Lead, WorkflowContext } from '../../types/core';
import { ILeadRepository } from '../interfaces/IDataService';

export class LeadValidator {
    constructor(private leadRepository: ILeadRepository) {}

    async validateCreateLead(data: CreateLeadDto, context: WorkflowContext): Promise<ServiceResponse<boolean>> {
        if (!data.telefono_cliente || !data.concesionario_id) {
            return { success: false, error: 'Teléfono y concesionario son requeridos' };
        }

        const existingLead = await this.leadRepository.findByPhone(
            data.telefono_cliente,
            data.concesionario_id,
            context
        );

        if (existingLead.success && existingLead.data) {
            return { success: false, error: 'Ya existe un lead para este número de teléfono', data: existingLead.data };
        }

        return { success: true, data: true };
    }

    async validateUpdateLead(id: string, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
        const currentLead = await this.leadRepository.findById(id, context);
        if (!currentLead.success || !currentLead.data) {
            return { success: false, error: 'Lead no encontrado' };
        }
        return currentLead;
    }
}
