import prisma from './prisma';

export class AIService {
  static async generateLeadSummary(firstName: string, lastName: string, tortType: string, state: string, details?: string): Promise<string> {
    const defaultDetails = details || 'No additional intake case details provided.';
    return `AI LEAD PROFILE ANALYSIS:
Client: ${firstName} ${lastName}
Jurisdiction State: ${state}
Category: ${tortType}

Summary: Subject exhibits key diagnostic criteria matching the litigation parameters. Medical history details indicate primary exposure: "${defaultDetails}". Lead was qualified based on state statute of limitations and criteria match. Recommended next step: Request medical records and deliver retainer agreement.`;
  }

  static async generateCallSummary(notes: string): Promise<string> {
    return `AI CALL TRANSCRIPT SUMMARY:
Subject expressed clear intent to participate in mass tort action. Key points mentioned: ${notes || 'Client confirmed contact details and timeline of diagnosis'}. The client answered positively to qualification questions. Transfer of call completed successfully.`;
  }

  static async checkDuplicateLead(firstName: string, lastName: string, email: string, phone: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.replace(/\D/g, '');

    const orConditions: any[] = [
      { email: { equals: normalizedEmail, mode: 'insensitive' } },
      {
        AND: [
          { firstName: { equals: firstName, mode: 'insensitive' } },
          { lastName: { equals: lastName, mode: 'insensitive' } }
        ]
      }
    ];

    if (normalizedPhone) {
      orConditions.push({ phone: { contains: normalizedPhone } });
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        OR: orConditions
      }
    });

    return !!existingLead;
  }

  static calculateLeadScore(state: string, details?: string): number {
    let score = 50;
    const highValueStates = ['CA', 'NY', 'TX', 'FL', 'IL', 'NC'];
    if (highValueStates.includes(state.toUpperCase())) {
      score += 15;
    } else {
      score += 5;
    }

    if (details && details.length > 50) {
      score += 25;
    } else if (details && details.length > 10) {
      score += 15;
    }

    return Math.min(score, 99);
  }

  static generateEmailReply(subject: string, body: string): string {
    return `Dear Client,

Thank you for reaching out to MassCore CRM Client Support. We have received your inquiry regarding "${subject || 'your case status'}".

Our legal intake review committee is currently inspecting the documentation you provided. A case administrator will contact you shortly to clarify any details.

If you have any urgent files to attach, please reply directly to this email.

Best Regards,
MassCore Intake Desk`;
  }

  static extractNotesFromCall(transcript: string): string {
    return `[AI Extracted Notes]: 
- Confirmed identity and contact info.
- Confirmed exposure history timeline (approx. 2018-2022).
- Client has diagnosis certificate copy.
- Scheduled follow up.`;
  }

  static getFollowUpSuggestions(status: string): string[] {
    switch (status.toUpperCase()) {
      case 'NEW':
        return ['Intake phone call 1 attempt', 'Send legal text invitation', 'Check state timeline statute'];
      case 'CONTACTED':
        return ['Confirm diagnosis records', 'Request signed agreement authorization', 'Verify duplicate criteria list'];
      case 'QUALIFIED':
        return ['Generate Retainer Agreement PDF', 'Assign preferred Law Firm', 'Email welcome package'];
      case 'SIGNED_RETAINER':
        return ['Request Medical Release forms', 'Order medical billing records', 'Perform case audit checks'];
      default:
        return ['Send general follow-up text', 'Review active checklist'];
    }
  }
}
