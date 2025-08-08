# 📁 Scripts Deprecados - OptimaCX

Esta carpeta contiene scripts que han sido movidos por estar obsoletos o haber completado su propósito.

## 🗂️ Estructura

```
deprecated/
├── n8n-migration/          # Scripts de migración N8N (COMPLETADA)
├── fixes/                  # Fixes específicos no reutilizables
└── utilities/              # Utilidades obsoletas
```

## 📋 Scripts Deprecados por Categoría

### 🔄 **N8N Migration (MIGRACIÓN COMPLETADA)**
- `deploy-n8n-fix.sh` - Deploy con fix N8N (Ya aplicado)
- `n8n-terraform-migration-check.sh` - Verificación migración (Completada)
- `n8n-terraform-migration-complete.sh` - Completar migración (Ejecutada)

**Razón**: La migración de N8N a Terraform fue completada exitosamente en Agosto 2025.

### 🔧 **Fixes Específicos (NO REUTILIZABLES)**
- `fix-chatwoot.sh` - Fix ActionCable Chatwoot (Fix específico aplicado)
- `n8n-quick-fix.sh` - Fix rápido N8N (Fix específico)
- `fix-n8n-access.sh` - Fix acceso N8N (Script muy viejo - Aug 1)

**Razón**: Fixes específicos para problemas puntuales que ya fueron resueltos.

### 🛠️ **Utilities Obsoletas**
- `reorganize-project.sh` - Reorganización proyecto (Ya ejecutada)
- `get-supabase-keys.sh` - Obtener claves Supabase (Script viejo - Aug 1)

**Razón**: Utilidades que cumplieron su propósito o son muy antiguas.

## ⚠️ **Nota Importante**

Estos scripts se mantienen por **referencia histórica** pero **NO DEBEN** ser utilizados en producción:

- ❌ **No están actualizados** con la configuración actual
- ❌ **Podrían causar conflictos** con el estado actual del sistema
- ❌ **Algunos son para migraciones ya completadas**

## 🗑️ **Limpieza Futura**

Estos scripts pueden ser eliminados permanentemente después de **6 meses** de no uso (Febrero 2026).

---
*Scripts deprecados el: Agosto 8, 2025*
*Última migración N8N: Agosto 5, 2025*
