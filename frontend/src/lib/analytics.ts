import { track } from '@vercel/analytics'

// Tipos de eventos específicos de OptimaCX
export type OptimaCXEvent = 
  | 'lead_created'
  | 'lead_converted'
  | 'encuesta_completed'
  | 'reclamo_created'
  | 'dashboard_viewed'
  | 'export_data'
  | 'user_login'
  | 'user_logout'

interface EventProperties {
  concesionario_id?: string
  user_role?: string
  lead_score?: number
  encuesta_origen?: 'QR' | 'WhatsApp' | 'Llamada'
  reclamo_urgencia?: 'alta' | 'media' | 'baja'
  [key: string]: string | number | boolean | undefined
}

// Wrapper para analytics con contexto de OptimaCX
export const trackOptimaCXEvent = (
  event: OptimaCXEvent,
  properties?: EventProperties
) => {
  // Solo trackear en producción
  if (process.env.NODE_ENV !== 'production') {
    console.log('Analytics Event:', event, properties)
    return
  }

  track(event, {
    ...properties,
    timestamp: new Date().toISOString(),
    app: 'optimacx',
  })
}

// Eventos específicos del dominio
export const analytics = {
  // Leads
  leadCreated: (leadData: { score: number; source: string; concesionario_id: string }) => {
    trackOptimaCXEvent('lead_created', {
      lead_score: leadData.score,
      source: leadData.source,
      concesionario_id: leadData.concesionario_id,
    })
  },

  leadConverted: (leadData: { score: number; days_to_convert: number; concesionario_id: string }) => {
    trackOptimaCXEvent('lead_converted', {
      lead_score: leadData.score,
      days_to_convert: leadData.days_to_convert,
      concesionario_id: leadData.concesionario_id,
    })
  },

  // Encuestas
  encuestaCompleted: (encuestaData: { 
    origen: 'QR' | 'WhatsApp' | 'Llamada'
    nps_score: number
    concesionario_id: string 
  }) => {
    trackOptimaCXEvent('encuesta_completed', {
      encuesta_origen: encuestaData.origen,
      nps_score: encuestaData.nps_score,
      concesionario_id: encuestaData.concesionario_id,
    })
  },

  // Reclamos
  reclamoCreated: (reclamoData: { 
    urgencia: 'alta' | 'media' | 'baja'
    black_alert: boolean
    concesionario_id: string 
  }) => {
    trackOptimaCXEvent('reclamo_created', {
      reclamo_urgencia: reclamoData.urgencia,
      black_alert: reclamoData.black_alert,
      concesionario_id: reclamoData.concesionario_id,
    })
  },

  // Dashboard
  dashboardViewed: (viewData: { 
    section: string
    user_role: string
    concesionario_id: string 
  }) => {
    trackOptimaCXEvent('dashboard_viewed', {
      section: viewData.section,
      user_role: viewData.user_role,
      concesionario_id: viewData.concesionario_id,
    })
  },

  // Exportación de datos
  dataExported: (exportData: { 
    type: string
    format: string
    record_count: number
    concesionario_id: string 
  }) => {
    trackOptimaCXEvent('export_data', {
      export_type: exportData.type,
      format: exportData.format,
      record_count: exportData.record_count,
      concesionario_id: exportData.concesionario_id,
    })
  },
}