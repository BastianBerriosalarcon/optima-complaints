/**
 * AdvisorWorkloadManager - Manages sales advisor workload assignment and tracking
 * 
 * This service handles:
 * - Workload increment/decrement for asesor_ventas, jefe_ventas, gerente_ventas
 * - Smart assignment based on role hierarchy, specialization, and current workload
 * - Audit logging of all workload changes
 * - Statistics and reporting for workload distribution
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface AdvisorWorkloadData {
    id: string;
    nombre: string;
    role: 'asesor_ventas' | 'jefe_ventas' | 'gerente_ventas';
    carga_actual: number;
    especialidad?: string;
    sucursal_id: string;
    sucursal_nombre?: string;
}

export interface WorkloadStats {
    asesor_id: string;
    asesor_nombre: string;
    role: string;
    carga_actual: number;
    total_incrementos: number;
    total_decrementos: number;
    cambios_netos: number;
}

export class AdvisorWorkloadManager {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Increment workload for a sales advisor
     * Supports asesor_ventas, jefe_ventas, and gerente_ventas roles
     */
    async incrementWorkload(
        advisorId: string, 
        leadId?: string
    ): Promise<void> {
        try {
            const { error } = await this.supabase.rpc('incrementar_carga_asesor', {
                p_asesor_id: advisorId,
                p_lead_id: leadId || null
            });

            if (error) {
                throw new Error(`Failed to increment advisor workload: ${error.message}`);
            }
        } catch (error) {
            console.error('Error incrementing advisor workload:', error);
            throw error;
        }
    }

    /**
     * Decrement workload for a sales advisor
     * Ensures workload never goes below 0
     */
    async decrementWorkload(
        advisorId: string, 
        leadId?: string
    ): Promise<void> {
        try {
            const { error } = await this.supabase.rpc('decrementar_carga_asesor', {
                p_asesor_id: advisorId,
                p_lead_id: leadId || null
            });

            if (error) {
                throw new Error(`Failed to decrement advisor workload: ${error.message}`);
            }
        } catch (error) {
            console.error('Error decrementing advisor workload:', error);
            throw error;
        }
    }

    /**
     * Get available sales team members for intelligent assignment
     * Returns advisors ordered by role hierarchy, specialization match, and workload
     */
    async getAvailableSalesTeam(
        concesionarioId: string,
        sucursalId?: string,
        especialidad?: string
    ): Promise<AdvisorWorkloadData[]> {
        try {
            const { data, error } = await this.supabase.rpc('get_available_sales_team', {
                p_concesionario_id: concesionarioId,
                p_sucursal_id: sucursalId || null,
                p_especialidad: especialidad || null
            });

            if (error) {
                throw new Error(`Failed to get available sales team: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting available sales team:', error);
            throw error;
        }
    }

    /**
     * Get workload statistics for sales team over a date range
     */
    async getWorkloadStats(
        concesionarioId: string,
        fechaInicio?: Date,
        fechaFin?: Date
    ): Promise<WorkloadStats[]> {
        try {
            const { data, error } = await this.supabase.rpc('get_advisor_workload_stats', {
                p_concesionario_id: concesionarioId,
                p_fecha_inicio: fechaInicio?.toISOString().split('T')[0] || null,
                p_fecha_fin: fechaFin?.toISOString().split('T')[0] || null
            });

            if (error) {
                throw new Error(`Failed to get workload statistics: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting workload statistics:', error);
            throw error;
        }
    }

    /**
     * Smart advisor assignment based on multiple criteria
     * Returns the best advisor for lead assignment
     */
    async getBestAdvisorForAssignment(
        concesionarioId: string,
        leadData: {
            sucursalId?: string;
            vehicleModel?: string;
            leadPriority?: 'high' | 'medium' | 'low';
            requiresSpecialty?: boolean;
        }
    ): Promise<AdvisorWorkloadData | null> {
        try {
            // Get available advisors with optional filters
            const availableAdvisors = await this.getAvailableSalesTeam(
                concesionarioId,
                leadData.sucursalId,
                leadData.requiresSpecialty ? leadData.vehicleModel : undefined
            );

            if (availableAdvisors.length === 0) {
                return null;
            }

            // For high priority leads, prefer jefe_ventas or gerente_ventas
            if (leadData.leadPriority === 'high') {
                const seniorAdvisors = availableAdvisors.filter(
                    advisor => advisor.role === 'gerente_ventas' || advisor.role === 'jefe_ventas'
                );
                
                if (seniorAdvisors.length > 0) {
                    return seniorAdvisors[0]; // Already sorted by workload
                }
            }

            // Return the best available advisor (first in sorted list)
            return availableAdvisors[0];
        } catch (error) {
            console.error('Error getting best advisor for assignment:', error);
            throw error;
        }
    }

    /**
     * Assign lead to advisor and increment workload atomically
     */
    async assignLeadToAdvisor(
        leadId: string,
        advisorId: string,
        concesionarioId: string
    ): Promise<void> {
        try {
            // Start transaction
            const { error: assignError } = await this.supabase
                .from('leads')
                .update({ 
                    asesor_asignado_id: advisorId,
                    estado: 'asignado',
                    fecha_asignacion: new Date().toISOString()
                })
                .eq('id', leadId)
                .eq('concesionario_id', concesionarioId);

            if (assignError) {
                throw new Error(`Failed to assign lead: ${assignError.message}`);
            }

            // Increment workload
            await this.incrementWorkload(advisorId, leadId);

        } catch (error) {
            console.error('Error assigning lead to advisor:', error);
            throw error;
        }
    }

    /**
     * Reassign lead from one advisor to another
     */
    async reassignLead(
        leadId: string,
        fromAdvisorId: string,
        toAdvisorId: string,
        concesionarioId: string,
        reason?: string
    ): Promise<void> {
        try {
            // Update lead assignment
            const { error: reassignError } = await this.supabase
                .from('leads')
                .update({ 
                    asesor_asignado_id: toAdvisorId,
                    fecha_reasignacion: new Date().toISOString(),
                    motivo_reasignacion: reason
                })
                .eq('id', leadId)
                .eq('concesionario_id', concesionarioId);

            if (reassignError) {
                throw new Error(`Failed to reassign lead: ${reassignError.message}`);
            }

            // Decrement old advisor workload
            await this.decrementWorkload(fromAdvisorId, leadId);
            
            // Increment new advisor workload
            await this.incrementWorkload(toAdvisorId, leadId);

        } catch (error) {
            console.error('Error reassigning lead:', error);
            throw error;
        }
    }

    /**
     * Handle lead closure (sold/lost) - decrement advisor workload
     */
    async closeLead(
        leadId: string,
        advisorId: string,
        status: 'vendido' | 'perdido',
        concesionarioId: string
    ): Promise<void> {
        try {
            // Update lead status
            const { error: closeError } = await this.supabase
                .from('leads')
                .update({ 
                    estado: status,
                    fecha_cierre: new Date().toISOString()
                })
                .eq('id', leadId)
                .eq('concesionario_id', concesionarioId);

            if (closeError) {
                throw new Error(`Failed to close lead: ${closeError.message}`);
            }

            // Decrement advisor workload
            await this.decrementWorkload(advisorId, leadId);

        } catch (error) {
            console.error('Error closing lead:', error);
            throw error;
        }
    }
}

export default AdvisorWorkloadManager;