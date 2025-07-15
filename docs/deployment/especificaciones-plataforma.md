# OptimaCX Platform - Especificaciones Completas

## 🎯 Objetivo General
Plataforma CRM para concesionarios automotrices que gestiona encuestas de satisfacción, reclamos de clientes y catálogo de productos, integrada con N8N para automatización de workflows.

## 👥 Usuarios del Sistema

### 1. **Administrador de Concesionario**
- Gestiona usuarios de su concesionario
- Ve métricas generales y reportes
- Configura productos y servicios
- Gestiona reclamos críticos

### 2. **Asesor de Ventas**
- Registra encuestas de satisfacción
- Ve sus métricas de satisfacción
- Gestiona productos asignados
- Recibe notificaciones de reclamos

### 3. **Encargado de Post-Venta**
- Gestiona todos los reclamos
- Asigna prioridades y urgencias
- Hace seguimiento de resolución
- Genera reportes de satisfacción

## 🏗️ Módulos de la Plataforma

### **1. Dashboard Principal**
**Funcionalidades:**
- Métricas generales del concesionario
- Gráficos de satisfacción por período
- Alertas de reclamos críticos (black alerts)
- Resumen de encuestas recientes
- Indicadores de performance por asesor

**Componentes UI:**
- Cards con métricas clave
- Gráficos de barras/líneas (Chart.js)
- Lista de alertas rojas
- Tabla de últimas encuestas

### **2. Módulo de Leads**
**Funcionalidades:**
- Vista de leads capturados (WhatsApp, Web, Teléfono)
- Análisis de intención con IA
- Asignación automática/manual a asesores
- Seguimiento del pipeline de ventas
- Scoring de leads por nivel de interés

**Campos de Lead:**
```typescript
interface Lead {
  id: string
  concesionario_id: string
  telefono_cliente: string
  nombre_cliente?: string
  email_cliente?: string
  estado: 'nuevo' | 'contactado' | 'calificado' | 'oportunidad' | 'perdido' | 'vendido'
  origen: 'whatsapp' | 'telefono' | 'email' | 'web' | 'referido'
  intencion_detectada: 'compra' | 'informacion' | 'servicio' | 'reclamo' | 'otro'
  nivel_interes: number // 1-10
  asesor_asignado_id?: string
  vehiculo_interes?: {
    marca: string
    modelo: string
    año?: number
    tipo: 'nuevo' | 'usado'
    financiamiento_requerido: boolean
  }
  presupuesto_estimado?: number
  notas_ia: string
  created_at: Date
  updated_at: Date
}
```

**Componentes UI:**
- Tabla de leads con filtros por estado/origen
- Kanban board para pipeline
- Modal de análisis de IA
- Formulario de asignación manual
- Métricas de conversión

### **3. Módulo de Encuestas**
**Funcionalidades:**
- Formulario de encuesta de satisfacción
- Lista de encuestas por asesor/período
- Reportes de satisfacción
- Exportación de datos

**Campos de Encuesta:**
```typescript
interface Encuesta {
  id: string
  tenant_id: string
  asesor_id: string
  cliente_nombre: string
  cliente_telefono: string
  cliente_email: string
  fecha_encuesta: Date
  recomendacion: number // 1-10
  satisfaccion: number // 1-10
  lavado: number // 1-10
  asesor: number // 1-10
  comentario: string
  created_at: Date
  updated_at: Date
}
```

**Componentes UI:**
- Formulario con sliders para calificaciones
- Tabla de encuestas con filtros
- Gráficos de promedios
- Botón de exportar a Excel

### **4. Módulo de Reclamos**
**Funcionalidades:**
- Registro de reclamos
- Sistema de prioridades (alta, media, baja)
- Black alerts para casos críticos
- Asignación a responsables
- Seguimiento de estados
- Historial de acciones

**Campos de Reclamo:**
```typescript
interface Reclamo {
  id: string
  tenant_id: string
  cliente_nombre: string
  cliente_telefono: string
  cliente_email: string
  detalle: string
  urgencia: 'alta' | 'media' | 'baja'
  blackAlert: boolean
  estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado'
  asignado_a: string
  fecha_reclamo: Date
  fecha_resolucion?: Date
  comentarios: string[]
  created_at: Date
  updated_at: Date
}
```

**Componentes UI:**
- Formulario de registro
- Tabla con filtros por estado/urgencia
- Modal para ver detalles
- Sistema de comentarios
- Botones de cambio de estado

### **5. Módulo de Productos**
**Funcionalidades:**
- Catálogo de productos/servicios
- Gestión de precios
- Control de stock
- Asignación a asesores

**Campos de Producto:**
```typescript
interface Producto {
  id: string
  tenant_id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  asesor_asignado?: string
  activo: boolean
  created_at: Date
  updated_at: Date
}
```

**Componentes UI:**
- Tabla de productos con filtros
- Formulario de agregar/editar
- Modal de detalles
- Sistema de categorías

### **6. Módulo de Usuarios**
**Funcionalidades:**
- Gestión de usuarios del concesionario
- Roles y permisos
- Autenticación
- Perfil de usuario

**Campos de Usuario:**
```typescript
interface Usuario {
  id: string
  tenant_id: string
  nombre: string
  email: string
  telefono: string
  rol: 'admin' | 'asesor' | 'post_venta'
  activo: boolean
  created_at: Date
  updated_at: Date
}
```

## 🔧 Integraciones Técnicas

### **1. Supabase Backend**
**Configuración:**
- Row Level Security (RLS) por tenant_id
- Políticas de acceso por rol
- Realtime subscriptions para notificaciones
- Storage para archivos adjuntos

**Tablas principales:**
- tenants
- usuarios
- leads
- encuestas
- reclamos
- productos
- comentarios_reclamos

### **2. N8N Workflows**
**Integraciones:**
- Webhook al recibir mensaje WhatsApp → análisis lead
- Webhook al crear lead → asignación automática
- Webhook al crear encuesta → trigger análisis
- Webhook al crear reclamo → notificaciones
- Cron jobs para reportes automáticos
- Integración con WhatsApp para alertas

**Endpoints necesarios:**
```bash
POST /api/webhooks/whatsapp-message
POST /api/webhooks/lead-created
POST /api/webhooks/lead-updated
POST /api/webhooks/encuesta-created
POST /api/webhooks/reclamo-created
POST /api/webhooks/black-alert
GET /api/n8n/trigger-report
```

### **3. Autenticación y Multitenancy**
**Estructura:**
- Supabase Auth para login/register
- Tenant isolation por RLS
- Middleware de verificación de tenant
- Roles basados en database

## 📱 Flujos de Usuario

### **Flujo 1: Captura de Lead**
1. Cliente envía mensaje WhatsApp
2. N8N recibe webhook → análisis con IA
3. Lead creado automáticamente en Supabase
4. Asignación automática a asesor disponible
5. Notificación al asesor → seguimiento

### **Flujo 2: Gestión de Lead**
1. Asesor ve lead asignado en dashboard
2. Revisa análisis de IA y nivel de interés
3. Actualiza estado del lead
4. Agrega notas de contacto
5. Mueve por pipeline hasta cierre

### **Flujo 3: Registro de Encuesta**
1. Asesor entra al módulo de encuestas
2. Clic en "Nueva Encuesta"
3. Llena formulario con datos del cliente
4. Califica con sliders (1-10)
5. Agrega comentario opcional
6. Envía → Trigger N8N → Análisis automático

### **Flujo 4: Gestión de Reclamo**
1. Cliente llama/escribe reclamo
2. Recepcionista registra en sistema
3. Sistema evalúa si es black alert
4. Si es crítico → Notificación inmediata
5. Asignación a responsable
6. Seguimiento hasta resolución

### **Flujo 5: Dashboard de Métricas**
1. Usuario ingresa al dashboard
2. Ve métricas filtradas por su tenant
3. Gráficos actualizados en tiempo real
4. Alertas rojas destacadas
5. Clic en métrica → drill down

## 🎨 Especificaciones de UI/UX

### **Tema Visual**
- Colores principales: OptimaCX branding
- Tipografía: Inter/Roboto
- Componentes: Shadcn/ui
- Iconos: Lucide React

### **Responsive Design**
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Navegación adaptativa
- Formularios optimizados para móvil

### **Componentes Reutilizables**
- DataTable con filtros
- FormModal para crear/editar
- MetricCard para dashboard
- AlertBanner para notificaciones
- RatingSlider para calificaciones

## 🚀 Fases de Desarrollo

### **Fase 1: Setup Base (1 día)**
- Proyecto Next.js + TypeScript
- Configuración Supabase
- Autenticación básica
- Layout principal

### **Fase 2: Core Modules (4 días)**
- Módulo de leads completo
- Módulo de encuestas completo
- Módulo de reclamos básico
- Dashboard con métricas
- Gestión de usuarios

### **Fase 3: Integraciones (1 día)**
- Webhooks para N8N
- Notificaciones en tiempo real
- Exportación de datos
- Optimizaciones de performance

### **Fase 4: Deploy (medio día)**
- Dockerfile optimizado
- Variables de entorno
- Deploy en Cloud Run
- Testing en producción

## 📊 Métricas y KPIs

### **Métricas de Satisfacción**
- Promedio de recomendación (NPS)
- Satisfacción general
- Calificación por asesor
- Tendencias mensuales

### **Métricas de Reclamos**
- Tiempo promedio de resolución
- Cantidad de black alerts
- Reclamos por categoría
- Satisfacción post-resolución

### **Métricas de Productos**
- Productos más vendidos
- Performance por asesor
- Rotación de stock
- Margen por producto

## 🔒 Seguridad y Compliance

### **Protección de Datos**
- Encriptación en tránsito y reposo
- Logs de auditoría
- Backup automático
- Política de retención

### **Control de Acceso**
- RLS por tenant
- Roles granulares
- Sesiones con timeout
- 2FA opcional

## 📈 Escalabilidad

### **Performance**
- Paginación en tablas
- Lazy loading de componentes
- Caching de queries
- Optimistic updates

### **Infraestructura**
- Cloud Run auto-scaling
- CDN para assets
- Database connection pooling
- Monitoring con logs

---

*Especificaciones creadas: 2025-07-14*
*Status: Definición completa para desarrollo*