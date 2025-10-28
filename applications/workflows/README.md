# N8N Workflows - Optima-Complaints

Sistema de workflows para gestión inteligente de reclamos con IA y RAG.

## Arquitectura Modular

```
applications/workflows/
├── administracion/
│   └── portal-super-admin.json                   # Portal Super-Admin para gestión de tenants
│
├── reclamos/
│   ├── complaint-orchestrator.json               # Orquestador principal de reclamos
│   ├── procesador-rag-reclamos.json              # Pipeline RAG + IA (Gemini)
│   ├── asignacion-automatica-reclamos.json       # Asignación automática a asesores
│   ├── notificaciones-reclamos.json              # Notificaciones por email
│   ├── alerta-black-alert.json                   # Alertas críticas Black Alert
│   ├── auditor-modificaciones.json               # Auditoría de cambios
│   │
│   └── conocimiento/
│       ├── ingesta-conocimiento.json             # Ingesta de documentos
│       ├── fragmentacion-conocimiento.json       # Chunking de documentos
│       ├── almacenamiento-conocimiento.json      # Almacenamiento en BD vectorial
│       ├── generador-embeddings.json             # Generación embeddings (Gemini)
│       └── rerank-cohere-documentos.json         # Refinamiento con Cohere Rerank
│
├── utils/
│   ├── cargador-config-tenant.json               # Cargador de configuración multitenant
│   ├── manejador-errores.json                    # Manejador centralizado de errores
│   ├── monitor-telemetria-avanzada.json          # Monitoreo y telemetría
│   ├── notificador-escalacion.json               # Notificaciones de escalamiento
│   └── optimizador-base-datos.json               # Optimización de consultas BD
│
└── templates/
    ├── plantilla-incorporacion-concesionario.json # Onboarding de nuevos tenants
    └── provision-workflows-automatica.json        # Provisión automática de workflows
```

## Módulos Principales

### Administración
Portal de gestión para Super-Admin que permite:
- Crear y configurar nuevos concesionarios (tenants)
- Gestionar usuarios y permisos
- Monitorear métricas globales
- Configurar integraciones

### Reclamos (Módulo Core)
Sistema completo de gestión de reclamos con IA:

**Workflow Principal:**
- `complaint-orchestrator.json` - Punto de entrada para todos los canales (Contact Center, Email, Web, API)

**Pipeline de Procesamiento:**
1. `procesador-rag-reclamos.json` - Análisis con RAG y Gemini 2.5 Pro
   - Genera embedding del reclamo
   - Busca en base de conocimiento
   - Rerank con Cohere
   - Análisis contextualizado con IA
   - Extracción de datos estructurados
   - Clasificación automática
   - Análisis de sentimiento
   - Detección de Black Alert

2. `asignacion-automatica-reclamos.json` - Asignación inteligente
   - Scoring de asesores disponibles
   - Criterios: sucursal, especialización, carga de trabajo
   - Asignación automática al mejor asesor

3. `notificaciones-reclamos.json` - Notificaciones multi-rol
   - Email al asesor asignado
   - Email al jefe de servicio
   - Email al encargado de calidad
   - Email de confirmación al cliente

4. `alerta-black-alert.json` - Alertas críticas
   - Detección de casos Black Alert (ley del consumidor)
   - Notificación masiva a equipo completo
   - Reducción de SLA a 24 horas
   - Registro en auditoría

5. `auditor-modificaciones.json` - Trazabilidad
   - Registro de todos los cambios
   - Historial de estados
   - Tracking de asignaciones

### Gestión de Conocimiento (RAG)

**Pipeline de Ingesta:**
```
Documento --> ingesta-conocimiento.json
            --> fragmentacion-conocimiento.json (chunking)
            --> generador-embeddings.json (Gemini Embedding 001)
            --> almacenamiento-conocimiento.json (pgvector)
```

**Pipeline de Búsqueda:**
```
Query --> Embedding --> Búsqueda Vectorial (TOP 20)
      --> Cohere Rerank (TOP 5)
      --> Contexto Enriquecido para Gemini
```

## Principios de Arquitectura

### Single Responsibility Principle
- Cada workflow tiene una responsabilidad específica
- Funciones JavaScript enfocadas en una sola tarea
- Separación clara entre validación, procesamiento y persistencia

### Configuración Multitenant
- Configuración externalizada por concesionario
- Carga dinámica desde `tenant_configurations`
- Aislamiento total mediante Row Level Security (RLS)

### Manejo de Errores
- Captura centralizada de errores
- Logging estructurado
- Reintentos automáticos con backoff
- Notificaciones de fallos críticos

### Telemetría y Monitoreo
- Métricas de ejecución en tiempo real
- Tracking de performance
- Alertas automáticas de degradación
- Dashboard de salud de workflows

## Flujo Completo de Reclamo

```
┌─────────────────────────────────────────────────────────┐
│  INGRESO DE RECLAMO                                     │
│  (Contact Center | Web | Email | API)                   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  complaint-orchestrator.json                            │
│  - Validación básica                                    │
│  - Extracción de concesionario_id                       │
│  - Disparo de pipeline RAG (async)                      │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  procesador-rag-reclamos.json                           │
│  - Generación de embedding (Gemini)                     │
│  - Búsqueda vectorial en knowledge base                 │
│  - Rerank con Cohere (TOP 5 docs)                       │
│  - Análisis con Gemini 2.5 Pro + contexto RAG          │
│  - Extracción de datos estructurados                    │
│  - Clasificación y priorización                         │
│  - Detección de Black Alert                             │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  asignacion-automatica-reclamos.json                    │
│  - Buscar asesores disponibles                          │
│  - Calcular score por criterios                         │
│  - Asignar a mejor asesor                               │
│  - Actualizar estado a 'asignado'                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  notificaciones-reclamos.json                           │
│  - Email al asesor asignado                             │
│  - Email al jefe de servicio                            │
│  - Email al encargado de calidad                        │
│  - Email de confirmación al cliente                     │
└────────────────────┬────────────────────────────────────┘
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
┌──────────────────┐   ┌──────────────────┐
│  Black Alert?    │   │  Dashboard       │
│  SI: Alerta      │   │  Update          │
│  NO: Flujo normal│   │  Realtime        │
└──────────────────┘   └──────────────────┘
```

## Integraciones

### Supabase
- PostgreSQL con pgvector para búsqueda semántica
- Row Level Security (RLS) para aislamiento multitenant
- Realtime para actualizaciones en tiempo real
- Storage para adjuntos

### Gemini AI
- Gemini 2.5 Pro: Análisis y clasificación de reclamos
- Gemini Embedding 001: Generación de embeddings (768 dims)
- Análisis de sentimiento
- Extracción de entidades

### Cohere
- Cohere Rerank: Re-clasificación de documentos recuperados
- Mejora la precisión del RAG

### Email (SMTP)
- Gmail / SendGrid / SMTP personalizado
- Templates personalizables por tenant
- Tracking de envíos

## Configuración

### Variables de Entorno Requeridas

```json
{
  "SUPABASE_URL": "https://your-project.supabase.co",
  "SUPABASE_SERVICE_KEY": "your-service-key",
  "N8N_WEBHOOK_BASE_URL": "https://your-n8n-instance.com",
  "GEMINI_API_KEY": "your-gemini-key",
  "COHERE_API_KEY": "your-cohere-key",
  "SMTP_HOST": "smtp.gmail.com",
  "SMTP_PORT": "587",
  "SMTP_USER": "your-email@domain.com",
  "SMTP_PASSWORD": "your-smtp-password"
}
```

### Configuración por Tenant

Cada concesionario puede configurar:
- Políticas de garantía específicas
- Tiempos de SLA personalizados
- Reglas de asignación de asesores
- Templates de email personalizados
- Base de conocimiento propia

## Testing

### Workflows de Test
- `test-conectividad-supabase.json` - Validar conexión a BD
- `test-gemini-api.json` - Validar API de Gemini
- `test-email-smtp.json` - Validar configuración SMTP

### Monitoreo
- Monitor de telemetría avanzada
- Alertas automáticas de fallos
- Métricas de performance
- Dashboard de salud

## Deployment

### Importación Manual
```bash
# Importar workflows vía N8N UI
1. Acceder a N8N admin panel
2. Ir a Workflows > Import
3. Seleccionar archivo JSON
4. Activar workflow
```

### Importación Automática
```bash
# Script de deployment
./scripts/deployment/import-n8n-workflows-direct.sh
```

## Mantenimiento

### Actualización de Workflows
1. Modificar workflow en N8N UI
2. Exportar workflow actualizado
3. Actualizar archivo JSON en repositorio
4. Commit y push a repositorio
5. Re-importar en otros ambientes

### Versionamiento
- Usar versión semántica (x.y.z)
- Documentar cambios en metadata del workflow
- Mantener historial en git

## Soporte

Para issues o preguntas sobre workflows:
- Documentación completa: `/docs/workflows/`
- Issues: GitHub Issues
- Contacto: bastian.berrios@ejemplo.com

---

**Última actualización:** 28 de Octubre 2025
**Versión:** 2.1.0 - Módulo único de reclamos
