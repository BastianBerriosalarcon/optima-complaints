// Enums para el sistema de gestión de leads, reclamos y encuestas

export enum LeadStatus {
  NUEVO = 'nuevo',
  CONTACTADO = 'contactado', 
  COTIZADO = 'cotizado',
  VENDIDO = 'vendido',
  PERDIDO = 'perdido'
}

export enum LeadSource {
  WHATSAPP = 'whatsapp',
  FORMULARIO_WEB = 'formulario_web',
  LLAMADA = 'llamada',
  EMAIL = 'email',
  REFERIDO = 'referido'
}

export enum LeadPriority {
  ALTO = 'alto',
  MEDIO = 'medio', 
  BAJO = 'bajo'
}

export enum ComplaintStatus {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  CERRADO = 'cerrado'
}

export enum ComplaintUrgency {
  ALTA = 'alta',
  MEDIA = 'media',
  BAJA = 'baja'
}

export enum ComplaintType {
  EXTERNO = 'externo',
  INTERNO = 'interno'
}

export enum SurveyOrigin {
  QR = 'QR',
  WHATSAPP = 'WhatsApp',
  LLAMADA = 'Llamada'
}

export enum SurveyStatus {
  PENDIENTE = 'pendiente',
  COMPLETADO = 'completado'
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN_CONCESIONARIO = 'admin_concesionario',
  GERENTE_VENTAS = 'gerente_ventas',
  ASESOR_VENTAS = 'asesor_ventas',
  JEFE_SERVICIO = 'jefe_servicio',
  ASESOR_SERVICIO = 'asesor_servicio',
  CONTACT_CENTER = 'contact_center',
  ENCARGADO_CALIDAD = 'encargado_calidad',
  MARKETING = 'marketing'
}

export enum NotificationType {
  LEAD_ASIGNADO = 'lead_asignado',
  LEAD_ESCALADO = 'lead_escalado',
  RECLAMO_NUEVO = 'reclamo_nuevo',
  RECLAMO_BLACK_ALERT = 'reclamo_black_alert',
  ENCUESTA_BAJA_CALIFICACION = 'encuesta_baja_calificacion',
  SISTEMA_ERROR = 'sistema_error'
}