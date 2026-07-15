export class SMSService {
  static async sendSMS(to: string, message: string): Promise<{ success: boolean; messageId: string }> {
    console.log(`[SMS Sent] To: ${to} | Message: "${message}"`);
    return {
      success: true,
      messageId: `sms_${Math.random().toString(36).substring(2, 11)}`,
    };
  }

  static async sendWhatsApp(to: string, message: string): Promise<{ success: boolean; messageId: string }> {
    console.log(`[WhatsApp Sent] To: ${to} | Message: "${message}"`);
    return {
      success: true,
      messageId: `wa_${Math.random().toString(36).substring(2, 11)}`,
    };
  }
}
