// Data Service Interface - Principio de Inversión de Dependencias (DIP)
import { ServiceResponse, WorkflowContext } from '../../types/core';

export interface QueryParams {
  [key: string]: any;
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  fields?: any[];
}

// Abstracción para operaciones de base de datos
export interface IDataService {
  // Operaciones básicas de consulta
  query<T>(sql: string, params?: QueryParams, context?: WorkflowContext): Promise<ServiceResponse<QueryResult<T>>>;
  queryOne<T>(sql: string, params?: QueryParams, context?: WorkflowContext): Promise<ServiceResponse<T | null>>;
  
  // Transacciones
  transaction<T>(callback: (client: ITransactionClient) => Promise<T>, context?: WorkflowContext): Promise<ServiceResponse<T>>;
  
  // Utilidades
  escapeIdentifier(identifier: string): string;
  formatValue(value: any): any;
}

export interface ITransactionClient {
  query<T>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
  queryOne<T>(sql: string, params?: QueryParams): Promise<T | null>;
}

// Repository pattern para entidades específicas
export interface IRepository<T, TCreate, TUpdate> {
  create(data: TCreate, context: WorkflowContext): Promise<ServiceResponse<T>>;
  findById(id: string, context: WorkflowContext): Promise<ServiceResponse<T | null>>;
  update(id: string, data: TUpdate, context: WorkflowContext): Promise<ServiceResponse<T>>;
  delete(id: string, context: WorkflowContext): Promise<ServiceResponse<void>>;
  findMany(filters: Record<string, any>, context: WorkflowContext): Promise<ServiceResponse<T[]>>;
}

// Repositorios específicos
export interface ILeadRepository extends IRepository<any, any, any> {
  findByPhone(phone: string, tenantId: string, context: WorkflowContext): Promise<ServiceResponse<any | null>>;
  findByTenant(tenantId: string, filters: any, context: WorkflowContext): Promise<ServiceResponse<any[]>>;
  updateStatus(id: string, status: string, context: WorkflowContext): Promise<ServiceResponse<any>>;
}

export interface ITenantRepository extends IRepository<any, any, any> {
  findByPhoneId(phoneId: string, context: WorkflowContext): Promise<ServiceResponse<any | null>>;
  getAIConfig(tenantId: string, context: WorkflowContext): Promise<ServiceResponse<any>>;
}

export interface IAdvisorRepository extends IRepository<any, any, any> {
  findAvailableAdvisors(tenantId: string, specialty: string, context: WorkflowContext): Promise<ServiceResponse<any[]>>;
  updateLeadCount(advisorId: string, increment: number, context: WorkflowContext): Promise<ServiceResponse<void>>;
}