
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppHandler } from './BaseWhatsAppHandler';
import { WhatsAppClient } from '../services/WhatsAppClient';

export class GetDeliveryStatusHandler implements IWhatsAppHandler {
    constructor(private client: WhatsAppClient) {}

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const messageId = context.getNodeParameter('messageId', 0) as string;

        if (!messageId) {
            return { success: false, error: 'Message ID is required to get delivery status' };
        }

        const deliveryStatus = await this.client.getDeliveryStatus(messageId);

        return { success: true, data: { message_id: messageId, ...deliveryStatus } };
    }
}
