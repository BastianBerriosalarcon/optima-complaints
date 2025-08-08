# 🚀 Applications - OptimaCX

Módulo de aplicaciones y extensiones del sistema OptimaCX.

## 📁 Estructura Reorganizada

```
applications/
├── 🔧 extensions/           # Extensiones y nodos personalizados
│   ├── custom-nodes/       # Nodos N8N personalizados
│   └── rag-system/         # Sistema RAG (Retrieval Augmented Generation)
└── 🔄 workflows/           # Workflows N8N organizados
    ├── business/           # Workflows de negocio por dominio
    │   ├── administracion/ # Workflows administrativos
    │   ├── campañas/       # Gestión de campañas
    │   ├── encuestas/      # Sistema de encuestas
    │   ├── leads/          # Gestión de leads
    │   └── reclamos/       # Sistema de reclamos
    ├── templates/          # Plantillas reutilizables
    ├── tests/              # Tests de workflows
    └── utils/              # Utilidades y helpers
```

## 🧹 Mantenimiento

### Limpieza de Workflows
```bash
# Limpiar logs de debug de workflows
./clean-workflows.sh
```

**Últimas mejoras aplicadas:**
- ✅ **Console.log eliminados**: Todos los logs de debug removidos (43 archivos)
- ✅ **Templates consolidados**: Mantenidos solo templates necesarios
- ✅ **Estructura optimizada**: Workflows organizados por dominio de negocio

## 🔧 Extensions

### Custom Nodes
Nodos personalizados para N8N que extienden la funcionalidad base:
- **AdvisorAssigner**: Asignación automática de asesores
- **AIAnalyzer**: Análisis con IA
- **WhatsApp Business**: Integración WhatsApp
- **OptimaCX API**: Conectores API propietarios

### RAG System
Sistema de Retrieval Augmented Generation para:
- Procesamiento de conocimiento
- Generación de embeddings
- Búsqueda semántica

## 🔄 Workflows

### Business Workflows

#### 👥 **Administración**
- Portal super admin
- Gestión de usuarios y permisos

#### 📢 **Campañas**
- Analíticas de campañas
- Automatización de email
- Envío masivo WhatsApp
- Secuencias de seguimiento

#### 📊 **Encuestas**
- Agregador de métricas
- Calculador NPS
- Encuestas post-venta
- Encuestas de ventas

#### 🎯 **Leads**
- Gestión completa del ciclo de leads
- Análisis con IA
- Asignación automática de asesores
- Integración WhatsApp
- Métricas de conversión

#### 🆘 **Reclamos**
- Sistema completo de gestión de reclamos
- Procesamiento RAG
- Asignación automática
- Alertas y escalación
- Auditoría de modificaciones

### Templates
Plantillas reutilizables para:
- **Chatwoot Multitenant v2**: Integración webhook actualizada
- **Universal Handler**: Manejador de webhooks universal
- **Incorporación Concesionario**: Workflow de onboarding
- **Provisión Automática**: Auto-deployment de workflows

### Utils
Utilidades compartidas:
- Validadores
- Manejadores de errores
- Sincronizadores
- Optimizadores

## 🚀 Uso

```bash
# Instalar dependencias de nodos personalizados
cd applications/extensions/custom-nodes
npm install

# Importar workflows de negocio
cd applications/workflows/business
# Los workflows están listos para importar en N8N
```

## 📝 Notas

- Todos los workflows están optimizados para producción (sin console.log)
- Las extensiones son modulares e independientes
- Templates actualizados y consolidados
- Sistema preparado para escalabilidad horizontal
