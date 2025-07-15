// Core Types - OptimaCX Platform
// Definiciones de tipos compartidos para toda la plataforma

// ===== TENANT & USER TYPES =====
export interface TenantConfig {
  id: string;
  nombre: string;
  telefono_principal: string;
  configuracion_ai: AISettings;
  configuracion_horarios: BusinessHours;
  activo: boolean;
}

export interface BusinessHours {
  lunes_a_viernes: { inicio: string; fin: string };
  sabados: { inicio: string; fin: string };
  domingos: { activo: boolean; inicio?: string; fin?: string };
  timezone: string;
}

export interface AISettings {
  modelo_ia: string;
  temperatura: number;
  max_tokens: number;
  prompt_ventas: string;
  prompt_post_venta: string;
  umbral_intencion: number;
}

// ===== LEAD TYPES =====
export interface Lead {
  id: string;
  concesionario_id: string;
  telefono_cliente: string;
  nombre_cliente?: string;
  email_cliente?: string;
  estado: LeadStatus;
  origen: LeadOrigin;
  intencion_detectada: IntentionType;
  nivel_interes: number;
  asesor_asignado_id?: string;
  vehiculo_interes?: VehicleInterest;
  presupuesto_estimado?: number;
  notas_ia: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export enum LeadStatus {
  NUEVO = 'nuevo',
  CONTACTADO = 'contactado',
  CALIFICADO = 'calificado',
  OPORTUNIDAD = 'oportunidad',
  PERDIDO = 'perdido',
  VENDIDO = 'vendido'
}

export enum LeadOrigin {
  WHATSAPP = 'whatsapp',
  TELEFONO = 'telefono',
  EMAIL = 'email',
  WEB = 'web',
  REFERIDO = 'referido'
}

export enum IntentionType {
  COMPRA = 'compra',
  INFORMACION = 'informacion',
  SERVICIO = 'servicio',
  RECLAMO = 'reclamo',
  OTRO = 'otro'
}

export interface VehicleInterest {
  marca: string;
  modelo: string;
  año?: number;
  tipo: 'nuevo' | 'usado';
  financiamiento_requerido: boolean;
}

// ===== MESSAGE TYPES =====
export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: Date;
  messageId: string;
  type: 'text' | 'image' | 'document' | 'audio';
  metadata?: Record<string, any>;
}

export interface AIAnalysis {
  intencion: IntentionType;
  nivel_interes: number;
  entidades_extraidas: ExtractedEntities;
  respuesta_sugerida: string;
  requiere_asesor: boolean;
  sentimiento: 'positivo' | 'neutral' | 'negativo';
  confianza: number;
}

export interface ExtractedEntities {
  nombre?: string;
  email?: string;
  vehiculo_mencionado?: string;
  presupuesto?: number;
  fecha_visita?: Date;
  servicio_solicitado?: string;
}

// ===== ADVISOR TYPES =====
export interface Advisor {
  id: string;
  concesionario_id: string;
  nombre: string;
  email: string;
  telefono: string;
  especialidad: AdvisorSpecialty;
  activo: boolean;
  leads_asignados: number;
  rating_promedio: number;
}

export enum AdvisorSpecialty {
  VENTAS = 'ventas',
  POST_VENTA = 'post_venta',
  REPUESTOS = 'repuestos',
  FINANCIAMIENTO = 'financiamiento'
}

// ===== SERVICE INTERFACES =====
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ===== CONFIGURATION TYPES =====
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

export interface ExternalAPIConfig {
  whatsapp: {
    api_url: string;
    token: string;
    webhook_verify_token: string;
  };
  ai: {
    provider: 'openai' | 'gemini' | 'claude';
    api_key: string;
    model: string;
    base_url?: string;
  };
}

// ===== WORKFLOW CONTEXT =====
export interface WorkflowContext {
  tenant_id: string;
  user_id?: string;
  lead_id?: string;
  message_id?: string;
  correlation_id: string;
  timestamp: Date;
}