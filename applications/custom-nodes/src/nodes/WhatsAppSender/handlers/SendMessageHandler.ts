
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppHandler } from './BaseWhatsAppHandler';
import { WhatsAppClient } from '../services/WhatsAppClient';
import { WhatsAppFormatter } from '../services/WhatsAppFormatter';
import { WhatsAppLogger } from '../services/WhatsAppLogger';

export class SendMessageHandler implements IWhatsAppHandler {
    constructor(
        private client: WhatsAppClient,
        private formatter: WhatsAppFormatter,
        private logger: WhatsAppLogger
    ) {}

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
        const messageText = context.getNodeParameter('messageText', 0) as string;

        if (!recipientPhone || !messageText) {
            return { success: false, error: 'Recipient phone and message text are required' };
        }

        const formattedPhone = this.formatter.formatPhoneNumber(recipientPhone);
        if (!this.formatter.isValidPhoneNumber(formattedPhone)) {
            return { success: false, error: `Invalid phone number: ${recipientPhone}` };
        }

        const payload = this.formatter.buildTextPayload(formattedPhone, messageText);
        const response = await this.client.send(payload);

        const result = {
            message_id: response.messages[0].id,
            recipient_phone: formattedPhone,
            status: 'sent',
        };

        await this.logger.logMessage(result);
        return { success: true, data: result };
    }
}
