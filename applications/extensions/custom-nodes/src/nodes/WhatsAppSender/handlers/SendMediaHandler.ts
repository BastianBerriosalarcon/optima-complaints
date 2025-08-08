
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppHandler } from './BaseWhatsAppHandler';
import { WhatsAppClient } from '../services/WhatsAppClient';
import { WhatsAppFormatter } from '../services/WhatsAppFormatter';
import { WhatsAppLogger } from '../services/WhatsAppLogger';

export class SendMediaHandler implements IWhatsAppHandler {
    constructor(
        private client: WhatsAppClient,
        private formatter: WhatsAppFormatter,
        private logger: WhatsAppLogger
    ) {}

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
        const mediaType = context.getNodeParameter('mediaType', 0) as string;
        const mediaUrl = context.getNodeParameter('mediaUrl', 0, '') as string;
        const mediaId = context.getNodeParameter('mediaId', 0, '') as string;
        const caption = context.getNodeParameter('caption', 0, '') as string;

        if (!recipientPhone || (!mediaUrl && !mediaId)) {
            return { success: false, error: 'Recipient phone and media (URL or ID) are required' };
        }

        const formattedPhone = this.formatter.formatPhoneNumber(recipientPhone);
        if (!this.formatter.isValidPhoneNumber(formattedPhone)) {
            return { success: false, error: `Invalid phone number: ${recipientPhone}` };
        }

        const mediaObject: any = {};
        if (mediaId) {
            mediaObject.id = mediaId;
        } else {
            mediaObject.link = mediaUrl;
        }
        if (caption) {
            mediaObject.caption = caption;
        }

        const payload = this.formatter.buildMediaPayload(formattedPhone, mediaType, mediaObject);
        const response = await this.client.send(payload);

        const result = {
            message_id: response.messages[0].id,
            recipient_phone: formattedPhone,
            media_type: mediaType,
            status: 'sent',
        };

        await this.logger.logMessage(result);
        return { success: true, data: result };
    }
}
