# 📋 Estructura del Proyecto OptimaCX-GCP

> **Estado**: Reorganizado el 8 de agosto, 2025
> **Versión**: 2.0 - Arquitectura Modular

## 🏗️ **Arquitectura General**

```
optimacx-GCP/
├── 🚀 applications/              # Aplicaciones y extensiones
│   ├── extensions/              # Nodos personalizados y sistemas
│   └── workflows/               # Workflows organizados por dominio
├── ⚙️ config/                   # Configuraciones del sistema
├── 🗄️ database/                 # Esquemas, migraciones y políticas
├── 📚 docs/                     # Documentación del proyecto
├── 🎨 frontend/                 # Aplicación Next.js
├── 🏗️ infrastructure/           # Terraform e infraestructura
├── 🔧 scripts/                  # Scripts organizados por categoría
├── 🤝 shared/                   # Código compartido entre módulos
└── 📁 temp/                     # Archivos temporales
```

## 📁 **Descripción de Módulos**

### 🚀 **Applications**
**Propósito**: Extensiones y workflows de negocio
- `extensions/`: Nodos N8N personalizados y sistema RAG
- `workflows/`: Workflows organizados por dominio (leads, reclamos, etc.)

### 🏗️ **Infrastructure** 
**Propósito**: Infraestructura como código
- Terraform modularizado por servicios
- Ambientes separados (dev, prod)
- Módulos reutilizables

### 🔧 **Scripts**
**Propósito**: Automatización y deployment
```
deployment/    # Scripts de despliegue (Chatwoot, N8N)
testing/       # Validación y health checks
database/      # Migraciones y setup DB
utilities/     # Herramientas generales
maintenance/   # Scripts de mantenimiento
setup/         # Configuración inicial
```

### 🗄️ **Database**
**Propósito**: Gestión de base de datos Supabase
- `migrations/`: Migraciones SQL versionadas
- `policies/`: Row Level Security policies
- `schemas/`: Definiciones de esquemas
- `functions/`: Funciones SQL y triggers

### 🎨 **Frontend**
**Propósito**: Aplicación web Next.js
- Configuración completa de testing (Jest, Playwright)
- Integración con Supabase
- Componentes UI organizados

### 🤝 **Shared**
**Propósito**: Código reutilizable entre módulos
- Tipos TypeScript compartidos
- Servicios comunes
- Configuraciones compartidas

## 🎯 **Ventajas de la Nueva Estructura**

### ✅ **Modularidad**
- Separación clara de responsabilidades
- Módulos independientes y reutilizables
- Fácil mantenimiento y escalabilidad

### ✅ **Organización**
- Scripts categorizados por función
- Workflows agrupados por dominio de negocio
- Documentación en cada módulo

### ✅ **Desarrollo**
- Estructura predecible y estándar
- Fácil onboarding para nuevos desarrolladores
- Separación entre código temporal y producción

### ✅ **Deployment**
- Scripts organizados por fase de deployment
- Infraestructura modularizada
- Ambientes claramente separados

## 🚀 **Flujo de Trabajo Recomendado**

1. **Desarrollo de Workflows**: `applications/workflows/business/`
2. **Testing**: `scripts/testing/`
3. **Deployment**: `scripts/deployment/`
4. **Mantenimiento**: `scripts/maintenance/`

## 📖 **Documentación Adicional**

- [`applications/README.md`](./applications/README.md) - Documentación de aplicaciones
- [`scripts/README.md`](./scripts/README.md) - Guía de scripts
- [`docs/`](./docs/) - Documentación técnica detallada

## 🔄 **Próximos Pasos**

1. ✅ Reorganización completada
2. 🔄 Actualizar referencias en código
3. 📝 Actualizar documentación de deployment
4. 🧪 Validar que todos los scripts funcionen en nueva estructura
