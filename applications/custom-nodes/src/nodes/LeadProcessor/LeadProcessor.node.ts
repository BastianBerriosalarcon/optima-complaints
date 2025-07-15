// Lead Processor Node - Principio de Responsabilidad Única
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase, IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';
import { LeadProcessorService } from './LeadProcessorService';

export class LeadProcessor extends OptimaCxNodeBase {
  description: INodeTypeDescription = {
    displayName: 'Lead Processor',
    name: 'leadProcessor',
    icon: 'file:leadProcessor.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Process leads with AI analysis and business logic',
    defaults: {
      name: 'Lead Processor',
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
            name: 'Create Lead',
            value: 'createLead',
            description: 'Create a new lead from message data',
            action: 'Create a new lead',
          },
          {
            name: 'Update Lead',
            value: 'updateLead',
            description: 'Update existing lead with new information',
            action: 'Update an existing lead',
          },
          {
            name: 'Analyze Message',
            value: 'analyzeMessage',
            description: 'Analyze message content with AI',
            action: 'Analyze message with AI',
          },
          {
            name: 'Assign Advisor',
            value: 'assignAdvisor',
            description: 'Assign the best advisor to a lead',
            action: 'Assign advisor to lead',
          },
        ],
        default: 'createLead',
      },
      
      // Create Lead Operation
      {
        displayName: 'Lead Data',
        name: 'leadData',
        type: 'collection',
        placeholder: 'Add Lead Field',
        default: {},
        displayOptions: {
          show: {
            operation: ['createLead'],
          },
        },
        options: [
          {
            displayName: 'Phone Number',
            name: 'telefono_cliente',
            type: 'string',
            default: '',
            required: true,
            description: 'Customer phone number',
          },
          {
            displayName: 'Customer Name',
            name: 'nombre_cliente',
            type: 'string',
            default: '',
            description: 'Customer name (optional)',
          },
          {
            displayName: 'Email',
            name: 'email_cliente',
            type: 'string',
            default: '',
            description: 'Customer email (optional)',
          },
          {
            displayName: 'Origin',
            name: 'origen',
            type: 'options',
            options: [
              { name: 'WhatsApp', value: 'whatsapp' },
              { name: 'Phone', value: 'telefono' },
              { name: 'Email', value: 'email' },
              { name: 'Web', value: 'web' },
              { name: 'Referral', value: 'referido' },
            ],
            default: 'whatsapp',
          },
          {
            displayName: 'Initial Message',
            name: 'mensaje_inicial',
            type: 'string',
            typeOptions: {
              alwaysOpenEditWindow: true,
            },
            default: '',
            description: 'The initial message from the customer',
          },
        ],
      },

      // Update Lead Operation  
      {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['updateLead', 'assignAdvisor'],
          },
        },
        description: 'ID of the lead to update',
      },

      // Analyze Message Operation
      {
        displayName: 'Message Content',
        name: 'messageContent',
        type: 'string',
        typeOptions: {
          alwaysOpenEditWindow: true,
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['analyzeMessage'],
          },
        },
        description: 'Message content to analyze',
      },

      {
        displayName: 'Analysis Context',
        name: 'analysisContext',
        type: 'collection',
        placeholder: 'Add Context',
        default: {},
        displayOptions: {
          show: {
            operation: ['analyzeMessage'],
          },
        },
        options: [
          {
            displayName: 'Customer History',
            name: 'customerHistory',
            type: 'string',
            default: '',
            description: 'Previous interactions with customer',
          },
          {
            displayName: 'Business Context',
            name: 'businessContext',
            type: 'options',
            options: [
              { name: 'Sales', value: 'ventas' },
              { name: 'Post-Sales', value: 'post_venta' },
              { name: 'General', value: 'general' },
            ],
            default: 'ventas',
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
    const service = new LeadProcessorService(
      await this.getCredentials('optimaCxApi'),
      this.getNodeParameter('additionalOptions', 0, {}) as any
    );

    // Usar template method del base class
    return await this.executeWithErrorHandling.call(this, service, operation);
  }
}