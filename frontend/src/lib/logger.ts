import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
  base: {
    // Añade contexto estático a todos los logs, como el nombre del servicio
    service: 'optimacx-frontend',
  },
  formatters: {
    // Formatea el nivel del log para que coincida con los estándares de Google Cloud
    level: (label) => {
      return { severity: label.toUpperCase() };
    },
  },
  // Evita imprimir el hostname y el pid en cada log, que no son tan útiles en un entorno serverless
  redact: ['hostname', 'pid'],
  // Usa un timestamp estándar
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
