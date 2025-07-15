// WhatsApp Sender Service - Principio de Responsabilidad Única
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';

export class WhatsAppSenderService implements IOptimaCxNodeService {
  private credentials: any;
  private whatsappCredentials: any;
  private options: any;

  constructor(credentials: any, whatsappCredentials: any, options: any = {}) {
    this.credentials = credentials;
    this.whatsappCredentials = whatsappCredentials;
    this.options = {
      enableLogging: true,
      timeout: 30,
      retryCount: 3,
      validatePhoneNumbers: true,
      enableDeliveryTracking: true,
      ...options
    };
  }

  async validate(input: any): Promise<ServiceResponse<boolean>> {
    try {
      if (!input || typeof input !== 'object') {
        return {
          success: false,
          error: 'Input must be a valid object'
        };
      }

      if (!this.credentials.tenantId) {
        return {
          success: false,
          error: 'Tenant ID is required in credentials'
        };
      }

      if (!this.whatsappCredentials.accessToken) {
        return {
          success: false,
          error: 'WhatsApp access token is required'
        };
      }

      if (!this.whatsappCredentials.phoneNumberId) {
        return {
          success: false,
          error: 'WhatsApp phone number ID is required'
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error.message}`
      };
    }
  }

  async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const operation = context.getNodeParameter('operation', 0) as string;

      switch (operation) {
        case 'sendMessage':
          return await this.sendMessage(context, input);
        case 'sendTemplate':
          return await this.sendTemplate(context, input);
        case 'sendMedia':
          return await this.sendMedia(context, input);
        case 'sendInteractive':
          return await this.sendInteractiveMessage(context, input);
        case 'markAsRead':
          return await this.markMessageAsRead(context, input);
        case 'getDeliveryStatus':
          return await this.getDeliveryStatus(context, input);
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Execution failed: ${error.message}`
      };
    }
  }

  private async sendMessage(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
      const messageText = context.getNodeParameter('messageText', 0) as string;
      const messageOptions = context.getNodeParameter('messageOptions', 0, {}) as any;

      if (!recipientPhone || !messageText) {
        return {
          success: false,
          error: 'Recipient phone and message text are required'
        };
      }

      // Validar y formatear número de teléfono
      const formattedPhone = this.formatPhoneNumber(recipientPhone);
      if (!this.isValidPhoneNumber(formattedPhone)) {
        return {
          success: false,
          error: `Invalid phone number: ${recipientPhone}`
        };
      }

      // Construir payload del mensaje
      const messagePayload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: messageText,
          preview_url: messageOptions.enablePreview || false
        }
      };

      // Simular envío a WhatsApp API
      const response = await this.sendToWhatsAppAPI(messagePayload);

      const result = {
        message_id: response.messages[0].id,
        recipient_phone: formattedPhone,
        message_text: messageText,
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 5000).toISOString(), // 5 segundos
          tracking_enabled: this.options.enableDeliveryTracking
        },
        metadata: {
          operation: 'sendMessage',
          phone_number_id: this.whatsappCredentials.phoneNumberId,
          api_version: this.whatsappCredentials.apiVersion || 'v18.0'
        }
      };

      // Registrar envío en historial
      await this.logMessageHistory(result);

      if (this.options.enableLogging) {
        console.log('Message sent:', {
          messageId: result.message_id,
          recipientPhone: formattedPhone,
          messageLength: messageText.length,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'sendMessage',
          characters_sent: messageText.length,
          delivery_tracking: this.options.enableDeliveryTracking
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Send message failed: ${error.message}`
      };
    }
  }

  private async sendTemplate(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
      const templateName = context.getNodeParameter('templateName', 0) as string;
      const templateLanguage = context.getNodeParameter('templateLanguage', 0, 'es') as string;
      const templateParams = context.getNodeParameter('templateParams', 0, []) as any[];

      if (!recipientPhone || !templateName) {
        return {
          success: false,
          error: 'Recipient phone and template name are required'
        };
      }

      const formattedPhone = this.formatPhoneNumber(recipientPhone);
      if (!this.isValidPhoneNumber(formattedPhone)) {
        return {
          success: false,
          error: `Invalid phone number: ${recipientPhone}`
        };
      }

      // Construir payload del template
      const templatePayload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateLanguage
          },
          components: this.buildTemplateComponents(templateParams)
        }
      };

      // Simular envío a WhatsApp API
      const response = await this.sendToWhatsAppAPI(templatePayload);

      const result = {
        message_id: response.messages[0].id,
        recipient_phone: formattedPhone,
        template_name: templateName,
        template_language: templateLanguage,
        parameters_used: templateParams.length,
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 3000).toISOString(), // 3 segundos
          tracking_enabled: this.options.enableDeliveryTracking
        },
        metadata: {
          operation: 'sendTemplate',
          template_category: 'business',
          api_version: this.whatsappCredentials.apiVersion || 'v18.0'
        }
      };

      await this.logMessageHistory(result);

      if (this.options.enableLogging) {
        console.log('Template sent:', {
          messageId: result.message_id,
          recipientPhone: formattedPhone,
          templateName,
          paramCount: templateParams.length,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'sendTemplate',
          template_name: templateName,
          parameters_count: templateParams.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Send template failed: ${error.message}`
      };
    }
  }

  private async sendMedia(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
      const mediaType = context.getNodeParameter('mediaType', 0) as string;
      const mediaUrl = context.getNodeParameter('mediaUrl', 0, '') as string;
      const mediaId = context.getNodeParameter('mediaId', 0, '') as string;
      const caption = context.getNodeParameter('caption', 0, '') as string;

      if (!recipientPhone || (!mediaUrl && !mediaId)) {
        return {
          success: false,
          error: 'Recipient phone and media (URL or ID) are required'
        };
      }

      const formattedPhone = this.formatPhoneNumber(recipientPhone);
      if (!this.isValidPhoneNumber(formattedPhone)) {
        return {
          success: false,
          error: `Invalid phone number: ${recipientPhone}`
        };
      }

      // Construir payload de media
      const mediaObject: any = {};
      if (mediaId) {
        mediaObject.id = mediaId;
      } else {
        mediaObject.link = mediaUrl;
      }

      if (caption && ['image', 'video', 'document'].includes(mediaType)) {
        mediaObject.caption = caption;
      }

      const mediaPayload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: mediaType,
        [mediaType]: mediaObject
      };

      // Simular envío a WhatsApp API
      const response = await this.sendToWhatsAppAPI(mediaPayload);

      const result = {
        message_id: response.messages[0].id,
        recipient_phone: formattedPhone,
        media_type: mediaType,
        media_source: mediaId ? 'uploaded' : 'url',
        media_reference: mediaId || mediaUrl,
        caption: caption || null,
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 8000).toISOString(), // 8 segundos para media
          tracking_enabled: this.options.enableDeliveryTracking
        },
        metadata: {
          operation: 'sendMedia',
          media_size_estimate: this.estimateMediaSize(mediaType),
          api_version: this.whatsappCredentials.apiVersion || 'v18.0'
        }
      };

      await this.logMessageHistory(result);

      if (this.options.enableLogging) {
        console.log('Media sent:', {
          messageId: result.message_id,
          recipientPhone: formattedPhone,
          mediaType,
          hasCaption: !!caption,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'sendMedia',
          media_type: mediaType,
          has_caption: !!caption
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Send media failed: ${error.message}`
      };
    }
  }

  private async sendInteractiveMessage(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
      const interactiveType = context.getNodeParameter('interactiveType', 0) as string;
      const headerText = context.getNodeParameter('headerText', 0, '') as string;
      const bodyText = context.getNodeParameter('bodyText', 0) as string;
      const footerText = context.getNodeParameter('footerText', 0, '') as string;
      const buttons = context.getNodeParameter('buttons', 0, []) as any[];

      if (!recipientPhone || !bodyText) {
        return {
          success: false,
          error: 'Recipient phone and body text are required'
        };
      }

      const formattedPhone = this.formatPhoneNumber(recipientPhone);
      if (!this.isValidPhoneNumber(formattedPhone)) {
        return {
          success: false,
          error: `Invalid phone number: ${recipientPhone}`
        };
      }

      // Construir componente interactivo
      const interactive: any = {
        type: interactiveType,
        body: {
          text: bodyText
        }
      };

      if (headerText) {
        interactive.header = {
          type: 'text',
          text: headerText
        };
      }

      if (footerText) {
        interactive.footer = {
          text: footerText
        };
      }

      if (interactiveType === 'button' && buttons.length > 0) {
        interactive.action = {
          buttons: buttons.map((btn, index) => ({
            type: 'reply',
            reply: {
              id: btn.id || `btn_${index}`,
              title: btn.title
            }
          }))
        };
      }

      const interactivePayload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'interactive',
        interactive: interactive
      };

      // Simular envío a WhatsApp API
      const response = await this.sendToWhatsAppAPI(interactivePayload);

      const result = {
        message_id: response.messages[0].id,
        recipient_phone: formattedPhone,
        interactive_type: interactiveType,
        body_text: bodyText,
        header_text: headerText || null,
        footer_text: footerText || null,
        buttons_count: buttons.length,
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 4000).toISOString(), // 4 segundos
          tracking_enabled: this.options.enableDeliveryTracking
        },
        metadata: {
          operation: 'sendInteractive',
          interaction_complexity: this.calculateInteractionComplexity(interactive),
          api_version: this.whatsappCredentials.apiVersion || 'v18.0'
        }
      };

      await this.logMessageHistory(result);

      if (this.options.enableLogging) {
        console.log('Interactive message sent:', {
          messageId: result.message_id,
          recipientPhone: formattedPhone,
          interactiveType,
          buttonsCount: buttons.length,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'sendInteractive',
          interactive_type: interactiveType,
          buttons_count: buttons.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Send interactive message failed: ${error.message}`
      };
    }
  }

  private async markMessageAsRead(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const messageId = context.getNodeParameter('messageId', 0) as string;

      if (!messageId) {
        return {
          success: false,
          error: 'Message ID is required to mark as read'
        };
      }

      const readPayload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };

      // Simular llamada a WhatsApp API para marcar como leído
      const response = await this.sendToWhatsAppAPI(readPayload, 'messages');

      const result = {
        message_id: messageId,
        status: 'read',
        marked_at: new Date().toISOString(),
        tenant_id: this.credentials.tenantId,
        api_response: response.success || true
      };

      if (this.options.enableLogging) {
        console.log('Message marked as read:', {
          messageId,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'markAsRead'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Mark as read failed: ${error.message}`
      };
    }
  }

  private async getDeliveryStatus(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const messageId = context.getNodeParameter('messageId', 0) as string;

      if (!messageId) {
        return {
          success: false,
          error: 'Message ID is required to get delivery status'
        };
      }

      // Simular consulta de estado de entrega
      const deliveryStatus = await this.fetchDeliveryStatus(messageId);

      const result = {
        message_id: messageId,
        current_status: deliveryStatus.status,
        status_history: deliveryStatus.history,
        last_updated: deliveryStatus.lastUpdated,
        delivery_details: {
          sent_at: deliveryStatus.sentAt,
          delivered_at: deliveryStatus.deliveredAt,
          read_at: deliveryStatus.readAt,
          failed_at: deliveryStatus.failedAt,
          error_message: deliveryStatus.errorMessage
        },
        tenant_id: this.credentials.tenantId,
        checked_at: new Date().toISOString()
      };

      if (this.options.enableLogging) {
        console.log('Delivery status checked:', {
          messageId,
          currentStatus: deliveryStatus.status,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'getDeliveryStatus',
          status: deliveryStatus.status
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Get delivery status failed: ${error.message}`
      };
    }
  }

  // Métodos auxiliares
  private formatPhoneNumber(phone: string): string {
    // Remover caracteres no numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Si empieza con 56 (código de Chile), mantener
    if (cleaned.startsWith('56')) {
      return cleaned;
    }
    
    // Si empieza con 9 (móvil chileno), agregar 56
    if (cleaned.startsWith('9')) {
      return `56${cleaned}`;
    }
    
    // Si no tiene código de país, asumir Chile
    if (cleaned.length === 8) {
      return `569${cleaned}`;
    }
    
    return cleaned;
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Validar formato chileno: 56 + 9 + 8 dígitos
    return /^569\d{8}$/.test(phone);
  }

  private buildTemplateComponents(params: any[]): any[] {
    if (!params || params.length === 0) return [];

    return [
      {
        type: 'body',
        parameters: params.map(param => ({
          type: 'text',
          text: param.value || param
        }))
      }
    ];
  }

  private estimateMediaSize(mediaType: string): string {
    const estimates = {
      image: '~500KB',
      video: '~2MB',
      audio: '~200KB',
      document: '~1MB'
    };
    
    return estimates[mediaType] || '~unknown';
  }

  private calculateInteractionComplexity(interactive: any): string {
    let complexity = 'simple';
    
    if (interactive.header) complexity = 'medium';
    if (interactive.action && interactive.action.buttons && interactive.action.buttons.length > 2) {
      complexity = 'complex';
    }
    
    return complexity;
  }

  private async sendToWhatsAppAPI(payload: any, endpoint: string = 'messages'): Promise<any> {
    // Simular llamada a WhatsApp Business API
    const baseUrl = this.whatsappCredentials.baseUrl || 'https://graph.facebook.com';
    const version = this.whatsappCredentials.apiVersion || 'v18.0';
    const phoneNumberId = this.whatsappCredentials.phoneNumberId;
    
    const url = `${baseUrl}/${version}/${phoneNumberId}/${endpoint}`;
    
    // En producción aquí iría la llamada HTTP real
    console.log(`Simulated API call to: ${url}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Simular respuesta exitosa
    return {
      messages: [
        {
          id: `wamid.${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      ]
    };
  }

  private async logMessageHistory(messageData: any): Promise<void> {
    // Simular logging en base de datos
    console.log('Message logged to history:', {
      messageId: messageData.message_id,
      operation: messageData.metadata?.operation,
      tenantId: messageData.tenant_id
    });
  }

  private async fetchDeliveryStatus(messageId: string): Promise<any> {
    // Simular consulta de estado de entrega
    const statuses = ['sent', 'delivered', 'read', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const now = new Date();
    const sentTime = new Date(now.getTime() - 300000); // 5 minutos atrás
    
    return {
      status: randomStatus,
      history: [
        { status: 'sent', timestamp: sentTime.toISOString() },
        { status: randomStatus, timestamp: now.toISOString() }
      ],
      lastUpdated: now.toISOString(),
      sentAt: sentTime.toISOString(),
      deliveredAt: randomStatus === 'delivered' || randomStatus === 'read' ? 
        new Date(sentTime.getTime() + 10000).toISOString() : null,
      readAt: randomStatus === 'read' ? 
        new Date(sentTime.getTime() + 30000).toISOString() : null,
      failedAt: randomStatus === 'failed' ? now.toISOString() : null,
      errorMessage: randomStatus === 'failed' ? 'Invalid phone number' : null
    };
  }
}