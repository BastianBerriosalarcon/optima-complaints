// External Services Interfaces - Principio Abierto/Cerrado (OCP)
import { ServiceResponse, WhatsAppMessage, AIAnalysis, WorkflowContext } from '../../types/core';

// ===== WHATSAPP SERVICE =====
export interface WhatsAppSendRequest {
  to: string;
  message: string;
  type?: 'text' | 'template' | 'media';
  templateData?: Record<string, any>;
}

export interface WhatsAppResponse {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
}

export interface IWhatsAppService {
  sendMessage(request: WhatsAppSendRequest, context: WorkflowContext): Promise<ServiceResponse<WhatsAppResponse>>;
  sendTemplate(to: string, templateName: string, parameters: any[], context: WorkflowContext): Promise<ServiceResponse<WhatsAppResponse>>;
  markAsRead(messageId: string, context: WorkflowContext): Promise<ServiceResponse<void>>;
  validateWebhook(payload: any, signature: string): boolean;
  parseIncomingMessage(payload: any): WhatsAppMessage | null;
}

// ===== AI SERVICE =====
export interface AIRequest {
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIPromptTemplate {
  name: string;
  template: string;
  variables: string[];
  contextType: 'ventas' | 'post_venta' | 'general';
}

export interface IAIService {
  // Análisis de mensajes
  analyzeMessage(message: string, context: string, tenantConfig: any, workflowContext: WorkflowContext): Promise<ServiceResponse<AIAnalysis>>;
  
  // Generación de respuestas
  generateResponse(prompt: string, context: any, workflowContext: WorkflowContext): Promise<ServiceResponse<string>>;
  
  // Extracción de entidades
  extractEntities(text: string, entityTypes: string[], workflowContext: WorkflowContext): Promise<ServiceResponse<Record<string, any>>>;
  
  // Clasificación
  classifyIntent(message: string, possibleIntents: string[], workflowContext: WorkflowContext): Promise<ServiceResponse<{ intent: string; confidence: number }>>;
  
  // Configuración de prompts
  getPromptTemplate(name: string, contextType: string): Promise<ServiceResponse<AIPromptTemplate>>;
  renderPrompt(template: AIPromptTemplate, variables: Record<string, any>): string;
}

// ===== NOTIFICATION SERVICE =====
export interface NotificationRequest {
  recipient: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  subject?: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface INotificationService {
  sendNotification(request: NotificationRequest, context: WorkflowContext): Promise<ServiceResponse<void>>;
  sendBulkNotifications(requests: NotificationRequest[], context: WorkflowContext): Promise<ServiceResponse<any[]>>;
  scheduleNotification(request: NotificationRequest, scheduledFor: Date, context: WorkflowContext): Promise<ServiceResponse<string>>;
  cancelScheduledNotification(notificationId: string, context: WorkflowContext): Promise<ServiceResponse<void>>;
}

// ===== CONFIGURATION SERVICE =====
export interface IConfigurationService {
  // Configuración de tenant
  getTenantConfig(tenantId: string, context: WorkflowContext): Promise<ServiceResponse<any>>;
  updateTenantConfig(tenantId: string, config: Partial<any>, context: WorkflowContext): Promise<ServiceResponse<any>>;
  
  // Configuración de AI
  getAISettings(tenantId: string, context: WorkflowContext): Promise<ServiceResponse<any>>;
  updateAISettings(tenantId: string, settings: Partial<any>, context: WorkflowContext): Promise<ServiceResponse<any>>;
  
  // Horarios de negocio
  getBusinessHours(tenantId: string, context: WorkflowContext): Promise<ServiceResponse<any>>;
  isBusinessHours(tenantId: string, timestamp: Date, context: WorkflowContext): Promise<ServiceResponse<boolean>>;
  
  // Configuración de workflows
  getWorkflowConfig(workflowName: string, tenantId: string, context: WorkflowContext): Promise<ServiceResponse<any>>;
}

// ===== AUDIT SERVICE =====
export interface AuditEvent {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  changes?: Record<string, { old: any; new: any }>;
  userId?: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IAuditService {
  logEvent(event: AuditEvent, context: WorkflowContext): Promise<ServiceResponse<void>>;
  getEntityHistory(entityType: string, entityId: string, context: WorkflowContext): Promise<ServiceResponse<AuditEvent[]>>;
  getUserActivity(userId: string, tenantId: string, startDate: Date, endDate: Date): Promise<ServiceResponse<AuditEvent[]>>;
}