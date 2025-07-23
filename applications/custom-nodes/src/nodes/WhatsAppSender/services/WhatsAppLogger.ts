
export class WhatsAppLogger {
    constructor(private tenantId: string) {}

    async logMessage(messageData: any): Promise<void> {
        // Simulate logging to a database
        console.log('Message logged to history:', {
            messageId: messageData.message_id,
            tenantId: this.tenantId,
            ...messageData
        });
    }
}
