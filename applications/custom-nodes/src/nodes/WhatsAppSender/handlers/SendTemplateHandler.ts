
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppHandler } from './BaseWhatsAppHandler';
import { WhatsAppClient } from '../services/WhatsAppClient';
import { WhatsAppFormatter } from '../services/WhatsAppFormatter';
import { WhatsAppLogger } from '../services/WhatsAppLogger';

export class SendTemplateHandler implements IWhatsAppHandler {
    constructor(
        private client: WhatsAppClient,
        private formatter: WhatsAppFormatter,
        private logger: WhatsAppLogger
    ) {}

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
        const templateName = context.getNodeParameter('templateName', 0) as string;
        const templateLanguage = context.getNodeParameter('templateLanguage', 0, 'es') as string;
        const templateParams = context.getNodeParameter('templateParams', 0, []) as any[];

        if (!recipientPhone || !templateName) {
            return { success: false, error: 'Recipient phone and template name are required' };
        }

        const formattedPhone = this.formatter.formatPhoneNumber(recipientPhone);
        if (!this.formatter.isValidPhoneNumber(formattedPhone)) {
            return { success: false, error: `Invalid phone number: ${recipientPhone}` };
        }

        const components = this.buildTemplateComponents(templateParams);
        const payload = this.formatter.buildTemplatePayload(formattedPhone, templateName, templateLanguage, components);
        const response = await this.client.send(payload);

        const result = {
            message_id: response.messages[0].id,
            recipient_phone: formattedPhone,
            template_name: templateName,
            status: 'sent',
        };

        await this.logger.logMessage(result);
        return { success: true, data: result };
    }

    private buildTemplateComponents(params: any[]): any[] {
        if (!params || params.length === 0) return [];
        return [
            {
                type: 'body',
                parameters: params.map(param => ({ type: 'text', text: param.value || param }))
            }
        ];
    }
}
