// AI Analyzer Node - Principio de Responsabilidad Única
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase } from '../base/OptimaCxNodeBase';
import { AIAnalyzerService } from './AIAnalyzerService';

export class AIAnalyzer extends OptimaCxNodeBase {
  description: INodeTypeDescription = {
    displayName: 'AI Analyzer',
    name: 'aiAnalyzer',
    icon: 'file:aiAnalyzer.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Analyze messages and leads using AI and NLP techniques',
    defaults: {
      name: 'AI Analyzer',
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
            name: 'Analyze Intent',
            value: 'analyzeIntent',
            description: 'Analyze customer message intent',
            action: 'Analyze message intent',
          },
          {
            name: 'Extract Entities',
            value: 'extractEntities',
            description: 'Extract entities from message',
            action: 'Extract entities',
          },
          {
            name: 'Classify Lead',
            value: 'classifyLead',
            description: 'Classify lead quality and characteristics',
            action: 'Classify lead',
          },
          {
            name: 'Generate Response',
            value: 'generateResponse',
            description: 'Generate automatic response suggestions',
            action: 'Generate response',
          },
          {
            name: 'Sentiment Analysis',
            value: 'sentimentAnalysis',
            description: 'Analyze message sentiment and emotions',
            action: 'Analyze sentiment',
          },
        ],
        default: 'analyzeIntent',
      },

      // Message Content (used by multiple operations)
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
            operation: ['analyzeIntent', 'extractEntities', 'generateResponse', 'sentimentAnalysis'],
          },
        },
        description: 'The message content to analyze',
      },

      // Business Context (for intent analysis)
      {
        displayName: 'Business Context',
        name: 'businessContext',
        type: 'options',
        options: [
          { name: 'Automotive', value: 'automotive' },
          { name: 'Real Estate', value: 'real_estate' },
          { name: 'Insurance', value: 'insurance' },
          { name: 'General', value: 'general' },
        ],
        default: 'automotive',
        displayOptions: {
          show: {
            operation: ['analyzeIntent'],
          },
        },
        description: 'Business context for intent analysis',
      },

      // Entity Types (for entity extraction)
      {
        displayName: 'Entity Types',
        name: 'entityTypes',
        type: 'multiOptions',
        options: [
          { name: 'Persons', value: 'personas' },
          { name: 'Vehicles', value: 'vehiculos' },
          { name: 'Prices', value: 'precios' },
          { name: 'Dates', value: 'fechas' },
          { name: 'Contact Info', value: 'contacto' },
          { name: 'Locations', value: 'ubicaciones' },
          { name: 'Car Brands/Models', value: 'marcas_modelos' },
        ],
        default: [],
        displayOptions: {
          show: {
            operation: ['extractEntities'],
          },
        },
        description: 'Types of entities to extract (leave empty for all)',
      },

      // Lead Data (for lead classification)
      {
        displayName: 'Lead Data',
        name: 'leadData',
        type: 'collection',
        placeholder: 'Add Lead Field',
        default: {},
        displayOptions: {
          show: {
            operation: ['classifyLead'],
          },
        },
        options: [
          {
            displayName: 'Lead ID',
            name: 'id',
            type: 'string',
            default: '',
            description: 'Unique identifier for the lead',
          },
          {
            displayName: 'Phone Number',
            name: 'telefono_cliente',
            type: 'string',
            default: '',
            description: 'Customer phone number',
          },
          {
            displayName: 'Email',
            name: 'email_cliente',
            type: 'string',
            default: '',
            description: 'Customer email',
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
        ],
      },

      // Response Type (for response generation)
      {
        displayName: 'Response Type',
        name: 'responseType',
        type: 'options',
        options: [
          { name: 'Auto (Smart)', value: 'auto' },
          { name: 'Informational', value: 'informativo' },
          { name: 'Sales Focused', value: 'ventas' },
          { name: 'Customer Service', value: 'servicio_cliente' },
          { name: 'Appointment Booking', value: 'agendamiento' },
        ],
        default: 'auto',
        displayOptions: {
          show: {
            operation: ['generateResponse'],
          },
        },
        description: 'Type of response to generate',
      },

      // Customer Context (for response generation)
      {
        displayName: 'Customer Context',
        name: 'customerContext',
        type: 'collection',
        placeholder: 'Add Context',
        default: {},
        displayOptions: {
          show: {
            operation: ['generateResponse'],
          },
        },
        options: [
          {
            displayName: 'Customer Name',
            name: 'customerName',
            type: 'string',
            default: '',
            description: 'Customer name for personalization',
          },
          {
            displayName: 'Previous Interactions',
            name: 'previousInteractions',
            type: 'number',
            default: 0,
            description: 'Number of previous interactions',
          },
          {
            displayName: 'Interest Level',
            name: 'interestLevel',
            type: 'options',
            options: [
              { name: 'Low', value: 'bajo' },
              { name: 'Medium', value: 'medio' },
              { name: 'High', value: 'alto' },
            ],
            default: 'medio',
          },
          {
            displayName: 'Preferred Products',
            name: 'preferredProducts',
            type: 'string',
            default: '',
            description: 'Customer preferred vehicle types or models',
          },
        ],
      },

      // AI Model Configuration
      {
        displayName: 'AI Model Configuration',
        name: 'aiConfig',
        type: 'collection',
        placeholder: 'Add AI Config',
        default: {},
        options: [
          {
            displayName: 'Model',
            name: 'aiModel',
            type: 'options',
            options: [
              { name: 'GPT-4', value: 'gpt-4' },
              { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
              { name: 'Rule-based', value: 'rule_based' },
            ],
            default: 'gpt-4',
            description: 'AI model to use for analysis',
          },
          {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 2,
              numberStepSize: 0.1,
            },
            default: 0.7,
            description: 'Creativity level for AI responses (0-2)',
          },
          {
            displayName: 'Max Tokens',
            name: 'maxTokens',
            type: 'number',
            default: 500,
            description: 'Maximum tokens for AI response',
          },
          {
            displayName: 'Enable Context Memory',
            name: 'enableContextMemory',
            type: 'boolean',
            default: true,
            description: 'Use conversation history for better analysis',
          },
        ],
      },

      // Analysis Options
      {
        displayName: 'Analysis Options',
        name: 'analysisOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Include Confidence Scores',
            name: 'includeConfidence',
            type: 'boolean',
            default: true,
            description: 'Include confidence scores in results',
          },
          {
            displayName: 'Include Alternatives',
            name: 'includeAlternatives',
            type: 'boolean',
            default: false,
            description: 'Include alternative interpretations',
          },
          {
            displayName: 'Detailed Analysis',
            name: 'detailedAnalysis',
            type: 'boolean',
            default: true,
            description: 'Provide detailed analysis breakdown',
          },
          {
            displayName: 'Language',
            name: 'language',
            type: 'options',
            options: [
              { name: 'Spanish', value: 'es' },
              { name: 'English', value: 'en' },
              { name: 'Portuguese', value: 'pt' },
            ],
            default: 'es',
            description: 'Language for analysis',
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
            description: 'Timeout for AI operations in seconds',
          },
          {
            displayName: 'Retry Count',
            name: 'retryCount',
            type: 'number',
            default: 3,
            description: 'Number of retries for failed operations',
          },
          {
            displayName: 'Cache Results',
            name: 'cacheResults',
            type: 'boolean',
            default: true,
            description: 'Cache analysis results for similar inputs',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const operation = this.getNodeParameter('operation', 0) as string;
    
    // Combinar configuraciones AI y opciones adicionales
    const aiConfig = this.getNodeParameter('aiConfig', 0, {}) as any;
    const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as any;
    const analysisOptions = this.getNodeParameter('analysisOptions', 0, {}) as any;
    
    const combinedOptions = {
      ...aiConfig,
      ...additionalOptions,
      ...analysisOptions
    };
    
    // Principio de Inversión de Dependencias - inyectar servicio
    const service = new AIAnalyzerService(
      await this.getCredentials('optimaCxApi'),
      combinedOptions
    );

    // Usar template method del base class
    return await this.executeWithErrorHandling.call(this, service, operation);
  }
}