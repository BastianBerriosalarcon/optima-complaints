# 🚀 Applications - Optima-Complaints

Este directorio contiene las aplicaciones principales que componen el sistema de gestión de reclamos, incluyendo los workflows de N8N y las extensiones personalizadas.

## 📁 Estructura de Directorios

```
applications/
├── extensions/           # Extensiones y nodos personalizados para N8N
│   └── custom-nodes/       # Nodos para cargar configuración de tenant y análisis RAG
└── workflows/            # Workflows de N8N para la lógica de negocio
    ├── administracion/     # Workflows para la administración de tenants
    ├── reclamos/           # Módulo principal de gestión de reclamos
    └── utils/              # Workflows de utilidad (monitoreo, conectividad)
```

## 🔧 Extensiones (Custom Nodes)

Nodos de N8N desarrollados a medida para encapsular la lógica de negocio de Optima-Complaints:

- **TenantConfigLoader**: Carga y valida la configuración específica de cada concesionario (tenant) desde la base de datos.
- **RagAnalysis**: Ejecuta el pipeline de Retrieval Augmented Generation (RAG) para analizar el contenido de un reclamo contra la base de conocimiento.

### Despliegue de Nodos Personalizados

Para que los nodos estén disponibles en N8N, el directorio `dist` generado tras la compilación debe ser montado en la instancia de N8N.

```bash
# 1. Navegar al directorio de los nodos
cd applications/extensions/custom-nodes

# 2. Instalar dependencias
npm install

# 3. Construir los nodos
npm run build
```

## 🔄 Workflows (N8N)

La lógica de negocio principal reside en los workflows de N8N, organizados por dominio:

- **Administración**: Contiene workflows para el portal de super-admin, como la creación y configuración de nuevos tenants.
- **Reclamos**: Es el corazón del sistema. Incluye el orquestador principal de reclamos, el procesador RAG, la asignación automática, el sistema de notificaciones y las alertas críticas (Black Alert).
- **Utilidades**: Workflows de soporte como monitores de telemetría, scripts de testing de conectividad y agregadores de métricas.

Para más detalles, consulta el `README.md` dentro del directorio `workflows`.