# Plan de Limpieza - Optima-Complaints
# Eliminación de Módulos Contaminados del Proyecto Anterior

**Fecha:** 28 de Octubre 2025
**Objetivo:** Alinear el código con CLAUDE.md eliminando: WhatsApp, Chatwoot, Leads, Encuestas, Ventas, Campañas
**Estado:** PENDIENTE

---

## PRECAUCIONES CRÍTICAS

### Antes de Comenzar:

1. **BACKUP OBLIGATORIO:**
   ```bash
   # Crear backup completo
   cd /home/bastian_berrios/Optima-Complaints
   tar -czf ../optima-complaints-backup-$(date +%Y%m%d-%H%M%S).tar.gz .

   # Verificar backup
   tar -tzf ../optima-complaints-backup-*.tar.gz | head -20
   ```

2. **Crear rama de limpieza:**
   ```bash
   git checkout -b cleanup/remove-old-modules
   git push -u origin cleanup/remove-old-modules
   ```

3. **Verificar que estás en desarrollo (NO PRODUCCIÓN)**

---

## FASE 1: ELIMINAR SERVICIOS DE LEADS

### Archivos a Eliminar:

```bash
cd /home/bastian_berrios/Optima-Complaints

# Eliminar servicios completos de Leads
rm -rf shared/services/interfaces/ILeadService.ts
rm -rf shared/services/implementations/LeadService.ts
rm -rf shared/services/implementations/SupabaseLeadRepository.ts
rm -rf shared/services/implementations/lead_analysis_handlers/
rm -rf shared/services/helpers/LeadValidator.ts
rm -rf shared/services/helpers/AdvisorWorkloadManager.ts

# Verificar eliminación
find shared/services -name "*lead*" -o -name "*Lead*"
```

**Resultado esperado:** No debe haber archivos relacionados con leads

### Commit:
```bash
git add -A
git commit -m "chore: Remove lead management services and handlers"
```

---

## FASE 2: ELIMINAR NODOS N8N PERSONALIZADOS

### Archivos a Eliminar:

```bash
cd /home/bastian_berrios/Optima-Complaints/applications/extensions/custom-nodes/src/nodes

# Eliminar configuración UI de leads
rm -f AIAnalyzer/ui/leadData.ts

# Limpiar TenantConfigLoader de referencias WhatsApp
# NOTA: Este archivo requiere edición manual, no eliminación completa
```

### Editar Manualmente:

**Archivo:** `applications/extensions/custom-nodes/src/nodes/TenantConfigLoader/TenantConfigLoader.node.ts`

**Eliminar secciones:**
- Displayname 'Format for WhatsApp'
- name: 'formatForWhatsApp'
- Toda la configuración relacionada con WhatsApp

**Archivo:** `applications/extensions/custom-nodes/src/nodes/TenantConfigLoader/TenantConfigLoaderService.ts`

**Eliminar:**
- `whatsapp: { ... }` configuration object
- `formato_whatsapp: this.formatForWhatsApp(phoneNumber)`
- `id: 'whatsapp_lead_processing'`
- `private formatForWhatsApp(phone: string): string { ... }` method

### Commit:
```bash
git add -A
git commit -m "chore: Remove WhatsApp and lead processing from custom N8N nodes"
```

---

## FASE 3: ELIMINAR SCRIPTS DE CHATWOOT

### Archivos a Eliminar:

```bash
cd /home/bastian_berrios/Optima-Complaints

# Eliminar directorio completo de Chatwoot
rm -rf scripts/deployment/chatwoot/

# Verificar
ls -la scripts/deployment/
```

### Actualizar scripts/README.md:

**Eliminar secciones:**
- Referencias a `chatwoot/` directory
- Scripts: `setup-chatwoot-webhooks.sh`, `deploy-chatwoot-independent.sh`, `setup-chatwoot-multitenant.sh`

### Commit:
```bash
git add -A
git commit -m "chore: Remove Chatwoot deployment scripts and infrastructure"
```

---

## FASE 4: LIMPIAR WORKFLOWS N8N

### Archivos de Configuración a Actualizar:

#### A. applications/workflows/config/n8n-environment-variables.json

**Eliminar variables:**
```json
"WHATSAPP_TOKEN": { ... }
"WHATSAPP_PHONE_ID": { ... }
```

#### B. applications/workflows/schemas/workflow-schema.json

**Actualizar categorías (línea ~30):**
```json
// ANTES:
"enum": ["administracion", "campañas", "encuestas", "leads", "reclamos", "template"]

// DESPUÉS:
"enum": ["administracion", "reclamos", "template"]
```

**Actualizar tags permitidos (línea ~40):**
```json
// ELIMINAR tags:
"campaign", "email", "whatsapp", "marketing", "automation",
"lead", "ventas", "postventa", "survey", "webhook"

// MANTENER solo:
"reclamos", "complaint", "notification", "analytics", "admin"
```

#### C. applications/workflows/README.md

**Eliminar secciones completas:**

```markdown
# ELIMINAR estas secciones:

├── campañas/
├── leads/
├── encuestas/
    ├── postventa/
    └── ventas/

# MANTENER solo:
├── administracion/
├── reclamos/
└── utils/
```

**Eliminar flujos de:**
- lead-whatsapp-orchestrator
- procesador-whatsapp-leads
- envio-masivo-whatsapp
- enviador-whatsapp-ventas
- procesador-excel-ventas
- sincronizador-chatwoot
- calculador-nps
- etc.

### Workflows N8N a Revisar/Limpiar:

```bash
cd applications/workflows

# Buscar workflows que mencionen módulos prohibidos
grep -r "lead" . --include="*.json" | grep -v "CLEANUP_PLAN"
grep -r "whatsapp" . --include="*.json" -i
grep -r "chatwoot" . --include="*.json" -i
grep -r "encuesta" . --include="*.json"
grep -r "survey" . --include="*.json"
grep -r "venta" . --include="*.json"
```

**Acción:** Eliminar o limpiar cada workflow encontrado según contexto

### Commit:
```bash
git add -A
git commit -m "chore: Clean N8N workflows configuration and remove excluded modules"
```

---

## FASE 5: CREAR MIGRACIÓN DE BASE DE DATOS

### Crear Nueva Migración:

```bash
cd /home/bastian_berrios/Optima-Complaints/database/migrations

# Crear archivo de migración
touch 99_cleanup_remove_old_modules.sql
```

### Contenido de la Migración:

```sql
-- ============================================================================
-- CLEANUP MIGRATION: Remove Leads, Encuestas, Ventas, Chatwoot, WhatsApp
-- Fecha: 2025-10-28
-- Descripción: Elimina tablas y columnas de módulos excluidos en CLAUDE.md
-- ============================================================================

-- PASO 1: Eliminar tablas de módulos excluidos
-- ============================================================================

-- Eliminar tabla de leads
DROP TABLE IF EXISTS public.leads CASCADE;

-- Eliminar tabla de encuestas
DROP TABLE IF EXISTS public.encuestas CASCADE;

-- Eliminar tabla de ventas
DROP TABLE IF EXISTS public.ventas CASCADE;

-- Eliminar tabla de productos (solo si existe)
DROP TABLE IF EXISTS public.productos CASCADE;

-- Eliminar tabla de cotizaciones (si existe)
DROP TABLE IF EXISTS public.cotizaciones CASCADE;

-- Eliminar métricas de encuestas
DROP TABLE IF EXISTS public.metricas_dashboard_encuestas CASCADE;


-- PASO 2: Limpiar columnas de Chatwoot en tenant_configurations
-- ============================================================================

-- Eliminar índices relacionados
DROP INDEX IF EXISTS idx_tenant_configurations_chatwoot;

-- Eliminar función helper de Chatwoot
DROP FUNCTION IF EXISTS get_tenant_by_chatwoot_account(INTEGER);

-- Eliminar columnas de Chatwoot
ALTER TABLE public.tenant_configurations
    DROP COLUMN IF EXISTS chatwoot_account_id CASCADE,
    DROP COLUMN IF EXISTS chatwoot_webhook_token CASCADE,
    DROP COLUMN IF EXISTS chatwoot_api_access_token CASCADE;


-- PASO 3: Limpiar configuraciones JSON de WhatsApp
-- ============================================================================

-- Nota: No eliminamos la columna completa porque puede contener otras configs
-- Solo limpiamos el contenido relacionado con WhatsApp

UPDATE public.tenant_configurations
SET email_config = email_config - 'whatsapp'
WHERE email_config ? 'whatsapp';

-- Si existe una columna específica whatsapp_config, eliminarla
ALTER TABLE public.tenant_configurations
    DROP COLUMN IF EXISTS whatsapp_config CASCADE;


-- PASO 4: Limpiar roles de usuario relacionados con ventas
-- ============================================================================

-- Actualizar constraint de roles (mantener solo roles de reclamos)
ALTER TABLE public.usuarios
    DROP CONSTRAINT IF EXISTS usuarios_role_check;

ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_role_check
    CHECK (role IN (
        'super_admin',
        'admin_concesionario',
        'jefe_servicio',
        'asesor_servicio',
        'encargado_calidad',
        'contact_center'
    ));

-- Reasignar usuarios con roles obsoletos a un rol válido
-- IMPORTANTE: Revisar manualmente antes de ejecutar
UPDATE public.usuarios
SET role = 'asesor_servicio'
WHERE role IN ('asesor_ventas', 'gerente_ventas', 'jefe_ventas');

-- Eliminar columnas relacionadas con ventas de usuarios
ALTER TABLE public.usuarios
    DROP COLUMN IF EXISTS comision_ventas CASCADE,
    DROP COLUMN IF EXISTS meta_mensual CASCADE;


-- PASO 5: Limpiar tablas relacionadas si existen
-- ============================================================================

-- Eliminar seguimientos de leads si existen
DROP TABLE IF EXISTS public.seguimientos_lead CASCADE;

-- Eliminar interacciones de encuestas
DROP TABLE IF EXISTS public.interacciones_encuesta CASCADE;

-- Eliminar campañas de marketing
DROP TABLE IF EXISTS public.campañas CASCADE;
DROP TABLE IF EXISTS public.campañas_envios CASCADE;


-- PASO 6: Verificación final
-- ============================================================================

-- Query para verificar tablas restantes
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN DE LIMPIEZA ===';
    RAISE NOTICE 'Tablas restantes en schema public:';
END $$;

SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar que no existan columnas chatwoot
SELECT
    table_name,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name LIKE '%chatwoot%' OR
    column_name LIKE '%whatsapp%' OR
    column_name LIKE '%lead%' OR
    column_name LIKE '%encuesta%' OR
    column_name LIKE '%venta%'
  )
ORDER BY table_name, column_name;


-- PASO 7: Comentarios en tablas restantes
-- ============================================================================

COMMENT ON TABLE public.reclamos IS 'Tabla principal de gestión de reclamos - Módulo único según CLAUDE.md';
COMMENT ON TABLE public.usuarios IS 'Usuarios del sistema - Solo roles relacionados con gestión de reclamos';
COMMENT ON TABLE public.tenant_configurations IS 'Configuraciones multitenant - Limpiado de Chatwoot y WhatsApp';


-- FIN DE MIGRACIÓN
-- ============================================================================
```

### Verificar SQL antes de ejecutar:

```bash
# Validar sintaxis (dry-run en desarrollo)
psql -h localhost -U postgres -d optima_complaints_dev -f 99_cleanup_remove_old_modules.sql --dry-run

# Si no hay errores, aplicar
psql -h localhost -U postgres -d optima_complaints_dev -f 99_cleanup_remove_old_modules.sql
```

### Commit:
```bash
git add database/migrations/99_cleanup_remove_old_modules.sql
git commit -m "feat: Add database migration to remove excluded modules"
```

---

## FASE 6: LIMPIAR SEED DATA

### Archivo: database/seeds/01_initial_data.sql

**Eliminar secciones completas:**

```sql
-- ELIMINAR:
-- - INSERT INTO public.leads (...)
-- - INSERT INTO public.encuestas (...)
-- - INSERT INTO public.ventas (...)
-- - INSERT INTO public.productos (...)
-- - Referencias a: auto_envio_encuestas, prompts_ventas, prompts_post_venta
-- - Usuarios con role: 'asesor_ventas', 'gerente_ventas'
```

### Script de limpieza:

```bash
cd /home/bastian_berrios/Optima-Complaints/database/seeds

# Crear backup del seed
cp 01_initial_data.sql 01_initial_data.sql.backup

# Editar manualmente o usar sed para eliminar secciones
# NOTA: Requiere revisión manual debido a complejidad
```

### Commit:
```bash
git add database/seeds/
git commit -m "chore: Clean seed data removing leads, surveys, and sales data"
```

---

## FASE 7: ACTUALIZAR CONFIGURACIONES

### Archivos a Limpiar:

#### A. frontend/supabase/migrations/20250101_complete_schema.sql

**Eliminar secciones (líneas aproximadas):**

- **Líneas 80-103:** Tabla `leads` completa
- **Líneas 105-126:** Tabla `encuestas` completa
- **Líneas 203-204:** Indexes de leads
- **Líneas 205-206:** Indexes de encuestas
- **Línea 222:** RLS de leads
- **Línea 223:** RLS de encuestas
- **Líneas 256-257:** Policy de leads
- **Líneas 259-261:** Policy de encuestas
- **Líneas 279-300:** Triggers de encuestas

#### B. database/migrations/10_create_tenant_configurations_table.sql

**Eliminar:**
- `chatwoot_account_id INTEGER`
- `chatwoot_webhook_token TEXT`
- `chatwoot_api_access_token TEXT`
- `UNIQUE(chatwoot_account_id)`
- `CREATE INDEX idx_tenant_configurations_chatwoot`
- `CREATE OR REPLACE FUNCTION get_tenant_by_chatwoot_account`
- `COMMENT ON COLUMN ... chatwoot_account_id`

#### C. database/migrations/07_create_dashboard_metrics_tables.sql

**Eliminar:**
- `metricas_dashboard_encuestas` table completa

### Commit:
```bash
git add database/migrations/ frontend/supabase/migrations/
git commit -m "refactor: Clean database schemas removing excluded module tables"
```

---

## FASE 8: ACTUALIZAR DOCUMENTACIÓN

### Archivos a Actualizar:

#### A. applications/workflows/README.md

**Estructura nueva:**

```markdown
# Workflows N8N - Optima-Complaints

## Módulos Activos

### Administración
- portal-super-admin.json
- cargador-config-tenant.json

### Reclamos (Módulo Principal)
- complaint-orchestrator.json
- procesador-rag-reclamos.json
- asignacion-automatica-reclamos.json
- notificaciones-reclamos.json
- alerta-black-alert.json
- auditor-modificaciones.json

### Gestión de Conocimiento (RAG)
- ingesta-conocimiento.json
- fragmentacion-conocimiento.json
- almacenamiento-conocimiento.json
- generador-embeddings.json
- rerank-cohere-documentos.json

### Utilidades
- monitor-telemetria-avanzada.json
- agregador-metricas-reclamos.json
- escaner-malware-documentos.json
- test-conectividad-supabase.json
```

#### B. applications/README.md

**Eliminar referencias a:**
- Chatwoot Multitenant v2
- Procesamiento de leads
- Encuestas
- WhatsApp

#### C. scripts/README.md

**Eliminar sección completa:**
- Chatwoot (5 scripts)
- Referencias a deployment de Chatwoot

#### D. README.md principal (si existe)

**Actualizar:**
- Alcance del proyecto (solo reclamos)
- Módulos disponibles
- Tecnologías (eliminar Chatwoot)

### Commit:
```bash
git add applications/README.md applications/workflows/README.md scripts/README.md
git commit -m "docs: Update documentation to reflect complaints-only scope"
```

---

## FASE 9: LIMPIAR FRONTEND

### Archivos TypeScript a Actualizar:

#### A. frontend/src/lib/enums.ts

**Actualizar enum de roles:**

```typescript
// ANTES:
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  GERENCIA = 'gerencia',
  JEFE_SERVICIO = 'jefe_servicio',
  ASESOR_SERVICIO = 'asesor_servicio',
  CONTACT_CENTER = 'contact_center',
  ENCARGADO_CALIDAD = 'encargado_calidad',
  ASESOR_VENTAS = 'asesor_ventas',  // ELIMINAR
  GERENTE_VENTAS = 'gerente_ventas'  // ELIMINAR
}

// DESPUÉS:
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN_CONCESIONARIO = 'admin_concesionario',
  JEFE_SERVICIO = 'jefe_servicio',
  ASESOR_SERVICIO = 'asesor_servicio',
  CONTACT_CENTER = 'contact_center',
  ENCARGADO_CALIDAD = 'encargado_calidad'
}
```

**Eliminar enums de:**
- `LeadStatus` (si existe)
- `SurveyOrigin` (si existe)
- `SalesStatus` (si existe)

#### B. frontend/src/lib/auth-middleware.ts

**Actualizar validaciones de roles** para que solo permitan roles de reclamos

#### C. Buscar y eliminar componentes de Frontend:

```bash
cd frontend/src

# Buscar componentes de leads
find . -name "*lead*" -o -name "*Lead*"

# Buscar componentes de encuestas
find . -name "*survey*" -o -name "*Survey*" -o -name "*encuesta*"

# Buscar componentes de ventas
find . -name "*sales*" -o -name "*Sales*" -o -name "*venta*"

# Eliminar según hallazgos
```

#### D. Actualizar tipos TypeScript:

```bash
# Buscar archivos de tipos
find frontend/src -name "*.types.ts" -o -name "types.ts"

# Revisar y limpiar manualmente cada uno
```

### Commit:
```bash
git add frontend/src/
git commit -m "refactor: Remove frontend components and types for excluded modules"
```

---

## FASE 10: VERIFICACIÓN EXHAUSTIVA

### A. Buscar Referencias Residuales:

```bash
cd /home/bastian_berrios/Optima-Complaints

# Buscar "lead" (excluyendo comentarios de git)
grep -r "lead" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  --exclude="CLEANUP_PLAN.md" \
  --exclude="CLAUDE.md" \
  | grep -v "# lead" \
  | grep -v "leading"

# Buscar "whatsapp"
grep -ri "whatsapp" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  --exclude="CLEANUP_PLAN.md"

# Buscar "chatwoot"
grep -ri "chatwoot" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  --exclude="CLEANUP_PLAN.md"

# Buscar "encuesta"
grep -ri "encuesta\|survey" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  --exclude="CLEANUP_PLAN.md"

# Buscar "venta"
grep -ri "venta\|sales" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  --exclude="CLEANUP_PLAN.md" \
  | grep -v "prevent"
```

### B. Verificar Package.json:

```bash
# Buscar dependencias relacionadas
cat package.json | grep -i "whatsapp\|chatwoot\|lead\|survey"

# Si hay dependencias, eliminarlas
npm uninstall <package-name>
```

### C. Verificar Variables de Entorno:

```bash
# Revisar archivos .env de ejemplo
cat .env.example | grep -i "whatsapp\|chatwoot|lead"

# Limpiar referencias encontradas
```

### Commit:
```bash
git add -A
git commit -m "chore: Final cleanup of residual references"
```

---

## FASE 11: VALIDACIÓN Y TESTING

### A. Compilación del Proyecto:

```bash
cd /home/bastian_berrios/Optima-Complaints

# Si es un proyecto Node.js/TypeScript
npm install
npm run build

# Verificar que no haya errores de compilación
```

### B. Testing de Base de Datos:

```bash
# Aplicar migraciones limpias en BD de desarrollo
cd database/migrations
psql -h localhost -U postgres -d optima_complaints_test < 99_cleanup_remove_old_modules.sql

# Verificar tablas restantes
psql -h localhost -U postgres -d optima_complaints_test -c "\dt"

# No deben aparecer: leads, encuestas, ventas, productos
```

### C. Testing de Frontend:

```bash
cd frontend

# Ejecutar tests si existen
npm run test

# Ejecutar linter
npm run lint

# Verificar que no hay errores de TypeScript
npm run type-check
```

### D. Testing de N8N Custom Nodes:

```bash
cd applications/extensions/custom-nodes

# Compilar nodos
npm run build

# Verificar que compila sin errores
```

---

## FASE 12: DOCUMENTACIÓN FINAL

### Actualizar CLAUDE.md:

**Agregar sección de changelog:**

```markdown
## Changelog

### v2.1.0 - Limpieza Completa (28 Oct 2025)

**Eliminado:**
- Sistema completo de Leads Management (servicios, DB, workflows)
- Integración WhatsApp Business API (nodos N8N, configuración)
- Integración Chatwoot (webhooks, DB columns, scripts)
- Sistema de Encuestas (ventas y post-venta, DB, workflows)
- Módulo de Ventas (tabla ventas, roles, productos)
- Campañas de Marketing (workflows, documentación)

**Resultado:** Proyecto 100% enfocado en gestión de reclamos según alcance original

**Archivos eliminados:** 30+ archivos de servicios y configuración
**Migraciones DB:** 99_cleanup_remove_old_modules.sql
**Commits:** 12 commits de limpieza organizados por módulo
```

### Crear documento de resumen:

```bash
touch CLEANUP_SUMMARY.md
```

**Contenido:**

```markdown
# Resumen de Limpieza - Optima-Complaints

## Estadísticas

- **Archivos eliminados:** ~40 archivos
- **Líneas de código eliminadas:** ~10,000+ líneas
- **Tablas de BD eliminadas:** 6 tablas (leads, encuestas, ventas, productos, etc.)
- **Columnas de BD eliminadas:** 8+ columnas (chatwoot_*, whatsapp_*)
- **Workflows N8N limpiados:** 30+ workflows eliminados de documentación
- **Roles de usuario eliminados:** 2 roles (asesor_ventas, gerente_ventas)

## Módulos Eliminados

1. WhatsApp Business API
2. Chatwoot Integration
3. Leads Management
4. Encuestas (Surveys)
5. Ventas (Sales)
6. Campañas Marketing

## Módulos Conservados

1. Gestión de Reclamos (Módulo Principal)
2. Sistema RAG con Gemini
3. Asignación Automática
4. Notificaciones por Email
5. Black Alert Detection
6. Portal de Administración
7. Base de Conocimiento

## Próximos Pasos

1. Merge a main después de QA
2. Desplegar a producción con migraciones
3. Actualizar documentación de usuarios
4. Archivar código eliminado en branch legacy
```

### Commit final:
```bash
git add CLEANUP_SUMMARY.md CLAUDE.md
git commit -m "docs: Add cleanup summary and update changelog"
```

---

## FASE 13: MERGE Y CIERRE

### Preparar Pull Request:

```bash
# Push de la rama
git push origin cleanup/remove-old-modules

# Crear PR usando GitHub CLI
gh pr create \
  --title "chore: Remove excluded modules (Leads, WhatsApp, Chatwoot, Surveys, Sales)" \
  --body "$(cat CLEANUP_SUMMARY.md)" \
  --label "cleanup,breaking-change"
```

### Checklist Final antes de Merge:

- [ ] Todos los tests pasan
- [ ] Proyecto compila sin errores
- [ ] Base de datos migra correctamente
- [ ] No hay referencias residuales a módulos eliminados
- [ ] Documentación actualizada
- [ ] Changelog actualizado en CLAUDE.md
- [ ] Code review aprobado
- [ ] Backup de producción creado

### Merge:

```bash
git checkout main
git merge cleanup/remove-old-modules
git push origin main
```

### Archivar código antiguo:

```bash
# Crear branch legacy con código original
git checkout -b legacy/full-system-backup
git push origin legacy/full-system-backup

# Tag del estado anterior
git tag -a v2.0.0-legacy -m "Legacy version with all modules before cleanup"
git push --tags
```

---

## MÉTRICAS DE ÉXITO

Al finalizar, deberías tener:

1. **0 referencias** a "lead", "whatsapp", "chatwoot", "encuesta", "venta" en código activo
2. **Solo tablas de reclamos** en base de datos
3. **Solo 6 roles** de usuario (sin ventas)
4. **Compilación exitosa** sin errores
5. **Tests pasando** (si existen)
6. **Documentación alineada** con CLAUDE.md
7. **Reducción de ~30-40%** en tamaño de código

---

## SOPORTE

**Creado por:** Claude Code (Anthropic)
**Fecha:** 28 de Octubre 2025
**Contacto proyecto:** bastian.berrios@ejemplo.com

**Notas importantes:**
- Este plan es IRREVERSIBLE una vez aplicadas las migraciones de BD
- Siempre mantén backups actualizados
- Prueba en entorno de desarrollo ANTES de producción
- Ejecuta las fases en orden secuencial
- No saltees la verificación entre fases

---

**FIN DEL PLAN DE LIMPIEZA**
