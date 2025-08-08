# 📁 Infrastructure Deprecated - OptimaCX

Esta carpeta contiene módulos y environments de Terraform que han sido deprecados por estar obsoletos o duplicados.

## 🗂️ Estructura

```
deprecated/
├── environments/          # Environments obsoletos
└── services/             # Services duplicados o no utilizados
```

## 📋 Recursos Deprecados

### 🌍 **Environments Obsoletos**

#### `dev/` (ENVIRONMENT NO UTILIZADO)
- **Razón**: No tenía terraform.tfstate activo
- **Estado**: Era una copia de configuration que nunca se ejecutó
- **Reemplazado por**: Los environments `n8n/` y `chatwoot/` que sí están activos

### 🔧 **Services Obsoletos**

#### `chatwoot-multitenant/` (DUPLICADO)
- **Razón**: Duplicado de `modules/chatwoot-multitenant/`
- **Estado**: El environment chatwoot usa `modules/chatwoot-multitenant/`
- **Diferencias**: El module es más completo (tiene apis.tf, cloud-sql-santiago.tf, load-balancer.tf)

#### `optimacx-frontend/` (NO UTILIZADO)
- **Razón**: Solo estaba comentado en los environments
- **Estado**: No hay imagen de frontend construida aún
- **Futuro**: Se recreará cuando el frontend esté listo para deployment

## ✅ **Estructura Actual Activa**

```
infrastructure/terraform/
├── modules/                    # ✅ Módulos reutilizables
│   ├── chatwoot-multitenant/   # ✅ (usado por chatwoot env)
│   ├── cloud-run/             # ✅ 
│   ├── database/              # ✅ 
│   ├── networking/            # ✅ 
│   ├── redis/                 # ✅ 
│   └── security/              # ✅ 
├── services/                  # ✅ Services activos
│   ├── n8n/                   # ✅ (usado por n8n env)
│   └── supabase/              # ✅ (usado por n8n env)
└── environments/              # ✅ Deployments activos
    ├── n8n/                   # ✅ (Cloud Run: n8n-optimacx-supabase-dev)
    └── chatwoot/              # ✅ (Cloud Run: chatwoot-multitenant-dev)
```

## 🚨 **Servicios Cloud Run ACTIVOS (NO AFECTADOS)**

- ✅ **N8N**: `n8n-optimacx-supabase-dev` → Gestionado por `environments/n8n/`
- ✅ **Chatwoot**: `chatwoot-multitenant-dev` → Gestionado por `environments/chatwoot/`

## ⚠️ **Nota Importante**

Estos recursos se mantienen por **referencia histórica** pero **NO DEBEN** ser utilizados:

- ❌ **No están actualizados** con la configuración actual
- ❌ **Podrían causar conflictos** con los deployments activos
- ❌ **Algunos son duplicados** de módulos activos

## 🗑️ **Limpieza Futura**

Estos recursos pueden ser eliminados permanentemente después de **6 meses** de no uso (Febrero 2026).

---
*Resources deprecados el: Agosto 8, 2025*
*Limpieza conservadora: Solo recursos no utilizados*
*Deployments activos: NO AFECTADOS*
