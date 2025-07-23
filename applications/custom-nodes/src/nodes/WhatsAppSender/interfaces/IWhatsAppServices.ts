// WhatsApp Services Interfaces - Principio de Segregación de Interfaces (ISP)
import { ServiceResponse } from '@shared/types/core';

// Configuración de WhatsApp
export interface WhatsAppConfig {
  tenantId: string;
  accessToken: string;
  phoneNumberId: string;
  apiVersion?: string;
  timeout?: number;
  retryCount?: number;
}

// Opciones de mensaje
export interface MessageOptions {
  enablePreview?: boolean;
  enableDeliveryTracking?: boolean;
  enableLogging?: boolean;
}

// Resultado de envío
export interface WhatsAppSendResult {
  message_id: string;
  recipient_phone: string;
  status: string;
  sent_at: string;
  tenant_id: string;
  delivery_info: {
    expected_delivery: string;
    tracking_enabled: boolean;
  };
  metadata: {
    operation: string;
    api_version: string;
    [key: string]: any;
  };
}

// Interfaz para validación
export interface IWhatsAppValidator {
  validateCredentials(config: WhatsAppConfig): Promise<ServiceResponse<boolean>>;
  validateInput(input: any): Promise<ServiceResponse<boolean>>;
  validatePhoneNumber(phone: string): Promise<ServiceResponse<boolean>>;
}

// Interfaz para formateo
export interface IWhatsAppFormatter {
  formatPhoneNumber(phone: string): string;
  buildTextPayload(to: string, text: string, options?: MessageOptions): any;
  buildTemplatePayload(to: string, templateName: string, language: string, params: any[]): any;
  buildMediaPayload(to: string, mediaType: string, mediaUrl: string, caption?: string): any;
  buildInteractivePayload(to: string, interactive: any): any;
}

// Interfaz para cliente WhatsApp
export interface IWhatsAppClient {
  sendMessage(payload: any): Promise<ServiceResponse<any>>;
  markAsRead(messageId: string): Promise<ServiceResponse<any>>;
  getDeliveryStatus(messageId: string): Promise<ServiceResponse<any>>;
}

// Interfaz para logging
export interface IWhatsAppLogger {
  logSentMessage(result: WhatsAppSendResult): Promise<void>;
  logError(error: Error, context: string, metadata?: any): Promise<void>;
  logDeliveryStatus(messageId: string, status: any): Promise<void>;
}

// Interfaz principal del coordinador
export interface IWhatsAppSenderCoordinator {
  sendTextMessage(to: string, text: string, options?: MessageOptions): Promise<ServiceResponse<WhatsAppSendResult>>;
  sendTemplate(to: string, templateName: string, language: string, params: any[]): Promise<ServiceResponse<WhatsAppSendResult>>;
  sendMedia(to: string, mediaType: string, mediaUrl: string, caption?: string): Promise<ServiceResponse<WhatsAppSendResult>>;
  sendInteractive(to: string, interactive: any): Promise<ServiceResponse<WhatsAppSendResult>>;
  markAsRead(messageId: string): Promise<ServiceResponse<any>>;
  getDeliveryStatus(messageId: string): Promise<ServiceResponse<any>>;
}