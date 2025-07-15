// Advisor Assigner Node - Principio de Responsabilidad Única
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase } from '../base/OptimaCxNodeBase';
import { AdvisorAssignerService } from './AdvisorAssignerService';

export class AdvisorAssigner extends OptimaCxNodeBase {
  description: INodeTypeDescription = {
    displayName: 'Advisor Assigner',
    name: 'advisorAssigner',
    icon: 'file:advisorAssigner.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Assign leads to advisors based on workload, specialty, and availability',
    defaults: {
      name: 'Advisor Assigner',
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
            name: 'Assign Advisor',
            value: 'assignAdvisor',
            description: 'Assign the best available advisor to a lead',
            action: 'Assign advisor to lead',
          },
          {
            name: 'Get Available Advisors',
            value: 'getAvailableAdvisors',
            description: 'Get list of available advisors with workload info',
            action: 'Get available advisors',
          },
          {
            name: 'Reassign Lead',
            value: 'reassignLead',
            description: 'Reassign a lead to a different advisor',
            action: 'Reassign lead',
          },
          {
            name: 'Get Advisor Workload',
            value: 'getAdvisorWorkload',
            description: 'Get current workload for advisor(s)',
            action: 'Get advisor workload',
          },
          {
            name: 'Update Availability',
            value: 'updateAvailability',
            description: 'Update advisor availability status',
            action: 'Update advisor availability',
          },
        ],
        default: 'assignAdvisor',
      },

      // Lead Data (for assignment operations)
      {
        displayName: 'Lead Data',
        name: 'leadData',
        type: 'collection',
        placeholder: 'Add Lead Field',
        default: {},
        displayOptions: {
          show: {
            operation: ['assignAdvisor'],
          },
        },
        options: [
          {
            displayName: 'Lead ID',
            name: 'id',
            type: 'string',
            default: '',
            required: true,
            description: 'Unique identifier for the lead',
          },
          {
            displayName: 'Customer Name',
            name: 'nombre_cliente',
            type: 'string',
            default: '',
            description: 'Customer name',
          },
          {
            displayName: 'Phone Number',
            name: 'telefono_cliente',
            type: 'string',
            default: '',
            description: 'Customer phone number',
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
          {
            displayName: 'Source',
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
            displayName: 'Lead Quality',
            name: 'calidad',
            type: 'options',
            options: [
              { name: 'High', value: 'alta' },
              { name: 'Medium', value: 'media' },
              { name: 'Low', value: 'baja' },
            ],
            default: 'media',
          },
        ],
      },

      // Assignment Criteria
      {
        displayName: 'Assignment Criteria',
        name: 'assignmentCriteria',
        type: 'collection',
        placeholder: 'Add Criteria',
        default: {},
        displayOptions: {
          show: {
            operation: ['assignAdvisor'],
          },
        },
        options: [
          {
            displayName: 'Assignment Strategy',
            name: 'strategy',
            type: 'options',
            options: [
              { name: 'Balanced Workload', value: 'balanced_workload' },
              { name: 'Specialty Match', value: 'specialty_match' },
              { name: 'Best Performance', value: 'best_performance' },
              { name: 'Round Robin', value: 'round_robin' },
            ],
            default: 'balanced_workload',
            description: 'Strategy for selecting the best advisor',
          },
          {
            displayName: 'Preferred Specialty',
            name: 'preferredSpecialty',
            type: 'options',
            options: [
              { name: 'New Vehicle Sales', value: 'ventas_nuevos' },
              { name: 'Used Vehicle Sales', value: 'ventas_usados' },
              { name: 'Post-Sales Service', value: 'post_venta' },
              { name: 'Financing', value: 'financiamiento' },
            ],
            default: 'ventas_nuevos',
            description: 'Preferred advisor specialty for this lead',
          },
          {
            displayName: 'Max Workload',
            name: 'maxWorkload',
            type: 'number',
            default: 8,
            description: 'Maximum current workload for advisor selection',
          },
          {
            displayName: 'Consider Performance',
            name: 'considerPerformance',
            type: 'boolean',
            default: true,
            description: 'Factor in advisor performance metrics',
          },
        ],
      },

      // Filters (for getting available advisors)
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            operation: ['getAvailableAdvisors'],
          },
        },
        options: [
          {
            displayName: 'Specialty',
            name: 'specialty',
            type: 'options',
            options: [
              { name: 'New Vehicle Sales', value: 'ventas_nuevos' },
              { name: 'Used Vehicle Sales', value: 'ventas_usados' },
              { name: 'Post-Sales Service', value: 'post_venta' },
              { name: 'Financing', value: 'financiamiento' },
            ],
            default: '',
            description: 'Filter by advisor specialty',
          },
          {
            displayName: 'Max Workload',
            name: 'maxWorkload',
            type: 'number',
            default: 10,
            description: 'Maximum current leads per advisor',
          },
          {
            displayName: 'Only Available',
            name: 'onlyAvailable',
            type: 'boolean',
            default: true,
            description: 'Only show currently available advisors',
          },
          {
            displayName: 'Min Performance Rating',
            name: 'minRating',
            type: 'number',
            typeOptions: {
              minValue: 1,
              maxValue: 5,
              numberStepSize: 0.1,
            },
            default: 4.0,
            description: 'Minimum performance rating (1-5)',
          },
        ],
      },

      // Lead ID and Advisor ID (for reassignment and workload)
      {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['reassignLead'],
          },
        },
        description: 'ID of the lead to reassign',
      },

      {
        displayName: 'Current Advisor ID',
        name: 'currentAdvisorId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['reassignLead'],
          },
        },
        description: 'ID of the current advisor assigned to the lead',
      },

      {
        displayName: 'Reassignment Reason',
        name: 'reassignmentReason',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['reassignLead'],
          },
        },
        description: 'Reason for reassigning the lead',
      },

      // Advisor ID (for workload and availability operations)
      {
        displayName: 'Advisor ID',
        name: 'advisorId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['getAdvisorWorkload', 'updateAvailability'],
          },
        },
        description: 'Specific advisor ID (leave empty for all advisors in workload operation)',
      },

      {
        displayName: 'Include Details',
        name: 'includeDetails',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: ['getAdvisorWorkload'],
          },
        },
        description: 'Include detailed lead and schedule information',
      },

      // Availability Update
      {
        displayName: 'Is Available',
        name: 'isAvailable',
        type: 'boolean',
        default: true,
        required: true,
        displayOptions: {
          show: {
            operation: ['updateAvailability'],
          },
        },
        description: 'Set advisor availability status',
      },

      {
        displayName: 'Reason',
        name: 'reason',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['updateAvailability'],
          },
        },
        description: 'Reason for availability change',
      },

      {
        displayName: 'Duration (minutes)',
        name: 'duration',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            operation: ['updateAvailability'],
            isAvailable: [false],
          },
        },
        description: 'Auto-restore availability after this many minutes (0 = manual restore)',
      },

      // Assignment Strategy Options
      {
        displayName: 'Strategy Options',
        name: 'strategyOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Assignment Strategy',
            name: 'assignmentStrategy',
            type: 'options',
            options: [
              { name: 'Balanced Workload', value: 'balanced_workload' },
              { name: 'Specialty Match', value: 'specialty_match' },
              { name: 'Best Performance', value: 'best_performance' },
              { name: 'Round Robin', value: 'round_robin' },
            ],
            default: 'balanced_workload',
            description: 'Default assignment strategy',
          },
          {
            displayName: 'Consider Specialty',
            name: 'considerSpecialty',
            type: 'boolean',
            default: true,
            description: 'Factor in advisor specialty when assigning',
          },
          {
            displayName: 'Consider Availability',
            name: 'considerAvailability',
            type: 'boolean',
            default: true,
            description: 'Only assign to available advisors',
          },
          {
            displayName: 'Workload Balancing Weight',
            name: 'workloadWeight',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 1,
              numberStepSize: 0.1,
            },
            default: 0.4,
            description: 'Weight of workload balancing in selection (0-1)',
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
          {
            displayName: 'Auto Notify Advisor',
            name: 'autoNotifyAdvisor',
            type: 'boolean',
            default: true,
            description: 'Automatically notify advisor of new assignment',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const operation = this.getNodeParameter('operation', 0) as string;
    
    // Combinar opciones de estrategia y opciones adicionales
    const strategyOptions = this.getNodeParameter('strategyOptions', 0, {}) as any;
    const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as any;
    
    const combinedOptions = {
      ...strategyOptions,
      ...additionalOptions
    };
    
    // Principio de Inversión de Dependencias - inyectar servicio
    const service = new AdvisorAssignerService(
      await this.getCredentials('optimaCxApi'),
      combinedOptions
    );

    // Usar template method del base class
    return await this.executeWithErrorHandling.call(this, service, operation);
  }
}