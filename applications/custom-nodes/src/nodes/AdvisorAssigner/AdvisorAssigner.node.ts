
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase } from '../base/OptimaCxNodeBase';
import { AdvisorAssignerService } from './AdvisorAssignerService';
import { advisorAssignerProperties } from './ui';

export class AdvisorAssigner extends OptimaCxNodeBase {
    description: INodeTypeDescription = {
        displayName: 'Advisor Assigner',
        name: 'advisorAssigner',
        icon: 'file:advisorAssigner.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Assign leads to advisors based on workload, specialty, and availability',
        defaults: {
            name: 'Advisor Assigner',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'optimaCxApi',
                required: true,
            },
        ],
        properties: advisorAssignerProperties,
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const operation = this.getNodeParameter('operation', 0) as string;
        
        const strategyOptions = this.getNodeParameter('strategyOptions', 0, {}) as any;
        const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as any;
        
        const combinedOptions = {
            ...strategyOptions,
            ...additionalOptions
        };
        
        const service = new AdvisorAssignerService(
            await this.getCredentials('optimaCxApi'),
            combinedOptions
        );

        return await this.executeWithErrorHandling.call(this, service, operation);
    }
}
