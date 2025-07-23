
import { ServiceResponse, AIAnalysis, Lead, WhatsAppMessage, WorkflowContext } from '../../../types/core';

export interface ILeadAnalysisHandler {
    handle(message: WhatsAppMessage, leadContext: Lead | null, context: WorkflowContext): Promise<ServiceResponse<AIAnalysis>>;
}
