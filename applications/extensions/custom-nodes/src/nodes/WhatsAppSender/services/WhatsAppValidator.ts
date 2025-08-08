// WhatsApp Validator Service - Principio de Responsabilidad Única (SRP)
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppValidator, WhatsAppConfig } from '../interfaces/IWhatsAppServices';

export class WhatsAppValidator implements IWhatsAppValidator {
  
  async validateCredentials(config: WhatsAppConfig): Promise<ServiceResponse<boolean>> {
    try {
      const errors: string[] = [];

      if (!config.tenantId) {
        errors.push('Tenant ID is required');
      }

      if (!config.accessToken) {
        errors.push('WhatsApp access token is required');
      }

      if (!config.phoneNumberId) {
        errors.push('WhatsApp phone number ID is required');
      }

      if (config.accessToken && !this.isValidAccessToken(config.accessToken)) {
        errors.push('Invalid access token format');
      }

      if (config.phoneNumberId && !this.isValidPhoneNumberId(config.phoneNumberId)) {
        errors.push('Invalid phone number ID format');
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', ')
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Credential validation failed: ${error.message}`
      };
    }
  }

  async validateInput(input: any): Promise<ServiceResponse<boolean>> {
    try {
      if (!input || typeof input !== 'object') {
        return {
          success: false,
          error: 'Input must be a valid object'
        };
      }

      // Validaciones adicionales específicas del input podrían ir aquí
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Input validation failed: ${error.message}`
      };
    }
  }

  async validatePhoneNumber(phone: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!phone || typeof phone !== 'string') {
        return {
          success: false,
          error: 'Phone number must be a non-empty string'
        };
      }

      // Remover espacios y caracteres especiales
      const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');

      // Validar que solo contenga números
      if (!/^\d+$/.test(cleanPhone)) {
        return {
          success: false,
          error: 'Phone number must contain only digits'
        };
      }

      // Validar longitud (entre 8 y 15 dígitos según estándar internacional)
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        return {
          success: false,
          error: 'Phone number must be between 8 and 15 digits'
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Phone validation failed: ${error.message}`
      };
    }
  }

  private isValidAccessToken(token: string): boolean {
    // Validar formato básico del token (puede ajustarse según especificaciones de WhatsApp)
    return token.length > 10 && /^[A-Za-z0-9_-]+$/.test(token);
  }

  private isValidPhoneNumberId(phoneNumberId: string): boolean {
    // Validar que sea un ID numérico válido
    return /^\d+$/.test(phoneNumberId) && phoneNumberId.length > 5;
  }
}