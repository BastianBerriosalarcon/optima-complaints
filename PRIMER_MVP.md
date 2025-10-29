# 🚀 Plan de Acción: Primer MVP - Optima-Complaints

> **Fecha Objetivo:** Mañana
> **Tiempo Estimado:** 8-10 horas de trabajo enfocado
> **Estado Actual del Proyecto:** 60% completo

---

## 📊 Resumen Ejecutivo

### Estado Actual

**✅ LO QUE FUNCIONA:**
- Base de datos completa con RLS multitenant (95%)
- 13 workflows N8N implementados (90%)
- Frontend Next.js 14 con UI profesional (70%)
- Sistema RAG con Gemini + Cohere funcionando
- Autenticación y roles configurados

**❌ LO QUE FALTA (CRÍTICO):**
- Frontend desconectado del backend (usa datos MOCK)
- No hay integración formulario → N8N
- No hay queries reales a Supabase
- Falta datos de demostración realistas

---

## 🎯 Objetivo del MVP

Demostrar un **flujo completo funcional** de gestión de reclamos:

```
Usuario crea reclamo → N8N procesa con IA → Guarda en BD →
Asigna automáticamente → Envía email → Aparece en dashboard
```

---

## 📋 Plan de Trabajo (8-10 horas)

### FASE 1: Conexión Crítica Backend (4-5 horas) 🔴

#### Tarea 1.1: Crear Servicio de Reclamos (1 hora)

**Archivo:** `frontend/src/services/reclamos.service.ts`

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

// Servicio para crear reclamo
export async function crearReclamo(data: CrearReclamoInput) {
  try {
    // 1. Obtener usuario actual para concesionario_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // 2. Preparar payload para N8N
    const payload = {
      concesionario_id: user.user_metadata.concesionario_id,
      canal_origen: 'contact_center',
      cliente: {
        nombre: data.cliente_nombre,
        rut: data.cliente_rut,
        telefono: data.cliente_telefono,
        email: data.cliente_email || null,
      },
      vehiculo: {
        patente: data.vehiculo_patente,
        marca: data.vehiculo_marca || null,
        modelo: data.vehiculo_modelo || null,
      },
      sucursal_id: data.sucursal_id,
      descripcion: data.descripcion,
      titulo: data.titulo || null,
      es_black_alert: data.es_black_alert || false,
      attachments: data.attachments || [],
    };

    // 3. Llamar webhook N8N
    const response = await fetch(`${N8N_WEBHOOK_URL}/webhook/complaint/orchestrator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error N8N: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al crear reclamo:', error);
    throw error;
  }
}

// Servicio para obtener reclamos
export async function obtenerReclamos(filtros?: ReclamosFiltros) {
  try {
    let query = supabase
      .from('reclamos')
      .select(`
        *,
        sucursal:sucursales(nombre),
        asignado:usuarios(nombre_completo),
        cliente:clientes(nombre, telefono, email)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filtros?.estado) {
      query = query.in('estado', filtros.estado);
    }
    if (filtros?.urgencia) {
      query = query.in('urgencia', filtros.urgencia);
    }
    if (filtros?.es_black_alert !== undefined) {
      query = query.eq('es_black_alert', filtros.es_black_alert);
    }
    if (filtros?.sucursal_id) {
      query = query.eq('sucursal_id', filtros.sucursal_id);
    }
    if (filtros?.busqueda) {
      query = query.or(`
        numero_reclamo.ilike.%${filtros.busqueda}%,
        cliente_nombre.ilike.%${filtros.busqueda}%,
        descripcion.ilike.%${filtros.busqueda}%
      `);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener reclamos:', error);
    throw error;
  }
}

// Servicio para obtener detalle de reclamo
export async function obtenerReclamoPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from('reclamos')
      .select(`
        *,
        sucursal:sucursales(nombre, direccion),
        asignado:usuarios(nombre_completo, email, telefono),
        cliente:clientes(nombre, telefono, email, rut),
        vehiculo:vehiculos(patente, marca, modelo, vin),
        seguimientos:seguimientos_reclamo(
          *,
          usuario:usuarios(nombre_completo)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener reclamo:', error);
    throw error;
  }
}

// Tipos
export interface CrearReclamoInput {
  cliente_nombre: string;
  cliente_rut?: string;
  cliente_telefono: string;
  cliente_email?: string;
  vehiculo_patente: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  sucursal_id: string;
  titulo?: string;
  descripcion: string;
  es_black_alert?: boolean;
  attachments?: string[];
}

export interface ReclamosFiltros {
  estado?: string[];
  urgencia?: string[];
  es_black_alert?: boolean;
  sucursal_id?: string;
  busqueda?: string;
}
```

**Checklist:**
- [ ] Crear archivo `frontend/src/services/reclamos.service.ts`
- [ ] Copiar código anterior
- [ ] Verificar imports de Supabase

---

#### Tarea 1.2: Conectar Formulario con API Real (1 hora)

**Archivo a modificar:** `frontend/src/components/complaints/NewComplaintModal.tsx`

**Cambios necesarios:**

```typescript
// Importar servicio
import { crearReclamo } from '@/services/reclamos.service';
import { toast } from 'sonner';

// Modificar función handleSubmit (buscar alrededor de la línea 200-300)
const handleSubmit = async (data: ComplaintFormData) => {
  setIsSubmitting(true);

  try {
    // Validar datos
    complaintSchema.parse(data);

    // Llamar servicio real
    const resultado = await crearReclamo({
      cliente_nombre: data.clientName,
      cliente_rut: data.clientRut,
      cliente_telefono: data.clientPhone,
      cliente_email: data.clientEmail,
      vehiculo_patente: data.vehiclePlate,
      vehiculo_marca: data.vehicleBrand,
      vehiculo_modelo: data.vehicleModel,
      sucursal_id: data.branch,
      descripcion: data.description,
      titulo: data.title,
      es_black_alert: data.isBlackAlert,
    });

    // Mostrar éxito
    toast.success(`Reclamo ${resultado.numero_reclamo} creado exitosamente`);

    // Limpiar formulario
    form.reset();

    // Cerrar modal
    onClose();

    // Recargar lista de reclamos
    window.location.reload(); // Temporal, luego usar Realtime

  } catch (error) {
    console.error('Error:', error);
    toast.error('Error al crear el reclamo. Por favor intente nuevamente.');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Checklist:**
- [ ] Importar servicio `crearReclamo`
- [ ] Reemplazar lógica de `handleSubmit`
- [ ] Agregar manejo de errores con toast
- [ ] Probar creación de reclamo

---

#### Tarea 1.3: Reemplazar Mock Data con Queries Reales (2-3 horas)

**Archivo a modificar:** `frontend/src/app/dashboard/reclamos/page.tsx`

**Cambios necesarios:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { obtenerReclamos, type ReclamosFiltros } from '@/services/reclamos.service';
import { ComplaintsTable } from '@/components/complaints/ComplaintsTable';
import { NewComplaintModal } from '@/components/complaints/NewComplaintModal';
import { toast } from 'sonner';

export default function ReclamosPage() {
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<ReclamosFiltros>({});

  // Cargar reclamos al montar
  useEffect(() => {
    cargarReclamos();
  }, [filtros]);

  const cargarReclamos = async () => {
    try {
      setLoading(true);
      const data = await obtenerReclamos(filtros);
      setReclamos(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar reclamos');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en filtros
  const handleFiltrosChange = (nuevosFiltros: ReclamosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  if (loading) {
    return <div>Cargando reclamos...</div>;
  }

  return (
    <div>
      {/* Filtros y UI existente */}
      <ComplaintsTable
        data={reclamos}
        onFiltrosChange={handleFiltrosChange}
      />
    </div>
  );
}
```

**Checklist:**
- [ ] Eliminar import de `mockData`
- [ ] Importar `obtenerReclamos`
- [ ] Agregar estado `loading` y `reclamos`
- [ ] Implementar `useEffect` para cargar datos
- [ ] Probar que la tabla muestra datos reales

---

### FASE 2: Configuración y Testing (3-4 horas) 🟡

#### Tarea 2.1: Configurar Variables de Entorno (30 min)

**Archivo:** `frontend/.env.local`

```env
# Supabase (obtener de Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# N8N (URL de tu instancia de elest.io)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://tu-instancia-n8n.elest.io

# Aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Checklist:**
- [ ] Crear archivo `.env.local`
- [ ] Copiar credenciales de Supabase
- [ ] Verificar URL de N8N
- [ ] Reiniciar servidor dev

---

#### Tarea 2.2: Crear Datos de Demostración (1-2 horas)

**Opción A: Script SQL Manual**

Ejecutar en Supabase SQL Editor:

```sql
-- 1. Crear concesionario de prueba
INSERT INTO concesionarios (id, nombre, rut, email, telefono)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'Automovilismo del Sur',
  '76.123.456-7',
  'info@autosur.cl',
  '+56912345678'
);

-- 2. Crear sucursal
INSERT INTO sucursales (concesionario_id, nombre, ciudad)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'Sucursal Centro',
  'Santiago'
);

-- 3. Crear usuario asesor
INSERT INTO usuarios (
  concesionario_id,
  nombre_completo,
  email,
  rol
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'Juan Pérez',
  'juan.perez@autosur.cl',
  'asesor_servicio'
);

-- 4. Crear clientes de prueba
INSERT INTO clientes (concesionario_id, nombre, telefono, email, rut)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'María González', '+56987654321', 'maria@email.com', '12.345.678-9'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Pedro Sánchez', '+56976543210', 'pedro@email.com', '23.456.789-0'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Ana Martínez', '+56965432109', 'ana@email.com', '34.567.890-1');

-- 5. Crear vehículos
INSERT INTO vehiculos (concesionario_id, patente, marca, modelo)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'AB1234', 'Toyota', 'Corolla'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'CD5678', 'Hyundai', 'Tucson'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'EF9012', 'Chevrolet', 'Tracker');

-- 6. Crear reclamos de demostración
-- (Necesitarás obtener los IDs de cliente, vehículo y sucursal creados arriba)
-- Ejecutar queries SELECT para obtener los UUIDs y luego insertar reclamos
```

**Opción B: Usar el Formulario**

Una vez que el formulario esté conectado:
- [ ] Crear 10-15 reclamos manualmente
- [ ] Variar estados, urgencias y tipos
- [ ] Incluir algunos Black Alerts
- [ ] Agregar descripciones realistas

**Checklist:**
- [ ] Concesionario de prueba creado
- [ ] Al menos 1 sucursal
- [ ] 2-3 usuarios de prueba
- [ ] 10-15 reclamos de demostración
- [ ] Verificar que aparecen en el dashboard

---

#### Tarea 2.3: Testing del Flujo Completo (2 horas)

**Test 1: Creación de Reclamo**

1. Abrir `http://localhost:3000/dashboard/reclamos`
2. Click en "Nuevo Reclamo"
3. Llenar formulario con datos válidos:
   - Cliente: María González, +56987654321
   - Vehículo: AB1234, Toyota Corolla
   - Descripción: "El motor hace ruido al encender"
   - Black Alert: NO
4. Click "Crear Reclamo"
5. **Verificar:**
   - [ ] Aparece toast de éxito
   - [ ] Modal se cierra
   - [ ] Reclamo aparece en la tabla

**Test 2: Procesamiento N8N**

1. Abrir N8N Dashboard
2. Verificar workflow `complaint-orchestrator` ejecutado
3. Verificar workflow `procesador-rag-reclamos` ejecutado
4. **Verificar en logs:**
   - [ ] Embedding generado
   - [ ] Búsqueda vectorial ejecutada
   - [ ] Gemini 2.5 Pro analizó el reclamo
   - [ ] Clasificación IA guardada

**Test 3: Base de Datos**

1. Abrir Supabase SQL Editor
2. Ejecutar:
```sql
SELECT
  numero_reclamo,
  cliente_nombre,
  estado,
  urgencia,
  clasificacion_ia
FROM reclamos
ORDER BY created_at DESC
LIMIT 5;
```
3. **Verificar:**
   - [ ] Reclamo aparece en BD
   - [ ] `numero_reclamo` generado (REC-2025-001)
   - [ ] `clasificacion_ia` tiene datos JSON
   - [ ] Estado es 'nuevo' o 'asignado'

**Test 4: Asignación Automática**

1. Verificar en N8N workflow `asignacion-automatica-reclamos`
2. **Verificar:**
   - [ ] Reclamo fue asignado a un asesor
   - [ ] Campo `asignado_a_user_id` tiene UUID
   - [ ] Estado cambió a 'asignado'

**Test 5: Notificaciones**

1. Revisar logs de N8N workflow `notificaciones-reclamos`
2. **Verificar:**
   - [ ] Email enviado a asesor asignado
   - [ ] Email enviado a cliente (confirmación)
   - [ ] Email enviado a jefe de servicio

**Test 6: Filtros y Búsqueda**

1. En dashboard, probar filtros:
   - [ ] Filtrar por estado
   - [ ] Filtrar por urgencia
   - [ ] Filtrar por Black Alert
   - [ ] Buscar por número de reclamo
   - [ ] Buscar por nombre de cliente

**Checklist General:**
- [ ] Todos los tests pasaron
- [ ] No hay errores en consola
- [ ] No hay errores en logs de N8N
- [ ] Performance es aceptable (<3s para crear reclamo)

---

### FASE 3: Preparación para Demo (1-2 horas) 🟢

#### Tarea 3.1: Build de Producción (30 min)

```bash
cd frontend
npm run build
npm start
```

**Verificar:**
- [ ] Build completado sin errores
- [ ] Aplicación inicia en modo producción
- [ ] Todas las páginas cargan correctamente
- [ ] No hay warnings críticos

---

#### Tarea 3.2: Pulir UI y Experiencia (1 hora)

**Checklist visual:**
- [ ] No hay textos "Lorem ipsum" o placeholders
- [ ] Todos los botones funcionan
- [ ] Loading states visibles
- [ ] Mensajes de error claros
- [ ] Toast notifications funcionando
- [ ] Responsive en mobile (opcional para MVP)

**Checklist técnico:**
- [ ] No hay `console.log` en producción
- [ ] No hay `console.error` en funcionamiento normal
- [ ] Variables de entorno configuradas
- [ ] Supabase RLS activo y funcionando

---

#### Tarea 3.3: Preparar Script de Presentación (30 min)

**Documento:** `DEMO_SCRIPT.md`

```markdown
# Script de Demostración - Optima-Complaints MVP

## 1. Introducción (2 minutos)

"Buenos días/tardes. Les presento Optima-Complaints, un sistema SaaS multitenant
para gestión inteligente de reclamos en el sector automotriz.

Características clave:
- Automatización con IA (Google Gemini 2.5 Pro)
- Sistema RAG para respuestas contextualizadas
- Asignación inteligente de casos
- Multitenant con total aislamiento de datos"

## 2. Demo en Vivo (5 minutos)

### Paso 1: Dashboard
"Aquí vemos el dashboard con reclamos en tiempo real.
Tenemos filtros por estado, urgencia y Black Alerts."

### Paso 2: Crear Reclamo
"Voy a crear un nuevo reclamo desde el Contact Center.
- Cliente: María González
- Vehículo: Toyota Corolla, patente AB1234
- Problema: Motor hace ruido al encender
- Marcar como Black Alert: SÍ (cliente tiene menos de 6 meses)"

Click "Crear Reclamo"

### Paso 3: Procesamiento IA
"En este momento:
1. N8N recibe el reclamo
2. Gemini genera embedding del texto (768 dimensiones)
3. Búsqueda vectorial en base de conocimiento
4. Cohere rerank optimiza resultados
5. Gemini 2.5 Pro analiza y clasifica
6. Sistema asigna automáticamente a asesor disponible
7. Envía notificaciones por email"

(Mostrar logs de N8N en pantalla secundaria si es posible)

### Paso 4: Resultado
"El reclamo ahora aparece en la tabla:
- Número: REC-2025-015
- Estado: Asignado
- Urgencia: Alta (detectada por IA)
- Asignado a: Juan Pérez
- Black Alert activo"

Click en el reclamo para ver detalle.

### Paso 5: Clasificación IA
"La IA extrajo automáticamente:
- Tipo: Garantía
- Categoría: Motor
- Sentimiento: Negativo (frustración detectada)
- Sugerencias de resolución basadas en políticas
- Referencias a manual de garantías sección 3.2"

## 3. Arquitectura Técnica (3 minutos)

"Stack tecnológico:
- Frontend: Next.js 14 con App Router, TypeScript, Tailwind CSS
- Backend: Supabase PostgreSQL con pgvector para RAG
- Automatización: 13 workflows N8N
- IA: Gemini 2.5 Pro + Embedding 001 + Cohere Rerank
- Seguridad: Row Level Security multitenant"

## 4. Roadmap (2 minutos)

"Estado actual: MVP funcional (60% completo)

Próximas fases:
- Fase 2 (2 semanas): Portal público, métricas avanzadas
- Fase 3 (1 mes): API REST, mobile app
- Fase 4 (2 meses): Integraciones CRM, analytics predictivos"

## 5. Q&A

Preguntas anticipadas:
- ¿Cuántos concesionarios soporta? R: Ilimitados, multitenant nativo
- ¿Qué pasa si la IA se equivoca? R: Asesores pueden corregir, sistema aprende
- ¿Costos? R: $115-135/mes por concesionario
- ¿Tiempo de implementación? R: 2-3 semanas para producción
```

**Checklist:**
- [ ] Script de demo preparado
- [ ] Timing practicado (<10 minutos)
- [ ] Datos de demo listos
- [ ] Pantallas de N8N preparadas
- [ ] Respuestas a preguntas frecuentes

---

## 🔍 Checklist Final Pre-Presentación

### Técnico
- [ ] Frontend en modo producción
- [ ] Supabase conectado y funcionando
- [ ] N8N workflows activos
- [ ] Variables de entorno configuradas
- [ ] Al menos 10 reclamos de prueba en BD
- [ ] No hay errores en consola
- [ ] Build sin warnings críticos

### Funcional
- [ ] Flujo completo testeado: Crear → Procesar → Asignar → Notificar
- [ ] Tabla muestra datos reales
- [ ] Filtros funcionan
- [ ] Búsqueda funciona
- [ ] Modal de nuevo reclamo funciona
- [ ] Black Alerts se marcan correctamente

### Presentación
- [ ] Script de demo preparado
- [ ] Timing practicado
- [ ] Backup de datos por si algo falla
- [ ] Plan B: screenshots/video si hay problemas de conectividad
- [ ] Laptop cargada
- [ ] Internet estable verificado

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "Error: Invalid API key"
**Solución:**
- Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`
- Reiniciar servidor dev
- Verificar que no hay espacios en la key

### Problema 2: "CORS error al llamar N8N"
**Solución:**
- En N8N, configurar CORS en webhook settings
- Agregar `http://localhost:3000` a allowed origins
- Verificar que la URL de N8N es correcta

### Problema 3: "RLS policy error"
**Solución:**
- Verificar que usuario tiene `concesionario_id` en metadata
- Verificar policies en Supabase Dashboard
- Ejecutar query directamente en SQL Editor para debug

### Problema 4: "No aparecen reclamos en tabla"
**Solución:**
- Abrir DevTools → Network → Verificar request a Supabase
- Verificar response: ¿hay datos? ¿hay error?
- Verificar que el usuario autenticado tiene acceso al concesionario

### Problema 5: "Build falla"
**Solución:**
- Verificar que todas las dependencias están instaladas
- Limpiar caché: `rm -rf .next && npm run build`
- Verificar que no hay imports faltantes
- Verificar que archivos TypeScript no tienen errores

---

## 📞 Contactos de Emergencia

**Si algo falla durante la demo:**
1. Mantener calma
2. Tener screenshots de backup
3. Explicar que es un MVP
4. Enfocar en la arquitectura y potencial

**Recursos:**
- Documentación: `/CLAUDE.md`
- Workflows N8N: `/applications/workflows/`
- Migraciones: `/database/migrations/`
- Frontend: `/frontend/src/`

---

## 📈 Métricas de Éxito del MVP

**MVP será exitoso si:**
- [ ] Se puede crear un reclamo desde el formulario
- [ ] El reclamo se procesa con IA
- [ ] Aparece en la tabla con clasificación
- [ ] Se asigna automáticamente
- [ ] La demo dura menos de 10 minutos
- [ ] No hay crashes durante la presentación

---

## 🎯 Después del MVP

**Tareas inmediatas (próxima semana):**
1. Implementar Supabase Realtime (actualizaciones en vivo)
2. Portal público de seguimiento
3. Dashboard de métricas avanzado
4. Upload de adjuntos a Storage
5. Gestión de base de conocimiento UI

**Tareas a corto plazo (próximo mes):**
1. Canales alternos (email, formulario web público)
2. API REST documentada
3. Testing automatizado
4. Mobile responsive
5. Deployment a producción

---

## 📝 Notas Finales

**Recuerda:**
- Este es un MVP, no un producto terminado
- Enfócate en mostrar el valor, no la perfección
- La arquitectura es sólida, solo falta conexión
- Tienes 60% del trabajo hecho, es mucho
- La IA funciona, los workflows funcionan, solo falta unir las piezas

**¡Éxito en tu presentación! 🚀**

---

*Última actualización: [Fecha]*
*Autor: Claude Code*
*Versión: 1.0*