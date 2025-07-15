// Lead Processor Service - Implementación de lógica de negocio separada
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class LeadProcessorService implements IOptimaCxNodeService {
  private credentials: any;
  private options: any;
  private supabase: SupabaseClient;

  constructor(credentials: any, options: any = {}) {
    this.credentials = credentials;
    this.options = {
      enableLogging: true,
      timeout: 30,
      retryCount: 3,
      ...options
    };

    if (!credentials.supabaseUrl || !credentials.supabaseServiceKey) {
      throw new Error('Supabase URL and Service Key are required in credentials');
    }

    this.supabase = createClient(credentials.supabaseUrl, credentials.supabaseServiceKey);
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

      // Check if lead already exists
      const { data: existingLead, error: findError } = await this.supabase
        .from('leads')
        .select('id')
        .eq('concesionario_id', this.credentials.tenantId)
        .eq('telefono', leadData.telefono_cliente)
        .single();

      if (findError && findError.code !== 'PGRST116') { // Ignore 'not found' error
        throw new Error(`Error checking for existing lead: ${findError.message}`);
      }
      if (existingLead) {
        return { success: false, error: `Lead with phone ${leadData.telefono_cliente} already exists with id ${existingLead.id}` };
      }

      const newLeadPayload = {
        concesionario_id: this.credentials.tenantId,
        telefono: leadData.telefono_cliente,
        nombre_completo: leadData.nombre_cliente || 'Unknown',
        email: leadData.email_cliente || null,
        canal_origen: leadData.origen || 'whatsapp',
        estado: 'nuevo',
        score_calidad: 50, // Initial score
        notas: `Lead creado desde n8n. Mensaje inicial: ${leadData.mensaje_inicial || ''}`,
        metadata: {
          created_by_node: true,
          node_version: '1.0.0',
          initial_message: leadData.mensaje_inicial || ''
        }
      };

      if (this.options.enableLogging) {
        console.log('Creating lead with payload:', newLeadPayload);
      }

      const { data, error } = await this.supabase
        .from('leads')
        .insert(newLeadPayload)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`);
      }

      return {
        success: true,
        data,
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
      // The entire input is the update data
      const { id, created_at, concesionario_id, ...updateData } = input;

      if (!leadId) {
        return { success: false, error: 'Lead ID is required for update operation' };
      }

      if (Object.keys(updateData).length === 0) {
        return { success: false, error: 'No data provided for update.' };
      }

      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      
      if (this.options.enableLogging) {
        console.log(`Updating lead ${leadId} with payload:`, updatePayload);
      }

      const { data, error } = await this.supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase update error: ${error.message}`);
      }

      return {
        success: true,
        data,
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
