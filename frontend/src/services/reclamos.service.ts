import { createClient } from "../../supabase/client";

const supabase = createClient();

// =====================================================
// TIPOS E INTERFACES
// =====================================================

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

export interface Reclamo {
  id: string;
  numero_reclamo: string;
  titulo: string;
  descripcion: string;
  estado: string;
  urgencia: string;
  prioridad: string;
  es_black_alert: boolean;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  vehiculo_patente: string;
  sucursal_id: string;
  asignado_a_user_id?: string;
  clasificacion_ia?: any;
  created_at: string;
  updated_at: string;
}

// =====================================================
// CREAR RECLAMO
// =====================================================

/**
 * Crea un nuevo reclamo y lo envía al webhook de N8N para procesamiento
 */
export async function crearReclamo(data: CrearReclamoInput) {
  try {
    // 1. Obtener usuario actual para concesionario_id
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // 2. Obtener concesionario_id del usuario
    const concesionario_id = user.user_metadata?.concesionario_id;

    if (!concesionario_id) {
      throw new Error('Usuario no tiene concesionario asociado');
    }

    // 3. Preparar payload para N8N
    const payload = {
      concesionario_id,
      canal_origen: 'contact_center',
      cliente: {
        nombre: data.cliente_nombre,
        rut: data.cliente_rut || null,
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

    // 4. Verificar si tenemos URL de N8N configurada
    const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL) {
      console.warn('⚠️ N8N_WEBHOOK_URL no configurado, guardando directo en BD');

      // FALLBACK: Guardar directo en Supabase si N8N no está disponible
      return await crearReclamoDirecto(payload);
    }

    // 5. Llamar webhook N8N
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

/**
 * Fallback: Crear reclamo directo en Supabase sin N8N
 * Útil para desarrollo y testing
 */
async function crearReclamoDirecto(payload: any) {
  try {
    // Generar número de reclamo
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const numero_reclamo = `REC-${year}-${random}`;

    // Insertar en la tabla reclamos
    const { data, error } = await supabase
      .from('reclamos')
      .insert({
        concesionario_id: payload.concesionario_id,
        sucursal_id: payload.sucursal_id,
        numero_reclamo,
        titulo: payload.titulo || 'Reclamo sin título',
        descripcion: payload.descripcion,
        estado: 'nuevo',
        urgencia: 'normal',
        prioridad: 'media',
        es_black_alert: payload.es_black_alert,
        cliente_nombre: payload.cliente.nombre,
        cliente_telefono: payload.cliente.telefono,
        cliente_email: payload.cliente.email,
        cliente_rut: payload.cliente.rut,
        canal_origen: payload.canal_origen,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      numero_reclamo,
      reclamo_id: data.id,
      message: 'Reclamo creado exitosamente (modo directo)',
    };

  } catch (error) {
    console.error('Error en crearReclamoDirecto:', error);
    throw error;
  }
}

// =====================================================
// OBTENER RECLAMOS (CON FILTROS)
// =====================================================

/**
 * Obtiene lista de reclamos con filtros opcionales
 */
export async function obtenerReclamos(filtros?: ReclamosFiltros) {
  try {
    let query = supabase
      .from('reclamos')
      .select(`
        *,
        sucursal:sucursales(nombre),
        asignado:usuarios(nombre_completo)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros si existen
    if (filtros?.estado && filtros.estado.length > 0) {
      query = query.in('estado', filtros.estado);
    }

    if (filtros?.urgencia && filtros.urgencia.length > 0) {
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

    if (error) {
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Error al obtener reclamos:', error);
    throw error;
  }
}

// =====================================================
// OBTENER DETALLE DE RECLAMO
// =====================================================

/**
 * Obtiene el detalle completo de un reclamo por ID
 */
export async function obtenerReclamoPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from('reclamos')
      .select(`
        *,
        sucursal:sucursales(nombre, direccion, telefono),
        asignado:usuarios(nombre_completo, email, telefono),
        seguimientos:seguimientos_reclamo(
          *,
          usuario:usuarios(nombre_completo)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error al obtener reclamo:', error);
    throw error;
  }
}

// =====================================================
// OBTENER SUCURSALES
// =====================================================

/**
 * Obtiene las sucursales del concesionario del usuario actual
 */
export async function obtenerSucursales() {
  try {
    const { data, error } = await supabase
      .from('sucursales')
      .select('id, nombre, direccion, ciudad')
      .order('nombre');

    if (error) {
      throw error;
    }

    return data || [];

  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    throw error;
  }
}

// =====================================================
// ACTUALIZAR ESTADO DE RECLAMO
// =====================================================

/**
 * Actualiza el estado de un reclamo
 */
export async function actualizarEstadoReclamo(id: string, estado: string) {
  try {
    const { data, error } = await supabase
      .from('reclamos')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    throw error;
  }
}
