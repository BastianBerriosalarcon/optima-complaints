import { http, HttpResponse } from 'msw'

// Mock data para OptimaCX
const mockLeads = [
  {
    id: '1',
    telefono_cliente: '+56912345678',
    nombre_cliente: 'Juan Pérez',
    email_cliente: 'juan@example.com',
    intencion_detectada: 'compra',
    modelo_interes: 'Toyota Corolla',
    score_calidad: 85,
    nivel_interes: 'alto',
    estado: 'nuevo',
    concesionario_id: 'concesionario_001',
  },
]

const mockEncuestas = [
  {
    id: '1',
    cliente_id: '1',
    recomendacion: 9,
    satisfaccion: 8,
    lavado: 7,
    asesor: 9,
    comentario: 'Excelente servicio',
    estado: 'completado',
    origen: 'QR',
    concesionario_id: 'concesionario_001',
  },
]

const mockReclamos = [
  {
    id: '1',
    cliente_id: '1',
    vehiculo_id: '1',
    vin: 'ABC123456789',
    detalle: 'Problema con el motor',
    black_alert: false,
    estado: 'pendiente',
    tipo_reclamo: 'Externo',
    concesionario_id: 'concesionario_001',
  },
]

export const handlers = [
  // Leads endpoints
  http.get('/api/leads', () => {
    return HttpResponse.json({ data: mockLeads, error: null })
  }),

  http.post('/api/leads', async ({ request }) => {
    const newLead = await request.json()
    return HttpResponse.json({ 
      data: { ...newLead, id: Date.now().toString() }, 
      error: null 
    })
  }),

  // Encuestas endpoints
  http.get('/api/encuestas', () => {
    return HttpResponse.json({ data: mockEncuestas, error: null })
  }),

  http.post('/api/encuestas', async ({ request }) => {
    const newEncuesta = await request.json()
    return HttpResponse.json({ 
      data: { ...newEncuesta, id: Date.now().toString() }, 
      error: null 
    })
  }),

  // Reclamos endpoints
  http.get('/api/reclamos', () => {
    return HttpResponse.json({ data: mockReclamos, error: null })
  }),

  http.post('/api/reclamos', async ({ request }) => {
    const newReclamo = await request.json()
    return HttpResponse.json({ 
      data: { ...newReclamo, id: Date.now().toString() }, 
      error: null 
    })
  }),

  // Auth endpoints
  http.post('/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: {
        id: 'user-1',
        email: 'test@optimacx.com',
        role: 'admin',
        concesionario_id: 'concesionario_001',
      },
    })
  }),

  // Dashboard metrics
  http.get('/api/dashboard/metrics', () => {
    return HttpResponse.json({
      data: {
        totalLeads: 150,
        leadsConvertidos: 45,
        encuestasCompletadas: 89,
        reclamosActivos: 12,
        npsPromedio: 8.5,
        satisfaccionPromedio: 8.2,
      },
      error: null,
    })
  }),
]