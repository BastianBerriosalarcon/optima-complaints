#  Guías para Claude Code en el Proyecto Óptima-CX

## 1. Contexto General del Proyecto

**Nombre del Proyecto:** Óptima-CX

**Descripción:** Óptima-CX es una plataforma multitenant SaaS de experiencia al cliente diseñada para el sector automotriz. La plataforma integra cuatro módulos principales: **Gestión de Leads y Ventas**, **Encuestas de Ventas**, **Encuestas Post-Venta** y **Gestión de Reclamos con IA**, optimizando todo el ciclo de vida del cliente automotriz desde la prospección hasta el servicio post-venta.

**Arquitectura Actual:** La plataforma utiliza una arquitectura moderna basada en:
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Supabase Auth
- **Backend:** Supabase (PostgreSQL con RLS) + N8N workflows en Cloud Run
- **WhatsApp:** Chatwoot + Redis para gestión conversacional multitenant
- **Cloud:** Google Cloud Platform con infraestructura Terraform
- **IA:** Integración con Gemini para análisis de leads y procesamiento de reclamos

La plataforma maneja distintos roles de usuario con permisos y vistas de datos específicos:

* **Super Usuario:** Administra el sistema completo y puede ver todos los concesionarios (siempre separados por concesionario).
* **Roles por Concesionario:** Gerencia, Jefe de Servicio, Asesor de Servicio, Contact Center, Encargado de Calidad, Jefa de Contact Center, **Jefe de Ventas**, **Asesor de Ventas**, Staff. Estos roles solo acceden a la información de su concesionario y/o sucursal asignada.

Se busca automatizar la comunicación (correos, WhatsApp) y la gestión de datos (leads, encuestas, reclamos) utilizando N8N como motor de automatización, desplegado en Google Cloud Run. La integración y las automatizaciones deben ser totalmente aisladas y configurables por cada concesionario para proteger la privacidad de los datos, asegurar la consistencia de la marca y evitar la mezcla de datos sensibles como números de WhatsApp Business y correos electrónicos corporativos.

## 2. Principios y Prioridades Clave

* **Aislamiento Multitenant con Supabase RLS:** La máxima prioridad es garantizar la segregación total de datos y operaciones entre concesionarios. Utilizamos Row Level Security (RLS) en Supabase para asegurar que cada consulta esté automáticamente filtrada por `concesionario_id`.

* **Automatización Inteligente con IA:** Fomentar el uso de automatizaciones para reducir la carga de trabajo manual, mejorar la eficiencia en la respuesta al cliente y asegurar la consistencia. La IA (Gemini) se utiliza para análisis de leads y clasificación de reclamos.

* **Arquitectura Serverless-First:** Priorizar soluciones serverless (Supabase, Cloud Run, Edge Functions) para reducir costos operativos y mejorar escalabilidad automática.

* **Desarrollo Moderno:** Utilizar tecnologías modernas (Next.js, TypeScript, Tailwind) que permiten desarrollo rápido, mantenimiento sencillo y experiencia de usuario superior.

## 3. Módulos de la Plataforma

### 3.1. Módulo de Gestión de Leads y Ventas (Implementado)

#### **Funcionalidades Principales:**

**📱 Recepción y Análisis Automático de Leads:**
* **Canal Principal:** WhatsApp Business API → Chatwoot → N8N por concesionario
* **Gestión Conversacional:** Chatwoot maneja interfaz de chat con agentes humanos
* **Análisis IA:** Procesamiento automático de mensajes con Gemini para detectar:
  - Intención del cliente (compra, información, servicio, cotización)
  - Modelo de vehículo de interés
  - Urgencia y nivel de interés
  - Datos de contacto y preferencias
  (todo esto debe ser por concecionario, recordar multitenant)

**🎯 Scoring y Clasificación Automática:**
* **Score de Calidad:** Algoritmo que evalúa la probabilidad de conversión (1-100)
* **Clasificación por Tipo:**
  - Lead Caliente (score >70): Intención de compra inmediata
  - Lead Tibio (score 40-70): Interés confirmado, requiere seguimiento
  - Lead Frío (score <40): Información general, seguimiento a largo plazo

**👥 Asignación Inteligente de Asesores:**
* **Reglas de Asignación:** Basadas en especialidad, carga de trabajo y disponibilidad
* **Especialización:** Asesores especializados por marca/tipo de vehículo
* **Distribución Equitativa:** Algoritmo que balancea la carga entre asesores activos

**📊 Seguimiento del Ciclo de Ventas:**
* **Estados del Lead:** Nuevo → Contactado → Cotizado → Vendido/Perdido
* **Gestión de Cotizaciones:** Registro y seguimiento de ofertas realizadas
* **Métricas de Conversión:** Análisis de performance por asesor y canal
* **Historial Completo:** Trazabilidad de todas las interacciones

#### **Campos del Sistema de Leads:**

**Datos del Lead:**
* `telefono_cliente` - Número de WhatsApp origen (único por concesionario)
* `nombre_cliente` - Nombre extraído o proporcionado
* `email_cliente` - Email de contacto (opcional)
* `intencion_detectada` - Enum: compra, informacion, servicio, cotizacion
* `modelo_interes` - Vehículo/modelo de interés detectado
* `mensaje_original` - Texto original del mensaje WhatsApp
* `score_calidad` - Puntuación automática 1-100
* `nivel_interes` - Enum: alto, medio, bajo
* `asesor_asignado_id` - ForeignKey al asesor responsable
* `estado` - Enum: nuevo, contactado, cotizado, vendido, perdido
* `fecha_creacion` - Timestamp automático
* `concesionario_id` - Tenant ID para segregación multitenant

**Seguimiento y Métricas:**
* `fecha_primer_contacto` - Cuando el asesor contactó por primera vez
* `fecha_cotizacion` - Cuando se generó cotización formal
* `monto_cotizacion` - Valor de la cotización realizada
* `fecha_cierre` - Fecha de venta o pérdida del lead
* `motivo_perdida` - Razón si el lead no se convirtió
* `fuente_lead` - Siempre 'whatsapp' para este módulo

#### **Automatización N8N para Leads:**

**Flujo Automático:**
1. **Recepción:** Webhook recibe mensaje WhatsApp por concesionario
2. **Análisis IA:** Extracción de intención y datos con Gemini
3. **Scoring:** Cálculo automático de score de calidad
4. **Asignación:** Algoritmo asigna asesor óptimo
5. **Notificación:** Email/SMS al asesor asignado con resumen del lead
6. **Seguimiento:** Recordatorios automáticos para contacto y seguimiento

**Configuración por Concesionario:**
* WhatsApp Business tokens únicos por tenant
* Cuentas Chatwoot segregadas por concesionario
* Prompts personalizados para análisis IA
* Reglas de asignación específicas por concesionario
* Templates de notificación customizados
* Agentes Chatwoot con roles específicos

#### **Roles Específicos para el Módulo de Ventas:**

**🏢 Jefe de Ventas (jefe_ventas):**
* **Supervisión Operativa:** Gestión completa del equipo de asesores de ventas
* **Gestión de Leads:** Asignación inteligente y seguimiento de leads calientes
* **Métricas y Reportes:** Acceso a dashboard específico de ventas con KPIs
* **Configuración:** Parametrización de reglas de asignación y scoring
* **Exportación:** Datos de ventas y performance del equipo
* **Automatización:** Recibe notificaciones de leads de alta prioridad

**👨‍💼 Asesor de Ventas (asesor_ventas):**  
* **Gestión Individual:** Leads asignados automáticamente según especialidad
* **Seguimiento:** Actualización de estados (contactado, cotizado, vendido/perdido)
* **Información:** Acceso a datos de clientes, vehículos e historial
* **Dashboard:** Vista operativa con sus leads y métricas personales
* **Notificaciones:** Alertas inmediatas de nuevos leads asignados
* **Integración:** Conexión directa con workflows de encuestas de ventas

### 3.2. Módulo de Encuestas Post-Venta (Implementado)

**Objetivo Principal:** Recopilar feedback del cliente después del servicio automotriz mediante 3 canales automatizados, con automatización de alertas para casos de baja satisfacción.

#### **Estructura de Encuestas:**

**4 Preguntas Principales (Escala 1-10):**

  1. ¿Qué tan probable es que recomiende nuestro servicio?
    - Campo: recomendacion
    - Escala: 1-10
    - Propósito: Mide NPS (Net Promoter Score)
  2. ¿Cuál es su nivel de satisfacción general?
    - Campo: satisfaccion
    - Escala: 1-10
    - Propósito: Satisfacción general del servicio
  3. ¿Cómo califica el servicio de lavado?
    - Campo: lavado
    - Escala: 1-10
    - Propósito: Evalúa servicio específico de lavado
  4. ¿Cómo califica la atención del asesor?
    - Campo: asesor
    - Escala: 1-10
    - Propósito: Califica atención al cliente

  Pregunta Adicional:

  5. Comentarios adicionales
    - Campo: comentario
    - Tipo: Texto libre (opcional)
    - Propósito: Feedback cualitativo del cliente

  📊 Validaciones:

  - Campos requeridos cuando estado = 'completado': recomendación,
  satisfacción, lavado, asesor
  - Campo opcional: comentario
  - Escala: 1-10 para todas las preguntas numéricas

  🎯 Automatización por Puntaje:

  - Nota 9-10: Encuesta se registra normalmente
  - Nota 1-8: Dispara email automático a Jefe Servicio, Asesor
  Servicio y Encargado de Calidad

  LOS CANALES O FLUJO DE DE LAS ENCUESTAS ES EL SIGUIENTE: 
1.  **Canal 1 (Inmediato): Código QR**
    * **Registro por QR:** Se creará un código QR único por concesionario. Al ser escaneado por el cliente en el local, le permitirá responder una breve encuesta. Las respuestas deben registrarse instantáneamente en la base de datos asociadas a su `identificador de concesionario` y además de la sucursal a la cual pertenece la encuesta. 
    el QR debe contener las 4 preguntas, y ademas debe considerar el nombre, rut, numero de telefono 

* Si la nota es **9 a 10 (positiva)**, la encuesta simplemente se registra y va al dashboard.
la nota es de **1 a 8 (baja)**, el sistema debe disparar automáticamente un correo electrónico (vía n8no internamente) al **Jefe de Servicio, Asesor de Servicio y Responsable de Calidad** del mismo concesionario con el detalle de la encuesta para una acción inmediata.


2.  **Canal 2 (Seguimiento Automatizado): WhatsApp**
    * **Carga de Datos:** Al día siguiente, el Responsable de Contact Center o Encargado de Calidad cargará un archivo Excel con la lista completa de clientes atendidos el día anterior.
    * **Filtrado Inteligente:** El sistema **DEBE** verificar esta lista y **excluir automáticamente** a los clientes (usando su número de teléfono como clave) que ya contestaron la encuesta a través del Código QR.
    * **Envío Masivo de WhatsApp:** Inmediatamente después de la carga y el filtrado, el sistema (vía n8ny configurado por concesionario) enviará mensajes de WhatsApp con la encuesta a los clientes que **NO** la han contestado aún.
* Si la nota es **9 a 10 (positiva)**, la encuesta simplemente se registra y va al dashboard.
la nota es de **1 a 8 (baja)**, el sistema debe disparar automáticamente un correo electrónico (vía n8no internamente) al **Jefe de Servicio, Asesor de Servicio y Responsable de Calidad** del mismo concesionario con el detalle de la encuesta para una acción inmediata.
* **Período de Espera:** Se monitorea un período de 6 horas desde el envío del WhatsApp. 
el disparador de conversación se envía una sola ves, ya que si no contesta pasa al siguiente flujo, el cual es el siguiente:

3.  **Canal 3 (Seguimiento Manual): Llamada de Contact Center**
    * **Asignación Automática:** Transcurrido el período de espera, el sistema identificará a los clientes que aún no han contestado la encuesta (ni por QR ni por WhatsApp).
    * Estas encuestas pendientes deben ser **automáticamente asignadas de forma equitativa** a los usuarios de Contact Center creados del consecionario para que realicen un seguimiento por llamada.

#### Flujo Secundario (Casos de Baja Calificación por Llamada):

* **Registro por Llamada (Salida):** Cuando un ejecutivo de Contact Center realiza una encuesta por llamada y la nota es de **1 a 8 (baja)**, el sistema debe disparar automáticamente un correo electrónico (vía n8no internamente) al **Jefe de Servicio, Asesor de Servicio y Responsable de Calidad** del mismo concesionario con el detalle de la encuesta para una acción inmediata.
* Si la nota es **9 a 10 (positiva)**, la encuesta simplemente se registra y va al dashboard.

### 3.3. Módulo de Encuestas de Ventas (Nuevo)

**Objetivo Principal:** Medir la satisfacción del cliente inmediatamente después de la finalización del ciclo de venta (ya sea concretada o perdida) para obtener feedback sobre el proceso y el desempeño del asesor.

#### **Estructura de Encuestas de Ventas:**

**4 Preguntas Principales (Escala 1-10):**

  1. ¿Cómo calificaría su experiencia general durante el proceso de compra/cotización?
    - Campo: `experiencia_venta`
    - Escala: 1-10
    - Propósito: Mide la satisfacción general con el ciclo de venta.
  2. ¿Cuál es su nivel de satisfacción con la atención del asesor de ventas?
    - Campo: `satisfaccion_asesor_ventas`
    - Escala: 1-10
    - Propósito: Evalúa el desempeño del asesor de ventas.
  3. ¿La información sobre el vehículo y la cotización fue clara y transparente?
    - Campo: `claridad_informacion`
    - Escala: 1-10
    - Propósito: Evalúa la calidad de la información entregada.
  4. ¿Qué tan probable es que nos recomiende a un amigo o familiar para comprar un vehículo?
    - Campo: `recomendacion_venta`
    - Escala: 1-10
    - Propósito: Mide el NPS del proceso de ventas.

  **Pregunta Adicional:**

  5. ¿Tiene algún comentario adicional sobre su experiencia?
    - Campo: `comentario_venta`
    - Tipo: Texto libre (opcional)
    - Propósito: Recopilar feedback cualitativo detallado.

  **📊 Validaciones:**

  - Campos requeridos cuando estado = 'completado': `experiencia_venta`, `satisfaccion_asesor_ventas`, `claridad_informacion`, `recomendacion_venta`.
  - Campo opcional: `comentario_venta`.
  - Escala: 1-10 para todas las preguntas numéricas.

  **🎯 Automatización por Puntaje:**

  - **Nota 9-10:** La encuesta se registra y se asocia al lead correspondiente.
  - **Nota 1-8:** Dispara un email automático al **Jefe de Ventas** y al **Asesor de Ventas** asignado al lead, con el detalle de la encuesta para revisión y seguimiento.

#### **Flujo de Automatización Multicanal (N8N):**

El sistema orquesta un flujo inteligente y multicanal para maximizar la tasa de respuesta, priorizando el feedback inmediato y automatizando el seguimiento.

**Canal 1: Código QR (Feedback Inmediato en Entrega)**
1.  **Disparador:** Al momento de la entrega del vehículo, el cliente escanea un código QR único del concesionario.
2.  **Acción:** Se presenta una encuesta de satisfacción de venta optimizada para móviles.
3.  **Registro:** Las respuestas se guardan instantáneamente en la tabla `encuestas_ventas`, asociadas al `lead_id` (que debe ser buscado por RUT o teléfono), `asesor_asignado_id` y `concesionario_id`. El origen se registra como `QR_VENTA`.

**Canal 2: WhatsApp (Seguimiento Automático para Leads 'Vendido')**
1.  **Disparador:** El flujo se activa 24 horas después de que el `estado` de un lead cambia a **`Vendido`**.
2.  **Filtrado Inteligente:** El sistema **verifica si el cliente ya respondió** a través del QR. Si ya lo hizo, el flujo se detiene para este cliente.
3.  **Acción:** Si no hay respuesta previa, el sistema (vía N8N) envía automáticamente un mensaje de WhatsApp al `telefono_cliente` del lead con un enlace a la encuesta. El origen se registrará como `WHATSAPP_VENTA`.

**Canal 3: WhatsApp (Seguimiento para Leads 'Perdido')**
1.  **Disparador:** El flujo se activa cuando el `estado` de un lead cambia a **`Perdido`**.
2.  **Acción:** Se envía una encuesta adaptada para entender las razones de la pérdida, con preguntas como "¿Qué podríamos haber hecho mejor?" o "¿Cuál fue el principal motivo para no elegirnos?". El origen se registra como `WHATSAPP_PERDIDO`.

**Gestión de Respuestas y Alertas (Común a todos los canales):**
1.  **Recepción de Respuesta:** El cliente completa la encuesta. Las respuestas se guardan en la tabla `encuestas_ventas`.
2.  **Alerta por Baja Calificación:** Si cualquier pregunta principal recibe una nota de 1 a 8, el sistema ejecuta la automatización de alerta por correo electrónico al **Jefe de Ventas** y al **Asesor de Ventas**.
3.  **Actualización de Dashboard:** Los resultados actualizan en tiempo real los dashboards de métricas de ventas.

### 4.2. Gestión de Reclamos y Agente IA con n8n

**Canales de Recepción:** El sistema recibe reclamos desde múltiples canales integrados:

* **WhatsApp Business API + Chatwoot:** Gestión completa de conversaciones con WhatsApp Flows
* **Correo Electrónico:** Integración directa con N8N  
* **Formularios Web:** Via webhook/API desde sitio web del concesionario
* **Interface Chatwoot:** Para agentes humanos en casos complejos

Componente de Inteligencia Artificial con RAG (Integrado con n8n): n8nse conectará con servicios externos de PLN/IA (ej., Google Cloud Natural Language API, OpenAI GPT, Claude), pensando bien, como el proyecto esta en GCP y será con Gemini embedding 001 , idealmente será con Gemini 2.5 pro, implementando RAG (Retrieval Augmented Generation) para:


Procesamiento de lenguaje natural (PLN) Aumentado: El LLM recibirá tanto el reclamo original como el contexto recuperado de la base de conocimiento del concesionario para generar:
Extracción de datos clave: sucursal, tipo de reclamo, cliente ( patente, vin, marca de vehículo, modelo), descripción resumida, urgencia

Flujo del Proceso de Reclamos (con Agente IA RAG orquestado por n8n):

Cliente envía reclamo por su canal preferido (WhatsApp, Email, Formulario Web)
n8nrecibe el reclamo y extrae el tenant_id correspondiente basado en el canal/webhook específico
Generación de Embedding y Recuperación RAG:

n8ngenera un embedding vectorial del texto del reclamo
Consulta la Base de Datos Vectorial filtrada por tenant_id para recuperar fragmentos de documentos relevantes
Obtiene contexto específico del concesionario (políticas, procedimientos, casos similares)

n8nconstruye un prompt enriquecido que incluye:

Reclamo original del cliente
Contexto recuperado de la base de conocimiento específica del concesionario
Custom prompts configurados por el concesionario
Envía el prompt aumentado al servicio de IA externo (Google gemini 2.5 pro)
Respuesta IA Contextualizada:

El Agente IA devuelve información estructurada más precisa y contextualizada a n8n:
Datos extraídos (sucursal, tipo, urgencia, cliente)
Clasificación automática basada en las políticas específicas del concesionario: (esto que sea personalizable)
Sugerencias de resolución personalizadas
Referencias a documentos/procedimientos aplicables


n8nvalida los datos extraídos y enriquecidos, y los envía al backend de supabase vía API para su registro
supabase registra el reclamo enriquecido con la información contextual y lo asigna automáticamente al Jefe de Servicio y Asesor de la sucursal correspondiente (basado en la sucursal extraída por la IA y la lógica de asignación de supabase)
n8nenvía notificaciones automáticas y personalizadas por rol, utilizando el contexto recuperado para adaptar los mensajes:

- **Al cliente:** Confirmación de recepción con información específica y número de seguimiento, a través del mismo canal de origen si es posible.
- **Al Asesor de Servicio:** Notificación detallada con el reclamo completo, historial del cliente y sugerencias de resolución para que pueda iniciar la gestión.
- **Al Jefe de Servicio:** Notificación de supervisión con un resumen del reclamo, la clasificación de la IA y el asesor asignado, permitiéndole monitorear el caso.
- **Al Encargado de Calidad:** Notificación con foco en la clasificación, sentimiento del cliente y tipo de reclamo para análisis de tendencias y calidad.


Automatización de Provisión de Flujos de n8n:
Capacidad futura de automatizar la creación de flujos de n8npara reclamos (y encuestas) cuando se agregue un nuevo concesionario.
Inicialización Automática de Base de Conocimiento: Proceso automatizado para crear y configurar la base vectorial específica para nuevos concesionarios.
Esto se logrará utilizando la API de n8npara desplegar flujos "plantilla" con variables que se inyectarán con las configuraciones específicas de cada concesionario, incluyendo acceso a su base de conocimiento RAG.

#### Campos Requeridos para Reclamos:

**Campos obligatorios al ingresar un reclamo:**
* `cliente` - Cliente que presenta el reclamo (ForeignKey a usuarios.Cliente)
* `vehiculo` - Vehículo relacionado (ForeignKey a usuarios.Vehiculo)  
* `vin` - Número de chasis del vehículo (CharField único por concesionario)
* `sucursal` - Sucursal donde se presenta (ForeignKey a usuarios.Sucursal)
* `taller` - Taller responsable (ForeignKey a usuarios.Taller)
* `id_externo` - Identificador único del reclamo (CharField único por concesionario)
* `detalle` - Descripción detallada del problema (TextField)
* `black_alert` - Campo desplegable SI/NO para indicar si es Black Alert (BooleanField, default=False)

**Campos opcionales/automáticos:**
* `concesionario` - Asociado automáticamente al concesionario (multitenant)
* `tipo_reclamo` - Externo/Interno (default: 'Externo')
* `estado` - Pendiente/En Proceso/cerrado (default: 'Pendiente')
* `fecha_creacion` - Automática
* `fecha_actualizacion` - Automática

**Black Alert - Funcionalidad Especial:**
* **Definición:** Cliente que compra un vehículo y le falla dentro de los 6 meses, puede acogerse a ley del consumidor
* **Campo:** `black_alert` - Desplegable SI/NO
* **Automatización:** Si es SI, se envía automáticamente correo masivo a:
  - Encargado de Calidad
  - Jefe de Servicio  
  - Asesor de Servicio
  - Equipos de Venta y Postventa

#### Gestión Manual y Ciclo de Vida:
* **el reclamo puede caer por whatsapp** respuestas con RAG, ia, solicitando los datos correspondientes. 
* **Registro y Asignación por Sucursal:** Los usuarios de Contact Center también pueden ingresar reclamos manualmente en la plataforma. Inmediatamente, el sistema debe asignar automáticamente el reclamo tanto al **Asesor de Servicio** como al **Jefe de Servicio** que correspondan a la **sucursal** del cliente via mail.
* **Estados del Reclamo:** 
  - **Pendiente:** Estado inicial del reclamo
  - **En Proceso:** Reclamo siendo atendido/investigado
  - **Cerrado:** Estado final del reclamo (archivado)
* **Historial de Modificaciones (Auditoría):** La plataforma deberá registrar y mostrar un historial de todas las modificaciones realizadas en un reclamo. Será visible qué usuario ha cambiado el estado o la información y cuándo lo hizo.
* **Ciclo de Vida del Reclamo (Resolución):** El reclamo permanecerá en la bandeja de trabajo activa del Asesor y Jefe de Servicio hasta que su estado sea marcado como **"Resuelto"**. Una vez resuelto, se archivará y dejará de estar en la lista de casos pendientes de gestión.


## 5. Métricas y Dashboards
* **Segregación de Métricas:** Todos los dashboards y métricas (encuestas contestadas, reclamos por tipo/estado, etc.) deben ser filtrados por concesionario y solo mostrar datos relevantes para el rol del usuario logueado.
* **Origen de la Encuesta:** Es **CRUCIAL** que cada encuesta finalizada registre la fuente de su respuesta: **`QR`**, **`WhatsApp`** (resultado de la carga masiva), o **`Llamada`** (ejecutivo de Contact Center). Esto es fundamental para medir la eficiencia de cada canal.
* **Dashboard de Canales y Ejecutivos:** Debe existir un dashboard que muestre:
    * Total de encuestas contestadas por origen (QR vs. WhatsApp vs. Llamada).
    * Desglose de las encuestas por llamada, mostrando el rendimiento por cada ejecutivo de Contact Center.
    * Esto permitirá comparar cuántas respuestas provienen directamente de los clientes (canales automáticos) y cuántas requieren intervención manual.
* **Métricas de Reclamos:** Se deben crear dashboards para visualizar métricas de reclamos, tales como: número de reclamos por sucursal, por tipo, por estado, y tiempo promedio de resolución.
* **Optimización de Consultas:** Al generar código para dashboards, prioriza la eficiencia de las consultas a la base de datos para manejar grandes volúmenes de datos por concesionario de forma rápida.

## 4. Arquitectura Cloud Run y Despliegue en GCP

### 4.1. Arquitectura Actual Implementada

**Óptima-CX utiliza una arquitectura moderna basada en Supabase + Next.js + N8N + Chatwoot** que optimiza costos, escalabilidad y mantenimiento para un SaaS multi-tenant.

#### **Stack Tecnológico Actual:**

**🎯 Frontend (Implementado):**
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Radix UI** para componentes
- **Supabase Auth** para autenticación
- **React Hook Form** para formularios

**🔧 Backend (Implementado):**
- **Supabase PostgreSQL** con Row Level Security (RLS)
- **Supabase Realtime** para actualizaciones live
- **Supabase Edge Functions** para lógica serverless
- **N8N workflows** en Cloud Run para automatización

**☁️ Infraestructura (Implementado):**
- **Google Cloud Platform** como proveedor principal
- **Cloud Run** para servicios containerizados (Frontend + N8N + Chatwoot)
- **Cloud Memorystore (Redis)** para sessions de Chatwoot y cache
- **Terraform** para Infrastructure as Code
- **Secret Manager** para credenciales sensibles
- **Cloud Storage** para archivos y documentos

**💬 WhatsApp + Conversacional (Implementado):**
- **Chatwoot** para gestión de conversaciones multitenant
- **WhatsApp Business API** para mensajería
- **Redis** para gestión de sessions y cache
- **PostgreSQL** para historiales de conversación

#### **🏗️ Arquitectura de 3 Cloud Run Services**

**☁️ CLOUD RUN #1: optima-cx-frontend**
```
├── Next.js 14 + TypeScript
├── Supabase Auth + RLS 
├── Dashboard multitenant
├── APIs para comunicación con N8N/Chatwoot
└── URL: pendiente
```

**☁️ CLOUD RUN #2: n8n-optimacx-supabase**
```
├── N8N workflows engine
├── Multitenant workflow configuration
├── Integración con Gemini IA
├── Webhooks bidireccionales
├── RAG pipeline para reclamos
└── URL: pendiente
```

**☁️ CLOUD RUN #3: chatwoot-conversations** (NUEVO)
```
├── Chatwoot conversation management
├── WhatsApp Business API integration
├── Redis para sessions
├── PostgreSQL para chat history
├── Multitenant por subdominios
├── Agent interface por concesionario
└── URL: pendiente 
```

#### **¿Por qué esta es LA MEJOR opción para Óptima-CX?**

**🎯 Razones Técnicas Críticas:**

1. **Multi-tenancy Real Complejo:**
   ```
   Concesionario A:
   ├── WhatsApp: +56912345001 (Business API específica)
   ├── Chatwoot: account_a + subdomain a.chat.optimacx.com
   ├── Email SMTP: smtp.concesionario-a.com
   ├── IA Config: Gemini 2.5 pro específica + prompts personalizados
   └── BD Schema: tenant_a_* (datos completamente aislados)
   
   Concesionario B:  
   ├── WhatsApp: +56987654002 (Business API diferente)
   ├── Chatwoot: account_b + subdomain b.chat.optimacx.com
   ├── Email SMTP: smtp.concesionario-b.com
   ├── IA Config: Gemini 2.5 pro + prompts diferentes
   └── BD Schema: tenant_b_* (datos completamente aislados)
   ```

2. **Aislamiento de Integraciones Crítico:**
   - n8nseparado permite configuraciones completamente aisladas por tenant
   - Credenciales sensibles (WhatsApp tokens, SMTP) están encriptadas por tenant
   - Fallos en integraciones de un concesionario no afectan la aplicación principal
   - Cada tenant puede usar diferentes proveedores de IA o servicios

3. **Escalabilidad Independiente:**
   - Óptima-CX escala por usuarios concurrentes
   - n8n escala por volumen de automatizaciones
   - Un concesionario con alto volumen no afecta a otros

#### **💡 Flujo Multi-tenant Específico:**

```
1. Usuario de Concesionario A crea encuesta
   ↓
2. Óptima-CX → n8n-hub (tenant_id: "concesionario_a")
   ↓
3. n8ncarga config específica de Concesionario A:
   - WhatsApp API key A
   - SMTP config A
   - IA model config A
   ↓
4. n8nejecuta workflow con integraciones A
   ↓
5. n8n→ callback Óptima-CX con resultados
   ↓
6. Óptima-CX procesa y almacena datos específicos del Concesionario A
   ↓
7. Dashboard actualizado con métricas filtradas por tenant
```

**Aislamiento de Configuraciones por Concesionario sin Duplicación de Infraestructura:**

#### **Estructura de Configuración Multi-tenant:**
```
📊 TENANT_CONFIGURATIONS (tabla en n8nDB):
├── tenant_id: "concesionario_001"
├── whatsapp_config: 
│   ├── business_token: "EAAK...encrypted"
│   ├── phone_number_id: "123456789"
│   └── verify_token: "custom_webhook_token"
├── email_config:
│   ├── smtp_host: "smtp.concesionario001.com"
│   ├── smtp_credentials: "encrypted_user_pass"
│   └── from_email: "noreply@concesionario001.com"
├── ai_config:
│   ├── provider: "google" 
│   ├── api_key: "sk-...encrypted"
│   ├── model: "gemini-2.5-pro" 
│   ├── custom_prompts: {...}
│   └── rag_config:
│       ├── vector_index_id: "projects/.../vectorIndex123"
│       ├── embedding_model: "gemini-embedding-001"
│       ├── search_config: {"k": 5, "threshold": 0.7}
│       └── knowledge_base_version: "v1.2.3"
└── workflow_variables:
    ├── brand_colors: {"primary": "#...", "secondary": "#..."}
    ├── logo_url: "https://storage.googleapis.com/..."
    ├── custom_messages: {"welcome": "...", "followup": "..."}
    └── business_hours: {"start": "09:00", "end": "18:00"}
```
### 4.3. Comunicación Entre Services

#### **Flujo de Comunicación Multi-tenant con RAG:**
```
📱 Cliente Concesionario A → Load Balancer → optima-cx-saas
                                              ↓ (trigger automation)
                                         POST /webhook/trigger-complaint
                                         {tenant_id: "concesionario_a", complaint_text: "..."}
                                              ↓
                                         n8n-automation-hub
                                              ↓ (load tenant config A + RAG setup)
                                         1. Generate embedding (gemini-embedding-001)
                                         2. Query Supabase (pgvector) (tenant filtered)
                                         3. Retrieve relevant knowledge context
                                              ↓
                                         Gemini 2.5 Pro + RAG Context
                                         {original_complaint + retrieved_docs + custom_prompts}
                                              ↓ (enriched AI response)
                                         External Services (WhatsApp A + enriched response)
                                              ↓ (callback with contextual results)
                                         POST /api/webhooks/n8n-complaint-callback
                                         {tenant_id: "concesionario_a", enriched_data: "..."}
                                              ↓
                                         optima-cx-saas (update with contextual data)
```


#### **ROI y Justificación:**
* **Break-even:** Con 3-4 concesionarios activos
* **Escalabilidad:** Hasta 100+ concesionarios sin cambios arquitectónicos
* **Ahorro operacional:** 80% reducción en tiempo de configuración nuevos tenants

### 4.5. Versionado y CI/CD para n8nWorkflows

#### **Pipeline de Deployment:**
1. **Developer** modifica template workflow
2. **Git Push** → **Cloud Build** trigger
3. **Automated Testing** en ambiente staging
4. **Backup** de workflows activos en producción
5. **Deploy** de nuevos workflows via n8nAPI
6. **Validation** de workflows deployados
7. **Rollback automático** si falla validación

### 4.6. Monitoreo y Observabilidad Avanzada

#### **Métricas Clave por Service:**
**optima-cx-saas:**


**n8n-automation-hub:**

#### **Dashboards Especializados:**
* **Tenant Performance:** Métricas comparativas entre concesionarios
* **Automation Health:** Estado de integraciones por tenant
* **Cost Analysis:** Consumo de recursos y costos por concesionario
* **SLA Monitoring:** Cumplimiento de SLAs por tenant

#### **Alertas Críticas Configuradas:**
* **Cold Starts:** n8n-hub min-instances monitoring
* **Workflow Failures:** > 5% failure rate por tenant
* **API Rate Limits:** Aproximación a límites de WhatsApp/IA
* **Cross-Service Communication:** Latencia > 2s entre services

### 4.7. Seguridad y Compliance Multi-tenant

#### **Aislamiento de Datos Estricto:**
* **Tenant Filtering:** Filtros automáticos por tenant_id en todas las consultas
* **Credential Isolation:** Encriptación AES-256 de tokens por concesionario
* **Audit Logging:** Trazabilidad completa de operaciones con tenant context
* **API Security:** Rate limiting y authentication por tenant

#### **Seguridad de Red y Perímetro (Defensa en Profundidad):**
* **Comunicación Interna Segura:** Configurar un **VPC Connector** para los servicios de Cloud Run. Esto fuerza la comunicación entre servicios (SaaS ↔ n8n) y con Cloud SQL a través de la red privada de GCP, minimizando la exposición a la red pública.

#### **Seguridad de Aplicación y Cargas de Trabajo:**
* **Identidad Segura de Servicios:** Utilizar **Workload Identity** para asociar los servicios de Cloud Run con Cuentas de Servicio de IAM dedicadas. Esto elimina la necesidad de gestionar y rotar claves de servicio, ya que las credenciales se inyectan de forma segura y automática.
* **Análisis de Malware en Ingesta RAG:** Antes de procesar cualquier documento subido por un concesionario, escanearlo en busca de malware. Esto se puede lograr con una solución como ClamAV integrada en un servicio de Cloud Run que se active mediante un trigger de Cloud Storage.

#### **Migraciones y Compatibilidad:**
* **Zero-downtime deployment:** Blue-green deployment strategy
* **Database migrations:** Aplicadas automáticamente con rollback capability
* **Tenant onboarding:** Proceso automatizado de 10 minutos
* **Legacy support:** Compatibilidad con configuraciones existentes

## 5. Infraestructura como Código con Terraform

### 5.1. Estrategia de Despliegue con Terraform

**Óptima-CX utiliza Terraform para el manejo completo de la infraestructura en GCP**, garantizando reproducibilidad, versionado y gestión consistente de recursos cloud para el entorno multitenant.

#### **Estructura de Terraform Recomendada:**
* **Organización Modular:** Separación por ambientes (dev/staging/prod) con módulos reutilizables para Cloud Run, Cloud SQL, networking y security
* **Gestión de Estado:** Backend remoto en Google Cloud Storage con cifrado y versionado habilitado
* **Configuración por Tenant:** Variables dinámicas que permiten el onboarding automatizado de nuevos concesionarios

#### **Módulos Terraform Específicos para Óptima-CX:**

**Módulo Cloud Run:**
* Gestiona ambos servicios: optima-cx-saas y n8n-automation-hub
* Configuración de auto-scaling diferenciada por servicio
* Variables de ambiente específicas por tenant
* Etiquetado para monitoreo y facturación por concesionario


#### **Configuración por Ambiente:**
* **Desarrollo:** Recursos mínimos, instancias compartidas, backups de 7 días
* **Staging:** Configuración similar a producción con menor capacidad
* **Producción:** Alta disponibilidad, auto-scaling, backups extendidos, always-on para n8n

### 5.2. CI/CD con Terraform

#### **Pipeline de Infraestructura:**
* **Validación:** terraform fmt, validate y plan automáticos en cada PR
* **Despliegue:** terraform apply solo en merge a main branch
* **Rollback:** Capacidad de revertir cambios usando terraform state
* **Monitoreo:** Integración con Cloud Build para logs centralizados

#### **Gestión de Estado:**
* **Backend Seguro:** Google Cloud Storage con cifrado KMS
* **State Locking:** Prevención de modificaciones concurrentes
* **Versionado:** Historial completo de cambios de infraestructura
* **Backup:** Respaldos automatizados del estado de Terraform

### 5.3. Provisión Automatizada de Nuevos Tenants

#### **Onboarding de Concesionarios:**
* **Automatización Completa:** Script que crea base de datos, usuario, secrets y workflows n8n
* **Configuración Personalizada:** Variables específicas por concesionario (WhatsApp tokens, SMTP, IA)
* **Validación:** Tests automatizados post-provisión para verificar conectividad
* **Rollback:** Capacidad de deshacer onboarding en caso de errores

### 5.4. Mejores Prácticas Implementadas

#### **Seguridad:**
* Estado remoto cifrado con KMS
* Secrets nunca hardcodeados en archivos Terraform
* Service Account con permisos mínimos necesarios
* Network segura con VPC privada y Cloud NAT

#### **Operaciones:**
* Disaster recovery con scripts automatizados
* Monitoreo integrado con Cloud Monitoring
* Gestión de costos con etiquetado automático
* Cumplimiento con policies como código

## 6. Flujo de Trabajo y Herramientas

* **Entorno de Desarrollo:** Trabajamos en Cloud Shell con Claude Code en la terminal. Claude tiene acceso completo al sistema de archivos para inspeccionar código existente y entender el contexto antes de realizar cambios.

* **Stack de Desarrollo Actual:**
  - **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
  - **Base de Datos:** Supabase PostgreSQL con RLS
  - **Autenticación:** Supabase Auth con roles personalizados
  - **Automatización:** N8N workflows en Cloud Run
  - **Infraestructura:** Terraform + Google Cloud Platform
  - **IA:** Integración con Gemini para procesamiento inteligente

* **Estándares de Código:** Seguimos los principios SOLID implementados recientemente:
  - Archivos <150 líneas para mantener legibilidad
  - Funciones <30 líneas para comprensión inmediata
  - Una responsabilidad por componente/módulo
  - Inyección de dependencias con Context providers
  - Tipado TypeScript estricto en todo el código

* **Pruebas y Calidad:** **SIEMPRE** considerar la adición de pruebas para nueva funcionalidad. El código debe ser legible, seguir estándares SOLID y ser mantenible. Buscar oportunidades de refactorización sin introducir regresiones.

* **Modificación de Archivos:** Claude puede crear o modificar archivos directamente en el entorno de desarrollo, respetando la estructura modular actual del proyecto.

## 6.1. Políticas de Escalación y SLAs (Acuerdos de Nivel de Servicio)

Para garantizar la operatividad y la respuesta oportuna, el sistema implementa políticas de escalación automáticas gestionadas por los workflows en `utils/`.

**1. Escalación de Leads no Atendidos:**
*   **Regla:** Si un lead con `nivel_interes` **'alto'** no es contactado por el asesor asignado después de 2 recordatorios (aproximadamente 2 horas desde la asignación), el sistema escalará automáticamente el lead.
*   **Acción:** El workflow `utils/notificador-escalacion.json` enviará una notificación de **"Lead Crítico Sin Atención"** al `Jefe de Ventas` correspondiente, incluyendo los detalles del lead y el tiempo transcurrido.
*   **Objetivo:** Asegurar que los leads de mayor potencial reciban atención prioritaria y no se pierdan por falta de seguimiento.

**2. Escalación de Reclamos no Gestionados:**
*   **Regla:** Si un reclamo clasificado con `urgencia` **'alta'** permanece en estado **'Pendiente'** por más de 24 horas sin ninguna actualización o cambio de estado.
*   **Acción:** El workflow `utils/notificador-escalacion.json` enviará una notificación de **"Reclamo Urgente Estancado"** al `Jefe de Servicio` y con copia al `Encargado de Calidad`.
*   **Objetivo:** Garantizar que los reclamos más críticos sean atendidos dentro de un plazo razonable, mejorando la satisfacción del cliente.

**3. Manejo de Fallos en Workflows Críticos:**
*   **Regla:** Si un workflow crítico (ej. `procesador-rag-reclamos`, `procesador-whatsapp-leads`) falla 3 veces consecutivas para el mismo `tenant_id`.
*   **Acción:** El workflow `utils/manejador-errores.json` registrará el fallo crítico y enviará una alerta de **"Fallo Crítico de Sistema"** al rol `admin` (o a un canal de operaciones designado). La alerta incluirá el nombre del workflow, el tenant afectado y los logs de error para una intervención técnica inmediata.
*   **Objetivo:** Mantener la alta disponibilidad del sistema y detectar problemas de integración o configuración de forma proactiva.


#### **Mediana Prioridad:**
1. Dashboard de métricas avanzado
2. Testing y QA comprehensivo
3. Optimización de performance
4. Documentación técnica completa

## 7. Especificaciones Técnicas RAG para Agente de Reclamos

### 7.1. Arquitectura RAG Multi-tenant

#### **Base de Datos Vectorial:**
* **Tecnología:** Supabase (extensión pgvector)
* **Modelo de Embeddings:** gemini-embedding-001 (Google)
* **Segregación:** Filtros estrictos por tenant_id en todas las consultas
* **Dimensiones:** 
* **Índices:** Un índice por concesionario para máximo aislamiento

#### **Pipeline de Procesamiento de Documentos:**
```
📄 Documento Original → Chunking → Embedding → Vector Storage
├── Tipos soportados: PDF, Word, Excel, txt, markdown
├── Chunk size: 512 tokens con overlap de 50 tokens
├── Metadata: {tenant_id, doc_id, chunk_id, timestamp, version}
└── Storage: Cloud Storage + metadatos en Cloud SQL
```

#### **Estructura de Metadatos por Documento:**
```json
{
  "tenant_id": "concesionario_001",
  "document_id": "manual_garantias_v2.1",
  "title": "Manual de Garantías 2024",
  "category": "policies",
  "tags": ["garantia", "vehiculos", "procedimientos"],
  "version": "2.1.0",
  "upload_date": "2024-01-15T10:30:00Z",
  "last_updated": "2024-06-15T14:20:00Z",
  "source_file": "gs://optima-cx-docs/concesionario_001/garantias.pdf",
  "total_chunks": 47,
  "status": "active"
}
```

### 7.2. Flujo RAG Integrado con n8n

#### **Procesamiento de Reclamo con RAG (Pipeline Mejorado con Cohere):**
```
1. Cliente envía reclamo → n8n recibe webhook
2. n8n extrae tenant_id y preprocessa texto
3. Generación de embedding con gemini-embedding-001
4. **Recuperación (Retrieval):** Query a Supabase (pgvector) para obtener un grupo amplio de chunks relevantes (ej. top 20-50).
5. **Re-clasificación (Rerank):** Se envía la consulta original y los chunks recuperados a la API de **Cohere Rerank** para obtener los 3-5 resultados más relevantes.
6. **Construcción de Prompt Enriquecido:**
   - Reclamo original
   - **Contexto de alta precisión** (los 3-5 chunks re-clasificados por Cohere)
   - Custom prompts del concesionario
   - Instrucciones específicas
7. **Generación:** Envío a Gemini 2.5 Pro (o al LLM de Cohere) para la respuesta final.
8. Respuesta estructurada con clasificación y sugerencias
9. Callback a supabase con datos enriquecidos
```

#### **Prompt Engineering Específico:**
```
SISTEMA: Eres un especialista en atención al cliente del concesionario {tenant_name}.

CONTEXTO RECUPERADO:
{retrieved_knowledge}

RECLAMO CLIENTE:
{original_complaint}

INSTRUCCIONES:
- Clasifica el reclamo según las políticas específicas del concesionario
- Extrae: sucursal, tipo_reclamo, urgencia, vehiculo (patente/vin)
- Sugiere resolución basada en el contexto recuperado
- Mantén el tono profesional y empático característico de {tenant_name}

FORMATO DE RESPUESTA JSON:
{
  "clasificacion": "...",
  "urgencia": "alta|media|baja",
  "datos_extraidos": {...},
  "sugerencias_resolucion": [...],
  "referencias_politicas": [...]
}
```

### 7.3. Gestión de Conocimiento por Concesionario

#### **Portal de Administración de Conocimiento:**
* **Carga de Documentos:** Interface drag-and-drop para subir documentos
* **Gestión de Versiones:** Control de versiones automático con rollback
* **Categorización:** Tags y categorías personalizables por concesionario
* **Preview y Edición:** Vista previa de chunks generados con opción de edición
* **Métricas de Uso:** Estadísticas de qué documentos se usan más en RAG

#### **Tipos de Documentos Recomendados:**
* **Manuales de Procedimientos:** Protocolos de atención, escalación
* **Políticas de Garantía:** Términos, condiciones, excepciones
* **Catálogo de Productos:** Especificaciones técnicas, modelos, precios
* **FAQ Específicos:** Preguntas frecuentes del concesionario
* **Casos Resueltos:** Historial de resoluciones exitosas anonimizadas
* **Normativas:** Regulaciones específicas del país/región

### 7.4. Optimización y Monitoreo RAG

#### **Métricas de Calidad RAG:**
* **Precision@K:** Relevancia de documentos recuperados
* **Response Quality Score:** Evaluación de respuestas generadas
* **Knowledge Coverage:** Porcentaje de consultas con contexto útil
* **Latency P95:** Tiempo de respuesta del pipeline RAG completo
* **Cache Hit Rate:** Eficiencia de cache de embeddings

#### **Optimización de Latencia y Costos con Caching:**


#### **Mejora de Precisión con Cohere Rerank:**
* **Justificación:** Mientras que la búsqueda vectorial es eficiente para encontrar documentos semánticamente similares, no siempre garantiza la máxima relevancia contextual. El modelo **Cohere Rerank** está específicamente entrenado para tomar un conjunto de resultados de búsqueda y re-clasificarlos según su relevancia real para la consulta original.
* **Beneficios:**
    *   **Mayor Precisión:** Reduce el "ruido" y las "alucinaciones" al proporcionar al LLM final un contexto de mucha mayor calidad.
    *   **Mejor Experiencia:** Las respuestas generadas son más coherentes y útiles para el usuario.
    *   **Eficiencia:** Permite realizar una búsqueda inicial más amplia (ej. top 50) y luego refinarla a los mejores 3-5 resultados, mejorando la calidad sin sacrificar el rendimiento.

#### **n8nWorkflow para RAG:**
```json
{
  "nodes": [
    { "name": "Webhook Trigger" },
    { "name": "Extract Tenant Config" },
    { "name": "Generate Embedding (Gemini)" },
    { "name": "Vector Search (Supabase)" },
    { "name": "Rerank Documents (Cohere)" },
    { "name": "Build Enhanced Prompt" },
    { "name": "Generate Response (Gemini)" },
    { "name": "Callback to Supabase" }
  ]
}
```
### 7.6. Seguridad y Compliance RAG

#### **Aislamiento de Datos:**
* **Tenant Filtering:** Todos los queries incluyen filtro tenant_id obligatorio
* **Embedding Isolation:** Cache separado de embeddings por concesionario
* **Access Controls:** IAM roles específicos para acceso a documentos
* **Audit Trail:** Log completo de accesos y modificaciones

#### **Privacidad y Protección de Datos:**
* **Anonimización:** Removal automático de datos personales en ejemplos
* **Retención:** Políticas de retención configurable por tipo de documento
* **Encriptación:** Datos en reposo y en tránsito completamente encriptados
* **GDPR Compliance:** Derecho al olvido implementado a nivel de tenant