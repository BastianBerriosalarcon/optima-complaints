// Implementación de IDataService para Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IDataService, ITransactionClient, QueryParams, QueryResult } from '../interfaces/IDataService';
import { ServiceResponse, WorkflowContext } from '../../types/core';
import { config } from '../../config/ConfigService';

export class SupabaseDataService implements IDataService {
  private client: SupabaseClient;

  constructor() {
    const dbConfig = config.getDatabaseConfig();
    this.client = createClient(dbConfig.url, dbConfig.key);
  }

  async query<T>(
    sql: string, 
    params: QueryParams = {}, 
    context?: WorkflowContext
  ): Promise<ServiceResponse<QueryResult<T>>> {
    try {
      const { data, error } = await this.client.rpc('execute_sql', {
        sql_query: sql,
        params: params
      });

      if (error) {
        return {
          success: false,
          error: error.message,
          data: undefined
        };
      }

      return {
        success: true,
        data: {
          rows: data || [],
          rowCount: data?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: undefined
      };
    }
  }

  async queryOne<T>(
    sql: string, 
    params: QueryParams = {}, 
    context?: WorkflowContext
  ): Promise<ServiceResponse<T | null>> {
    const result = await this.query<T>(sql, params, context);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        data: undefined
              };
    }

    return {
      success: true,
      data: result.data?.rows[0] || null,
          };
  }

  async transaction<T>(
    callback: (client: ITransactionClient) => Promise<T>,
    context?: WorkflowContext
  ): Promise<ServiceResponse<T>> {
    // Supabase no soporta transacciones explícitas en el cliente
    // Por ahora, usamos el cliente normal
    const transactionClient = new SupabaseTransactionClient(this.client);
    
    try {
      const result = await callback(transactionClient);
      return {
        success: true,
        data: result,
              };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
        data: undefined
              };
    }
  }

  escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  formatValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }
    return value;
  }
}

class SupabaseTransactionClient implements ITransactionClient {
  constructor(private client: SupabaseClient) {}

  async query<T>(sql: string, params: QueryParams = {}): Promise<QueryResult<T>> {
    const { data, error } = await this.client.rpc('execute_sql', {
      sql_query: sql,
      params: params
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      rows: data || [],
      rowCount: data?.length || 0
    };
  }

  async queryOne<T>(sql: string, params: QueryParams = {}): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] || null;
  }
}