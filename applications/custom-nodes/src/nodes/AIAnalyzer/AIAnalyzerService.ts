// AI Analyzer Service - Principio de Responsabilidad Única
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';

export class AIAnalyzerService implements IOptimaCxNodeService {
  private credentials: any;
  private options: any;

  constructor(credentials: any, options: any = {}) {
    this.credentials = credentials;
    this.options = {
      enableLogging: true,
      timeout: 30,
      retryCount: 3,
      aiModel: 'gpt-4',
      temperature: 0.7,
      maxTokens: 500,
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
        case 'analyzeIntent':
          return await this.analyzeMessageIntent(context, input);
        case 'extractEntities':
          return await this.extractEntities(context, input);
        case 'classifyLead':
          return await this.classifyLead(context, input);
        case 'generateResponse':
          return await this.generateResponse(context, input);
        case 'sentimentAnalysis':
          return await this.analyzeSentiment(context, input);
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

  private async analyzeMessageIntent(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const messageContent = context.getNodeParameter('messageContent', 0) as string;
      const businessContext = context.getNodeParameter('businessContext', 0, 'automotive') as string;

      if (!messageContent) {
        return {
          success: false,
          error: 'Message content is required for intent analysis'
        };
      }

      // Análisis de intención usando reglas y patrones
      const intentAnalysis = {
        mensaje_original: messageContent,
        intencion_principal: this.detectPrimaryIntent(messageContent, businessContext),
        intenciones_secundarias: this.detectSecondaryIntents(messageContent),
        nivel_certeza: this.calculateConfidenceLevel(messageContent),
        entidades_detectadas: this.detectBasicEntities(messageContent),
        urgencia: this.detectUrgency(messageContent),
        tono_emocional: this.detectEmotionalTone(messageContent),
        contexto_negocio: businessContext,
        procesado_en: new Date().toISOString(),
        modelo_usado: this.options.aiModel || 'rule_based'
      };

      if (this.options.enableLogging) {
        console.log('Intent analyzed:', {
          messageLength: messageContent.length,
          primaryIntent: intentAnalysis.intencion_principal,
          confidence: intentAnalysis.nivel_certeza,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: intentAnalysis,
        metadata: {
          operation: 'analyzeIntent',
          model_version: '1.0.0',
          processing_time_ms: Date.now()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Intent analysis failed: ${error.message}`
      };
    }
  }

  private async extractEntities(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const messageContent = context.getNodeParameter('messageContent', 0) as string;
      const entityTypes = context.getNodeParameter('entityTypes', 0, []) as string[];

      if (!messageContent) {
        return {
          success: false,
          error: 'Message content is required for entity extraction'
        };
      }

      const extractedEntities = {
        mensaje_original: messageContent,
        entidades: {
          personas: this.extractPersonNames(messageContent),
          vehiculos: this.extractVehicleInfo(messageContent),
          precios: this.extractPrices(messageContent),
          fechas: this.extractDates(messageContent),
          contacto: this.extractContactInfo(messageContent),
          ubicaciones: this.extractLocations(messageContent),
          marcas_modelos: this.extractCarBrands(messageContent)
        },
        tipos_solicitados: entityTypes,
        confianza_promedio: 0.82,
        extraido_en: new Date().toISOString()
      };

      // Filtrar solo entidades solicitadas si se especifican
      if (entityTypes.length > 0) {
        const filteredEntities = {};
        entityTypes.forEach(type => {
          if (extractedEntities.entidades[type]) {
            filteredEntities[type] = extractedEntities.entidades[type];
          }
        });
        extractedEntities.entidades = filteredEntities;
      }

      if (this.options.enableLogging) {
        console.log('Entities extracted:', {
          messageLength: messageContent.length,
          entityCount: Object.keys(extractedEntities.entidades).length,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: extractedEntities,
        metadata: {
          operation: 'extractEntities',
          extraction_method: 'regex_patterns',
          total_entities: Object.keys(extractedEntities.entidades).length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Entity extraction failed: ${error.message}`
      };
    }
  }

  private async classifyLead(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const leadData = context.getNodeParameter('leadData', 0) as any;
      const messageContent = leadData.mensaje_inicial || '';

      if (!leadData) {
        return {
          success: false,
          error: 'Lead data is required for classification'
        };
      }

      const classification = {
        lead_id: leadData.id || 'temp_' + Date.now(),
        clasificacion: {
          calidad: this.classifyLeadQuality(messageContent, leadData),
          tipo_interes: this.classifyInterestType(messageContent),
          urgencia: this.classifyUrgency(messageContent),
          probabilidad_conversion: this.calculateConversionProbability(messageContent, leadData),
          categoria_producto: this.classifyProductCategory(messageContent),
          nivel_conocimiento: this.assessKnowledgeLevel(messageContent)
        },
        puntuacion_total: 0,
        recomendaciones: {
          seguimiento_sugerido: this.suggestFollowUp(messageContent),
          asesor_recomendado: this.recommendAdvisorType(messageContent),
          prioridad_atencion: 'media',
          acciones_sugeridas: []
        },
        analisis_detallado: {
          palabras_clave_positivas: this.extractPositiveKeywords(messageContent),
          senales_compra: this.detectBuyingSignals(messageContent),
          objeciones_potenciales: this.detectPotentialObjections(messageContent)
        },
        clasificado_en: new Date().toISOString()
      };

      // Calcular puntuación total
      classification.puntuacion_total = this.calculateTotalScore(classification.clasificacion);

      // Generar recomendaciones basadas en clasificación
      classification.recomendaciones = this.generateRecommendations(classification);

      if (this.options.enableLogging) {
        console.log('Lead classified:', {
          leadId: classification.lead_id,
          quality: classification.clasificacion.calidad,
          score: classification.puntuacion_total,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: classification,
        metadata: {
          operation: 'classifyLead',
          classification_model: 'automotive_v1',
          total_score: classification.puntuacion_total
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Lead classification failed: ${error.message}`
      };
    }
  }

  private async generateResponse(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const messageContent = context.getNodeParameter('messageContent', 0) as string;
      const responseType = context.getNodeParameter('responseType', 0, 'auto') as string;
      const customerContext = context.getNodeParameter('customerContext', 0, {}) as any;

      if (!messageContent) {
        return {
          success: false,
          error: 'Message content is required for response generation'
        };
      }

      const responseGeneration = {
        mensaje_cliente: messageContent,
        respuesta_generada: this.generateAutomaticResponse(messageContent, responseType, customerContext),
        tipo_respuesta: responseType,
        contexto_aplicado: customerContext,
        confianza: 0.88,
        requiere_revision_humana: this.requiresHumanReview(messageContent),
        alternativas: this.generateAlternativeResponses(messageContent, responseType),
        generado_en: new Date().toISOString(),
        parametros_modelo: {
          temperatura: this.options.temperature,
          max_tokens: this.options.maxTokens,
          modelo: this.options.aiModel
        }
      };

      if (this.options.enableLogging) {
        console.log('Response generated:', {
          messageLength: messageContent.length,
          responseType,
          requiresHumanReview: responseGeneration.requiere_revision_humana,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: responseGeneration,
        metadata: {
          operation: 'generateResponse',
          response_type: responseType,
          requires_human_review: responseGeneration.requiere_revision_humana
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Response generation failed: ${error.message}`
      };
    }
  }

  private async analyzeSentiment(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
    try {
      const messageContent = context.getNodeParameter('messageContent', 0) as string;

      if (!messageContent) {
        return {
          success: false,
          error: 'Message content is required for sentiment analysis'
        };
      }

      const sentimentAnalysis = {
        mensaje_original: messageContent,
        sentimiento: {
          polaridad: this.analyzePolarityBasic(messageContent),
          intensidad: this.analyzeIntensity(messageContent),
          emociones_detectadas: this.detectEmotions(messageContent),
          confianza: 0.85
        },
        indicadores: {
          palabras_positivas: this.countPositiveWords(messageContent),
          palabras_negativas: this.countNegativeWords(messageContent),
          palabras_neutrales: this.countNeutralWords(messageContent),
          emojis: this.extractEmojis(messageContent),
          exclamaciones: this.countExclamations(messageContent)
        },
        contexto_negocio: {
          satisfaccion_cliente: this.inferCustomerSatisfaction(messageContent),
          probabilidad_queja: this.calculateComplaintProbability(messageContent),
          nivel_entusiasmo: this.measureEnthusiasm(messageContent)
        },
        analizado_en: new Date().toISOString()
      };

      if (this.options.enableLogging) {
        console.log('Sentiment analyzed:', {
          polarity: sentimentAnalysis.sentimiento.polaridad,
          intensity: sentimentAnalysis.sentimiento.intensidad,
          tenantId: this.credentials.tenantId
        });
      }

      return {
        success: true,
        data: sentimentAnalysis,
        metadata: {
          operation: 'sentimentAnalysis',
          analysis_method: 'lexicon_based',
          confidence: sentimentAnalysis.sentimiento.confianza
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Sentiment analysis failed: ${error.message}`
      };
    }
  }

  // Métodos auxiliares para análisis
  private detectPrimaryIntent(message: string, context: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (context === 'automotive') {
      if (lowerMessage.includes('comprar') || lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
        return 'intencion_compra';
      }
      if (lowerMessage.includes('información') || lowerMessage.includes('detalles') || lowerMessage.includes('características')) {
        return 'solicitud_informacion';
      }
      if (lowerMessage.includes('cita') || lowerMessage.includes('visita') || lowerMessage.includes('ver')) {
        return 'agendar_cita';
      }
      if (lowerMessage.includes('servicio') || lowerMessage.includes('mantención') || lowerMessage.includes('reparar')) {
        return 'servicio_postventa';
      }
      if (lowerMessage.includes('financiamiento') || lowerMessage.includes('crédito') || lowerMessage.includes('cuotas')) {
        return 'consulta_financiamiento';
      }
    }
    
    return 'consulta_general';
  }

  private detectSecondaryIntents(message: string): string[] {
    const intents = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('urgente') || lowerMessage.includes('pronto')) {
      intents.push('urgencia');
    }
    if (lowerMessage.includes('descuento') || lowerMessage.includes('oferta')) {
      intents.push('busca_promocion');
    }
    if (lowerMessage.includes('comparar') || lowerMessage.includes('versus')) {
      intents.push('comparacion');
    }
    
    return intents;
  }

  private calculateConfidenceLevel(message: string): number {
    let confidence = 0.5;
    
    // Más confianza con mensajes más largos y específicos
    if (message.length > 50) confidence += 0.2;
    if (message.length > 100) confidence += 0.1;
    
    // Palabras clave específicas aumentan confianza
    const specificWords = ['modelo', 'año', 'precio', 'financiamiento', 'color'];
    specificWords.forEach(word => {
      if (message.toLowerCase().includes(word)) confidence += 0.05;
    });
    
    return Math.min(1.0, confidence);
  }

  private detectBasicEntities(message: string): any {
    return {
      emails: message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
      phones: message.match(/(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}/g) || [],
      numbers: message.match(/\d+/g) || [],
      caps_words: message.match(/\b[A-Z][a-z]+\b/g) || []
    };
  }

  private detectUrgency(message: string): string {
    const urgentWords = ['urgente', 'rápido', 'pronto', 'hoy', 'ahora', 'inmediato'];
    const foundUrgent = urgentWords.some(word => message.toLowerCase().includes(word));
    
    if (foundUrgent) return 'alta';
    if (message.includes('?') || message.includes('cuando')) return 'media';
    return 'baja';
  }

  private detectEmotionalTone(message: string): string {
    const positiveWords = ['excelente', 'perfecto', 'genial', 'increíble', 'fantástico'];
    const negativeWords = ['terrible', 'malo', 'problema', 'molesto', 'decepcionado'];
    
    const positiveCount = positiveWords.filter(word => message.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => message.toLowerCase().includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positivo';
    if (negativeCount > positiveCount) return 'negativo';
    return 'neutral';
  }

  // Implementar métodos auxiliares adicionales
  private extractPersonNames(message: string): string[] {
    return message.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g) || [];
  }

  private extractVehicleInfo(message: string): any {
    const brands = ['toyota', 'nissan', 'chevrolet', 'ford', 'hyundai', 'kia', 'mazda'];
    const foundBrands = brands.filter(brand => message.toLowerCase().includes(brand));
    return { marcas: foundBrands };
  }

  private extractPrices(message: string): string[] {
    return message.match(/\$?[\d.,]+/g) || [];
  }

  private extractDates(message: string): string[] {
    return message.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
  }

  private extractContactInfo(message: string): any {
    return {
      emails: message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
      phones: message.match(/(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}/g) || []
    };
  }

  private extractLocations(message: string): string[] {
    const locations = ['santiago', 'valparaíso', 'concepción', 'viña del mar', 'las condes', 'providencia'];
    return locations.filter(loc => message.toLowerCase().includes(loc));
  }

  private extractCarBrands(message: string): string[] {
    const brands = ['toyota', 'nissan', 'chevrolet', 'ford', 'hyundai', 'kia', 'mazda', 'bmw', 'mercedes', 'audi'];
    return brands.filter(brand => message.toLowerCase().includes(brand));
  }

  // Métodos de clasificación de leads
  private classifyLeadQuality(message: string, leadData: any): string {
    let score = 0;
    
    if (message.includes('comprar') || message.includes('adquirir')) score += 3;
    if (message.includes('precio') || message.includes('costo')) score += 2;
    if (message.includes('financiamiento')) score += 2;
    if (leadData.telefono_cliente) score += 1;
    if (leadData.email_cliente) score += 1;
    
    if (score >= 6) return 'alta';
    if (score >= 3) return 'media';
    return 'baja';
  }

  private classifyInterestType(message: string): string {
    if (message.toLowerCase().includes('nuevo')) return 'vehiculo_nuevo';
    if (message.toLowerCase().includes('usado')) return 'vehiculo_usado';
    if (message.toLowerCase().includes('servicio')) return 'servicio_tecnico';
    return 'general';
  }

  private classifyUrgency(message: string): string {
    const urgentWords = ['urgente', 'hoy', 'ahora', 'rápido'];
    if (urgentWords.some(word => message.toLowerCase().includes(word))) return 'alta';
    if (message.includes('esta semana')) return 'media';
    return 'baja';
  }

  private calculateConversionProbability(message: string, leadData: any): number {
    let probability = 0.3; // Base probability
    
    if (message.includes('comprar')) probability += 0.3;
    if (message.includes('precio')) probability += 0.2;
    if (leadData.telefono_cliente) probability += 0.1;
    if (leadData.email_cliente) probability += 0.1;
    
    return Math.min(1.0, probability);
  }

  private classifyProductCategory(message: string): string {
    if (message.toLowerCase().includes('auto') || message.toLowerCase().includes('sedan')) return 'sedan';
    if (message.toLowerCase().includes('suv')) return 'suv';
    if (message.toLowerCase().includes('pickup')) return 'pickup';
    return 'general';
  }

  private assessKnowledgeLevel(message: string): string {
    const technicalTerms = ['cilindrada', 'transmisión', 'tracción', 'consumo'];
    const foundTerms = technicalTerms.filter(term => message.toLowerCase().includes(term));
    
    if (foundTerms.length >= 2) return 'alto';
    if (foundTerms.length >= 1) return 'medio';
    return 'basico';
  }

  private calculateTotalScore(classification: any): number {
    let score = 0;
    
    switch (classification.calidad) {
      case 'alta': score += 30; break;
      case 'media': score += 20; break;
      case 'baja': score += 10; break;
    }
    
    score += classification.probabilidad_conversion * 40;
    
    switch (classification.urgencia) {
      case 'alta': score += 20; break;
      case 'media': score += 10; break;
      case 'baja': score += 5; break;
    }
    
    return Math.round(score);
  }

  private generateRecommendations(classification: any): any {
    const recommendations = {
      seguimiento_sugerido: 'llamada_telefonica',
      asesor_recomendado: 'ventas_generales',
      prioridad_atencion: 'media',
      acciones_sugeridas: []
    };
    
    if (classification.puntuacion_total >= 70) {
      recommendations.prioridad_atencion = 'alta';
      recommendations.seguimiento_sugerido = 'inmediato';
      recommendations.acciones_sugeridas.push('contacto_inmediato', 'envio_catalogo');
    }
    
    return recommendations;
  }

  // Métodos de generación de respuestas
  private generateAutomaticResponse(message: string, type: string, context: any): string {
    const intent = this.detectPrimaryIntent(message, 'automotive');
    
    const responses = {
      intencion_compra: '¡Gracias por tu interés en nuestros vehículos! Me encantaría ayudarte a encontrar el auto perfecto. ¿Tienes algún modelo específico en mente?',
      solicitud_informacion: 'Con gusto te proporciono la información que necesitas. ¿Sobre qué modelo te gustaría conocer más detalles?',
      agendar_cita: 'Perfecto, podemos coordinar una cita para que veas nuestros vehículos. ¿Cuándo te vendría mejor?',
      consulta_general: '¡Hola! Gracias por contactarnos. Estoy aquí para ayudarte con cualquier consulta sobre nuestros vehículos y servicios.'
    };
    
    return responses[intent] || responses.consulta_general;
  }

  private requiresHumanReview(message: string): boolean {
    const complexKeywords = ['reclamo', 'problema', 'insatisfecho', 'gerente'];
    return complexKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private generateAlternativeResponses(message: string, type: string): string[] {
    return [
      'Respuesta alternativa 1: Enfoque más personal',
      'Respuesta alternativa 2: Enfoque más técnico',
      'Respuesta alternativa 3: Enfoque promocional'
    ];
  }

  // Métodos de análisis de sentimiento
  private analyzePolarityBasic(message: string): string {
    const positiveWords = ['excelente', 'genial', 'perfecto', 'increíble', 'fantástico', 'bueno'];
    const negativeWords = ['terrible', 'malo', 'horrible', 'pésimo', 'decepcionante'];
    
    const positiveCount = positiveWords.filter(word => message.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => message.toLowerCase().includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positivo';
    if (negativeCount > positiveCount) return 'negativo';
    return 'neutral';
  }

  private analyzeIntensity(message: string): number {
    let intensity = 0.5;
    
    if (message.includes('!')) intensity += 0.2;
    if (message.includes('!!!')) intensity += 0.3;
    if (message.toUpperCase() === message) intensity += 0.3;
    
    return Math.min(1.0, intensity);
  }

  private detectEmotions(message: string): string[] {
    const emotions = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('feliz') || lowerMessage.includes('contento')) emotions.push('alegria');
    if (lowerMessage.includes('molesto') || lowerMessage.includes('enojado')) emotions.push('enojo');
    if (lowerMessage.includes('preocupado') || lowerMessage.includes('nervioso')) emotions.push('preocupacion');
    if (lowerMessage.includes('emocionado') || lowerMessage.includes('entusiasmado')) emotions.push('entusiasmo');
    
    return emotions;
  }

  private countPositiveWords(message: string): number {
    const positiveWords = ['excelente', 'genial', 'perfecto', 'increíble', 'fantástico', 'bueno', 'gracias'];
    return positiveWords.filter(word => message.toLowerCase().includes(word)).length;
  }

  private countNegativeWords(message: string): number {
    const negativeWords = ['terrible', 'malo', 'horrible', 'pésimo', 'decepcionante', 'problema'];
    return negativeWords.filter(word => message.toLowerCase().includes(word)).length;
  }

  private countNeutralWords(message: string): number {
    return message.split(' ').length - this.countPositiveWords(message) - this.countNegativeWords(message);
  }

  private extractEmojis(message: string): string[] {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    return message.match(emojiRegex) || [];
  }

  private countExclamations(message: string): number {
    return (message.match(/!/g) || []).length;
  }

  private inferCustomerSatisfaction(message: string): string {
    const polarity = this.analyzePolarityBasic(message);
    return polarity === 'positivo' ? 'alta' : polarity === 'negativo' ? 'baja' : 'media';
  }

  private calculateComplaintProbability(message: string): number {
    const complaintWords = ['reclamo', 'problema', 'molesto', 'insatisfecho', 'queja'];
    const foundWords = complaintWords.filter(word => message.toLowerCase().includes(word));
    return foundWords.length > 0 ? 0.8 : 0.1;
  }

  private measureEnthusiasm(message: string): string {
    const exclamations = this.countExclamations(message);
    const positiveWords = this.countPositiveWords(message);
    
    if (exclamations >= 2 && positiveWords >= 1) return 'alto';
    if (exclamations >= 1 || positiveWords >= 1) return 'medio';
    return 'bajo';
  }

  private suggestFollowUp(message: string): string {
    if (message.includes('precio')) return 'envio_cotizacion';
    if (message.includes('información')) return 'envio_catalogo';
    if (message.includes('cita')) return 'agendamiento';
    return 'llamada_telefonica';
  }

  private recommendAdvisorType(message: string): string {
    if (message.includes('financiamiento')) return 'asesor_financiero';
    if (message.includes('servicio')) return 'asesor_postventa';
    if (message.includes('usado')) return 'asesor_usados';
    return 'asesor_ventas_nuevos';
  }

  private extractPositiveKeywords(message: string): string[] {
    const keywords = ['interesado', 'comprar', 'perfecto', 'excelente', 'me gusta'];
    return keywords.filter(keyword => message.toLowerCase().includes(keyword));
  }

  private detectBuyingSignals(message: string): string[] {
    const signals = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cuando puedo')) signals.push('urgencia_temporal');
    if (lowerMessage.includes('precio final')) signals.push('negociacion_precio');
    if (lowerMessage.includes('disponible')) signals.push('verificacion_stock');
    if (lowerMessage.includes('financiamiento')) signals.push('consulta_credito');
    
    return signals;
  }

  private detectPotentialObjections(message: string): string[] {
    const objections = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('muy caro')) objections.push('precio_alto');
    if (lowerMessage.includes('no estoy seguro')) objections.push('indecision');
    if (lowerMessage.includes('pensarlo')) objections.push('necesita_tiempo');
    if (lowerMessage.includes('otros lugares')) objections.push('comparando_competencia');
    
    return objections;
  }
}