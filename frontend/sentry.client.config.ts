import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configuración específica para OptimaCX
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Filtros específicos del dominio
  beforeSend(event, hint) {
    // No enviar errores de desarrollo
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Filtrar errores conocidos
    if (event.exception) {
      const error = hint.originalException as Error | undefined
      if (error && error.message) {
        // Filtrar errores de red temporales
        if (error.message.includes('NetworkError') ||
            error.message.includes('fetch')) {
          return null
        }
      }
    }
    
    return event
  },
  
  // Tags específicos de OptimaCX
  initialScope: {
    tags: {
      component: 'frontend',
      platform: 'optimacx',
    },
  },
})