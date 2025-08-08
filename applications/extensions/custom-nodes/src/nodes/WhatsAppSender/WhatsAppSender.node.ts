
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeTypeDescription,
} from 'n8n-workflow';

import { OptimaCxNodeBase } from '../base/OptimaCxNodeBase';
import { WhatsAppSenderService } from './WhatsAppSenderService';
import { whatsAppSenderProperties } from './ui';

export class WhatsAppSender extends OptimaCxNodeBase {
    description: INodeTypeDescription = {
        displayName: 'WhatsApp Sender',
        name: 'whatsAppSender',
        icon: 'file:whatsapp.svg',
        group: ['output'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Send messages via WhatsApp Business API with rich media support',
        defaults: {
            name: 'WhatsApp Sender',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'optimaCxApi',
                required: true,
            },
            {
                name: 'whatsAppBusiness',
                required: true,
            },
        ],
        properties: whatsAppSenderProperties,
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const operation = this.getNodeParameter('operation', 0) as string;
        
        const phoneValidation = this.getNodeParameter('phoneValidation', 0, {}) as any;
        const deliveryOptions = this.getNodeParameter('deliveryOptions', 0, {}) as any;
        const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as any;
        
        const combinedOptions = {
            ...phoneValidation,
            ...deliveryOptions,
            ...additionalOptions
        };
        
        const service = new WhatsAppSenderService(
            await this.getCredentials('optimaCxApi'),
            await this.getCredentials('whatsAppBusiness'),
            combinedOptions
        );

        return await this.executeWithErrorHandling.call(this, service, operation);
    }
}
