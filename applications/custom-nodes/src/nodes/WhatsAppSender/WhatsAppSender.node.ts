// WhatsApp Sender Node - Principio de Responsabilidad Única
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase } from '../base/OptimaCxNodeBase';
import { WhatsAppSenderService } from './WhatsAppSenderService';

export class WhatsAppSender extends OptimaCxNodeBase {
  description: INodeTypeDescription = {
    displayName: 'WhatsApp Sender',
    name: 'whatsAppSender',
    icon: 'file:whatsapp.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Send messages via WhatsApp Business API with rich media support',
    defaults: {
      name: 'WhatsApp Sender',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'optimaCxApi',
        required: true,
      },
      {
        name: 'whatsAppBusiness',
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
            name: 'Send Message',
            value: 'sendMessage',
            description: 'Send a text message',
            action: 'Send text message',
          },
          {
            name: 'Send Template',
            value: 'sendTemplate',
            description: 'Send a pre-approved template message',
            action: 'Send template message',
          },
          {
            name: 'Send Media',
            value: 'sendMedia',
            description: 'Send image, video, audio, or document',
            action: 'Send media message',
          },
          {
            name: 'Send Interactive',
            value: 'sendInteractive',
            description: 'Send interactive message with buttons',
            action: 'Send interactive message',
          },
          {
            name: 'Mark as Read',
            value: 'markAsRead',
            description: 'Mark a received message as read',
            action: 'Mark message as read',
          },
          {
            name: 'Get Delivery Status',
            value: 'getDeliveryStatus',
            description: 'Check message delivery status',
            action: 'Get delivery status',
          },
        ],
        default: 'sendMessage',
      },

      // Recipient Phone (common field)
      {
        displayName: 'Recipient Phone',
        name: 'recipientPhone',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendMessage', 'sendTemplate', 'sendMedia', 'sendInteractive'],
          },
        },
        description: 'Phone number of the recipient (with country code)',
        placeholder: '+56912345678',
      },

      // Text Message Fields
      {
        displayName: 'Message Text',
        name: 'messageText',
        type: 'string',
        typeOptions: {
          alwaysOpenEditWindow: true,
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendMessage'],
          },
        },
        description: 'The text message to send',
      },

      {
        displayName: 'Message Options',
        name: 'messageOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            operation: ['sendMessage'],
          },
        },
        options: [
          {
            displayName: 'Enable Preview',
            name: 'enablePreview',
            type: 'boolean',
            default: false,
            description: 'Enable URL preview in the message',
          },
        ],
      },

      // Template Message Fields
      {
        displayName: 'Template Name',
        name: 'templateName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendTemplate'],
          },
        },
        description: 'Name of the approved template',
        placeholder: 'welcome_message',
      },

      {
        displayName: 'Template Language',
        name: 'templateLanguage',
        type: 'options',
        options: [
          { name: 'Spanish', value: 'es' },
          { name: 'English', value: 'en' },
          { name: 'Portuguese', value: 'pt' },
        ],
        default: 'es',
        displayOptions: {
          show: {
            operation: ['sendTemplate'],
          },
        },
        description: 'Language code for the template',
      },

      {
        displayName: 'Template Parameters',
        name: 'templateParams',
        type: 'fixedCollection',
        placeholder: 'Add Parameter',
        default: { parameters: [] },
        displayOptions: {
          show: {
            operation: ['sendTemplate'],
          },
        },
        options: [
          {
            name: 'parameters',
            displayName: 'Parameters',
            values: [
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Parameter value to substitute in template',
              },
            ],
          },
        ],
      },

      // Media Message Fields
      {
        displayName: 'Media Type',
        name: 'mediaType',
        type: 'options',
        options: [
          { name: 'Image', value: 'image' },
          { name: 'Video', value: 'video' },
          { name: 'Audio', value: 'audio' },
          { name: 'Document', value: 'document' },
        ],
        default: 'image',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendMedia'],
          },
        },
        description: 'Type of media to send',
      },

      {
        displayName: 'Media Source',
        name: 'mediaSource',
        type: 'options',
        options: [
          { name: 'URL', value: 'url' },
          { name: 'Uploaded Media ID', value: 'id' },
        ],
        default: 'url',
        displayOptions: {
          show: {
            operation: ['sendMedia'],
          },
        },
        description: 'Source of the media file',
      },

      {
        displayName: 'Media URL',
        name: 'mediaUrl',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendMedia'],
            mediaSource: ['url'],
          },
        },
        description: 'Public URL of the media file',
        placeholder: 'https://example.com/image.jpg',
      },

      {
        displayName: 'Media ID',
        name: 'mediaId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendMedia'],
            mediaSource: ['id'],
          },
        },
        description: 'ID of previously uploaded media',
      },

      {
        displayName: 'Caption',
        name: 'caption',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['sendMedia'],
            mediaType: ['image', 'video', 'document'],
          },
        },
        description: 'Caption for the media (not available for audio)',
      },

      // Interactive Message Fields
      {
        displayName: 'Interactive Type',
        name: 'interactiveType',
        type: 'options',
        options: [
          { name: 'Button', value: 'button' },
          { name: 'List', value: 'list' },
        ],
        default: 'button',
        displayOptions: {
          show: {
            operation: ['sendInteractive'],
          },
        },
        description: 'Type of interactive message',
      },

      {
        displayName: 'Header Text',
        name: 'headerText',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['sendInteractive'],
          },
        },
        description: 'Header text for the interactive message (optional)',
      },

      {
        displayName: 'Body Text',
        name: 'bodyText',
        type: 'string',
        typeOptions: {
          alwaysOpenEditWindow: true,
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['sendInteractive'],
          },
        },
        description: 'Main body text of the interactive message',
      },

      {
        displayName: 'Footer Text',
        name: 'footerText',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['sendInteractive'],
          },
        },
        description: 'Footer text for the interactive message (optional)',
      },

      {
        displayName: 'Buttons',
        name: 'buttons',
        type: 'fixedCollection',
        placeholder: 'Add Button',
        default: { buttons: [] },
        displayOptions: {
          show: {
            operation: ['sendInteractive'],
            interactiveType: ['button'],
          },
        },
        options: [
          {
            name: 'buttons',
            displayName: 'Buttons',
            values: [
              {
                displayName: 'Button ID',
                name: 'id',
                type: 'string',
                default: '',
                description: 'Unique ID for the button',
              },
              {
                displayName: 'Button Title',
                name: 'title',
                type: 'string',
                default: '',
                required: true,
                description: 'Text displayed on the button (max 20 chars)',
              },
            ],
          },
        ],
      },

      // Message ID (for status operations)
      {
        displayName: 'Message ID',
        name: 'messageId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['markAsRead', 'getDeliveryStatus'],
          },
        },
        description: 'WhatsApp message ID',
        placeholder: 'wamid.xxx',
      },

      // Phone Number Validation
      {
        displayName: 'Phone Validation',
        name: 'phoneValidation',
        type: 'collection',
        placeholder: 'Add Validation Option',
        default: {},
        options: [
          {
            displayName: 'Validate Phone Numbers',
            name: 'validatePhoneNumbers',
            type: 'boolean',
            default: true,
            description: 'Validate phone number format before sending',
          },
          {
            displayName: 'Auto Format Phone',
            name: 'autoFormatPhone',
            type: 'boolean',
            default: true,
            description: 'Automatically format phone numbers',
          },
          {
            displayName: 'Default Country Code',
            name: 'defaultCountryCode',
            type: 'options',
            options: [
              { name: 'Chile (+56)', value: '56' },
              { name: 'Argentina (+54)', value: '54' },
              { name: 'Peru (+51)', value: '51' },
              { name: 'Colombia (+57)', value: '57' },
            ],
            default: '56',
            description: 'Default country code for phone numbers',
          },
        ],
      },

      // Delivery Options
      {
        displayName: 'Delivery Options',
        name: 'deliveryOptions',
        type: 'collection',
        placeholder: 'Add Delivery Option',
        default: {},
        options: [
          {
            displayName: 'Enable Delivery Tracking',
            name: 'enableDeliveryTracking',
            type: 'boolean',
            default: true,
            description: 'Track message delivery status',
          },
          {
            displayName: 'Retry Failed Messages',
            name: 'retryFailedMessages',
            type: 'boolean',
            default: false,
            description: 'Automatically retry failed messages',
          },
          {
            displayName: 'Max Retry Attempts',
            name: 'maxRetryAttempts',
            type: 'number',
            default: 3,
            displayOptions: {
              show: {
                retryFailedMessages: [true],
              },
            },
            description: 'Maximum number of retry attempts',
          },
          {
            displayName: 'Retry Delay (seconds)',
            name: 'retryDelay',
            type: 'number',
            default: 60,
            displayOptions: {
              show: {
                retryFailedMessages: [true],
              },
            },
            description: 'Delay between retry attempts',
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
            description: 'Timeout for API calls in seconds',
          },
          {
            displayName: 'Rate Limit (messages/minute)',
            name: 'rateLimit',
            type: 'number',
            default: 80,
            description: 'Maximum messages per minute (WhatsApp limit is 80)',
          },
          {
            displayName: 'Store Message History',
            name: 'storeHistory',
            type: 'boolean',
            default: true,
            description: 'Store sent messages in history for tracking',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const operation = this.getNodeParameter('operation', 0) as string;
    
    // Combinar todas las opciones de configuración
    const phoneValidation = this.getNodeParameter('phoneValidation', 0, {}) as any;
    const deliveryOptions = this.getNodeParameter('deliveryOptions', 0, {}) as any;
    const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as any;
    
    const combinedOptions = {
      ...phoneValidation,
      ...deliveryOptions,
      ...additionalOptions
    };
    
    // Principio de Inversión de Dependencias - inyectar servicio con ambas credenciales
    const service = new WhatsAppSenderService(
      await this.getCredentials('optimaCxApi'),
      await this.getCredentials('whatsAppBusiness'),
      combinedOptions
    );

    // Usar template method del base class
    return await this.executeWithErrorHandling.call(this, service, operation);
  }
}