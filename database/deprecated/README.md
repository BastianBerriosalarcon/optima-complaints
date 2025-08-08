# 📁 Database Deprecated - OptimaCX

Esta carpeta contiene migrations y scripts de base de datos que han sido deprecados por estar obsoletos o duplicados.

## 🗂️ Estructura

```
deprecated/
└── migrations/           # Migrations obsoletos
    ├── 20250123_advisor_workload_functions.sql    # Versión básica (obsoleta)
    └── frontend-legacy/                           # Setup legacy obsoleto
        └── initial-setup.sql
```

## 📋 Migrations Deprecados

### 🔄 **Migration Duplicado - advisor_workload_functions**

#### ❌ `20250123_advisor_workload_functions.sql` (VERSIÓN BÁSICA)
- **Razón**: Superseded por versión enhanced
- **Tamaño**: 3.6KB (104 líneas)
- **Funcionalidad**: Solo tabla log básica
- **Reemplazado por**: `20250123_advisor_workload_functions_updated.sql` (activo)

**Diferencias clave:**
```sql
// Versión básica (deprecated):
- Solo tabla advisor_workload_log
- Funciones básicas increment/decrement
- Sin índices de performance

// Versión enhanced (activa):
- Campos adicionales en usuarios (carga_actual, especialidad)
- Índices de performance optimizados
- Soporte para jefe_ventas/gerente_ventas
- Enhanced logging con lead_id
```

### 🏗️ **Frontend Legacy Setup**

#### ❌ `frontend-legacy/initial-setup.sql` (OBSOLETO)
- **Razón**: Nomenclatura antigua de tablas
- **Problema**: Usa tabla `users` en lugar de `usuarios`
- **Estado**: Sistema actual usa nomenclatura en español
- **Tamaño**: 93 líneas

**Problemas identificados:**
```sql
// Legacy (deprecated):
CREATE TABLE public.users (...)

// Actual (en uso):
CREATE TABLE public.usuarios (...)
```

## ✅ **Migrations Activos (NO AFECTADOS)**

```
database/migrations/
├── 02_rls_policies_complete.sql               ✅
├── 02a_rls_functions.sql                      ✅
├── 02b_enable_rls.sql                         ✅
├── 02c_rls_policies_core.sql                  ✅
├── 03_update_embeddings_to_gemini.sql         ✅
├── 04_create_sales_feedback_cases_table.sql   ✅
├── 05_create_post_sale_feedback_cases_table.sql ✅
├── 06_create_sales_surveys_table.sql          ✅
├── 07_create_dashboard_metrics_tables.sql     ✅
├── 08_add_vin_to_sales_surveys.sql            ✅
├── 09_add_vin_to_postventa_surveys.sql        ✅
└── 20250123_advisor_workload_functions_updated.sql ✅ (VERSIÓN ACTIVA)
```

## 🚨 **Base de Datos - STATUS: NO AFECTADA**

- ✅ **Supabase Config**: `supabase-config.toml` mantenido y activo
- ✅ **Migrations Activos**: Todos funcionando correctamente
- ✅ **Schemas/Functions/Policies**: No modificados
- ✅ **Seeds**: No afectados

## ⚠️ **Nota Importante**

Estos migrations **NO DEBEN** ser aplicados:

- ❌ **Pueden crear conflictos** con la estructura actual
- ❌ **Nomenclatura obsoleta** (users vs usuarios)
- ❌ **Versión duplicada** del mismo migration

## 🗑️ **Limpieza Futura**

Estos resources pueden ser eliminados permanentemente después de **6 meses** de no uso (Febrero 2026).

---
*Migrations deprecados el: Agosto 8, 2025*
*Metodología: Preservar solo versiones enhanced*
*Base de datos: NO AFECTADA*
