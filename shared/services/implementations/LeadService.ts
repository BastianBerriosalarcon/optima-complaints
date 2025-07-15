// Lead Service Implementation - Principio de Responsabilidad Única y Inversión de Dependencias
import {
  ILeadService,
  ILeadAnalysisService,
  ILeadNotificationService,
  CreateLeadDto,
  UpdateLeadDto,
  LeadFilters
} from '../interfaces/ILeadService';
import {
  IDataService,
  ILeadRepository,
  ITenantRepository,
  IAdvisorRepository
} from '../interfaces/IDataService';
import {
  IAIService,
  INotificationService,
  IConfigurationService,
  IAuditService
} from '../interfaces/IExternalServices';
import {
  Lead,
  LeadStatus,
  AIAnalysis,
  WhatsAppMessage,
  ServiceResponse,
  PaginatedResponse,
  WorkflowContext,
  IntentionType
} from '../../types/core';

// Implementación siguiendo principios SOLID
export class LeadService implements ILeadService {
  constructor(
    private leadRepository: ILeadRepository,
    private tenantRepository: ITenantRepository,
    private advisorRepository: IAdvisorRepository,
    private auditService: IAuditService,
    private configService: IConfigurationService
  ) {}

  async createLead(data: CreateLeadDto, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      // Validación de entrada
      if (!data.telefono_cliente || !data.concesionario_id) {
        return {
          success: false,
          error: 'Teléfono y concesionario son requeridos'
        };
      }

      // Verificar si ya existe un lead para este teléfono
      const existingLead = await this.leadRepository.findByPhone(
        data.telefono_cliente,
        data.concesionario_id,
        context
      );

      if (existingLead.success && existingLead.data) {
        return {
          success: false,
          error: 'Ya existe un lead para este número de teléfono',
          data: existingLead.data
        };
      }

      // Crear el lead
      const leadData = {
        ...data,
        estado: LeadStatus.NUEVO,
        nivel_interes: 5, // Valor inicial
        notas_ia: `Lead creado desde ${data.origen}`,
        metadata: {
          mensaje_inicial: data.mensaje_inicial,
          created_by_workflow: context.correlation_id
        }
      };

      const result = await this.leadRepository.create(leadData, context);

      if (result.success && result.data) {
        // Auditar la creación
        await this.auditService.logEvent({
          entityType: 'lead',
          entityId: result.data.id,
          action: 'create',
          userId: context.user_id,
          tenantId: context.tenant_id,
          timestamp: new Date(),
          metadata: { origen: data.origen }
        }, context);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Error al crear lead: ${error.message}`
      };
    }
  }

  async updateLead(id: string, data: UpdateLeadDto, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      // Obtener el lead actual para auditoría
      const currentLead = await this.leadRepository.findById(id, context);
      if (!currentLead.success || !currentLead.data) {
        return {
          success: false,
          error: 'Lead no encontrado'
        };
      }

      // Actualizar
      const result = await this.leadRepository.update(id, data, context);

      if (result.success && result.data) {
        // Auditar los cambios
        const changes: Record<string, { old: any; new: any }> = {};
        Object.keys(data).forEach(key => {
          if (currentLead.data[key] !== data[key]) {
            changes[key] = {
              old: currentLead.data[key],
              new: data[key]
            };
          }
        });

        if (Object.keys(changes).length > 0) {
          await this.auditService.logEvent({
            entityType: 'lead',
            entityId: id,
            action: 'update',
            changes,
            userId: context.user_id,
            tenantId: context.tenant_id,
            timestamp: new Date()
          }, context);
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Error al actualizar lead: ${error.message}`
      };
    }
  }

  async getLead(id: string, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      const result = await this.leadRepository.findById(id, context);
      
      if (result.success && result.data) {
        // Auditar la consulta
        await this.auditService.logEvent({
          entityType: 'lead',
          entityId: id,
          action: 'view',
          userId: context.user_id,
          tenantId: context.tenant_id,
          timestamp: new Date()
        }, context);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Error al obtener lead: ${error.message}`
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
            hasMore: total === limit // Simplificado
          }
        };
      }

      return result as any;
    } catch (error) {
      return {
        success: false,
        error: `Error al obtener leads: ${error.message}`
      };
    }
  }

  async assignAdvisor(leadId: string, advisorId: string, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      // Verificar que el asesor existe y está disponible
      const advisor = await this.advisorRepository.findById(advisorId, context);
      if (!advisor.success || !advisor.data) {
        return {
          success: false,
          error: 'Asesor no encontrado'
        };
      }

      // Actualizar el lead
      const result = await this.updateLead(leadId, {
        asesor_asignado_id: advisorId
      }, context);

      if (result.success) {
        // Incrementar contador de leads del asesor
        await this.advisorRepository.updateLeadCount(advisorId, 1, context);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Error al asignar asesor: ${error.message}`
      };
    }
  }

  async updateLeadStatus(leadId: string, newStatus: LeadStatus, context: WorkflowContext): Promise<ServiceResponse<Lead>> {
    try {
      const result = await this.leadRepository.updateStatus(leadId, newStatus, context);
      return result as ServiceResponse<Lead>;
    } catch (error) {
      return {
        success: false,
        error: `Error al actualizar estado: ${error.message}`
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
    } catch (error) {
      return {
        success: false,
        error: `Error al buscar lead existente: ${error.message}`
      };
    }
  }

  async getLeadHistory(leadId: string): Promise<ServiceResponse<any[]>> {
    try {
      const context: WorkflowContext = {
        tenant_id: '',
        correlation_id: `lead-history-${Date.now()}`,
        timestamp: new Date()
      };

      return await this.auditService.getEntityHistory('lead', leadId, context);
    } catch (error) {
      return {
        success: false,
        error: `Error al obtener historial: ${error.message}`
      };
    }
  }
}

// Servicio especializado en análisis de leads
export class LeadAnalysisService implements ILeadAnalysisService {
  constructor(
    private aiService: IAIService,
    private configService: IConfigurationService,
    private advisorRepository: IAdvisorRepository
  ) {}

  async analyzeMessage(
    message: WhatsAppMessage, 
    leadContext: Lead | null, 
    context: WorkflowContext
  ): Promise<ServiceResponse<AIAnalysis>> {
    try {
      // Obtener configuración de IA para el tenant
      const aiConfig = await this.configService.getAISettings(context.tenant_id, context);
      if (!aiConfig.success) {
        return {
          success: false,
          error: 'No se pudo obtener configuración de IA'
        };
      }

      // Construir contexto para el análisis
      const analysisContext = this.buildAnalysisContext(message, leadContext);
      
      // Realizar análisis con IA
      const analysis = await this.aiService.analyzeMessage(
        message.body,
        analysisContext,
        aiConfig.data,
        context
      );

      return analysis;
    } catch (error) {
      return {
        success: false,
        error: `Error en análisis de mensaje: ${error.message}`
      };
    }
  }

  async extractEntities(messageText: string, context: WorkflowContext): Promise<ServiceResponse<any>> {
    try {
      const entityTypes = ['nombre', 'email', 'vehiculo', 'presupuesto', 'fecha'];
      return await this.aiService.extractEntities(messageText, entityTypes, context);
    } catch (error) {
      return {
        success: false,
        error: `Error extrayendo entidades: ${error.message}`
      };
    }
  }

  async calculateInterestLevel(analysis: AIAnalysis, leadHistory: any[]): Promise<ServiceResponse<number>> {
    try {
      let interestLevel = 5; // Base

      // Ajustar basado en la intención
      switch (analysis.intencion) {
        case IntentionType.COMPRA:
          interestLevel = 8;
          break;
        case IntentionType.INFORMACION:
          interestLevel = 6;
          break;
        case IntentionType.SERVICIO:
          interestLevel = 4;
          break;
        default:
          interestLevel = 3;
      }

      // Ajustar basado en entidades extraídas
      if (analysis.entidades_extraidas.presupuesto) {
        interestLevel += 1;
      }
      if (analysis.entidades_extraidas.vehiculo_mencionado) {
        interestLevel += 1;
      }
      if (analysis.entidades_extraidas.fecha_visita) {
        interestLevel += 2;
      }

      // Considerar historial previo
      if (leadHistory.length > 3) {
        interestLevel += 1; // Lead recurrente
      }

      // Normalizar entre 1-10
      interestLevel = Math.min(10, Math.max(1, interestLevel));

      return {
        success: true,
        data: interestLevel
      };
    } catch (error) {
      return {
        success: false,
        error: `Error calculando nivel de interés: ${error.message}`
      };
    }
  }

  async suggestAdvisor(lead: Lead, context: WorkflowContext): Promise<ServiceResponse<string>> {
    try {
      // Determinar especialidad requerida
      let specialty = 'ventas';
      if (lead.intencion_detectada === IntentionType.SERVICIO) {
        specialty = 'post_venta';
      }

      // Buscar asesores disponibles
      const advisors = await this.advisorRepository.findAvailableAdvisors(
        lead.concesionario_id,
        specialty,
        context
      );

      if (!advisors.success || !advisors.data?.length) {
        return {
          success: false,
          error: 'No hay asesores disponibles'
        };
      }

      // Seleccionar el asesor con menos leads asignados
      const selectedAdvisor = advisors.data.sort((a, b) => a.leads_asignados - b.leads_asignados)[0];

      return {
        success: true,
        data: selectedAdvisor.id
      };
    } catch (error) {
      return {
        success: false,
        error: `Error sugiriendo asesor: ${error.message}`
      };
    }
  }

  async generateResponse(
    analysis: AIAnalysis, 
    leadContext: Lead, 
    context: WorkflowContext
  ): Promise<ServiceResponse<string>> {
    try {
      // Obtener template de respuesta basado en la intención
      const templateName = `response_${analysis.intencion}`;
      const template = await this.aiService.getPromptTemplate(templateName, 'ventas');
      
      if (!template.success) {
        return {
          success: false,
          error: 'Template de respuesta no encontrado'
        };
      }

      // Renderizar respuesta personalizada
      const responsePrompt = this.aiService.renderPrompt(template.data, {
        cliente_nombre: leadContext.nombre_cliente || 'Cliente',
        vehiculo_interes: leadContext.vehiculo_interes || 'vehículo',
        nivel_interes: analysis.nivel_interes,
        entidades: analysis.entidades_extraidas
      });

      const response = await this.aiService.generateResponse(responsePrompt, { lead: leadContext }, context);
      return response;
    } catch (error) {
      return {
        success: false,
        error: `Error generando respuesta: ${error.message}`
      };
    }
  }

  private buildAnalysisContext(message: WhatsAppMessage, leadContext: Lead | null): string {
    let context = `Mensaje: "${message.body}"\n`;
    
    if (leadContext) {
      context += `Cliente existente: ${leadContext.nombre_cliente || 'Anónimo'}\n`;
      context += `Estado actual: ${leadContext.estado}\n`;
      context += `Interés previo: ${leadContext.vehiculo_interes || 'No especificado'}\n`;
      context += `Historial: ${leadContext.notas_ia}\n`;
    } else {
      context += `Cliente nuevo\n`;
    }
    
    return context;
  }
}