// Mock data para desarrollo y testing

// Dashboard principal
export const mockDashboardStats = {
  leads: {
    total: 156,
    nuevos: 23,
    contactados: 45,
    cotizados: 32,
    vendidos: 28,
    perdidos: 28,
    conversion_rate: 17.9
  },
  ventas: {
    mes_actual: 28,
    mes_anterior: 24,
    objetivo_mensual: 35,
    monto_total: 1250000000,
    ticket_promedio: 44642857
  },
  encuestas: {
    post_venta: {
      total: 89,
      completadas: 76,
      pendientes: 13,
      nps_score: 8.2,
      satisfaccion_promedio: 8.5
    },
    ventas: {
      total: 45,
      completadas: 38,
      pendientes: 7,
      satisfaccion_promedio: 8.8
    }
  },
  reclamos: {
    total: 12,
    pendientes: 5,
    en_proceso: 4,
    cerrados: 3,
    black_alerts: 2,
    tiempo_promedio_resolucion: 2.5
  }
};

// Leads mock data
export const mockLeads = [
  {
    id: "lead-001",
    telefono_cliente: "+56912345678",
    nombre_cliente: "Juan Pérez",
    email_cliente: "juan.perez@email.com",
    intencion_detectada: "compra" as const,
    modelo_interes: "Toyota Corolla 2024",
    mensaje_original: "Hola, estoy interesado en el Toyota Corolla 2024. ¿Pueden enviarme información?",
    score_calidad: 85,
    nivel_interes: "alto" as const,
    estado: "nuevo" as const,
    fecha_creacion: "2024-01-15T10:30:00Z",
    asesor_asignado: {
      id: "asesor-001",
      nombre: "María González",
      email: "maria.gonzalez@concesionario.com"
    },
    sucursal: {
      id: "sucursal-001",
      nombre: "Sucursal Centro"
    }
  },
  {
    id: "lead-002", 
    telefono_cliente: "+56987654321",
    nombre_cliente: "Ana Silva",
    email_cliente: "ana.silva@email.com",
    intencion_detectada: "cotizacion" as const,
    modelo_interes: "Honda Civic 2024",
    mensaje_original: "Necesito cotización para Honda Civic 2024, financiamiento incluido",
    score_calidad: 72,
    nivel_interes: "alto" as const,
    estado: "contactado" as const,
    fecha_creacion: "2024-01-14T15:45:00Z",
    fecha_primer_contacto: "2024-01-14T16:30:00Z",
    asesor_asignado: {
      id: "asesor-002",
      nombre: "Carlos Rodríguez",
      email: "carlos.rodriguez@concesionario.com"
    },
    sucursal: {
      id: "sucursal-001",
      nombre: "Sucursal Centro"
    }
  },
  // ... existing code ...
];

// Reclamos mock data
export const mockComplaints = [
  {
    id: "reclamo-001",
    id_externo: "REC-2024-001",
    cliente: {
      id: "cliente-001",
      nombre: "Roberto Martínez",
      telefono: "+56912345678",
      email: "roberto.martinez@email.com"
    },
    vehiculo: {
      id: "vehiculo-001",
      modelo: "Toyota RAV4 2023",
      patente: "ABCD12",
      vin: "1234567890ABCDEFG"
    },
    detalle: "El vehículo presenta fallas en el sistema eléctrico después de solo 3 meses de uso. Las luces se encienden y apagan solas.",
    tipo_reclamo: "externo" as const,
    estado: "pendiente" as const,
    urgencia: "alta" as const,
    black_alert: true,
    fecha_creacion: "2024-01-15T09:00:00Z",
    sucursal: {
      id: "sucursal-001", 
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "taller-001",
      nombre: "Taller Principal"
    },
    asesor_asignado: {
      id: "asesor-servicio-001",
      nombre: "Patricia López",
      email: "patricia.lopez@concesionario.com"
    }
  },
  {
    id: "reclamo-002",
    id_externo: "REC-2024-002", 
    cliente: {
      id: "cliente-002",
      nombre: "Luis Fernández",
      telefono: "+56987654321",
      email: "luis.fernandez@email.com"
    },
    vehiculo: {
      id: "vehiculo-002",
      modelo: "Honda Accord 2023",
      patente: "EFGH34",
      vin: "ABCDEFG1234567890"
    },
    detalle: "Demora excesiva en la entrega de repuestos para mantención programada. Ya han pasado 2 semanas.",
    tipo_reclamo: "externo" as const,
    estado: "en_proceso" as const,
    urgencia: "media" as const,
    black_alert: false,
    fecha_creacion: "2024-01-12T14:20:00Z",
    sucursal: {
      id: "sucursal-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "taller-002", 
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "asesor-servicio-002",
      nombre: "Miguel Torres",
      email: "miguel.torres@concesionario.com"
    }
  }
];

// Notificaciones mock data
export const mockNotifications = [
  {
    id: "notif-001",
    tipo: "lead_asignado" as const,
    titulo: "Nuevo lead asignado",
    mensaje: "Se te ha asignado un nuevo lead: Juan Pérez - Toyota Corolla 2024",
    fecha: "2024-01-15T10:35:00Z",
    leida: false,
    usuario_id: "asesor-001",
    datos_adicionales: {
      lead_id: "lead-001",
      cliente_nombre: "Juan Pérez"
    }
  },
  {
    id: "notif-002",
    tipo: "reclamo_black_alert" as const,
    titulo: "Black Alert - Reclamo Crítico",
    mensaje: "Nuevo reclamo Black Alert de Roberto Martínez - Toyota RAV4 2023",
    fecha: "2024-01-15T09:05:00Z",
    leida: false,
    usuario_id: "jefe-servicio-001",
    datos_adicionales: {
      reclamo_id: "reclamo-001",
      cliente_nombre: "Roberto Martínez"
    }
  }
];