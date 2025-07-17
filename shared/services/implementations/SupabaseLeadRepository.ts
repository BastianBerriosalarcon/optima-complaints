// Implementación del repositorio de leads usando Supabase
import { ILeadRepository } from '../interfaces/IDataService';
import { ServiceResponse, WorkflowContext } from '../../types/core';
import { SupabaseDataService } from './SupabaseDataService';

export interface Lead {
  id: string;
  tenant_id: string;
  phone: string;
  name?: string;
  email?: string;
  status: string;
  assigned_advisor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLead {
  tenant_id: string;
  phone: string;
  name?: string;
  email?: string;
  status: string;
}

export interface UpdateLead {
  name?: string;
  email?: string;
  status?: string;
  assigned_advisor_id?: string;
}

export class SupabaseLeadRepository implements ILeadRepository {
  private dataService: SupabaseDataService;

  constructor() {
    this.dataService = new SupabaseDataService();
  }

  async create(data: CreateLead, context: WorkflowContext): Promise<ServiceResponse<Lead | null>> {
    const sql = `
      INSERT INTO leads (tenant_id, phone, name, email, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const params = [
      data.tenant_id,
      data.phone,
      data.name || null,
      data.email || null,
      data.status
    ];

    return await this.dataService.queryOne<Lead>(sql, params, context);
  }

  async findById(id: string, context: WorkflowContext): Promise<ServiceResponse<Lead | null>> {
    const sql = `
      SELECT * FROM leads 
      WHERE id = $1 AND tenant_id = $2
    `;
    
    const params = [id, context.tenant_id];
    return await this.dataService.queryOne<Lead>(sql, params, context);
  }

  async update(id: string, data: UpdateLead, context: WorkflowContext): Promise<ServiceResponse<Lead | null>> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(data.email);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(data.status);
    }
    if (data.assigned_advisor_id !== undefined) {
      updates.push(`assigned_advisor_id = $${paramIndex++}`);
      params.push(data.assigned_advisor_id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id, context.tenant_id);

    const sql = `
      UPDATE leads 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *
    `;

    return await this.dataService.queryOne<Lead>(sql, params, context);
  }

  async delete(id: string, context: WorkflowContext): Promise<ServiceResponse<void>> {
    const sql = `
      DELETE FROM leads 
      WHERE id = $1 AND tenant_id = $2
    `;
    
    const params = [id, context.tenant_id];
    const result = await this.dataService.query(sql, params, context);
    
    if (result.success) {
      return {
        success: true,
        data: undefined
      };
    }
    
    return {
      success: false,
      error: result.error,
      data: undefined
    };
  }

  async findMany(filters: Record<string, any>, context: WorkflowContext): Promise<ServiceResponse<Lead[]>> {
    let sql = `SELECT * FROM leads WHERE tenant_id = $1`;
    const params = [context.tenant_id];
    let paramIndex = 2;

    // Agregar filtros dinámicamente
    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters.assigned_advisor_id) {
      sql += ` AND assigned_advisor_id = $${paramIndex++}`;
      params.push(filters.assigned_advisor_id);
    }
    if (filters.phone) {
      sql += ` AND phone LIKE $${paramIndex++}`;
      params.push(`%${filters.phone}%`);
    }

    sql += ` ORDER BY created_at DESC`;
    
    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    const result = await this.dataService.query<Lead>(sql, params, context);
    
    if (result.success) {
      return {
        success: true,
        data: result.data?.rows || [],
      };
    }
    
    return {
      success: false,
      error: result.error,
      data: [],
    };
  }

  async findByPhone(phone: string, tenantId: string, context: WorkflowContext): Promise<ServiceResponse<Lead | null>> {
    const sql = `
      SELECT * FROM leads 
      WHERE phone = $1 AND tenant_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const params = [phone, tenantId];
    return await this.dataService.queryOne<Lead>(sql, params, context);
  }

  async findByTenant(tenantId: string, filters: any, context: WorkflowContext): Promise<ServiceResponse<Lead[]>> {
    const contextWithTenant = { ...context, tenantId };
    return await this.findMany(filters, contextWithTenant);
  }

  async updateStatus(id: string, status: string, context: WorkflowContext): Promise<ServiceResponse<Lead | null>> {
    return await this.update(id, { status }, context);
  }
}