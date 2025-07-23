// WhatsApp Sender Service Refactored - Siguiendo principios SOLID
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';
import { WhatsAppSenderFactory } from './WhatsAppSenderFactory';
import { IWhatsAppSenderCoordinator, WhatsAppConfig } from './interfaces/IWhatsAppServices';

export class WhatsAppSenderService implements IOptimaCxNodeService {
  private coordinator: IWhatsAppSenderCoordinator;

  constructor(credentials: any, whatsappCredentials: any, options: any = {}) {
    // Construir configuración
    const config: WhatsAppConfig = {
      tenantId: credentials.tenantId,
      accessToken: whatsappCredentials.accessToken,
      phoneNumberId: whatsappCredentials.phoneNumberId,
      apiVersion: whatsappCredentials.apiVersion || 'v18.0',
      timeout: options.timeout || 30,
      retryCount: options.retryCount || 3
    };

    // Usar factory para crear el coordinador con todas las dependencias
    this.coordinator = WhatsAppSenderFactory.create(config, options.enableLogging !== false);
  }

  async validate(input: any): Promise<ServiceResponse<boolean>> {
    try {
      // El coordinador maneja internamente todas las validaciones
      // Solo validamos que tengamos input básico
      if (!input || typeof input !== 'object') {
        return {
          success: false,
          error: 'Input must be a valid object'
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
          return await this.handleSendMessage(context);
        
        case 'sendTemplate':
          return await this.handleSendTemplate(context);
        
        case 'sendMedia':
          return await this.handleSendMedia(context);
        
        case 'sendInteractive':
          return await this.handleSendInteractive(context);
        
        case 'markAsRead':
          return await this.handleMarkAsRead(context);
        
        case 'getDeliveryStatus':
          return await this.handleGetDeliveryStatus(context);
        
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

  private async handleSendMessage(context: IExecuteFunctions): Promise<ServiceResponse<any>> {
    const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
    const messageText = context.getNodeParameter('messageText', 0) as string;
    const messageOptions = context.getNodeParameter('messageOptions', 0, {}) as any;

    return await this.coordinator.sendTextMessage(recipientPhone, messageText, {
      enablePreview: messageOptions.enablePreview,
      enableDeliveryTracking: messageOptions.enableDeliveryTracking,
      enableLogging: messageOptions.enableLogging
    });
  }

  private async handleSendTemplate(context: IExecuteFunctions): Promise<ServiceResponse<any>> {
    const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
    const templateName = context.getNodeParameter('templateName', 0) as string;
    const templateLanguage = context.getNodeParameter('templateLanguage', 0, 'es') as string;
    const templateParams = context.getNodeParameter('templateParams', 0, []) as any[];

    return await this.coordinator.sendTemplate(recipientPhone, templateName, templateLanguage, templateParams);
  }

  private async handleSendMedia(context: IExecuteFunctions): Promise<ServiceResponse<any>> {
    const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
    const mediaType = context.getNodeParameter('mediaType', 0) as string;
    const mediaUrl = context.getNodeParameter('mediaUrl', 0) as string;
    const caption = context.getNodeParameter('caption', 0, '') as string;

    return await this.coordinator.sendMedia(recipientPhone, mediaType, mediaUrl, caption || undefined);
  }

  private async handleSendInteractive(context: IExecuteFunctions): Promise<ServiceResponse<any>> {
    const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
    const interactive = context.getNodeParameter('interactive', 0) as any;

    return await this.coordinator.sendInteractive(recipientPhone, interactive);
  }

  private async handleMarkAsRead(context: IExecuteFunctions): Promise<ServiceResponse<any>> {
    const messageId = context.getNodeParameter('messageId', 0) as string;
    return await this.coordinator.markAsRead(messageId);
  }

  private async handleGetDeliveryStatus(context: IExecuteFunctions): Promise<ServiceResponse<any>> {
    const messageId = context.getNodeParameter('messageId', 0) as string;
    return await this.coordinator.getDeliveryStatus(messageId);
  }
}