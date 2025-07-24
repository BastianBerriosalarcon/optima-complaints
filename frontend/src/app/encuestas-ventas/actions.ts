"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Types for sales surveys (similar to post-sale surveys)
export interface SalesSurveyData {
  concesionario_id: string;
  sucursal_id?: string;
  cliente_nombre: string;
  cliente_rut?: string;
  cliente_telefono: string;
  cliente_email?: string;
  asesor_ventas_id: string;
  vehiculo_modelo: string;
  vehiculo_vin?: string;
  fecha_venta: string; // Date string in ISO format
  recomendacion: number; // 1-10
  atencion_asesor: number; // 1-10
  proceso_entrega: number; // 1-10
  satisfaccion_general: number; // 1-10
  comentario?: string;
  origen: "QR_VENTAS" | "WhatsApp_VENTAS" | "Llamada_VENTAS";
  contact_center_user_id?: string;
}

export interface SalesSurveyBulkData {
  concesionario_id: string;
  surveys: Omit<SalesSurveyData, 'concesionario_id' | 'origen'>[];
}

/**
 * Create a new sales survey (similar to post-sale survey creation)
 */
export async function createSalesSurvey(surveyData: SalesSurveyData) {
  const supabase = await createClient();

  // Get current user for authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Usuario no autenticado" };
  }

  try {
    // Insert sales survey
    const { data, error } = await supabase
      .from("encuestas_ventas")
      .insert([{
        ...surveyData,
        estado: 'completado', // Mark as completed when created
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        sucursales(nombre),
        usuarios!asesor_ventas_id(nombre, email)
      `)
      .single();

    if (error) {
      console.error("Error creating sales survey:", error);
      return { error: error.message };
    }

    // Check if survey requires notification (score <= 8)
    const averageScore = (surveyData.recomendacion + surveyData.atencion_asesor + 
                         surveyData.proceso_entrega + surveyData.satisfaccion_general) / 4;
    
    if (averageScore <= 8) {
      // TODO: Trigger N8N workflow for low score notification
      console.log("Sales survey requires notification - low score:", averageScore);
    }

    revalidatePath("/dashboard/encuestas-ventas");
    return { data, success: true };

  } catch (error) {
    console.error("Unexpected error creating sales survey:", error);
    return { error: "Error inesperado al crear la encuesta de ventas" };
  }
}

/**
 * Get sales surveys with filtering (similar to post-sale surveys)
 */
export async function getSalesSurveys({
  concesionario_id,
  sucursal_id,
  asesor_ventas_id,
  origen,
  fecha_desde,
  fecha_hasta,
  page = 1,
  limit = 50
}: {
  concesionario_id?: string;
  sucursal_id?: string;
  asesor_ventas_id?: string;
  origen?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
} = {}) {
  const supabase = await createClient();

  // Get current user for authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Usuario no autenticado" };
  }

  try {
    let query = supabase
      .from("encuestas_ventas")
      .select(`
        *,
        sucursales(nombre, codigo),
        usuarios!asesor_ventas_id(nombre, email),
        contact_center_users:usuarios!contact_center_user_id(nombre)
      `, { count: 'exact' });

    // Apply filters (RLS will automatically filter by concesionario_id)
    if (sucursal_id) {
      query = query.eq('sucursal_id', sucursal_id);
    }
    if (asesor_ventas_id) {
      query = query.eq('asesor_ventas_id', asesor_ventas_id);
    }
    if (origen) {
      query = query.eq('origen', origen);
    }
    if (fecha_desde) {
      query = query.gte('fecha_venta', fecha_desde);
    }
    if (fecha_hasta) {
      query = query.lte('fecha_venta', fecha_hasta);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching sales surveys:", error);
      return { error: error.message };
    }

    return { 
      data: data || [], 
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };

  } catch (error) {
    console.error("Unexpected error fetching sales surveys:", error);
    return { error: "Error inesperado al obtener las encuestas de ventas" };
  }
}

/**
 * Create multiple sales surveys from Excel upload (for WhatsApp bulk sending)
 */
export async function createBulkSalesSurveys(bulkData: SalesSurveyBulkData) {
  const supabase = await createClient();

  // Get current user for authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Usuario no autenticado" };
  }

  try {
    // Prepare surveys for bulk insert
    const surveysToInsert = bulkData.surveys.map(survey => ({
      ...survey,
      concesionario_id: bulkData.concesionario_id,
      origen: 'WhatsApp_VENTAS' as const,
      estado: 'pendiente' as const, // Pending until customer responds
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Bulk insert surveys
    const { data, error } = await supabase
      .from("encuestas_ventas")
      .insert(surveysToInsert)
      .select(`
        *,
        sucursales(nombre),
        usuarios!asesor_ventas_id(nombre, email)
      `);

    if (error) {
      console.error("Error creating bulk sales surveys:", error);
      return { error: error.message };
    }

    // TODO: Trigger N8N workflow for WhatsApp bulk sending
    console.log(`Created ${data?.length} sales surveys for WhatsApp distribution`);

    revalidatePath("/dashboard/encuestas-ventas");
    return { 
      data, 
      success: true,
      message: `Se crearon ${data?.length} encuestas de ventas para envío por WhatsApp`
    };

  } catch (error) {
    console.error("Unexpected error creating bulk sales surveys:", error);
    return { error: "Error inesperado al crear las encuestas masivas de ventas" };
  }
}

/**
 * Update sales survey (for contact center manual completion)
 */
export async function updateSalesSurvey(id: string, updates: Partial<SalesSurveyData>) {
  const supabase = await createClient();

  // Get current user for authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Usuario no autenticado" };
  }

  try {
    const { data, error } = await supabase
      .from("encuestas_ventas")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        sucursales(nombre),
        usuarios!asesor_ventas_id(nombre, email)
      `)
      .single();

    if (error) {
      console.error("Error updating sales survey:", error);
      return { error: error.message };
    }

    // Check if updated survey requires notification
    if (updates.recomendacion && updates.atencion_asesor && 
        updates.proceso_entrega && updates.satisfaccion_general) {
      
      const averageScore = (updates.recomendacion + updates.atencion_asesor + 
                           updates.proceso_entrega + updates.satisfaccion_general) / 4;
      
      if (averageScore <= 8) {
        // TODO: Trigger N8N workflow for low score notification
        console.log("Updated sales survey requires notification - low score:", averageScore);
      }
    }

    revalidatePath("/dashboard/encuestas-ventas");
    return { data, success: true };

  } catch (error) {
    console.error("Unexpected error updating sales survey:", error);
    return { error: "Error inesperado al actualizar la encuesta de ventas" };
  }
}

/**
 * Get sales survey statistics (similar to post-sale survey stats)
 */
export async function getSalesSurveyStats(concesionario_id?: string, sucursal_id?: string) {
  const supabase = await createClient();

  // Get current user for authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Usuario no autenticado" };
  }

  try {
    let query = supabase
      .from("encuestas_ventas")
      .select('origen, estado, average_score, created_at');

    if (sucursal_id) {
      query = query.eq('sucursal_id', sucursal_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching sales survey stats:", error);
      return { error: error.message };
    }

    // Calculate statistics
    const stats = {
      total: data?.length || 0,
      completadas: data?.filter(s => s.estado === 'completado').length || 0,
      pendientes: data?.filter(s => s.estado === 'pendiente').length || 0,
      por_origen: {
        QR_VENTAS: data?.filter(s => s.origen === 'QR_VENTAS').length || 0,
        WhatsApp_VENTAS: data?.filter(s => s.origen === 'WhatsApp_VENTAS').length || 0,
        Llamada_VENTAS: data?.filter(s => s.origen === 'Llamada_VENTAS').length || 0
      },
      scores: {
        promedio: data?.filter(s => s.average_score)
          .reduce((acc, s) => acc + (s.average_score || 0), 0) / (data?.filter(s => s.average_score).length || 1),
        excelentes: data?.filter(s => (s.average_score || 0) >= 9).length || 0,
        buenos: data?.filter(s => (s.average_score || 0) >= 7 && (s.average_score || 0) < 9).length || 0,
        regulares: data?.filter(s => (s.average_score || 0) >= 5 && (s.average_score || 0) < 7).length || 0,
        bajos: data?.filter(s => (s.average_score || 0) < 5).length || 0
      }
    };

    return { data: stats, success: true };

  } catch (error) {
    console.error("Unexpected error fetching sales survey stats:", error);
    return { error: "Error inesperado al obtener estadísticas de encuestas de ventas" };
  }
}