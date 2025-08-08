// Advisor Assigner Service - Principio de Responsabilidad Única
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse, WorkflowContext } from '@shared/types/core';
import { ServiceFactory } from '@shared/services/ServiceFactory';
import { IDataService } from '@shared/services/interfaces/IDataService';
import { AdvisorWorkloadManager } from '@shared/services/helpers/AdvisorWorkloadManager';
import { createClient } from '@supabase/supabase-js';

export class AdvisorAssignerService implements IOptimaCxNodeService {
  private credentials: any;
  private options: any;
  private dataService: IDataService;
  private workloadManager: AdvisorWorkloadManager;
  private supabase: any;

  constructor(credentials: any, options: any = {}) {
    this.credentials = credentials;
    this.options = {
      enableLogging: true,
      timeout: 30,
      retryCount: 3,
      assignmentStrategy: 'balanced_workload',
      considerSpecialty: true,
      considerAvailability: true,
      ...options
    };

    if (!credentials.tenantId) {
      throw new Error('Tenant ID is required in credentials');
    }

    // Initialize Supabase client
    this.supabase = createClient(
      credentials.supabaseUrl || process.env.SUPABASE_URL,
      credentials.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    this.dataService = ServiceFactory.getDataService();
    this.workloadManager = new AdvisorWorkloadManager(this.supabase);
  }

  async validate(input: any): Promise<ServiceResponse<boolean>> {
    try {
      if (!input || typeof input !== 'object') {
        return {
          success: false,
          error: 'Input must be a valid object'
        };
      }

      if (!this.credentials.tenantId) {
        return {
          success: false,
          error: 'Tenant ID is required in credentials'
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error.message}`
      };
    }
  }

  async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const operation = context.getNodeParameter('operation', 0) as string;

      switch (operation) {
        case 'assignAdvisor':
          return await this.assignAdvisor(context, input);
        case 'getAvailableAdvisors':
          return await this.getAvailableAdvisors(context, input);
        case 'reassignLead':
          return await this.reassignLead(context, input);
        case 'getAdvisorWorkload':
          return await this.getAdvisorWorkload(context, input);
        case 'updateAvailability':
          return await this.updateAdvisorAvailability(context, input);
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Execution failed: ${error.message}`
      };
    }
  }

  private async assignAdvisor(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const leadData = context.getNodeParameter('leadData', 0) as any;
      const assignmentCriteria = context.getNodeParameter('assignmentCriteria', 0, {}) as any;

      if (!leadData || !leadData.id) {
        return {
          success: false,
          error: 'Lead data with ID is required for advisor assignment'
        };
      }

      // Use workload manager to get best available advisor
      const selectedAdvisor = await this.workloadManager.getBestAdvisorForAssignment(
        this.credentials.tenantId,
        {
          sucursalId: leadData.sucursal_id,
          vehicleModel: leadData.modelo_interes,
          leadPriority: this.calculateAssignmentPriority(leadData),
          requiresSpecialty: assignmentCriteria.considerSpecialty
        }
      );

      if (!selectedAdvisor) {
        return {
          success: false,
          error: 'No suitable advisor available for assignment'
        };
      }

      // Use workload manager to assign lead atomically
      await this.workloadManager.assignLeadToAdvisor(
        leadData.id,
        selectedAdvisor.id,
        this.credentials.tenantId
      );

      const assignment = {
        lead_id: leadData.id,
        advisor_id: selectedAdvisor.id,
        advisor_name: selectedAdvisor.nombre,
        advisor_role: selectedAdvisor.role,
        specialty: selectedAdvisor.especialidad,
        sucursal_nombre: selectedAdvisor.sucursal_nombre,
        current_workload: selectedAdvisor.carga_actual,
        assignment_reason: this.generateAssignmentReason(selectedAdvisor, leadData, assignmentCriteria),
        assignment_strategy: this.options.assignmentStrategy,
        assigned_at: new Date().toISOString(),
        priority: this.calculateAssignmentPriority(leadData),
        tenant_id: this.credentials.tenantId,
      };

      if (this.options.enableLogging) {
        console.log('Advisor assigned using workload manager:', {
          leadId: leadData.id,
          advisorId: selectedAdvisor.id,
          advisorName: selectedAdvisor.nombre,
          advisorRole: selectedAdvisor.role,
          currentWorkload: selectedAdvisor.carga_actual,
          reason: assignment.assignment_reason,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: assignment,
        metadata: {
          operation: 'assignAdvisor',
          assignment_strategy: this.options.assignmentStrategy,
          workload_managed: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Advisor assignment failed: ${error.message}`
      };
    }
  }

  private async getAvailableAdvisors(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const filters = context.getNodeParameter('filters', 0, {}) as any;
      
      // Use workload manager to get available sales team
      const advisors = await this.workloadManager.getAvailableSalesTeam(
        this.credentials.tenantId,
        filters.sucursalId,
        filters.especialidad
      );

      const result = {
        advisors: advisors,
        total_count: advisors.length,
        filters_applied: filters,
        retrieved_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId
      };

      if (this.options.enableLogging) {
        console.log('Available advisors retrieved via workload manager:', {
          totalCount: result.total_count,
          filtersApplied: Object.keys(filters).length,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'getAvailableAdvisors',
          filter_count: Object.keys(filters).length,
          workload_managed: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Get available advisors failed: ${error.message}`
      };
    }
  }

  // Métodos auxiliares
  private async fetchAvailableAdvisors(filters: any = {}): Promise<ServiceResponse<any[]>> {
    const advisorRoles = ['asesor_ventas', 'gerente_ventas', 'jefe_servicio', 'asesor_servicio'];
    
    let query = this.supabase
      .from('usuarios')
      .select(`
        id,
        nombre_completo,
        email,
        role,
        activo,
        areas_responsabilidad,
        leads:leads!asesor_asignado_id(count)
      `)
      .eq('concesionario_id', this.credentials.tenantId)
      .in('role', advisorRoles);

    if (filters.specialty) {
      query = query.eq('role', filters.specialty);
    }
    if (filters.onlyAvailable) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: `Failed to fetch advisors: ${error.message}` };
    }

    const advisors = data.map((user: any) => ({
      id: user.id,
      nombre: user.nombre_completo,
      email: user.email,
      especialidad: user.role,
      carga_actual: user.leads[0]?.count || 0,
      capacidad_maxima: 10, // This could be a field in the usuarios table
      disponible: user.activo,
      estado: user.activo ? 'activo' : 'inactivo',
      ultima_asignacion: user.updated_at, // Approximation
      rating_promedio: 4.5, // Mocked for now
      conversiones_mes: 10, // Mocked for now
      tiempo_respuesta_promedio: 15 // Mocked for now
    }));

    let filteredAdvisors = advisors;
    if (filters.maxWorkload !== undefined) {
      filteredAdvisors = filteredAdvisors.filter(advisor => advisor.carga_actual <= filters.maxWorkload);
    }

    return { success: true, data: filteredAdvisors };
  }

  private selectBestAdvisor(advisors: any[], leadData: any, criteria: any): any {
    const strategy = criteria.strategy || this.options.assignmentStrategy;

    switch (strategy) {
      case 'balanced_workload':
        return this.selectByBalancedWorkload(advisors, leadData);
      case 'round_robin':
        return this.selectByRoundRobin(advisors);
      default:
        return this.selectByBalancedWorkload(advisors, leadData);
    }
  }

  private selectByBalancedWorkload(advisors: any[], leadData: any): any {
    const availableAdvisors = advisors.filter(a => a.disponible);
    if (availableAdvisors.length === 0) return null;
    availableAdvisors.sort((a, b) => a.carga_actual - b.carga_actual);
    return availableAdvisors[0];
  }

  private selectByRoundRobin(advisors: any[]): any {
    const availableAdvisors = advisors.filter(a => a.disponible);
    if (availableAdvisors.length === 0) return null;
    availableAdvisors.sort((a, b) => new Date(a.ultima_asignacion).getTime() - new Date(b.ultima_asignacion).getTime());
    return availableAdvisors[0];
  }

  private generateAssignmentReason(advisor: any, leadData: any, criteria: any): string {
    return `Assigned via ${criteria.strategy || this.options.assignmentStrategy} strategy. Advisor workload: ${advisor.carga_actual}.`;
  }

  private calculateAssignmentPriority(leadData: any): 'high' | 'medium' | 'low' {
    const message = (leadData.mensaje_inicial || '').toLowerCase();
    if (message.includes('urgente') || message.includes('hoy')) return 'high';
    if (message.includes('comprar') || message.includes('precio')) return 'medium';
    return 'low';
  }

  private async updateAdvisorWorkload(advisorId: string, change: number): Promise<void> {
    // This is now implicitly handled by the lead assignment count.
    // For more complex logic, we could use an RPC call in Supabase.
    console.log(`Advisor ${advisorId} workload will be recalculated on next fetch.`);
  }

  private async reassignLead(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const reassignmentData = context.getNodeParameter('reassignmentFields', 0) as any;
      
      if (!reassignmentData.leadId || !reassignmentData.fromAdvisorId || !reassignmentData.toAdvisorId) {
        return {
          success: false,
          error: 'Lead ID, from advisor ID, and to advisor ID are required for reassignment'
        };
      }

      await this.workloadManager.reassignLead(
        reassignmentData.leadId,
        reassignmentData.fromAdvisorId,
        reassignmentData.toAdvisorId,
        this.credentials.tenantId,
        reassignmentData.reason
      );

      const result = {
        lead_id: reassignmentData.leadId,
        from_advisor_id: reassignmentData.fromAdvisorId,
        to_advisor_id: reassignmentData.toAdvisorId,
        reason: reassignmentData.reason,
        reassigned_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId
      };

      if (this.options.enableLogging) {
        console.log('Lead reassigned via workload manager:', result);
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'reassignLead',
          workload_managed: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Lead reassignment failed: ${error.message}`
      };
    }
  }

  private async getAdvisorWorkload(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const workloadQuery = context.getNodeParameter('workloadAndAvailability', 0, {}) as any;
      
      const stats = await this.workloadManager.getWorkloadStats(
        this.credentials.tenantId,
        workloadQuery.fechaInicio ? new Date(workloadQuery.fechaInicio) : undefined,
        workloadQuery.fechaFin ? new Date(workloadQuery.fechaFin) : undefined
      );

      const result = {
        workload_statistics: stats,
        total_advisors: stats.length,
        retrieved_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId
      };

      if (this.options.enableLogging) {
        console.log('Advisor workload statistics retrieved:', {
          totalAdvisors: result.total_advisors,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'getAdvisorWorkload',
          workload_managed: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Get advisor workload failed: ${error.message}`
      };
    }
  }

  private async updateAdvisorAvailability(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const availabilityData = context.getNodeParameter('availabilityUpdate', 0) as any;
      
      if (!availabilityData.advisorId) {
        return {
          success: false,
          error: 'Advisor ID is required for availability update'
        };
      }

      // Update advisor availability in usuarios table
      const { error } = await this.supabase
        .from('usuarios')
        .update({ 
          activo: availabilityData.available,
          updated_at: new Date().toISOString()
        })
        .eq('id', availabilityData.advisorId)
        .eq('concesionario_id', this.credentials.tenantId);

      if (error) {
        throw new Error(`Failed to update advisor availability: ${error.message}`);
      }

      const result = {
        advisor_id: availabilityData.advisorId,
        available: availabilityData.available,
        updated_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId
      };

      if (this.options.enableLogging) {
        console.log('Advisor availability updated:', result);
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'updateAdvisorAvailability'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Update advisor availability failed: ${error.message}`
      };
    }
  }
}
