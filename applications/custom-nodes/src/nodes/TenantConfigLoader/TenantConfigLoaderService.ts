// Tenant Config Loader Service - Principio de Responsabilidad Única
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';

export class TenantConfigLoaderService implements IOptimaCxNodeService {
  private credentials: any;
  private options: any;

  constructor(credentials: any, options: any = {}) {
    this.credentials = credentials;
    this.options = {
      enableLogging: true,
      timeout: 30,
      retryCount: 3,
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
        case 'loadConfig':
          return await this.loadTenantConfig(context, input);
        case 'validatePhone':
          return await this.validatePhoneNumber(context, input);
        case 'checkBusinessHours':
          return await this.checkBusinessHours(context, input);
        case 'getWorkflows':
          return await this.getActiveWorkflows(context, input);
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

  private async loadTenantConfig(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const tenantId = this.credentials.tenantId;

      if (this.options.enableLogging) {
        console.log('Loading tenant config:', { tenantId });
      }

      // Simular carga de configuración del tenant (en producción sería desde DB)
      const tenantConfig = {
        tenant_id: tenantId,
        nombre_concesionario: 'AutoVentas Premium',
        configuracion: {
          horario_atencion: {
            lunes_viernes: { inicio: '08:00', fin: '19:00' },
            sabado: { inicio: '09:00', fin: '14:00' },
            domingo: 'cerrado'
          },
          whatsapp: {
            numero_principal: '+56912345678',
            respuesta_automatica: true,
            mensaje_bienvenida: '¡Hola! Gracias por contactar AutoVentas Premium. ¿En qué podemos ayudarte?',
            tiempo_respuesta_maximo: 15
          },
          ai_config: {
            modelo: 'gpt-4',
            temperatura: 0.7,
            max_tokens: 500,
            prompts: {
              analisis_inicial: 'Analiza este mensaje de un cliente potencial de concesionario automotriz...',
              clasificacion_interes: 'Clasifica el nivel de interés del cliente del 1 al 10...'
            }
          },
          equipo_ventas: [
            { id: 'advisor_001', nombre: 'Juan Pérez', especialidad: 'ventas_nuevos' },
            { id: 'advisor_002', nombre: 'María García', especialidad: 'ventas_usados' },
            { id: 'advisor_003', nombre: 'Carlos López', especialidad: 'post_venta' }
          ],
          productos: {
            marcas_disponibles: ['Toyota', 'Nissan', 'Chevrolet', 'Ford'],
            servicios: ['venta_nuevos', 'venta_usados', 'financiamiento', 'mantenimiento']
          }
        },
        estado: 'activo',
        ultima_actualizacion: new Date().toISOString()
      };

      return {
        success: true,
        data: tenantConfig,
        metadata: {
          operation: 'loadConfig',
          tenant_id: tenantId,
          config_version: '1.0.0'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Load tenant config failed: ${error.message}`
      };
    }
  }

  private async validatePhoneNumber(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const phoneNumber = context.getNodeParameter('phoneNumber', 0) as string;

      if (!phoneNumber) {
        return {
          success: false,
          error: 'Phone number is required for validation'
        };
      }

      // Validación básica de número de teléfono chileno
      const validation = {
        numero_original: phoneNumber,
        numero_normalizado: this.normalizePhoneNumber(phoneNumber),
        es_valido: this.isValidChileanPhone(phoneNumber),
        tipo: this.getPhoneType(phoneNumber),
        region: 'CL',
        formato_whatsapp: this.formatForWhatsApp(phoneNumber),
        validado_en: new Date().toISOString()
      };

      if (this.options.enableLogging) {
        console.log('Phone validated:', {
          original: phoneNumber,
          normalized: validation.numero_normalizado,
          valid: validation.es_valido
        });
      }

      return {
        success: true,
        data: validation,
        metadata: {
          operation: 'validatePhone',
          validation_engine: 'basic_regex'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Phone validation failed: ${error.message}`
      };
    }
  }

  private async checkBusinessHours(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      const businessHours = {
        1: { inicio: '08:00', fin: '19:00' }, // Monday
        2: { inicio: '08:00', fin: '19:00' }, // Tuesday
        3: { inicio: '08:00', fin: '19:00' }, // Wednesday
        4: { inicio: '08:00', fin: '19:00' }, // Thursday
        5: { inicio: '08:00', fin: '19:00' }, // Friday
        6: { inicio: '09:00', fin: '14:00' }, // Saturday
        0: null // Sunday - closed
      };

      const todayHours = businessHours[dayOfWeek];
      let isOpen = false;
      let nextOpenTime = null;

      if (todayHours) {
        isOpen = currentTime >= todayHours.inicio && currentTime <= todayHours.fin;
      }

      if (!isOpen) {
        nextOpenTime = this.calculateNextOpenTime(dayOfWeek, currentTime);
      }

      const result = {
        esta_abierto: isOpen,
        dia_semana: this.getDayName(dayOfWeek),
        hora_actual: currentTime,
        horario_hoy: todayHours,
        proximo_horario: nextOpenTime,
        tipo_atencion: isOpen ? 'inmediata' : 'diferida',
        verificado_en: new Date().toISOString()
      };

      if (this.options.enableLogging) {
        console.log('Business hours checked:', {
          isOpen,
          currentTime,
          dayOfWeek: this.getDayName(dayOfWeek)
        });
      }

      return {
        success: true,
        data: result,
        metadata: {
          operation: 'checkBusinessHours',
          timezone: 'America/Santiago'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Business hours check failed: ${error.message}`
      };
    }
  }

  private async getActiveWorkflows(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const tenantId = this.credentials.tenantId;

      // Simular obtención de workflows activos para el tenant
      const workflows = {
        tenant_id: tenantId,
        workflows_activos: [
          {
            id: 'whatsapp_lead_processing',
            nombre: 'Procesamiento de Leads WhatsApp',
            estado: 'activo',
            version: '2.0.0',
            modulos: ['validation', 'tenant_lookup', 'ai_analysis', 'lead_management']
          },
          {
            id: 'appointment_scheduling',
            nombre: 'Agendamiento de Citas',
            estado: 'activo',
            version: '1.5.0',
            modulos: ['calendar_integration', 'advisor_assignment']
          },
          {
            id: 'follow_up_automation',
            nombre: 'Seguimiento Automático',
            estado: 'activo',
            version: '1.2.0',
            modulos: ['scheduling', 'message_templates']
          }
        ],
        total_workflows: 3,
        ultima_actualizacion: new Date().toISOString()
      };

      if (this.options.enableLogging) {
        console.log('Active workflows loaded:', {
          tenantId,
          workflowCount: workflows.workflows_activos.length
        });
      }

      return {
        success: true,
        data: workflows,
        metadata: {
          operation: 'getWorkflows',
          tenant_id: tenantId
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Get active workflows failed: ${error.message}`
      };
    }
  }

  // Métodos auxiliares
  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private isValidChileanPhone(phone: string): boolean {
    const normalized = this.normalizePhoneNumber(phone);
    // Números chilenos: 56 + 9 + 8 dígitos para móviles
    return /^(56)?9\d{8}$/.test(normalized);
  }

  private getPhoneType(phone: string): string {
    const normalized = this.normalizePhoneNumber(phone);
    if (normalized.startsWith('56') || normalized.startsWith('9')) {
      return 'mobile';
    }
    return 'unknown';
  }

  private formatForWhatsApp(phone: string): string {
    const normalized = this.normalizePhoneNumber(phone);
    if (normalized.startsWith('56')) {
      return `+${normalized}`;
    }
    if (normalized.startsWith('9')) {
      return `+56${normalized}`;
    }
    return `+56${normalized}`;
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[dayOfWeek];
  }

  private calculateNextOpenTime(currentDay: number, currentTime: string): any {
    // Lógica simplificada - en producción sería más compleja
    if (currentDay === 0) { // Sunday
      return { dia: 'lunes', hora: '08:00' };
    }
    if (currentDay === 6 && currentTime > '14:00') { // Saturday after closing
      return { dia: 'lunes', hora: '08:00' };
    }
    return { dia: 'mañana', hora: '08:00' };
  }
}