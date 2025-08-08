# 🔍 Análisis Database & Shared - Archivos Obsoletos

## 📂 **Database/** - Archivos en raíz

### ✅ **Archivos CORRECTOS (mantenidos)**
- `supabase-config.toml` ✅ **NECESARIO**
  - Configuración local de Supabase
  - Proyecto: "bastianberrios_a"
  - Configuración de puertos, auth, storage, etc.
  - **Estado**: Activo y necesario

### ⚠️ **Archivos PROBLEMÁTICOS en /migrations/**

#### 🔄 **DUPLICADO: advisor_workload_functions**
- ❌ `20250123_advisor_workload_functions.sql` (3.6KB) 
- ✅ `20250123_advisor_workload_functions_updated.sql` (9.4KB)

**Problema**: Dos versiones del mismo migration
- **Versión antigua**: Solo tabla log básica (104 líneas)
- **Versión nueva**: Enhanced + índices + campos adicionales (236 líneas)

**Acción recomendada**: Mover la versión antigua a deprecated/

#### 📁 **LEGACY: frontend-legacy/**
- ❌ `migrations/frontend-legacy/initial-setup.sql`
- **Problema**: Migration legacy con tabla `users` (no `usuarios`)
- **Estado**: Obsoleto, usa nomenclatura antigua
- **Acción recomendada**: Mover a deprecated/

---

## 📦 **Shared/** - Archivos en raíz

### ✅ **Archivos CORRECTOS (mantenidos)**
- `index.ts` ✅ **NECESARIO** - Entry point para exports
- `package.json` ✅ **NECESARIO** - Config del package @optimacx/shared
- `tsconfig.json` ✅ **NECESARIO** - Config TypeScript

**Estado**: Estructura perfecta, todos los archivos son necesarios

---

## 🎯 **Resumen de Acciones Recomendadas**

### ❌ **A mover a deprecated/**
1. `database/migrations/20250123_advisor_workload_functions.sql` (versión antigua)
2. `database/migrations/frontend-legacy/` (toda la carpeta)

### ✅ **Mantener activos**
- `database/supabase-config.toml` 
- `shared/index.ts`
- `shared/package.json` 
- `shared/tsconfig.json`

### 📊 **Estadísticas**
- **Database**: 1 config correcto + 2 elementos obsoletos
- **Shared**: 3 archivos correctos + 0 obsoletos
- **Total a limpiar**: 2 elementos

¿Procedo con el cleanup final?
