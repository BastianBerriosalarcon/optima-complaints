// Lead Service Interface - Principio de Segregación de Interfaces (ISP)
import {
  Lead,
  LeadStatus,
  AIAnalysis,
  WhatsAppMessage,
  ServiceResponse,
  PaginatedResponse,
  WorkflowContext
} from '../../types/core';

export interface CreateLeadDto {
  concesionario_id: string;
  telefono_cliente: string;
  origen: string;
  mensaje_inicial: string;
  nombre_cliente?: string;
  email_cliente?: string;
}

export interface UpdateLeadDto {
  nombre_cliente?: string;
  email_cliente?: string;
  estado?: LeadStatus;
  nivel_interes?: number;
  asesor_asignado_id?: string;
  notas_ia?: string;
  vehiculo_interes?: any;
  presupuesto_estimado?: number;
}

export interface LeadFilters {
  concesionario_id: string;
  estado?: LeadStatus;
  asesor_asignado_id?: string;
  fecha_desde?: Date;
  fecha_hasta?: Date;
  origen?: string;
  nivel_interes_min?: number;
}

// Principio de Responsabilidad Única (SRP) - Cada interfaz tiene una responsabilidad específica
export interface ILeadService {
  // Operaciones CRUD básicas
  createLead(data: CreateLeadDto, context: WorkflowContext): Promise<ServiceResponse<Lead>>;
  updateLead(id: string, data: UpdateLeadDto, context: WorkflowContext): Promise<ServiceResponse<Lead>>;
  getLead(id: string, context: WorkflowContext): Promise<ServiceResponse<Lead>>;
  getLeads(filters: LeadFilters, page: number, limit: number): Promise<ServiceResponse<PaginatedResponse<Lead>>>;
  
  // Operaciones de negocio específicas
  assignAdvisor(leadId: string, advisorId: string, context: WorkflowContext): Promise<ServiceResponse<Lead>>;
  updateLeadStatus(leadId: string, newStatus: LeadStatus, context: WorkflowContext): Promise<ServiceResponse<Lead>>;
  
  // Búsqueda y análisis
  findExistingLead(phone: string, tenantId: string): Promise<ServiceResponse<Lead | null>>;
  getLeadHistory(leadId: string): Promise<ServiceResponse<any[]>>;
}

export interface ILeadAnalysisService {
  // Análisis con IA
  analyzeMessage(message: WhatsAppMessage, leadContext: Lead | null, context: WorkflowContext): Promise<ServiceResponse<AIAnalysis>>;
  extractEntities(messageText: string, context: WorkflowContext): Promise<ServiceResponse<any>>;
  calculateInterestLevel(analysis: AIAnalysis, leadHistory: any[]): Promise<ServiceResponse<number>>;
  
  // Recomendaciones
  suggestAdvisor(lead: Lead, context: WorkflowContext): Promise<ServiceResponse<string>>;
  generateResponse(analysis: AIAnalysis, leadContext: Lead, context: WorkflowContext): Promise<ServiceResponse<string>>;
}

export interface ILeadNotificationService {
  // Notificaciones
  notifyAdvisorAssignment(leadId: string, advisorId: string, context: WorkflowContext): Promise<ServiceResponse<void>>;
  notifyLeadStatusChange(leadId: string, oldStatus: LeadStatus, newStatus: LeadStatus, context: WorkflowContext): Promise<ServiceResponse<void>>;
  sendFollowUpReminder(leadId: string, context: WorkflowContext): Promise<ServiceResponse<void>>;
}