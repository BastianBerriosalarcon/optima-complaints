
import { IExecuteFunctions } from 'n8n-workflow';
import { IOptimaCxNodeService } from '../base/OptimaCxNodeBase';
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppHandler } from './handlers/BaseWhatsAppHandler';
import { SendMessageHandler } from './handlers/SendMessageHandler';
import { SendTemplateHandler } from './handlers/SendTemplateHandler';
import { SendMediaHandler } from './handlers/SendMediaHandler';
import { SendInteractiveHandler } from './handlers/SendInteractiveHandler';
import { MarkAsReadHandler } from './handlers/MarkAsReadHandler';
import { GetDeliveryStatusHandler } from './handlers/GetDeliveryStatusHandler';
import { WhatsAppClient } from './services/WhatsAppClient';
import { WhatsAppFormatter } from './services/WhatsAppFormatter';
import { WhatsAppLogger } from './services/WhatsAppLogger';

export class WhatsAppSenderService implements IOptimaCxNodeService {
    private handlers: { [key: string]: IWhatsAppHandler };

    constructor(credentials: any, whatsappCredentials: any, options: any = {}) {
        const client = new WhatsAppClient(whatsappCredentials);
        const formatter = new WhatsAppFormatter();
        const logger = new WhatsAppLogger(credentials.tenantId);

        this.handlers = {
            sendMessage: new SendMessageHandler(client, formatter, logger),
            sendTemplate: new SendTemplateHandler(client, formatter, logger),
            sendMedia: new SendMediaHandler(client, formatter, logger),
            sendInteractive: new SendInteractiveHandler(client, formatter, logger),
            markAsRead: new MarkAsReadHandler(client),
            getDeliveryStatus: new GetDeliveryStatusHandler(client),
        };
    }

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const operation = context.getNodeParameter('operation', 0) as string;
        const handler = this.handlers[operation];

        if (!handler) {
            return { success: false, error: `Unknown operation: ${operation}` };
        }

        try {
            return await handler.execute(context, input);
        } catch (error) {
            return { success: false, error: `Execution failed for ${operation}: ${error.message}` };
        }
    }
}
