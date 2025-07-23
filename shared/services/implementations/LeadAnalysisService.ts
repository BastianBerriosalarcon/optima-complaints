
import { ILeadAnalysisService } from '../interfaces/ILeadService';
import { IAIService, IConfigurationService } from '../interfaces/IExternalServices';
import { IAdvisorRepository } from '../interfaces/IDataService';
import { ServiceResponse, AIAnalysis, Lead, WhatsAppMessage, WorkflowContext } from '../../types/core';

import { MessageAnalysisHandler } from './lead_analysis_handlers/MessageAnalysisHandler';
import { EntityExtractionHandler } from './lead_analysis_handlers/EntityExtractionHandler';
import { InterestLevelCalculator } from './lead_analysis_handlers/InterestLevelCalculator';
import { AdvisorSuggester } from './lead_analysis_handlers/AdvisorSuggester';
import { ResponseGenerator } from './lead_analysis_handlers/ResponseGenerator';

export class LeadAnalysisService implements ILeadAnalysisService {
    private messageAnalysisHandler: MessageAnalysisHandler;
    private entityExtractionHandler: EntityExtractionHandler;
    private interestLevelCalculator: InterestLevelCalculator;
    private advisorSuggester: AdvisorSuggester;
    private responseGenerator: ResponseGenerator;

    constructor(
        private aiService: IAIService,
        private configService: IConfigurationService,
        private advisorRepository: IAdvisorRepository
    ) {
        this.messageAnalysisHandler = new MessageAnalysisHandler(this.aiService, this.configService);
        this.entityExtractionHandler = new EntityExtractionHandler(this.aiService);
        this.interestLevelCalculator = new InterestLevelCalculator();
        this.advisorSuggester = new AdvisorSuggester(this.advisorRepository);
        this.responseGenerator = new ResponseGenerator(this.aiService);
    }

    async analyzeMessage(
        message: WhatsAppMessage,
        leadContext: Lead | null,
        context: WorkflowContext
    ): Promise<ServiceResponse<AIAnalysis>> {
        return this.messageAnalysisHandler.handle(message, leadContext, context);
    }

    async extractEntities(messageText: string, context: WorkflowContext): Promise<ServiceResponse<any>> {
        return this.entityExtractionHandler.extractEntities(messageText, context);
    }

    async calculateInterestLevel(analysis: AIAnalysis, leadHistory: any[]): Promise<ServiceResponse<number>> {
        return this.interestLevelCalculator.calculateInterestLevel(analysis, leadHistory);
    }

    async suggestAdvisor(lead: Lead, context: WorkflowContext): Promise<ServiceResponse<string>> {
        return this.advisorSuggester.suggestAdvisor(lead, context);
    }

    async generateResponse(
        analysis: AIAnalysis,
        leadContext: Lead,
        context: WorkflowContext
    ): Promise<ServiceResponse<string>> {
        return this.responseGenerator.generateResponse(analysis, leadContext, context);
    }
}
