// Tenant Config Loader Node - Principio de Responsabilidad Única
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase } from '../base/OptimaCxNodeBase';
import { TenantConfigLoaderService } from './TenantConfigLoaderService';

export class TenantConfigLoader extends OptimaCxNodeBase {
  description: INodeTypeDescription = {
    displayName: 'Tenant Config Loader',
    name: 'tenantConfigLoader',
    icon: 'file:tenantConfig.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Load and validate tenant configuration and business rules',
    defaults: {
      name: 'Tenant Config Loader',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'optimaCxApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Load Configuration',
            value: 'loadConfig',
            description: 'Load complete tenant configuration',
            action: 'Load tenant configuration',
          },
          {
            name: 'Validate Phone Number',
            value: 'validatePhone',
            description: 'Validate and format phone number',
            action: 'Validate phone number',
          },
          {
            name: 'Check Business Hours',
            value: 'checkBusinessHours',
            description: 'Check if business is currently open',
            action: 'Check business hours',
          },
          {
            name: 'Get Active Workflows',
            value: 'getWorkflows',
            description: 'Get list of active workflows for tenant',
            action: 'Get active workflows',
          },
        ],
        default: 'loadConfig',
      },

      // Validate Phone Operation
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['validatePhone'],
          },
        },
        description: 'Phone number to validate and format',
        placeholder: '+56912345678',
      },

      // Configuration Options
      {
        displayName: 'Configuration Options',
        name: 'configOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Include AI Config',
            name: 'includeAiConfig',
            type: 'boolean',
            default: true,
            description: 'Include AI configuration in response',
          },
          {
            displayName: 'Include Team Config',
            name: 'includeTeamConfig',
            type: 'boolean',
            default: true,
            description: 'Include sales team configuration',
          },
          {
            displayName: 'Include Business Hours',
            name: 'includeBusinessHours',
            type: 'boolean',
            default: true,
            description: 'Include business hours configuration',
          },
          {
            displayName: 'Cache Duration (minutes)',
            name: 'cacheDuration',
            type: 'number',
            default: 30,
            description: 'How long to cache configuration data',
          },
        ],
      },

      // Validation Options
      {
        displayName: 'Validation Options',
        name: 'validationOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            operation: ['validatePhone'],
          },
        },
        options: [
          {
            displayName: 'Country Code',
            name: 'countryCode',
            type: 'options',
            options: [
              { name: 'Chile (+56)', value: 'CL' },
              { name: 'Argentina (+54)', value: 'AR' },
              { name: 'Peru (+51)', value: 'PE' },
              { name: 'Colombia (+57)', value: 'CO' },
            ],
            default: 'CL',
            description: 'Expected country for phone validation',
          },
          {
            displayName: 'Format for WhatsApp',
            name: 'formatForWhatsApp',
            type: 'boolean',
            default: true,
            description: 'Format number for WhatsApp API usage',
          },
          {
            displayName: 'Strict Validation',
            name: 'strictValidation',
            type: 'boolean',
            default: false,
            description: 'Use strict validation rules',
          },
        ],
      },

      // Business Hours Options
      {
        displayName: 'Business Hours Options',
        name: 'businessHoursOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            operation: ['checkBusinessHours'],
          },
        },
        options: [
          {
            displayName: 'Timezone',
            name: 'timezone',
            type: 'options',
            options: [
              { name: 'Santiago (America/Santiago)', value: 'America/Santiago' },
              { name: 'Buenos Aires (America/Argentina/Buenos_Aires)', value: 'America/Argentina/Buenos_Aires' },
              { name: 'Lima (America/Lima)', value: 'America/Lima' },
              { name: 'Bogota (America/Bogota)', value: 'America/Bogota' },
            ],
            default: 'America/Santiago',
            description: 'Timezone for business hours calculation',
          },
          {
            displayName: 'Include Next Open Time',
            name: 'includeNextOpen',
            type: 'boolean',
            default: true,
            description: 'Calculate next business opening time',
          },
        ],
      },

      // Advanced Options
      {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Enable Logging',
            name: 'enableLogging',
            type: 'boolean',
            default: true,
            description: 'Enable detailed logging for debugging',
          },
          {
            displayName: 'Timeout (seconds)',
            name: 'timeout',
            type: 'number',
            default: 30,
            description: 'Timeout for operations in seconds',
          },
          {
            displayName: 'Retry Count',
            name: 'retryCount',
            type: 'number',
            default: 3,
            description: 'Number of retries for failed operations',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const operation = this.getNodeParameter('operation', 0) as string;
    
    // Principio de Inversión de Dependencias - inyectar servicio
    const service = new TenantConfigLoaderService(
      await this.getCredentials('optimaCxApi'),
      this.getNodeParameter('additionalOptions', 0, {}) as any
    );

    // Usar template method del base class
    return await this.executeWithErrorHandling.call(this, service, operation);
  }
}