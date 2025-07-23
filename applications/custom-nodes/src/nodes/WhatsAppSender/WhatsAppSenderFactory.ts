// WhatsApp Sender Factory - Principio de Inversión de Dependencias (DIP)
import { WhatsAppConfig } from './interfaces/IWhatsAppServices';
import { WhatsAppValidator } from './services/WhatsAppValidator';
import { WhatsAppFormatter } from './services/WhatsAppFormatter';
import { WhatsAppClient } from './services/WhatsAppClient';
import { WhatsAppLogger } from './services/WhatsAppLogger';
import { WhatsAppSenderCoordinator } from './services/WhatsAppSenderCoordinator';

export class WhatsAppSenderFactory {
  
  static create(config: WhatsAppConfig, enableLogging: boolean = true): WhatsAppSenderCoordinator {
    // Crear todas las dependencias
    const validator = new WhatsAppValidator();
    const formatter = new WhatsAppFormatter();
    const client = new WhatsAppClient(config);
    const logger = new WhatsAppLogger(config.tenantId, enableLogging);

    // Inyectar dependencias en el coordinador
    return new WhatsAppSenderCoordinator(
      config,
      validator,
      formatter,
      client,
      logger
    );
  }

  // Factory method para testing con mocks
  static createForTesting(
    config: WhatsAppConfig,
    mockValidator?: any,
    mockFormatter?: any,
    mockClient?: any,
    mockLogger?: any
  ): WhatsAppSenderCoordinator {
    return new WhatsAppSenderCoordinator(
      config,
      mockValidator || new WhatsAppValidator(),
      mockFormatter || new WhatsAppFormatter(),
      mockClient || new WhatsAppClient(config),
      mockLogger || new WhatsAppLogger(config.tenantId, false)
    );
  }

  // Factory method para configuraciones específicas
  static createWithCustomOptions(
    config: WhatsAppConfig,
    options: {
      enableLogging?: boolean;
      timeout?: number;
      retryCount?: number;
    } = {}
  ): WhatsAppSenderCoordinator {
    const enhancedConfig = {
      ...config,
      timeout: options.timeout || config.timeout,
      retryCount: options.retryCount || config.retryCount
    };

    return WhatsAppSenderFactory.create(enhancedConfig, options.enableLogging);
  }
}