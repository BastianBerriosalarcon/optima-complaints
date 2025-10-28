// Enums para el sistema de gestión de reclamos

export enum ComplaintStatus {
  NUEVO = 'nuevo',
  ASIGNADO = 'asignado',
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  RESUELTO = 'resuelto',
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

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN_CONCESIONARIO = 'admin_concesionario',
  JEFE_SERVICIO = 'jefe_servicio',
  ASESOR_SERVICIO = 'asesor_servicio',
  CONTACT_CENTER = 'contact_center',
  ENCARGADO_CALIDAD = 'encargado_calidad'
}

export enum NotificationType {
  RECLAMO_NUEVO = 'reclamo_nuevo',
  RECLAMO_BLACK_ALERT = 'reclamo_black_alert',
  SISTEMA_ERROR = 'sistema_error'
}
