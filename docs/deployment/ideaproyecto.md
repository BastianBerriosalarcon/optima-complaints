# Guías para Claude Code en el Proyecto Óptima-CX

## 1. Contexto General del Proyecto

**Nombre del Proyecto:** Óptima-CX

**Descripción:** Óptima-CX es una plataforma multitenant SaaS de experiencia al cliente diseñada para el sector automotriz. La plataforma integra tres módulos principales: **Gestión de Leads y Ventas**, **Encuestas Post-Venta** y **Gestión de Reclamos con IA**, optimizando todo el ciclo de vida del cliente automotriz desde la prospección hasta el servicio post-venta.

**Arquitectura Actual:** La plataforma utiliza una arquitectura moderna basada en:
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Supabase Auth
- **Backend:** Supabase (PostgreSQL con RLS) + N8N workflows en Cloud Run
- **WhatsApp:** Chatwoot + Redis para gestión conversacional multitenant
- **Cloud:** Google Cloud Platform con infraestructura Terraform
- **IA:** Integración con Gemini para análisis de leads y procesamiento de reclamos

La plataforma maneja distintos roles de usuario con permisos y vistas de datos específicos:

* **Super Usuario:** Administra el sistema completo y puede ver todos los concesionarios (siempre separados por concesionario).
* **Roles por Concesionario:** Gerencia, Jefe de Servicio, Asesor de Servicio, Contact Center, Encargado de Calidad, Responsable de Contact Center, **Asesor de Ventas** (nuevo rol). Estos roles solo acceden a la información de su concesionario y/o sucursal asignada.

Se busca automatizar la comunicación (correos, WhatsApp) y la gestión de datos (leads, encuestas, reclamos) utilizando N8N como motor de automatización, desplegado en Google Cloud Run. La integración y las automatizaciones deben ser totalmente aisladas y configurables por cada concesionario para proteger la privacidad de los datos, asegurar la consistencia de la marca y evitar la mezcla de datos sensibles como números de WhatsApp Business y correos electrónicos corporativos.

## 2. Principios y Prioridades Clave

* **Aislamiento Multitenant:** La máxima prioridad es garantizar la segregación total de datos y operaciones entre concesionarios. Cualquier funcionalidad, desde el almacenamiento de datos hasta las automatizaciones de n8n, debe diseñarse para operar de forma independiente por cada concesionario.
* **Automatización Inteligente:** Fomentar el uso de automatizaciones para reducir la carga de trabajo manual, mejorar la eficiencia en la respuesta al cliente y asegurar la consisten# Guías para Claude Code en el Proyecto Óptima-CX

## 1. Contexto General del Proyecto

**Nombre del Proyecto:** Óptima-CX

**Descripción:** Óptima-CX es una plataforma multitenant de experiencia al cliente diseñada para el sector automotriz. Su objetivo principal es optimizar la recopilación y gestión de encuestas, reclamos y la comunicación con el cliente, con un enfoque fuerte en la automatización personalizada por cada concesionario.

La plataforma maneja distintos roles de usuario con permisos y vistas de datos específicos:

* **Super Usuario:** Administra el sistema completo y puede ver todos los concesionarios (siempre separados por concesionario).
* **Roles por Concesionario:** Gerencia, Jefe de Servicio, Asesor de Servicio, Contact Center, Encargado de Calidad, Responsable de Contact Center. Estos roles solo acceden a la información de su concesionario y/o sucursal asignada.

## 3. Módulos de la Plataforma

### 3.1. Módulo de Gestión de Leads y Ventas (Implementado)

**Objetivo Principal:** Optimizar la captación, análisis y seguimiento de leads automotrices mediante automatización con IA, desde la recepción inicial hasta la conversión en venta.

#### **Funcionalidades Principales:**

**📱 Recepción y Análisis Automático de Leads:**
* **Canal Principal:** WhatsApp Business API → Chatwoot → N8N por concesionario
* **Gestión Conversacional:** Chatwoot maneja interfaz de chat con agentes humanos
* **Análisis IA:** Procesamiento automático de mensajes con Gemini para detectar:
  - Intención del cliente (compra, información, servicio, cotización)
  - Modelo de vehículo de interés
  - Urgencia y nivel de interés
  - Datos de contacto y preferencias

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

## 2. Principios y Prioridades Clave

* **Aislamiento Multitenant con Supabase RLS:** La máxima prioridad es garantizar la segregación total de datos y operaciones entre concesionarios. Utilizamos Row Level Security (RLS) en Supabase para asegurar que cada consulta esté automáticamente filtrada por `concesionario_id`.

* **Automatización Inteligente con IA:** Fomentar el uso de automatizaciones para reducir la carga de trabajo manual, mejorar la eficiencia en la respuesta al cliente y asegurar la consistencia. La IA (Gemini) se utiliza para análisis de leads y clasificación de reclamos.

* **Arquitectura Serverless-First:** Priorizar soluciones serverless (Supabase, Cloud Run, Edge Functions) para reducir costos operativos y mejorar escalabilidad automática.

* **Desarrollo Moderno:** Utilizar tecnologías modernas (Next.js, TypeScript, Tailwind) que permiten desarrollo rápido, mantenimiento sencillo y experiencia de usuario superior.

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

### 4.2. Gestión de Reclamos y Agente IA con n8n

4.2. Gestión de Reclamos y Agente IA con n8n
Objetivo Principal de la Funcionalidad de Reclamos:

Optimizar la recepción, procesamiento y asignación de reclamos mediante la automatización orquestada por n8n.
Mejorar la experiencia del cliente y la eficiencia operativa a través de la implementación de un Agente IA que procesa reclamos automáticamente utilizando RAG (Retrieval Augmented Generation) para contextualización inteligente basada en el conocimiento específico de cada concesionario.

**Canales de Recepción:** El sistema recibe reclamos desde múltiples canales integrados:

* **WhatsApp Business API + Chatwoot:** Gestión completa de conversaciones con WhatsApp Flows
* **Correo Electrónico:** Integración directa con N8N  
* **Formularios Web:** Via webhook/API desde sitio web del concesionario
* **Interface Chatwoot:** Para agentes humanos en casos complejos

Componente de Inteligencia Artificial con RAG (Integrado con n8n): n8nse conectará con servicios externos de PLN/IA (ej., Google Cloud Natural Language API, OpenAI GPT, Claude), pensando bien, como el proyecto esta en GCP y será con Gemini embedding 001 , idealmente será con Gemini 2.5 pro, implementando RAG (Retrieval Augmented Generation) para:

Base de Conocimiento Personalizada: Cada concesionario tendrá su propia base de conocimiento documental almacenada en una Base de Datos Vectorial (Vertex AI Vector Search o Cloud SQL PostgreSQL con pgvector), completamente segregada por tenant_id.
Recuperación Contextual Inteligente: Antes del procesamiento PLN, el sistema generará embeddings (Gemini embedding 001) del reclamo y consultará la base vectorial específica del concesionario para recuperar información relevante (políticas, procedimientos, productos, servicios específicos, etc).
Procesamiento de lenguaje natural (PLN) Aumentado: El LLM recibirá tanto el reclamo original como el contexto recuperado de la base de conocimiento del concesionario para generar:
Extracción de datos clave: sucursal, tipo de reclamo, cliente ( patente, vin, marca de vehículo, modelo), descripción resumida, urgencia
Clasificación automática del reclamo contextualizada según las políticas específicas del concesionario
Sugerencias de resolución basadas en casos similares previos y procedimientos documentados

Base de Conocimiento RAG Multitenant:
Almacenamiento Vectorial: Base de Datos Vectorial con embeddings (Gemini-embedding 001, ya que al parecer es integrado de gcp) de documentos específicos por concesionario (manuales de procedimientos, políticas de garantía, catálogos de productos, FAQ, casos resueltos históricos).
Segregación por Tenant: Todos los embeddings y documentos están estrictamente filtrados por tenant_id, garantizando que un concesionario nunca acceda a información de otro.
Ingesta Documental: Proceso automatizado para que cada concesionario pueda cargar y actualizar su base de conocimiento personalizada.
Versionado de Conocimiento: Control de versiones de documentos para mantener consistencia y trazabilidad.
también idealmente se debe poder modificar la información, por si llega algún nuevo modelo o se actualiza alguna política de la empresa

Backend Principal: Django, responsable del registro, asignación lógica (a Jefe de Servicio y Asesor de la sucursal correspondiente), seguimiento del ciclo de vida y almacenamiento de los reclamos.
Interacción n8n-Django: n8nutilizará APIs y Webhooks para la comunicación bidireccional con el backend de Django para el intercambio de datos y actualizaciones de estado.

Flujo del Proceso de Reclamos (con Agente IA RAG orquestado por n8n):

Cliente envía reclamo por su canal preferido (WhatsApp, Email, Formulario Web)
n8nrecibe el reclamo y extrae el tenant_id correspondiente basado en el canal/webhook específico
Generación de Embedding y Recuperación RAG:

n8ngenera un embedding vectorial del texto del reclamo
Consulta la Base de Datos Vectorial filtrada por tenant_id para recuperar fragmentos de documentos relevantes
Obtiene contexto específico del concesionario (políticas, procedimientos, casos similares)


Procesamiento IA Aumentado:
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


n8nvalida los datos extraídos y enriquecidos, y los envía al backend de Django vía API para su registro
Django registra el reclamo enriquecido con la información contextual y lo asigna automáticamente al Jefe de Servicio y Asesor de la sucursal correspondiente (basado en la sucursal extraída por la IA y la lógica de asignación de Django)
n8nenvía notificaciones automáticas y personalizadas utilizando el contexto recuperado para personalizar los mensajes:

Al cliente: Confirmación de recepción con información específica y número de seguimiento, a través del mismo canal de origen si es posible
A los responsables: Asesor y Jefe de Servicio, y con copia a encargado de calidad, con los detalles del reclamo enriquecidos, sugerencias de resolución contextualizadas y un enlace directo a la plataforma para su gestión


Consideraciones Clave y Estrategia de Implementación de n8ncon RAG:
Aislamiento multitenant CRÍTICO:
Cada flujo de n8ny las configuraciones específicas de cada concesionario (incluyendo credenciales de WhatsApp, correos, configuración del servicio de IA Y acceso a la base de conocimiento RAG) deben ser completamente aisladas y configurables.
Segregación Estricta de Base de Conocimiento: Los embeddings y documentos en la base vectorial están completamente segregados por tenant_id, garantizando zero-cross-contamination entre concesionarios.


Automatización de Provisión de Flujos de n8n:
Capacidad futura de automatizar la creación de flujos de n8npara reclamos (y encuestas) cuando se agregue un nuevo concesionario.
Inicialización Automática de Base de Conocimiento: Proceso automatizado para crear y configurar la base vectorial específica para nuevos concesionarios.
Esto se logrará utilizando la API de n8npara desplegar flujos "plantilla" con variables que se inyectarán con las configuraciones específicas de cada concesionario, incluyendo acceso a su base de conocimiento RAG.


Ingesta y Mantenimiento de Conocimiento por Concesionario:
Portal de Carga Documental: Interface para que cada concesionario pueda cargar, actualizar y gestionar sus documentos de conocimiento (manuales, políticas, FAQ, etc.).
Procesamiento Automático: Pipeline automatizado para convertir documentos cargados en embeddings y almacenarlos en la base vectorial con el tenant_id correspondiente.
Calidad de Conocimiento: Validación automática de documentos para asegurar calidad y relevancia de la base de conocimiento.


Ventajas del Agente IA con RAG y n8n:
Precisión Contextual Mejorada: Clasificación y procesamiento de reclamos mucho más preciso basado en el conocimiento específico de cada concesionario
Consistencia de Marca: Respuestas y procedimientos alineados con las políticas y estilo específico de cada concesionario
Eficiencia y mejora de la experiencia del cliente: Resoluciones más directas y menos frustrantes basadas en conocimiento específico
Reducción de la carga de trabajo manual: Personal puede enfocarse en casos complejos mientras la IA maneja casos rutinarios con alta precisión
Escalabilidad del procesamiento: n8npermite manejar volúmenes crecientes de reclamos manteniendo calidad contextual


Monitoreo y Optimización de RAG:

Métricas de Calidad: Tracking de precisión de clasificaciones, relevancia de contexto recuperado, y satisfacción de resoluciones sugeridas
Feedback Loop: Sistema para que los usuarios puedan mejorar la base de conocimiento basado en casos mal clasificados o resueltos
Optimización Continua: Análisis de patrones para identificar gaps en la base de conocimiento y oportunidades de mejora por concesionario

#### Consideraciones Clave y Estrategia de Implementación de n8n:

* **Aislamiento Multitenant:** Cada flujo de n8ny las configuraciones específicas de cada concesionario (incluyendo credenciales de WhatsApp, correos y configuración del servicio de IA) deben ser completamente aisladas y configurables.

* **Automatización de Provisión de Flujos de n8n:** Capacidad futura de automatizar la creación de flujos de n8npara reclamos (y encuestas) cuando se agregue un nuevo concesionario. Esto se logrará utilizando la API de n8npara desplegar flujos "plantilla" con variables que se inyectarán con las configuraciones específicas de cada concesionario.

* **Ventajas del Agente IA con n8n:** 
  * Eficiencia y mejora de la experiencia del cliente (más directa y menos frustrante que un chatbot conversacional)
  * Reducción de la carga de trabajo manual para el personal
  * Escalabilidad del procesamiento de reclamos que n8npermite al integrar los servicios de IA

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

## 5. Arquitectura Cloud Run y Despliegue en GCP

### 5.1. Arquitectura Actual Implementada

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

**☁️ CLOUD RUN #2: n8n-automation-hub**
```
├── N8N workflows engine
├── Multitenant workflow configuration
├── Integración con Gemini IA
├── Webhooks bidireccionales
├── RAG pipeline para reclamos
└── URL: https://workflows.optimacx.com
```

**☁️ CLOUD RUN #3: chatwoot-conversations** (NUEVO)
```
├── Chatwoot conversation management
├── WhatsApp Business API integration
├── Redis para sessions
├── PostgreSQL para chat history
├── Multitenant por subdominios
├── Agent interface por concesionario
└── URL: https://chat.optimacx.com
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
   - n8nescala por volumen de automatizaciones
   - Un concesionario con alto volumen no afecta a otros

#### **🔧 Arquitectura Específica Definitiva:**

**☁️ CLOUD RUN #1: optima-cx-saas**
```
├── Django + Next.js
├── Multi-tenant por subdominios
├── Cloud SQL PostgreSQL (con schemas por tenant)
├── Redis cache compartido
└── APIs para comunicación con n8n
```

**☁️ GKE autoescale #2: activepieces-automation-hub** (TODO INTEGRADO)
```
├── n8nservice (núcleo de automatización)
├── Cloud SQL PostgreSQL (workflows y configs)
├── Configuraciones por concesionario:
│   ├── Variables ambiente por tenant
│   ├── Credenciales encriptadas por tenant
│   ├── Workflows personalizados por tenant
│   └── Endpoints webhook únicos por tenant
├── APIs para recibir triggers desde Óptima-CX
├── Integración RAG Completa:
│   ├── Gemini embedding 001 para vectorización
│   ├── Gemini 2.5 Pro para procesamiento IA aumentado
│   ├── Vertex AI Vector Search (base de conocimiento)
│   ├── API para gestión de conocimiento por tenant
│   ├── Procesamiento de documentos y embeddings
│   ├── APIs de búsqueda semántica por tenant
│   └── Gestión de versiones de conocimiento
└── Middleware de aislamiento multi-tenant
```

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

#### **Cloud Run Service #1: optima-cx-saas**
* **Responsabilidad:** Aplicación principal SaaS
* **Componentes:** 
  * Django Backend (API REST, autenticación, lógica de negocio)
  * Next.js Frontend (interfaz de usuario, dashboards)
* **Recursos:** 2-4 GB RAM, 1-2 vCPU, auto-scaling 0-50 instancias
* **Base de Datos:** Cloud SQL PostgreSQL con schemas multi-tenant
* **Cache:** Cloud Memorystore (Redis) compartido
* **URL:** `https://optima-cx-saas.run.app`

#### **GKE autoescale: n8n-automation-hub** (TODO INTEGRADO)
* **Responsabilidad:** Motor de automatización completo + RAG + gestión de conocimiento
* **Componentes:**
  * n8nservice (workflows, automatizaciones)
  * Integraciones WhatsApp Business API por concesionario
  * Servicios de IA/PLN externos (Gemini 2.5 Pro, Gemini embedding 001)
  * Sistema RAG completo (Vertex AI Vector Search)
  * API REST para CRUD de documentos por tenant
  * Pipeline de procesamiento de documentos (PDF, Word, Excel)
  * Generación de embeddings con Gemini embedding 001
  * Gestión de versiones de conocimiento
  * APIs de búsqueda semántica avanzada
  * Gestión de notificaciones y callbacks personalizados
  * Middleware de aislamiento multi-tenant
* **Recursos:** 8-16 GB RAM, 4-6 vCPU, auto-scaling 1-20 instancias
* **Base de Datos:** Cloud SQL PostgreSQL separada para workflows + metadatos RAG
* **Vector DB:** Vertex AI Vector Search (segregado por tenant_id)
* **Storage:** Cloud Storage para documentos originales
* **Configuración:** Min-instances: 1 (evitar cold starts críticos)
* **URL:** pendiente

### 6.2. Multi-tenancy Centralizado en n8n-automation-hub

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
│   ├── provider: "google" | "openai" | "anthropic"
│   ├── api_key: "sk-...encrypted"
│   ├── model: "gemini-2.5-pro" | "gpt-4" | "claude-3-sonnet"
│   ├── custom_prompts: {...}
│   └── rag_config:
│       ├── vector_index_id: "projects/.../vectorIndex123"
│       ├── embedding_model: "text-embedding-004"
│       ├── search_config: {"k": 5, "threshold": 0.7}
│       └── knowledge_base_version: "v1.2.3"
└── workflow_variables:
    ├── brand_colors: {"primary": "#...", "secondary": "#..."}
    ├── logo_url: "https://storage.googleapis.com/..."
    ├── custom_messages: {"welcome": "...", "followup": "..."}
    └── business_hours: {"start": "09:00", "end": "18:00"}
```

#### **Ventajas del Multi-tenancy Centralizado con RAG:**
* **Costo-Eficiencia:** Una instancia n8n+ RAG maneja todos los concesionarios vs. 20+ instancias separadas
* **Mantenimiento Simplificado:** Un solo deployment para updates, bug fixes y nuevas features
* **Monitoreo Centralizado:** Dashboard unificado para todas las automatizaciones con filtros por tenant
* **Escalabilidad Inteligente:** Auto-scaling basado en carga agregada, no por tenant individual
* **Seguridad Mejorada:** Credenciales encriptadas y aisladas por tenant en base centralizada
* **RAG Optimizado:** Base de conocimiento segregada por tenant con embeddings compartiendo infraestructura
* **Consistency IA:** Modelos y configuraciones centralizadas con personalización por concesionario

### 6.3. Comunicación Entre Services

#### **Flujo de Comunicación Multi-tenant con RAG:**
```
📱 Cliente Concesionario A → Load Balancer → optima-cx-saas
                                              ↓ (trigger automation)
                                         POST /webhook/trigger-complaint
                                         {tenant_id: "concesionario_a", complaint_text: "..."}
                                              ↓
                                         n8n-automation-hub
                                              ↓ (load tenant config A + RAG setup)
                                         1. Generate embedding (text-embedding-004)
                                         2. Query Vertex AI Vector Search (tenant filtered)
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

#### **Endpoints de Integración:**
* **optima-cx-saas → n8n-hub:**
  * `POST /webhook/trigger-survey/{tenant_id}`
  * `POST /webhook/trigger-complaint/{tenant_id}`
  * `POST /webhook/trigger-notification/{tenant_id}`
* **n8n-hub → optima-cx-saas:**
  * `POST /api/webhooks/n8n-survey-callback`
  * `POST /api/webhooks/n8n-complaint-callback` (con datos enriquecidos RAG)
  * `POST /api/webhooks/n8n-notification-status`
* **optima-cx-saas → rag-service (si separado):**
  * `POST /api/knowledge/upload/{tenant_id}` (cargar documentos)
  * `GET /api/knowledge/search/{tenant_id}` (búsqueda semántica)
  * `PUT /api/knowledge/update/{tenant_id}/{doc_id}` (actualizar conocimiento)
* **Autenticación:** Service-to-service JWT tokens con scope por tenant
* **Retry Logic:** Exponential backoff para fallos de comunicación
* **Idempotencia:** Headers de request ID para evitar duplicación
* **RAG Specific:** Cache de embeddings y rate limiting para APIs de IA

### 6.4. Análisis Económico vs. Alternativas

#### **Comparación de Costos para 20 Concesionarios (Arquitectura Definitiva):**

| Arquitectura | Costo Mensual | Complejidad Operativa | Escalabilidad |
|-------------|---------------|----------------------|---------------|
| **2 Services Integrados (DEFINITIVA)** | $1,000-1,500 | ✅ Muy Baja | ✅ Excelente |
| **Cloud Run por Concesionario + RAG** | $6,000-9,000 | ❌ Muy Alta | ❌ Lineal costosa |
| **Instancia Única Monolítica + RAG** | $1,000-1,400 | ⚠️ Media | ⚠️ Limitada |

#### **Detalle de Costos Arquitectura Definitiva:**
* **optima-cx-saas:** $300-500/mes (aplicación principal)
* **n8n-automation-hub + RAG integrado:** $400-600/mes (todo en uno)
* **Cloud SQL** (2 instancias): $200-400/mes
* **Vertex AI Vector Search:** $150-300/mes (embeddings + queries)
* **Cloud Storage** (documentos): $50-100/mes
* **Cloud Memorystore:** $50-100/mes
* **Servicios IA externos:** $200-500/mes (Gemini 2.5 Pro + embeddings)
* **Total:** $1,000-1,500/mes para 20 concesionarios

#### **Ahorro vs Arquitectura Anterior:**
* **Reducción de costos:** $200-800/mes (eliminación Cloud Run #3)
* **Menor latencia:** Comunicación interna directa
* **Simplificación operativa:** Un solo servicio para n8n+ RAG

#### **ROI y Justificación:**
* **Break-even:** Con 3-4 concesionarios activos
* **Escalabilidad:** Hasta 100+ concesionarios sin cambios arquitectónicos
* **Ahorro operacional:** 80% reducción en tiempo de configuración nuevos tenants

### 6.5. Versionado y CI/CD para n8nWorkflows

#### **Estrategia de Control de Versiones:**
```
📁 GIT REPOSITORY: n8n-workflows-repo
├── workflows/
│   ├── templates/
│   │   ├── survey-flow-template.json
│   │   ├── complaint-flow-template.json
│   │   └── notification-flow-template.json
│   └── active/
│       ├── concesionario_001/
│       ├── concesionario_002/
│       └── ...
├── scripts/
│   ├── deploy-workflow.sh
│   ├── backup-active-flows.sh
│   └── rollback-workflow.sh
└── ci-cd/
    ├── cloudbuild.yaml
    └── deploy-pipeline.yaml
```

#### **Pipeline de Deployment:**
1. **Developer** modifica template workflow
2. **Git Push** → **Cloud Build** trigger
3. **Automated Testing** en ambiente staging
4. **Backup** de workflows activos en producción
5. **Deploy** de nuevos workflows via n8nAPI
6. **Validation** de workflows deployados
7. **Rollback automático** si falla validación

#### **Automatización de Provisión para Nuevos Concesionarios:**
* **API n8n:** Creación automatizada de flujos personalizados
* **Template Injection:** Variables específicas por tenant
* **Auto-configuration:** Setup de credenciales y webhooks únicos
* **Testing automatizado:** Validación de flujos antes de activación

### 6.6. Monitoreo y Observabilidad Avanzada

#### **Métricas Clave por Service:**
**optima-cx-saas:**
* Response time promedio por tenant
* Error rate por endpoint y tenant
* Concurrent users por concesionario
* Database query performance por tenant

**n8n-automation-hub:**
* Workflow execution time por tipo y tenant
* Success/failure rate de automatizaciones
* API rate limiting por tenant (WhatsApp, IA)
* Queue depth para workflows pendientes

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

### 6.7. Seguridad y Compliance Multi-tenant

#### **Aislamiento de Datos Estricto:**
* **Tenant Filtering:** Filtros automáticos por tenant_id en todas las consultas
* **Credential Isolation:** Encriptación AES-256 de tokens por concesionario
* **Audit Logging:** Trazabilidad completa de operaciones con tenant context
* **API Security:** Rate limiting y authentication por tenant

#### **Seguridad de Red y Perímetro (Defensa en Profundidad):**
* **Comunicación Interna Segura:** Configurar un **VPC Connector** para los servicios de Cloud Run. Esto fuerza la comunicación entre servicios (SaaS ↔ n8n) y con Cloud SQL a través de la red privada de GCP, minimizando la exposición a la red pública.
* **Control de Exfiltración de Datos:** Implementar **VPC Service Controls** para crear un perímetro de seguridad que restrinja el movimiento de datos. Esto previene que un atacante o una mala configuración pueda enviar datos sensibles de los tenants a destinos no autorizados en internet.
* **Protección de Endpoints Públicos:** Utilizar **Google Cloud Armor** frente al Load Balancer para obtener protección avanzada contra DDoS y un Web Application Firewall (WAF) que mitigue ataques comunes como Inyección SQL y XSS.

#### **Seguridad de Aplicación y Cargas de Trabajo:**
* **Identidad Segura de Servicios:** Utilizar **Workload Identity** para asociar los servicios de Cloud Run con Cuentas de Servicio de IAM dedicadas. Esto elimina la necesidad de gestionar y rotar claves de servicio, ya que las credenciales se inyectan de forma segura y automática.
* **Análisis de Malware en Ingesta RAG:** Antes de procesar cualquier documento subido por un concesionario, escanearlo en busca de malware. Esto se puede lograr con una solución como ClamAV integrada en un servicio de Cloud Run que se active mediante un trigger de Cloud Storage.

#### **Backup y Disaster Recovery:**
* **Datos por Tenant:** Backup granular con posibilidad de restore individual
* **Workflow Versioning:** Historial completo de cambios por tenant
* **Cross-Region Backup:** Réplicas en múltiples regiones GCP
* **RTO Target:** < 15 minutos para restauración completa
* **RPO Target:** < 5 minutos de pérdida de datos máxima

### 6.8. Consideraciones de Implementación

#### **Orden de Deployment Recomendado:**
1. **Fase 1:** Containerización y Cloud SQL setup
2. **Fase 2:** Deploy optima-cx-saas en Cloud Run
3. **Fase 3:** Deploy n8n-automation-hub con configuración básica
4. **Fase 4:** Implementación de comunicación entre services
5. **Fase 5:** Migración de tenants existentes
6. **Fase 6:** Monitoreo avanzado y optimización

#### **Migraciones y Compatibilidad:**
* **Zero-downtime deployment:** Blue-green deployment strategy
* **Database migrations:** Aplicadas automáticamente con rollback capability
* **Tenant onboarding:** Proceso automatizado de 10 minutos
* **Legacy support:** Compatibilidad con configuraciones existentes

## 7. Infraestructura como Código con Terraform

### 7.1. Estrategia de Despliegue con Terraform

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

**Módulo Cloud SQL:**
* Instancia principal multitenant para optima-cx-saas
* Instancia separada para workflows de n8n
* Configuración de backups automáticos con retención de 30 días
* Bases de datos dinámicas por tenant con usuarios dedicados

**Módulo Security:**
* Service Accounts con principio de menor privilegio
* Secret Manager para credenciales por tenant
* IAM bindings específicos por servicio
* Rotación automática de claves cada 90 días

#### **Configuración por Ambiente:**
* **Desarrollo:** Recursos mínimos, instancias compartidas, backups de 7 días
* **Staging:** Configuración similar a producción con menor capacidad
* **Producción:** Alta disponibilidad, auto-scaling, backups extendidos, always-on para n8n

### 7.2. CI/CD con Terraform

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

### 7.3. Provisión Automatizada de Nuevos Tenants

#### **Onboarding de Concesionarios:**
* **Automatización Completa:** Script que crea base de datos, usuario, secrets y workflows n8n
* **Configuración Personalizada:** Variables específicas por concesionario (WhatsApp tokens, SMTP, IA)
* **Validación:** Tests automatizados post-provisión para verificar conectividad
* **Rollback:** Capacidad de deshacer onboarding en caso de errores

### 7.4. Mejores Prácticas Implementadas

#### **Seguridad:**
* Estado remoto cifrado con KMS
* Secrets nunca hardcodeados en archivos Terraform
* Service Account con permisos mínimos necesarios
* Network segura con VPC privada y Cloud NAT

#### **Organización:**
* Modularización por componente reutilizable
* Ambientes separados con configuraciones específicas
* Versionado semántico para módulos estables
* Documentación completa por módulo

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

## 7. Estado Actual y Roadmap

### 7.1. Funcionalidades Implementadas ✅

#### **Infraestructura Base (95% completada):**
- ✅ Terraform configurado para GCP
- ✅ Cloud Run setup para N8N
- ✅ Secret Manager para credenciales
- ✅ VPC y networking configurado
- ✅ Supabase PostgreSQL con RLS

#### **Frontend Moderno (90% completado):**
- ✅ Next.js 14 con App Router
- ✅ Autenticación con Supabase Auth
- ✅ Componentes UI con Radix + Tailwind
- ✅ Sistema de temas claro/oscuro
- ✅ Landing page optimizada
- ✅ Dashboard base implementado

#### **Módulo de Leads (85% completado):**
- ✅ Schema de base de datos completo
- ✅ Servicios de lógica de negocio
- ✅ Análisis de intención con IA
- ✅ Sistema de scoring automático
- ✅ Asignación de asesores
- ⚠️ Integración N8N workflows - En desarrollo

#### **Módulo de Encuestas (90% completado):**
- ✅ Estructura de 4 preguntas + comentarios
- ✅ 3 canales de origen (QR, WhatsApp, llamada)
- ✅ Automatización de alertas por puntaje
- ✅ Filtrado inteligente por teléfono
- ⚠️ Interface frontend - En desarrollo

#### **Módulo de Reclamos (65% completado):**
- ✅ Schema de base de datos con Black Alert
- ✅ Estructura para RAG y IA
- ⚠️ Agente IA con procesamiento RAG - En desarrollo
- ⚠️ Pipeline de documentos - Pendiente
- ⚠️ Integración Vertex AI - Pendiente

### 7.2. Próximos Pasos Críticos (Siguientes 4 semanas)

#### **Alta Prioridad:**
1. **Completar N8N Automation Hub**
   - Deployment en Cloud Run
   - Configuración multitenant
   - Workflows para leads y encuestas

2. **Finalizar Frontend de Módulos**
   - Dashboard de leads para asesores
   - Interface de encuestas
   - Gestión de reclamos

3. **Implementar RAG Pipeline**
   - Procesamiento de documentos con Gemini
   - Vertex AI Vector Search setup
   - Agente IA para clasificación de reclamos

#### **Mediana Prioridad:**
1. Dashboard de métricas avanzado
2. Testing y QA comprehensivo
3. Optimización de performance
4. Documentación técnica completa

### 7.3. Cambios Arquitectónicos Realizados

#### **Migración Django → Supabase + Next.js:**
- **Beneficios:** Desarrollo más rápido, costos reducidos, mejor UX
- **Estado:** Completado exitosamente
- **Impacto:** Arquitectura 50% más eficiente y escalable

#### **GKE → Cloud Run:**
- **Beneficios:** Simplicidad operativa, auto-scaling, costos optimizados
- **Estado:** Implementado para frontend, N8N en progreso
- **Ahorro:** ~60% reducción en costos de infraestructura

#### **Adición Módulo de Ventas:**
- **Impacto:** Nueva fuente de valor para concesionarios
- **Estado:** 85% implementado con IA funcional
- **ROI:** Potencial aumento 30% en conversión de leads

## 8. Especificaciones Técnicas RAG para Agente de Reclamos

### 9.1. Arquitectura RAG Multi-tenant

#### **Base de Datos Vectorial:**
* **Tecnología:** Vertex AI Vector Search (Google Cloud)
* **Modelo de Embeddings:** text-embedding-004 (Google)
* **Segregación:** Filtros estrictos por tenant_id en todas las consultas
* **Dimensiones:** 768 dimensiones por embedding
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

### 9.2. Flujo RAG Integrado con n8n

#### **Procesamiento de Reclamo con RAG:**
```
1. Cliente envía reclamo → n8n recibe webhook
2. n8nextrae tenant_id y preprocessa texto
3. Generación de embedding con text-embedding-004
4. Query a Vertex AI Vector Search (filtered by tenant)
5. Recuperación de top-k chunks relevantes (k=5, threshold=0.7)
6. Construcción de prompt enriquecido:
   - Reclamo original
   - Contexto recuperado
   - Custom prompts del concesionario
   - Instrucciones específicas
7. Envío a Gemini 2.5 Pro
8. Respuesta estructurada con clasificación y sugerencias
9. Callback a Django con datos enriquecidos
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

### 9.3. Gestión de Conocimiento por Concesionario

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

### 9.4. Optimización y Monitoreo RAG

#### **Métricas de Calidad RAG:**
* **Precision@K:** Relevancia de documentos recuperados
* **Response Quality Score:** Evaluación de respuestas generadas
* **Knowledge Coverage:** Porcentaje de consultas con contexto útil
* **Latency P95:** Tiempo de respuesta del pipeline RAG completo
* **Cache Hit Rate:** Eficiencia de cache de embeddings

#### **Optimización de Latencia y Costos con Caching:**
* **Implementación de Cache en Múltiples Niveles:** Utilizar Cloud Memorystore (Redis) para reducir la latencia y los costos de las APIs de IA en operaciones repetitivas.
        *   **Cache de Embeddings:** Antes de llamar a la API `text-embedding-004`, verificar si el embedding para un texto de reclamo común ya existe en el caché.
        *   **Cache de Respuestas de RAG:** Para reclamos idénticos o muy similares, se puede cachear la respuesta JSON final y estructurada del LLM. Esto evita por completo el pipeline RAG (embedding, búsqueda, prompt) para consultas frecuentes, mejorando drásticamente el tiempo de respuesta y reduciendo costos.

#### **Feedback Loop y Mejora Continua:**
* **Human Feedback:** Rating de calidad de respuestas por usuarios
* **Auto-evaluation:** Evaluación automática de consistencia
* **Knowledge Gap Detection:** Identificación de áreas sin cobertura
* **Performance Analytics:** Dashboard de métricas RAG por tenant

### 9.5. Configuración Técnica Específica

#### **Vertex AI Vector Search Configuration:**
```yaml
index_config:
  dimensions: 768
  approximate_neighbors_count: 10
  distance_measure_type: "COSINE_DISTANCE"
  algorithm_config:
    tree_ah_config:
      leaf_node_embedding_count: 1000
      leaf_nodes_to_search_percent: 10
```

#### **n8nWorkflow para RAG:**
```json
{
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "webhook"
    },
    {
      "name": "Extract Tenant Config",
      "type": "function"
    },
    {
      "name": "Generate Embedding",
      "type": "http-request",
      "parameters": {
        "url": "https://aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/text-embedding-004:predict"
      }
    },
    {
      "name": "Vector Search",
      "type": "http-request", 
      "parameters": {
        "url": "https://aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/indexEndpoints/{endpoint_id}:findNeighbors"
      }
    },
    {
      "name": "Build Enhanced Prompt",
      "type": "function"
    },
    {
      "name": "Gemini Processing",
      "type": "google-ai-studio"
    },
    {
      "name": "Send to Django",
      "type": "http-request"
    }
  ]
}
```

### 9.6. Seguridad y Compliance RAG

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