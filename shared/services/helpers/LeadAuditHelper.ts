
import { IAuditService } from '../interfaces/IExternalServices';
import { WorkflowContext, Lead } from '../../types/core';

export class LeadAuditHelper {
    constructor(private auditService: IAuditService) {}

    async logLeadCreation(lead: Lead, data: any, context: WorkflowContext): Promise<void> {
        await this.auditService.logEvent({
            entityType: 'lead',
            entityId: lead.id,
            action: 'create',
            userId: context.user_id,
            tenantId: context.tenant_id,
            timestamp: new Date(),
            metadata: { origen: data.origen }
        }, context);
    }

    async logLeadUpdate(leadId: string, currentLead: Lead, updatedData: any, context: WorkflowContext): Promise<void> {
        const changes: Record<string, { old: any; new: any }> = {};
        Object.keys(updatedData).forEach(key => {
            if (currentLead[key] !== updatedData[key]) {
                changes[key] = {
                    old: currentLead[key],
                    new: updatedData[key]
                };
            }
        });

        if (Object.keys(changes).length > 0) {
            await this.auditService.logEvent({
                entityType: 'lead',
                entityId: leadId,
                action: 'update',
                changes,
                userId: context.user_id,
                tenantId: context.tenant_id,
                timestamp: new Date()
            }, context);
        }
    }

    async logLeadView(leadId: string, context: WorkflowContext): Promise<void> {
        await this.auditService.logEvent({
            entityType: 'lead',
            entityId: leadId,
            action: 'view',
            userId: context.user_id,
            tenantId: context.tenant_id,
            timestamp: new Date()
        }, context);
    }

    async getLeadHistory(leadId: string): Promise<ServiceResponse<any[]>> {
        const context: WorkflowContext = {
            tenant_id: '',
            correlation_id: `lead-history-${Date.now()}`,
            timestamp: new Date()
        };
        return await this.auditService.getEntityHistory('lead', leadId, context);
    }
}
