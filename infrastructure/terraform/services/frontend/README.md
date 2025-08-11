# Frontend Service - FUTURO USO
# Este servicio está listo pero NO se usa actualmente

## ⚠️ ESTADO: PREPARADO PARA FUTURO

El módulo del frontend está **configurado y listo** pero:

- ✅ **No se elimina**: Será útil cuando desarrolles el frontend
- ✅ **Está preparado**: Para Next.js con Supabase
- ✅ **No interfiere**: Con la configuración actual

## 🚀 Cuándo Activar

Cuando estés listo para el frontend:

1. **Descomenta** en `/environments/dev/main.tf`:
```terraform
# module "frontend" {
#   source = "../../services/frontend"
#   # ... configuración
# }
```

2. **Deploy**:
```bash
cd environments/dev
terraform apply -target=module.frontend
```

## 📝 Configuración Lista

- ✅ Next.js optimizado para Cloud Run
- ✅ Variables de entorno para Supabase
- ✅ Escalado automático
- ✅ HTTPS automático

**Por ahora se mantiene preparado pero sin usar.**
