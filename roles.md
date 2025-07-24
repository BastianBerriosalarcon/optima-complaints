# Roles y Permisos del Sistema Optima-CX

## Descripción General

El sistema Optima-CX implementa un sistema de roles jerárquico que controla el acceso a diferentes funcionalidades y datos dentro de la plataforma de gestión de concesionarios automotrices. Cada rol tiene permisos específicos y niveles de acceso diferenciados.

## Roles del Sistema

### 1. 👑 **Administrador (admin)**

**Descripción**: Rol con máximos privilegios del sistema

**Facultades**:
- Acceso completo a todas las funcionalidades del sistema
- Gestión de usuarios y configuraciones globales
- Administración de múltiples concesionarios (multi-tenant)
- Configuración de integraciones y servicios externos
- Acceso a logs del sistema y auditoría
- Gestión de configuraciones de marca y branding

**Puede Visualizar**:
- Dashboard completo con todas las métricas
- Todos los reclamos y encuestas del sistema
- Configuraciones de sistema y tenant
- Logs de auditoría y actividad
- Reportes ejecutivos completos
- Estadísticas de rendimiento del sistema

---

### 2. 🏢 **Gerencia (gerencia)**

**Descripción**: Nivel ejecutivo de gestión del concesionario

**Facultades**:
- Gestión completa de usuarios del concesionario
- Acceso a reportes ejecutivos y analíticos avanzados
- Exportación masiva de datos
- Configuración de procesos de negocio
- Supervisión de todas las áreas operativas
- Gestión de configuraciones del concesionario

**Puede Visualizar**:
- Dashboard ejecutivo con KPIs principales
- Todos los reclamos y encuestas del concesionario
- Reportes comparativos y de tendencias
- Métricas de rendimiento por área
- Análisis de satisfacción del cliente
- Informes de calidad de servicio

---

### 3. 👩‍💼 **Jefa de Contact Center (jefa_contact_center)**

**Descripción**: Supervisión y gestión del área de contact center

**Facultades**:
- Supervisión del equipo de contact center
- Gestión de asignación de encuestas
- Acceso a métricas de performance del equipo
- Configuración de procesos de contact center
- Exportación de datos operativos
- Gestión de calidad de atención

**Puede Visualizar**:
- Dashboard de contact center con métricas del equipo
- Todos los reclamos y encuestas gestionados por su área
- Estadísticas de performance individual y grupal
- Reportes de productividad
- Métricas de tiempo de respuesta
- Análisis de satisfacción de atención

---

### 4. 🔍 **Encargado de Calidad (encargado_calidad)**

**Descripción**: Especialista en análisis de calidad y satisfacción del cliente

**Facultades**:
- Análisis avanzado de datos de calidad
- Gestión de información y reportes especializados
- Exportación de encuestas y reclamos
- Configuración de métricas de calidad
- Acceso a analytics avanzados con drill-down
- Generación de reportes de tendencias

**Puede Visualizar**:
- Dashboard de analítica de calidad
- Reportes comparativos y de tendencias
- Análisis drill-down de satisfacción
- Métricas de NPS y satisfacción
- Reportes de análisis de reclamos
- Estadísticas de calidad de servicio

---

### 5. 🛠️ **Jefe de Servicio (jefe_servicio)**

**Descripción**: Gestión del área de servicio técnico

**Facultades**:
- Supervisión de operaciones de servicio
- Gestión y asignación de reclamos de servicio
- Acceso a métricas específicas de servicio
- Exportación de datos de servicio
- Configuración de procesos de servicio
- Gestión de equipos de servicio

**Puede Visualizar**:
- Dashboard específico de servicio técnico
- Reclamos relacionados con servicio
- Estadísticas de tiempo de servicio
- Métricas de satisfacción de servicio
- Reportes de eficiencia operativa
- Análisis de tipos de reclamos de servicio

---

### 6. 🧑‍🔧 **Asesor de Servicio (asesor_servicio)**

**Descripción**: Personal operativo del área de servicio

**Facultades**:
- Gestión de reclamos asignados
- Actualización de estados de servicio
- Acceso a información de clientes y vehículos
- Registro de actividades de servicio
- Consulta de historial de servicios

**Puede Visualizar**:
- Dashboard operativo de servicio
- Reclamos asignados a su gestión
- Información de clientes y vehículos
- Historial de servicios
- Métricas básicas de productividad

---

### 7. 📞 **Contact Center (contact_center)**

**Descripción**: Agentes operativos de atención al cliente

**Facultades**:
- Creación y gestión de encuestas de satisfacción
- Registro y seguimiento de reclamos
- Acceso a información básica de clientes y vehículos
- Actualización de datos de contacto
- Gestión de formularios internos y externos

**Puede Visualizar**:
- Dashboard operativo básico
- Encuestas y reclamos asignados
- Información de clientes y vehículos
- Formularios de gestión
- Métricas básicas de productividad personal

---

### 8. 👤 **Cliente (cliente)**

**Descripción**: Clientes del concesionario sin acceso directo al sistema

**Facultades**:
- Respuesta a encuestas de satisfacción (vía enlaces externos)
- Interacción a través de canales externos (WhatsApp, email, etc.)

**Puede Visualizar**:
- **No tiene acceso directo al sistema interno**
- Solo formularios públicos y encuestas externas
- Comunicaciones dirigidas por el concesionario

---

### 9. 📈 **Jefe de Ventas (jefe_ventas)**

**Descripción**: Gestión del área de ventas

**Facultades**:
- Supervisión de operaciones de ventas
- Gestión y asignación de leads de ventas
- Acceso a métricas específicas de ventas
- Exportación de datos de ventas
- Configuración de procesos de ventas
- Gestión de equipos de ventas

**Puede Visualizar**:
- Dashboard específico de ventas
- Leads relacionados con ventas
- Estadísticas de tiempo de venta
- Métricas de satisfacción de ventas
- Reportes de eficiencia operativa
- Análisis de tipos de leads de ventas

---

### 10. 🧑‍💼 **Asesor de Ventas (asesor_ventas)**

**Descripción**: Personal operativo del área de ventas

**Facultades**:
- Gestión de leads asignados
- Actualización de estados de ventas
- Acceso a información de clientes y vehículos
- Registro de actividades de ventas
- Consulta de historial de ventas

**Puede Visualizar**:
- Dashboard operativo de ventas
- Leads asignados a su gestión
- Información de clientes y vehículos
- Historial de ventas
- Métricas básicas de productividad

---

### 11. 👨‍💼 **Staff (staff)**

**Descripción**: Personal general del concesionario

**Facultades**:
- Acceso a funcionalidades básicas del sistema
- Consulta de información operativa limitada
- Participación en procesos internos

**Puede Visualizar**:
- Dashboard básico con información limitada
- Datos operativos relevantes a su área
- Reportes básicos de su departamento

---

## Jerarquía de Roles

```
admin (Máximo acceso)
├── gerencia
│   ├── jefa_contact_center
│   │   └── contact_center
│   ├── jefe_servicio
│   │   └── asesor_servicio
│   ├── jefe_ventas
│   │   └── asesor_ventas
│   └── encargado_calidad
├── staff
└── cliente (Acceso mínimo)
```

## Sistema de Permisos

### Permisos de Exportación
- **Exportación Estándar**: gerencia, jefe_servicio, encargado_calidad, jefa_contact_center, jefe_ventas
- **Exportación Masiva**: gerencia, jefe_servicio (limitada por rendimiento)
- **Exportación de Encuestas**: Todos los roles excepto contact_center
- **Exportación de Reclamos**: Todos los roles de exportación

### Seguridad Multi-tenant
- Cada usuario pertenece a un concesionario específico
- Aislamiento estricto de datos entre concesionarios
- Configuración independiente por concesionario
- Branding personalizado por tenant

### Características de Seguridad
- **Herencia de Roles**: Los roles superiores heredan permisos de roles inferiores
- **Aislamiento de Tenant**: Separación estricta de datos entre concesionarios
- **Limitación de API**: Diferentes límites según el rol de usuario
- **Feature Flags**: Disponibilidad de características específicas por tenant
- **Auditoría**: Registro de acciones basado en roles

## Notas Importantes

1. **Control de Acceso**: Cada rol tiene acceso únicamente a las funcionalidades necesarias para su trabajo
2. **Escalabilidad**: El sistema permite agregar nuevos roles según las necesidades del negocio
3. **Flexibilidad**: Los permisos pueden ser ajustados a nivel de tenant para necesidades específicas
4. **Seguridad**: Implementación de múltiples capas de seguridad para proteger datos sensibles
5. **Auditoría**: Todas las acciones importantes son registradas para fines de auditoría y cumplimiento