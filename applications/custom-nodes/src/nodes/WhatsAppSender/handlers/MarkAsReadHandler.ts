
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppHandler } from './BaseWhatsAppHandler';
import { WhatsAppClient } from '../services/WhatsAppClient';

export class MarkAsReadHandler implements IWhatsAppHandler {
    constructor(private client: WhatsAppClient) {}

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const messageId = context.getNodeParameter('messageId', 0) as string;

        if (!messageId) {
            return { success: false, error: 'Message ID is required to mark as read' };
        }

        const payload = { messaging_product: 'whatsapp', status: 'read', message_id: messageId };
        const response = await this.client.send(payload, 'messages');

        return { success: true, data: { message_id: messageId, status: 'read', api_response: response.success || true } };
    }
}
