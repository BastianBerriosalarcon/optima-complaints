// Base class for OptimaCX Nodes - Principio de Inversión de Dependencias (DIP)
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ServiceResponse, WorkflowContext } from '@shared/types/core';

// Interfaz base para servicios de nodos (ISP - Interface Segregation Principle)
export interface IOptimaCxNodeService {
  execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>>;
  validate(input: any): Promise<ServiceResponse<boolean>>;
}

// Clase base abstracta siguiendo principios SOLID
export abstract class OptimaCxNodeBase implements INodeType {
  abstract description: INodeTypeDescription;

  // Principio de Responsabilidad Única - manejo de errores centralizado
  protected handleError(error: any, context: string): NodeOperationError {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error(`[${this.description.name}] Error in ${context}:`, error);
    
    return new NodeOperationError(
      this.description,
      `${context}: ${errorMessage}`,
      {
        description: 'Check the node configuration and input data',
        timestamp: new Date().toISOString(),
        context
      }
    );
  }

  // Principio de Responsabilidad Única - construcción de contexto de workflow
  protected buildWorkflowContext(executeFunctions: IExecuteFunctions): WorkflowContext {
    const workflowData = executeFunctions.getWorkflowDataProxy();
    const nodeData = executeFunctions.getNode();
    
    return {
      tenant_id: '', // Se obtendrá de las credenciales
      correlation_id: `${workflowData.workflow.id}-${nodeData.id}-${Date.now()}`,
      timestamp: new Date(),
      user_id: undefined,
      lead_id: undefined,
      message_id: undefined
    };
  }

  // Principio de Responsabilidad Única - obtención segura de credenciales
  protected async getCredentials(executeFunctions: IExecuteFunctions, credentialType: string): Promise<any> {
    try {
      const credentials = await executeFunctions.getCredentials(credentialType);
      if (!credentials) {
        throw new Error(`${credentialType} credentials not configured`);
      }
      return credentials;
    } catch (error) {
      throw this.handleError(error, 'credential_retrieval');
    }
  }

  // Principio de Responsabilidad Única - validación de entrada
  protected validateInput(input: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => {
      const value = this.getNestedProperty(input, field);
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  // Utilidad para acceder a propiedades anidadas
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Principio de Responsabilidad Única - formateo de salida
  protected formatOutput(data: any, metadata?: any): INodeExecutionData[] {
    return [
      {
        json: {
          ...data,
          _metadata: {
            timestamp: new Date().toISOString(),
            node: this.description.name,
            version: this.description.version,
            ...metadata
          }
        }
      }
    ];
  }

  // Principio de Responsabilidad Única - logging estructurado
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      node: this.description.name,
      message,
      data: data || {}
    };

    switch (level) {
      case 'error':
        console.error(JSON.stringify(logEntry));
        break;
      case 'warn':
        console.warn(JSON.stringify(logEntry));
        break;
      default:
        console.log(JSON.stringify(logEntry));
    }
  }

  // Método abstracto que deben implementar los nodos específicos
  abstract execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;

  // Principio Abierto/Cerrado - template method pattern
  protected async executeWithErrorHandling(
    this: IExecuteFunctions,
    service: IOptimaCxNodeService,
    operation: string
  ): Promise<INodeExecutionData[][]> {
    try {
      const input = this.getInputData();
      const context = (this as any).buildWorkflowContext(this);

      // Validar entrada
      const validation = await service.validate(input[0]?.json || {});
      if (!validation.success) {
        throw new Error(validation.error || 'Input validation failed');
      }

      // Ejecutar operación
      const result = await service.execute(this, input[0]?.json || {});
      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      // Log exitoso
      (this as any).log('info', `${operation} completed successfully`, {
        inputSize: input.length,
        outputData: result.data
      });

      // Formatear salida
      return [(this as any).formatOutput(result.data, { operation })];

    } catch (error) {
      (this as any).log('error', `${operation} failed`, { error: error.message });
      throw (this as any).handleError(error, operation);
    }
  }
}