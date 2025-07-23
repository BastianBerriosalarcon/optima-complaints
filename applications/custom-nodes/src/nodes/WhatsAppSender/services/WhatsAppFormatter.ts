
export class WhatsAppFormatter {
    formatPhoneNumber(phone: string): string {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('56')) {
            return cleaned;
        }
        if (cleaned.startsWith('9')) {
            return `56${cleaned}`;
        }
        return cleaned;
    }

    isValidPhoneNumber(phone: string): boolean {
        return /^569\d{8}$/.test(phone);
    }

    buildTextPayload(to: string, body: string): any {
        return {
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body }
        };
    }

    buildTemplatePayload(to: string, name: string, language: string, components: any[]): any {
        return {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: { name, language: { code: language }, components }
        };
    }

    buildMediaPayload(to: string, type: string, media: any): any {
        return {
            messaging_product: 'whatsapp',
            to,
            type,
            [type]: media
        };
    }

    buildInteractivePayload(to: string, interactive: any): any {
        return {
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive
        };
    }
}
