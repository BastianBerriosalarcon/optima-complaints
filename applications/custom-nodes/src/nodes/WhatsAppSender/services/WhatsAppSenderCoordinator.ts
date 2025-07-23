// WhatsApp Sender Coordinator - Principio de Inversión de Dependencias (DIP)
import { ServiceResponse } from '@shared/types/core';
import { 
  IWhatsAppSenderCoordinator,
  IWhatsAppValidator,
  IWhatsAppFormatter,
  IWhatsAppClient,
  IWhatsAppLogger,
  WhatsAppConfig,
  WhatsAppSendResult,
  MessageOptions
} from '../interfaces/IWhatsAppServices';

export class WhatsAppSenderCoordinator implements IWhatsAppSenderCoordinator {
  
  constructor(
    private config: WhatsAppConfig,
    private validator: IWhatsAppValidator,
    private formatter: IWhatsAppFormatter,
    private client: IWhatsAppClient,
    private logger: IWhatsAppLogger
  ) {}

  async sendTextMessage(to: string, text: string, options: MessageOptions = {}): Promise<ServiceResponse<WhatsAppSendResult>> {
    try {
      // 1. Validar entrada
      const phoneValidation = await this.validator.validatePhoneNumber(to);
      if (!phoneValidation.success) {
        await this.logger.logError(
          new Error(phoneValidation.error || 'Phone validation failed'), 
          'sendTextMessage', 
          { to, textLength: text.length }
        );
        return phoneValidation as ServiceResponse<WhatsAppSendResult>;
      }

      // 2. Formatear payload
      const payload = this.formatter.buildTextPayload(to, text, options);

      // 3. Enviar mensaje
      const sendResult = await this.client.sendMessage(payload);
      if (!sendResult.success) {
        await this.logger.logError(
          new Error(sendResult.error || 'Send failed'), 
          'sendTextMessage', 
          { to, payload }
        );
        return sendResult as ServiceResponse<WhatsAppSendResult>;
      }

      // 4. Construir resultado
      const result: WhatsAppSendResult = {
        message_id: sendResult.data.messages[0].id,
        recipient_phone: this.formatter.formatPhoneNumber(to),
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.config.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 5000).toISOString(),
          tracking_enabled: options.enableDeliveryTracking || false
        },
        metadata: {
          operation: 'sendTextMessage',
          api_version: this.config.apiVersion || 'v18.0',
          message_length: text.length,
          phone_number_id: this.config.phoneNumberId
        }
      };

      // 5. Log del resultado
      await this.logger.logSentMessage(result);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      await this.logger.logError(error, 'sendTextMessage', { to, textLength: text.length });
      return {
        success: false,
        error: `Send text message failed: ${error.message}`
      };
    }
  }

  async sendTemplate(to: string, templateName: string, language: string, params: any[]): Promise<ServiceResponse<WhatsAppSendResult>> {
    try {
      // 1. Validar entrada
      const phoneValidation = await this.validator.validatePhoneNumber(to);
      if (!phoneValidation.success) {
        await this.logger.logError(
          new Error(phoneValidation.error || 'Phone validation failed'), 
          'sendTemplate', 
          { to, templateName, language }
        );
        return phoneValidation as ServiceResponse<WhatsAppSendResult>;
      }

      // 2. Formatear payload
      const payload = this.formatter.buildTemplatePayload(to, templateName, language, params);

      // 3. Enviar mensaje
      const sendResult = await this.client.sendMessage(payload);
      if (!sendResult.success) {
        await this.logger.logError(
          new Error(sendResult.error || 'Send failed'), 
          'sendTemplate', 
          { to, templateName, payload }
        );
        return sendResult as ServiceResponse<WhatsAppSendResult>;
      }

      // 4. Construir resultado
      const result: WhatsAppSendResult = {
        message_id: sendResult.data.messages[0].id,
        recipient_phone: this.formatter.formatPhoneNumber(to),
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.config.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 3000).toISOString(),
          tracking_enabled: true
        },
        metadata: {
          operation: 'sendTemplate',
          api_version: this.config.apiVersion || 'v18.0',
          template_name: templateName,
          template_language: language,
          parameters_count: params.length,
          phone_number_id: this.config.phoneNumberId
        }
      };

      // 5. Log del resultado
      await this.logger.logSentMessage(result);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      await this.logger.logError(error, 'sendTemplate', { to, templateName, language });
      return {
        success: false,
        error: `Send template failed: ${error.message}`
      };
    }
  }

  async sendMedia(to: string, mediaType: string, mediaUrl: string, caption?: string): Promise<ServiceResponse<WhatsAppSendResult>> {
    try {
      // 1. Validar entrada
      const phoneValidation = await this.validator.validatePhoneNumber(to);
      if (!phoneValidation.success) {
        await this.logger.logError(
          new Error(phoneValidation.error || 'Phone validation failed'), 
          'sendMedia', 
          { to, mediaType, mediaUrl }
        );
        return phoneValidation as ServiceResponse<WhatsAppSendResult>;
      }

      // 2. Formatear payload
      const payload = this.formatter.buildMediaPayload(to, mediaType, mediaUrl, caption);

      // 3. Enviar mensaje
      const sendResult = await this.client.sendMessage(payload);
      if (!sendResult.success) {
        await this.logger.logError(
          new Error(sendResult.error || 'Send failed'), 
          'sendMedia', 
          { to, mediaType, mediaUrl }
        );
        return sendResult as ServiceResponse<WhatsAppSendResult>;
      }

      // 4. Construir resultado
      const result: WhatsAppSendResult = {
        message_id: sendResult.data.messages[0].id,
        recipient_phone: this.formatter.formatPhoneNumber(to),
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.config.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 8000).toISOString(), // Media toma más tiempo
          tracking_enabled: true
        },
        metadata: {
          operation: 'sendMedia',
          api_version: this.config.apiVersion || 'v18.0',
          media_type: mediaType,
          media_url: mediaUrl,
          has_caption: !!caption,
          phone_number_id: this.config.phoneNumberId
        }
      };

      // 5. Log del resultado
      await this.logger.logSentMessage(result);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      await this.logger.logError(error, 'sendMedia', { to, mediaType, mediaUrl });
      return {
        success: false,
        error: `Send media failed: ${error.message}`
      };
    }
  }

  async sendInteractive(to: string, interactive: any): Promise<ServiceResponse<WhatsAppSendResult>> {
    try {
      // 1. Validar entrada
      const phoneValidation = await this.validator.validatePhoneNumber(to);
      if (!phoneValidation.success) {
        await this.logger.logError(
          new Error(phoneValidation.error || 'Phone validation failed'), 
          'sendInteractive', 
          { to, interactiveType: interactive.type }
        );
        return phoneValidation as ServiceResponse<WhatsAppSendResult>;
      }

      // 2. Formatear payload
      const payload = this.formatter.buildInteractivePayload(to, interactive);

      // 3. Enviar mensaje
      const sendResult = await this.client.sendMessage(payload);
      if (!sendResult.success) {
        await this.logger.logError(
          new Error(sendResult.error || 'Send failed'), 
          'sendInteractive', 
          { to, interactive }
        );
        return sendResult as ServiceResponse<WhatsAppSendResult>;
      }

      // 4. Construir resultado
      const result: WhatsAppSendResult = {
        message_id: sendResult.data.messages[0].id,
        recipient_phone: this.formatter.formatPhoneNumber(to),
        status: 'sent',
        sent_at: new Date().toISOString(),
        tenant_id: this.config.tenantId,
        delivery_info: {
          expected_delivery: new Date(Date.now() + 4000).toISOString(),
          tracking_enabled: true
        },
        metadata: {
          operation: 'sendInteractive',
          api_version: this.config.apiVersion || 'v18.0',
          interactive_type: interactive.type,
          complexity: this.formatter.calculateInteractionComplexity(interactive),
          phone_number_id: this.config.phoneNumberId
        }
      };

      // 5. Log del resultado
      await this.logger.logSentMessage(result);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      await this.logger.logError(error, 'sendInteractive', { to, interactive });
      return {
        success: false,
        error: `Send interactive failed: ${error.message}`
      };
    }
  }

  async markAsRead(messageId: string): Promise<ServiceResponse<any>> {
    try {
      const result = await this.client.markAsRead(messageId);
      
      if (result.success) {
        await this.logger.logCustomEvent('message_marked_read', { 
          message_id: messageId,
          marked_at: new Date().toISOString()
        });
      } else {
        await this.logger.logError(
          new Error(result.error || 'Mark as read failed'), 
          'markAsRead', 
          { messageId }
        );
      }

      return result;
    } catch (error) {
      await this.logger.logError(error, 'markAsRead', { messageId });
      return {
        success: false,
        error: `Mark as read failed: ${error.message}`
      };
    }
  }

  async getDeliveryStatus(messageId: string): Promise<ServiceResponse<any>> {
    try {
      const result = await this.client.getDeliveryStatus(messageId);
      
      if (result.success) {
        await this.logger.logDeliveryStatus(messageId, result.data);
      } else {
        await this.logger.logError(
          new Error(result.error || 'Get delivery status failed'), 
          'getDeliveryStatus', 
          { messageId }
        );
      }

      return result;
    } catch (error) {
      await this.logger.logError(error, 'getDeliveryStatus', { messageId });
      return {
        success: false,
        error: `Get delivery status failed: ${error.message}`
      };
    }
  }
}