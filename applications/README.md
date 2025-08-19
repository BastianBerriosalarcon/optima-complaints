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

### Nodos Personalizados (Custom Nodes)
Nodos de N8N desarrollados a medida para encapsular la lógica de negocio de OptimaCX:
- **LeadProcessor**: Procesa y gestiona el ciclo de vida de los leads.
- **TenantConfigLoader**: Carga y valida la configuración específica de cada tenant.
- **AIAnalyzer**: Realiza análisis de mensajes y leads usando IA.
- **AdvisorAssigner**: Asigna leads a asesores basado en lógica de negocio.
- **WhatsAppSender**: Envía mensajes a través de la API de WhatsApp Business.

### Credenciales Personalizadas (Custom Credentials)
Tipos de credenciales a medida para conectar N8N con servicios externos de forma segura:
- **OptimaCX API**: Para la API propietaria de OptimaCX.
- **WhatsApp Business**: Para la integración con la API de WhatsApp.

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

## 🚀 Despliegue y Uso

### 1. Nodos Personalizados
Los nodos deben ser construidos antes de ser utilizados por una instancia de N8N.

```bash
# 1. Navegar al directorio de los nodos
cd applications/extensions/custom-nodes

# 2. Instalar dependencias
npm install

# 3. Construir los nodos (genera el directorio `dist`)
npm run build
```
El directorio `dist` resultante debe ser montado en la instancia de N8N para que los nodos estén disponibles.

### 2. Workflows
La importación de los workflows (archivos `.json`) a la instancia de N8N se puede realizar de dos maneras:
- **Manualmente:** A través de la interfaz de usuario de N8N.
- **Automáticamente:** Usando la API REST de N8N para crear o actualizar workflows de forma programática. Este es el método recomendado para entornos de producción y CI/CD.


## 📝 Notas

- Todos los workflows están optimizados para producción (sin console.log)
- Las extensiones son modulares e independientes
- Templates actualizados y consolidados
- Sistema preparado para escalabilidad horizontal
