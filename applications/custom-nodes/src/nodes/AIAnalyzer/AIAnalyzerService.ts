
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';
import { IAnalysisHandler } from './handlers/BaseAnalysisHandler';
import { IntentAnalysisHandler } from './handlers/IntentAnalysisHandler';
import { EntityExtractionHandler } from './handlers/EntityExtractionHandler';
import { LeadClassificationHandler } from './handlers/LeadClassificationHandler';
import { ResponseGenerationHandler } from './handlers/ResponseGenerationHandler';
import { SentimentAnalysisHandler } from './handlers/SentimentAnalysisHandler';

export class AIAnalyzerService implements IOptimaCxNodeService {
    private handlers: { [key: string]: IAnalysisHandler };

    constructor(private credentials: any, private options: any = {}) {
        this.handlers = {
            analyzeIntent: new IntentAnalysisHandler(),
            extractEntities: new EntityExtractionHandler(),
            classifyLead: new LeadClassificationHandler(),
            generateResponse: new ResponseGenerationHandler(),
            sentimentAnalysis: new SentimentAnalysisHandler(),
        };
    }

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const operation = context.getNodeParameter('operation', 0) as string;
        const handler = this.handlers[operation];

        if (!handler) {
            return { success: false, error: `Unknown operation: ${operation}` };
        }

        if (this.options.enableLogging) {
            console.log(`Executing operation: ${operation} for tenant: ${this.credentials.tenantId}`);
        }

        try {
            return await handler.execute(context, input);
        } catch (error) {
            return { success: false, error: `Execution failed for ${operation}: ${error.message}` };
        }
    }
}
