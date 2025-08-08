
import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';
import { IWhatsAppHandler } from './BaseWhatsAppHandler';
import { WhatsAppClient } from '../services/WhatsAppClient';
import { WhatsAppFormatter } from '../services/WhatsAppFormatter';
import { WhatsAppLogger } from '../services/WhatsAppLogger';

export class SendInteractiveHandler implements IWhatsAppHandler {
    constructor(
        private client: WhatsAppClient,
        private formatter: WhatsAppFormatter,
        private logger: WhatsAppLogger
    ) {}

    async execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>> {
        const recipientPhone = context.getNodeParameter('recipientPhone', 0) as string;
        const interactiveType = context.getNodeParameter('interactiveType', 0) as string;
        const headerText = context.getNodeParameter('headerText', 0, '') as string;
        const bodyText = context.getNodeParameter('bodyText', 0) as string;
        const footerText = context.getNodeParameter('footerText', 0, '') as string;
        const buttons = context.getNodeParameter('buttons', 0, []) as any[];

        if (!recipientPhone || !bodyText) {
            return { success: false, error: 'Recipient phone and body text are required' };
        }

        const formattedPhone = this.formatter.formatPhoneNumber(recipientPhone);
        if (!this.formatter.isValidPhoneNumber(formattedPhone)) {
            return { success: false, error: `Invalid phone number: ${recipientPhone}` };
        }

        const interactive = this.buildInteractiveComponent(interactiveType, headerText, bodyText, footerText, buttons);
        const payload = this.formatter.buildInteractivePayload(formattedPhone, interactive);
        const response = await this.client.send(payload);

        const result = {
            message_id: response.messages[0].id,
            recipient_phone: formattedPhone,
            interactive_type: interactiveType,
            status: 'sent',
        };

        await this.logger.logMessage(result);
        return { success: true, data: result };
    }

    private buildInteractiveComponent(type: string, headerText: string, bodyText: string, footerText: string, buttons: any[]): any {
        const interactive: any = { type, body: { text: bodyText } };
        if (headerText) interactive.header = { type: 'text', text: headerText };
        if (footerText) interactive.footer = { text: footerText };
        if (type === 'button' && buttons.length > 0) {
            interactive.action = {
                buttons: buttons.map((btn, index) => ({ type: 'reply', reply: { id: btn.id || `btn_${index}`, title: btn.title } }))
            };
        }
        return interactive;
    }
}
