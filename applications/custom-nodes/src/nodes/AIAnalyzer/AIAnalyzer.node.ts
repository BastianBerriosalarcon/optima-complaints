
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase } from '../base/OptimaCxNodeBase';
import { AIAnalyzerService } from './AIAnalyzerService';
import { aiAnalyzerProperties } from './ui';

export class AIAnalyzer extends OptimaCxNodeBase {
    description: INodeTypeDescription = {
        displayName: 'AI Analyzer',
        name: 'aiAnalyzer',
        icon: 'file:aiAnalyzer.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Analyze messages and leads using AI and NLP techniques',
        defaults: {
            name: 'AI Analyzer',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'optimaCxApi',
                required: true,
            },
        ],
        properties: aiAnalyzerProperties,
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const operation = this.getNodeParameter('operation', 0) as string;
        
        const aiConfig = this.getNodeParameter('aiConfig', 0, {}) as any;
        const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as any;
        const analysisOptions = this.getNodeParameter('analysisOptions', 0, {}) as any;
        
        const combinedOptions = {
            ...aiConfig,
            ...additionalOptions,
            ...analysisOptions
        };
        
        const service = new AIAnalyzerService(
            await this.getCredentials('optimaCxApi'),
            combinedOptions
        );

        return await this.executeWithErrorHandling.call(this, service, operation);
    }
}
