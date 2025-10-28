// Datos detallados de reclamos incluyendo clasificación IA y seguimientos

export interface ClassificacionIA {
  tipo_reclamo: string;
  categoria: string;
  urgencia_detectada: string;
  confianza: number;
  sugerencias_resolucion: string[];
  referencias_politicas?: Array<{
    documento: string;
    seccion: string;
    relevancia: number;
  }>;
}

export interface SentimientoAnalisis {
  sentimiento: string;
  score: number;
  emociones: string[];
  tono: string;
}

export interface Seguimiento {
  id: string;
  reclamo_id: string;
  user_id: string;
  tipo_seguimiento: string;
  titulo: string;
  descripcion: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  created_at: string;
  usuario: {
    nombre: string;
    rol: string;
  };
}

// Clasificaciones IA por reclamo
export const clasificacionesIA: Record<string, ClassificacionIA> = {
  "rec-001": {
    tipo_reclamo: "garantia",
    categoria: "motor",
    urgencia_detectada: "alta",
    confianza: 0.92,
    sugerencias_resolucion: [
      "Revisar política de garantía sección 3.2",
      "Inspección técnica completa del motor",
      "Verificar historial de mantenciones previas",
      "Considerar reemplazo bajo garantía"
    ],
    referencias_politicas: [
      {
        documento: "Manual de Garantías 2024",
        seccion: "3.2 - Garantía de Motor",
        relevancia: 0.95
      }
    ]
  },
  "rec-002": {
    tipo_reclamo: "servicio",
    categoria: "frenos",
    urgencia_detectada: "media",
    confianza: 0.88,
    sugerencias_resolucion: [
      "Inspección de pastillas y discos",
      "Verificar desgaste de componentes",
      "Revisar fluido de frenos"
    ]
  },
  "rec-004": {
    tipo_reclamo: "garantia",
    categoria: "electricidad",
    urgencia_detectada: "alta",
    confianza: 0.90,
    sugerencias_resolucion: [
      "Revisión inmediata del sistema eléctrico",
      "Diagnóstico computarizado",
      "Verificar alternador y batería",
      "Revisar conexiones y fusibles"
    ]
  },
  "rec-005": {
    tipo_reclamo: "servicio",
    categoria: "climatizacion",
    urgencia_detectada: "media",
    confianza: 0.87,
    sugerencias_resolucion: [
      "Verificar nivel de refrigerante",
      "Revisar compresor de A/C",
      "Inspeccionar filtro de habitáculo",
      "Diagnóstico de sistema de climatización"
    ]
  },
  "rec-006": {
    tipo_reclamo: "garantia",
    categoria: "transmision",
    urgencia_detectada: "alta",
    confianza: 0.94,
    sugerencias_resolucion: [
      "Revisión urgente de transmisión automática",
      "Diagnóstico computarizado completo",
      "Evaluar reemplazo bajo garantía",
      "Contactar a fabricante para soporte técnico"
    ],
    referencias_politicas: [
      {
        documento: "Manual de Garantías 2025",
        seccion: "4.1 - Transmisión",
        relevancia: 0.93
      }
    ]
  },
  "rec-009": {
    tipo_reclamo: "servicio",
    categoria: "suspension",
    urgencia_detectada: "media",
    confianza: 0.85,
    sugerencias_resolucion: [
      "Segunda revisión con mecánico especialista",
      "Test de manejo con cliente",
      "Inspección de amortiguadores y bujes",
      "Considerar cambio preventivo de componentes"
    ]
  },
  "rec-010": {
    tipo_reclamo: "servicio",
    categoria: "electronica",
    urgencia_detectada: "baja",
    confianza: 0.91,
    sugerencias_resolucion: [
      "Actualización de firmware del sistema",
      "Reset de fábrica del sistema multimedia",
      "Verificar compatibilidad con dispositivo móvil",
      "Revisar manual de sincronización"
    ]
  }
};

// Análisis de sentimiento por reclamo
export const sentimientosAnalisis: Record<string, SentimientoAnalisis> = {
  "rec-001": {
    sentimiento: "negativo",
    score: -0.7,
    emociones: ["frustración", "enojo", "decepción"],
    tono: "formal-molesto"
  },
  "rec-002": {
    sentimiento: "neutral",
    score: -0.2,
    emociones: ["preocupación"],
    tono: "formal"
  },
  "rec-003": {
    sentimiento: "positivo",
    score: 0.9,
    emociones: ["satisfacción", "agradecimiento"],
    tono: "cordial"
  },
  "rec-004": {
    sentimiento: "negativo",
    score: -0.6,
    emociones: ["preocupación", "urgencia"],
    tono: "serio"
  },
  "rec-005": {
    sentimiento: "neutral",
    score: -0.3,
    emociones: ["molestia leve"],
    tono: "informal"
  },
  "rec-006": {
    sentimiento: "negativo",
    score: -0.8,
    emociones: ["enojo", "exigencia", "decepción"],
    tono: "formal-exigente"
  },
  "rec-007": {
    sentimiento: "neutral",
    score: 0.1,
    emociones: ["curiosidad"],
    tono: "informal-cordial"
  },
  "rec-008": {
    sentimiento: "negativo",
    score: -0.5,
    emociones: ["frustración", "impaciencia"],
    tono: "formal-molesto"
  },
  "rec-009": {
    sentimiento: "neutral",
    score: -0.4,
    emociones: ["duda", "molestia leve"],
    tono: "informal"
  },
  "rec-010": {
    sentimiento: "neutral",
    score: -0.2,
    emociones: ["frustración leve"],
    tono: "formal"
  }
};

// Timeline de seguimientos por reclamo
export const seguimientosTimeline: Record<string, Seguimiento[]> = {
  "rec-001": [
    {
      id: "seg-001-1",
      reclamo_id: "rec-001",
      user_id: "sys-001",
      tipo_seguimiento: "creacion",
      titulo: "Reclamo creado",
      descripcion: "Reclamo ingresado por Contact Center",
      created_at: "2025-01-20T09:15:00Z",
      usuario: {
        nombre: "Sistema",
        rol: "system"
      }
    },
    {
      id: "seg-001-2",
      reclamo_id: "rec-001",
      user_id: "sys-001",
      tipo_seguimiento: "asignacion",
      titulo: "Reclamo asignado",
      descripcion: "Asignado automáticamente a María Fernanda Lagos",
      estado_anterior: "nuevo",
      estado_nuevo: "asignado",
      created_at: "2025-01-20T09:16:00Z",
      usuario: {
        nombre: "Sistema IA",
        rol: "system"
      }
    },
    {
      id: "seg-001-3",
      reclamo_id: "rec-001",
      user_id: "ase-001",
      tipo_seguimiento: "comentario",
      titulo: "Primera revisión",
      descripcion: "Contacté al cliente vía telefónica. Agendamos revisión técnica para mañana 21/01 a las 10:00 hrs. Cliente muy molesto por la situación.",
      created_at: "2025-01-20T10:30:00Z",
      usuario: {
        nombre: "María Fernanda Lagos",
        rol: "Asesor de Servicio"
      }
    },
    {
      id: "seg-001-4",
      reclamo_id: "rec-001",
      user_id: "ase-001",
      tipo_seguimiento: "escalamiento",
      titulo: "BLACK ALERT - Escalado a Gerencia",
      descripcion: "Por tratarse de Black Alert (vehículo <6 meses), notificado a Jefe de Servicio y Gerente General. Se prioriza caso.",
      created_at: "2025-01-20T10:35:00Z",
      usuario: {
        nombre: "María Fernanda Lagos",
        rol: "Asesor de Servicio"
      }
    }
  ],
  "rec-002": [
    {
      id: "seg-002-1",
      reclamo_id: "rec-002",
      user_id: "sys-001",
      tipo_seguimiento: "creacion",
      titulo: "Reclamo creado",
      descripcion: "Reclamo ingresado vía formulario web",
      created_at: "2025-01-19T14:30:00Z",
      usuario: {
        nombre: "Sistema",
        rol: "system"
      }
    },
    {
      id: "seg-002-2",
      reclamo_id: "rec-002",
      user_id: "ase-002",
      tipo_seguimiento: "asignacion",
      titulo: "Asignado a asesor",
      descripcion: "Asignado a Carlos Alberto Muñoz",
      estado_anterior: "nuevo",
      estado_nuevo: "asignado",
      created_at: "2025-01-19T14:32:00Z",
      usuario: {
        nombre: "Sistema IA",
        rol: "system"
      }
    },
    {
      id: "seg-002-3",
      reclamo_id: "rec-002",
      user_id: "ase-002",
      tipo_seguimiento: "cambio_estado",
      titulo: "Iniciado proceso de revisión",
      descripcion: "Vehículo ingresado a taller. Mecánico especialista en frenos asignado.",
      estado_anterior: "asignado",
      estado_nuevo: "en_proceso",
      created_at: "2025-01-20T08:00:00Z",
      usuario: {
        nombre: "Carlos Alberto Muñoz",
        rol: "Asesor de Servicio"
      }
    }
  ],
  "rec-006": [
    {
      id: "seg-006-1",
      reclamo_id: "rec-006",
      user_id: "sys-001",
      tipo_seguimiento: "creacion",
      titulo: "Reclamo creado",
      descripcion: "Reclamo ingresado por Contact Center",
      created_at: "2025-01-20T08:30:00Z",
      usuario: {
        nombre: "Sistema",
        rol: "system"
      }
    },
    {
      id: "seg-006-2",
      reclamo_id: "rec-006",
      user_id: "sys-001",
      tipo_seguimiento: "asignacion",
      titulo: "BLACK ALERT - Asignación prioritaria",
      descripcion: "Por Black Alert, asignado con máxima prioridad a María Fernanda Lagos",
      estado_anterior: "nuevo",
      estado_nuevo: "asignado",
      created_at: "2025-01-20T08:31:00Z",
      usuario: {
        nombre: "Sistema IA",
        rol: "system"
      }
    },
    {
      id: "seg-006-3",
      reclamo_id: "rec-006",
      user_id: "ase-001",
      tipo_seguimiento: "cambio_estado",
      titulo: "Caso en proceso - Toyota contactado",
      descripcion: "Contactado al representante técnico de Toyota. Enviando diagnóstico completo de transmisión. Cliente informado del proceso.",
      estado_anterior: "asignado",
      estado_nuevo: "en_proceso",
      created_at: "2025-01-20T11:00:00Z",
      usuario: {
        nombre: "María Fernanda Lagos",
        rol: "Asesor de Servicio"
      }
    }
  ]
};
