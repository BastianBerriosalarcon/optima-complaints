
// Lead Service Implementation - Principio de Responsabilidad Única y Inversión de Dependencias
import {
  ILeadService,
  ILeadAnalysisService,
  CreateLeadDto,
  UpdateLeadDto,
  LeadFilters
} from '../interfaces/ILeadService';
import {
  ILeadRepository,
  ITenantRepository,
  IAdvisorRepository
} from '../interfaces/IDataService';
import {
  IAuditService
} from '../interfaces/IExternalServices';
import {
  Lead,
  LeadStatus,
  ServiceResponse,
  PaginatedResponse,
  WorkflowContext,
} from '../../types/core';
import { LeadValidator } from '../helpers/LeadValidator';
import { AdvisorAssignmentHelper } from '../helpers/AdvisorAssignmentHelper';
import { LeadAuditHelper } from '../helpers/LeadAuditHelper';

export class LeadService implements ILeadService {
  private leadValidator: LeadValidator;
  private advisorAssignmentHelper: AdvisorAssignmentHelper;
  private leadAuditHelper: LeadAuditHelper;

  constructor(
    private leadRepository: ILeadRepository,
    private tenantRepository: ITenantRepository,
    private advisorRepository: IAdvisorRepository,
    private auditService: IAuditService,
    private leadAnalysisService: ILeadAnalysisService
  ) {
    this.leadValidator = new LeadValidator(this.leadRepository);
    this.advisorAssignmentHelper = new AdvisorAssignmentHelper(this.advisorRepository, this.leadRepository);
    this.leadAuditHelper = new LeadAuditHelper(this.auditService);
  }

  async createLead(data: CreateLeadDto, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      const validationResult = await this.leadValidator.validateCreateLead(data, context);
      if (!validationResult.success) {
        return { success: false, error: validationResult.error };
      }

      const leadData = {
        ...data,
        estado: LeadStatus.NUEVO,
        nivel_interes: 5,
        notas_ia: `Lead creado desde ${data.origen}`,
        metadata: {
          mensaje_inicial: data.mensaje_inicial,
          created_by_workflow: context.correlation_id
        }
      };

      const result = await this.leadRepository.create(leadData, context);

      if (result.success && result.data) {
        await this.leadAuditHelper.logLeadCreation(result.data, data, context);
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al crear lead: ${errorMessage}`
      };
    }
  }

  async updateLead(id: string, data: UpdateLeadDto, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      const validationResult = await this.leadValidator.validateUpdateLead(id, context);
      if (!validationResult.success) {
        return validationResult;
      }
      const currentLead = validationResult.data;

      if (!currentLead) {
        return {
          success: false,
          error: 'No se pudo obtener el lead actual para actualizar.'
        };
      }

      const result = await this.leadRepository.update(id, data, context);

      if (result.success && result.data) {
        await this.leadAuditHelper.logLeadUpdate(id, currentLead, data, context);
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al actualizar lead: ${errorMessage}`
      };
    }
  }

  async getLead(id: string, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      const result = await this.leadRepository.findById(id, context);
      
      if (result.success && result.data) {
        await this.leadAuditHelper.logLeadView(id, context);
      }
      
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al obtener lead: ${errorMessage}`
      };
    }
  }

  async getLeads(filters: LeadFilters, page: number = 1, limit: number = 10): Promise<ServiceResponse<PaginatedResponse<Lead>>> {
    try {
      const offset = (page - 1) * limit;
      const result = await this.leadRepository.findMany({
        ...filters,
        limit,
        offset
      }, { tenant_id: filters.concesionario_id } as WorkflowContext);

      if (result.success) {
        const total = result.data?.length || 0;
        return {
          success: true,
          data: {
            items: result.data || [],
            total,
            page,
            limit,
            hasMore: total === limit
          }
        };
      }

      return result as any;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al obtener leads: ${errorMessage}`
      };
    }
  }

  async assignAdvisor(leadId: string, advisorId: string, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      return await this.advisorAssignmentHelper.assignAdvisorToLead(leadId, advisorId, context);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al asignar asesor: ${errorMessage}`
      };
    }
  }

  async updateLeadStatus(leadId: string, newStatus: LeadStatus, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      const result = await this.leadRepository.updateStatus(leadId, newStatus, context);
      return result as ServiceResponse<Lead>;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al actualizar estado: ${errorMessage}`
      };
    }
  }

  async findExistingLead(phone: string, tenantId: string): Promise<ServiceResponse<Lead | null>> {
    try {
      const context: WorkflowContext = {
        tenant_id: tenantId,
        correlation_id: `find-lead-${Date.now()}`,
        timestamp: new Date()
      };

      return await this.leadRepository.findByPhone(phone, tenantId, context);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al buscar lead existente: ${errorMessage}`
      };
    }
  }

  async getLeadHistory(leadId: string): Promise<ServiceResponse<any[]>> {
    try {
      return await this.leadAuditHelper.getLeadHistory(leadId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Error al obtener historial: ${errorMessage}`
      };
    }
  }
}
