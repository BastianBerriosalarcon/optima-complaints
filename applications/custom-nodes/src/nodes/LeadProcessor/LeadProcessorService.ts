// Lead Processor Service - Implementación de lógica de negocio separada
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse, WorkflowContext } from '@shared/types/core';
import { ServiceFactory } from '@shared/services/ServiceFactory';
import { ILeadRepository } from '@shared/services/interfaces/IDataService';
import { CreateLead, UpdateLead } from '@shared/services/implementations/SupabaseLeadRepository';

export class LeadProcessorService implements IOptimaCxNodeService {
  private credentials: any;
  private options: any;
  private leadRepository: ILeadRepository;

  constructor(credentials: any, options: any = {}) {
    this.credentials = credentials;
    this.options = {
      enableLogging: true,
      timeout: 30,
      retryCount: 3,
      ...options
    };

    if (!credentials.tenantId) {
      throw new Error('Tenant ID is required in credentials');
    }

    this.leadRepository = ServiceFactory.getLeadRepository();
  }

  async validate(input: any): Promise<ServiceResponse<boolean>> {
    try {
      if (!input || typeof input !== 'object') {
        return { success: false, error: 'Input must be a valid object' };
      }
      if (!this.credentials.tenantId) {
        return { success: false, error: 'Tenant ID is required in credentials' };
      }
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: `Validation failed: ${error.message}` };
    }
  }

  async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const operation = context.getNodeParameter('operation', 0) as string;

      switch (operation) {
        case 'createLead':
          return await this.createLead(context, input);
        case 'updateLead':
          return await this.updateLead(context, input);
        default:
          return { success: false, error: `Unknown or unsupported operation: ${operation}` };
      }
    } catch (error) {
      return { success: false, error: `Execution failed: ${error.message}` };
    }
  }

  private async createLead(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const leadData = context.getNodeParameter('leadData', 0) as any;
      
      if (!leadData.telefono_cliente) {
        return { success: false, error: 'Phone number is required for lead creation' };
      }

      const workflowContext: WorkflowContext = {
        requestId: crypto.randomUUID(),
        tenantId: this.credentials.tenantId,
        userId: 'n8n-system',
        timestamp: new Date().toISOString()
      };

      // Check if lead already exists
      const existingLead = await this.leadRepository.findByPhone(
        leadData.telefono_cliente,
        this.credentials.tenantId,
        workflowContext
      );

      if (existingLead.success && existingLead.data) {
        return { 
          success: false, 
          error: `Lead with phone ${leadData.telefono_cliente} already exists with id ${existingLead.data.id}` 
        };
      }

      const newLeadData: CreateLead = {
        tenant_id: this.credentials.tenantId,
        phone: leadData.telefono_cliente,
        name: leadData.nombre_cliente || 'Unknown',
        email: leadData.email_cliente || null,
        status: 'nuevo'
      };

      if (this.options.enableLogging) {
        console.log('Creating lead with data:', newLeadData);
      }

      const result = await this.leadRepository.create(newLeadData, workflowContext);

      if (!result.success) {
        return { success: false, error: `Create lead failed: ${result.error}` };
      }

      return {
        success: true,
        data: result.data,
        metadata: {
          operation: 'createLead',
          tenant_id: this.credentials.tenantId
        }
      };

    } catch (error) {
      return { success: false, error: `Create lead failed: ${error.message}` };
    }
  }

  private async updateLead(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const leadId = context.getNodeParameter('leadId', 0) as string;
      const { id, created_at, tenant_id, ...updateData } = input;

      if (!leadId) {
        return { success: false, error: 'Lead ID is required for update operation' };
      }

      if (Object.keys(updateData).length === 0) {
        return { success: false, error: 'No data provided for update.' };
      }

      const workflowContext: WorkflowContext = {
        requestId: crypto.randomUUID(),
        tenantId: this.credentials.tenantId,
        userId: 'n8n-system',
        timestamp: new Date().toISOString()
      };

      const updatePayload: UpdateLead = {
        name: updateData.name,
        email: updateData.email,
        status: updateData.status,
        assigned_advisor_id: updateData.assigned_advisor_id
      };
      
      if (this.options.enableLogging) {
        console.log(`Updating lead ${leadId} with payload:`, updatePayload);
      }

      const result = await this.leadRepository.update(leadId, updatePayload, workflowContext);

      if (!result.success) {
        return { success: false, error: `Update lead failed: ${result.error}` };
      }

      return {
        success: true,
        data: result.data,
        metadata: {
          operation: 'updateLead',
          lead_id: leadId,
          updated_fields: Object.keys(updateData)
        }
      };

    } catch (error) {
      return { success: false, error: `Update lead failed: ${error.message}` };
    }
  }
}
