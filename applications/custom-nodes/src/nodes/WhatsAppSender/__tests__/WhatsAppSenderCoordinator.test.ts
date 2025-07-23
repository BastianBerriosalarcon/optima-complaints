// Tests para WhatsApp Sender Coordinator - Verificar refactorización SOLID
import { WhatsAppSenderCoordinator } from '../services/WhatsAppSenderCoordinator';
import { WhatsAppSenderFactory } from '../WhatsAppSenderFactory';
import { WhatsAppConfig } from '../interfaces/IWhatsAppServices';

describe('WhatsAppSenderCoordinator', () => {
  let coordinator: WhatsAppSenderCoordinator;
  let mockConfig: WhatsAppConfig;

  beforeEach(() => {
    mockConfig = {
      tenantId: 'test-tenant-123',
      accessToken: 'test-access-token',
      phoneNumberId: '1234567890',
      apiVersion: 'v18.0',
      timeout: 30,
      retryCount: 3
    };

    coordinator = WhatsAppSenderFactory.create(mockConfig, false); // Disable logging for tests
  });

  describe('sendTextMessage', () => {
    it('should send text message successfully', async () => {
      const result = await coordinator.sendTextMessage('+56912345678', 'Hola, este es un mensaje de prueba');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.message_id).toBeDefined();
      expect(result.data.recipient_phone).toBe('56912345678');
      expect(result.data.status).toBe('sent');
      expect(result.data.tenant_id).toBe('test-tenant-123');
      expect(result.data.metadata.operation).toBe('sendTextMessage');
    });

    it('should fail with invalid phone number', async () => {
      const result = await coordinator.sendTextMessage('invalid-phone', 'Test message');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Phone number must contain only digits');
    });

    it('should fail with phone number too short', async () => {
      const result = await coordinator.sendTextMessage('123', 'Test message');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Phone number must be between 8 and 15 digits');
    });
  });

  describe('sendTemplate', () => {
    it('should send template message successfully', async () => {
      const templateParams = [
        { type: 'body', value: 'Juan Pérez', valueType: 'text' },
        { type: 'body', value: 'Toyota Corolla', valueType: 'text' }
      ];

      const result = await coordinator.sendTemplate(
        '+56987654321', 
        'lead_notification', 
        'es', 
        templateParams
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.metadata.template_name).toBe('lead_notification');
      expect(result.data.metadata.template_language).toBe('es');
      expect(result.data.metadata.parameters_count).toBe(2);
    });
  });

  describe('sendMedia', () => {
    it('should send image message successfully', async () => {
      const result = await coordinator.sendMedia(
        '+56912345678',
        'image',
        'https://example.com/image.jpg',
        'Esta es una imagen de prueba'
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.metadata.media_type).toBe('image');
      expect(result.data.metadata.has_caption).toBe(true);
    });

    it('should send document without caption', async () => {
      const result = await coordinator.sendMedia(
        '+56912345678',
        'document',
        'https://example.com/document.pdf'
      );
      
      expect(result.success).toBe(true);
      expect(result.data.metadata.media_type).toBe('document');
      expect(result.data.metadata.has_caption).toBe(false);
    });
  });

  describe('sendInteractive', () => {
    it('should send button interactive message successfully', async () => {
      const interactive = {
        type: 'button',
        body: '¿En qué podemos ayudarte?',
        buttons: [
          { id: 'btn1', title: 'Información' },
          { id: 'btn2', title: 'Cotización' },
          { id: 'btn3', title: 'Soporte' }
        ]
      };

      const result = await coordinator.sendInteractive('+56912345678', interactive);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.metadata.interactive_type).toBe('button');
      expect(result.data.metadata.complexity).toBe('medium');
    });

    it('should send list interactive message successfully', async () => {
      const interactive = {
        type: 'list',
        body: 'Selecciona una opción',
        buttonText: 'Ver opciones',
        sections: [
          {
            title: 'Vehículos',
            rows: [
              { id: 'car1', title: 'Toyota Corolla', description: 'Sedán compacto' },
              { id: 'car2', title: 'Honda Civic', description: 'Sedán deportivo' }
            ]
          }
        ]
      };

      const result = await coordinator.sendInteractive('+56912345678', interactive);
      
      expect(result.success).toBe(true);
      expect(result.data.metadata.interactive_type).toBe('list');
      expect(result.data.metadata.complexity).toBe('low');
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      const messageId = 'wamid.test123456789';
      const result = await coordinator.markAsRead(messageId);
      
      expect(result.success).toBe(true);
    });
  });

  describe('getDeliveryStatus', () => {
    it('should get delivery status successfully', async () => {
      const messageId = 'wamid.test123456789';
      const result = await coordinator.getDeliveryStatus(messageId);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.message_id).toBe(messageId);
      expect(['sent', 'delivered', 'read', 'failed']).toContain(result.data.status);
    });
  });
});

describe('WhatsAppSenderFactory', () => {
  it('should create coordinator with all dependencies', () => {
    const config: WhatsAppConfig = {
      tenantId: 'test-tenant',
      accessToken: 'test-token',
      phoneNumberId: '1234567890'
    };

    const coordinator = WhatsAppSenderFactory.create(config);
    expect(coordinator).toBeInstanceOf(WhatsAppSenderCoordinator);
  });

  it('should create coordinator with custom options', () => {
    const config: WhatsAppConfig = {
      tenantId: 'test-tenant',
      accessToken: 'test-token',
      phoneNumberId: '1234567890'
    };

    const coordinator = WhatsAppSenderFactory.createWithCustomOptions(config, {
      enableLogging: false,
      timeout: 60,
      retryCount: 5
    });

    expect(coordinator).toBeInstanceOf(WhatsAppSenderCoordinator);
  });
});

// Test de integración que verifica que la funcionalidad original se mantiene
describe('Integration Test - Original Functionality Preserved', () => {
  it('should maintain same API surface as original service', async () => {
    const config: WhatsAppConfig = {
      tenantId: 'test-tenant-123',
      accessToken: 'test-access-token',
      phoneNumberId: '1234567890'
    };

    const coordinator = WhatsAppSenderFactory.create(config, false);

    // Test all main operations that existed in original service
    const textResult = await coordinator.sendTextMessage('+56912345678', 'Test');
    expect(textResult.success).toBe(true);

    const templateResult = await coordinator.sendTemplate('+56912345678', 'test_template', 'es', []);
    expect(templateResult.success).toBe(true);

    const mediaResult = await coordinator.sendMedia('+56912345678', 'image', 'https://example.com/test.jpg');
    expect(mediaResult.success).toBe(true);

    const interactiveResult = await coordinator.sendInteractive('+56912345678', {
      type: 'button',
      body: 'Test',
      buttons: [{ id: 'test', title: 'Test' }]
    });
    expect(interactiveResult.success).toBe(true);

    // Verify all results have consistent structure
    [textResult, templateResult, mediaResult, interactiveResult].forEach(result => {
      expect(result.data).toHaveProperty('message_id');
      expect(result.data).toHaveProperty('recipient_phone');
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('sent_at');
      expect(result.data).toHaveProperty('tenant_id');
      expect(result.data).toHaveProperty('delivery_info');
      expect(result.data).toHaveProperty('metadata');
    });
  });
});