import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configuración del servidor
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración específica del servidor
  beforeSend(event, hint) {
    // Filtrar información sensible
    if (event.request) {
      // Remover headers sensibles
      delete event.request.headers?.authorization
      delete event.request.headers?.cookie
    }
    
    // Filtrar errores de Supabase conocidos
    if (event.exception) {
      const error = hint.originalException as Error | undefined
      if (error && error.message && error.message.includes('JWT')) {
        return null
      }
    }
    
    return event
  },
  
  // Tags del servidor
  initialScope: {
    tags: {
      component: 'server',
      platform: 'optimacx',
    },
  },
})