// Mock data específico para la Fase 1

// Encuestas Post-Venta
export const mockPostSaleSurveys = [
  {
    id: "post-survey-001",
    cliente_nombre: "Carlos Mendoza",
    cliente_telefono: "+56912345678",
    cliente_email: "carlos.mendoza@email.com",
    vehiculo_modelo: "Toyota RAV4 2023",
    vehiculo_patente: "ABCD12",
    fecha_servicio: "2024-01-15T09:30:00Z",
    sucursal: {
      id: "sucursal-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "taller-001", 
      nombre: "Taller Principal"
    },
    // 4 preguntas específicas (escala 1-10)
    recomendacion: 9,
    satisfaccion: 8,
    lavado: 7,
    asesor: 9,
    comentario: "Excelente atención, muy profesionales",
    origen: "QR" as const,
    estado: "completado" as const,
    fecha_creacion: "2024-01-15T10:00:00Z",
    fecha_completado: "2024-01-15T10:05:00Z",
    promedio_calificacion: 8.25,
    requiere_seguimiento: false
  },
  {
    id: "post-survey-002",
    cliente_nombre: "Ana Rodríguez", 
    cliente_telefono: "+56987654321",
    cliente_email: "ana.rodriguez@email.com",
    vehiculo_modelo: "Honda Civic 2024",
    vehiculo_patente: "EFGH34",
    fecha_servicio: "2024-01-14T14:20:00Z",
    sucursal: {
      id: "sucursal-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "taller-002",
      nombre: "Taller Norte"
    },
    recomendacion: 6,
    satisfaccion: 5,
    lavado: 4,
    asesor: 6,
    comentario: "El servicio demoró más de lo esperado y el lavado no fue completo",
    origen: "WhatsApp" as const,
    estado: "completado" as const,
    fecha_creacion: "2024-01-15T08:00:00Z",
    fecha_completado: "2024-01-15T08:15:00Z",
    promedio_calificacion: 5.25,
    requiere_seguimiento: true,
    contact_center_asignado: {
      id: "cc-001",
      nombre: "Patricia López"
    }
  }
];
// Historial de Auditoría
export const mockAuditHistory = [
  {
    id: "audit-001",
    entity_type: "reclamo",
    entity_id: "reclamo-001",
    action: "create" as const,
    usuario: {
      id: "user-001",
      nombre: "María González",
      email: "maria.gonzalez@concesionario.com",
      rol: "contact_center"
    },
    fecha: "2024-01-15T09:00:00Z",
    datos_anteriores: null,
    datos_nuevos: {
      estado: "pendiente",
      urgencia: "alta",
      cliente: "Roberto Martínez"
    },
    descripcion: "Reclamo creado por Contact Center",
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0..."
  },
  {
    id: "audit-002", 
    entity_type: "reclamo",
    entity_id: "reclamo-001",
    action: "status_change" as const,
    usuario: {
      id: "user-002",
      nombre: "Carlos Rodríguez", 
      email: "carlos.rodriguez@concesionario.com",
      rol: "asesor_servicio"
    },
    fecha: "2024-01-15T10:30:00Z",
    datos_anteriores: {
      estado: "pendiente"
    },
    datos_nuevos: {
      estado: "en_proceso"
    },
    descripcion: "Estado cambiado a En Proceso por Asesor de Servicio",
    ip_address: "192.168.1.101",
    user_agent: "Mozilla/5.0..."
  }
];

// Datos de procesamiento Excel
export const mockExcelProcessingResult = {
  total_rows: 150,
  processed_rows: 147,
  valid_rows: 145,
  invalid_rows: 2,
  duplicate_rows: 3,
  validation_errors: [
    {
      row: 23,
      field: "cliente_telefono",
      message: "Formato de teléfono inválido",
      value: "912345678"
    },
    {
      row: 45,
      field: "cliente_nombre", 
      message: "Nombre del cliente es requerido",
      value: ""
    }
  ],
  duplicates_found: [
    {
      row: 67,
      field: "cliente_telefono",
      message: "Teléfono duplicado en fila 23",
      value: "+56912345678"
    }
  ],
  processing_time: "2.3 segundos",
  estimated_whatsapp_send: "10-15 minutos"
};

// Métricas de canales
export const mockChannelMetrics = {
  qr_responses: {
    total_scanned: 89,
    completed_surveys: 76,
    completion_rate: 85.4,
    average_time: "2.3 minutos"
  },
  whatsapp_responses: {
    total_sent: 234,
    responses_received: 156,
    completion_rate: 66.7,
    average_response_time: "4.2 horas"
  },
  call_responses: {
    total_assigned: 78,
    completed_calls: 52,
    completion_rate: 66.7,
    average_call_duration: "6.8 minutos"
  },
  overall_nps: 7.8,
  satisfaction_distribution: {
    excelente: 42,
    bueno: 38, 
    regular: 15,
    bajo: 5
  }
};