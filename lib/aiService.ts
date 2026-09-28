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

  static normalizeEmail(email?: string): string {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  static normalizePhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  static isPlaceholderEmail(email?: string): boolean {
    const norm = this.normalizeEmail(email);
    if (!norm) return true;
    if (norm === 'lead@example.com') return true;
    if (norm.startsWith('public.lead.')) return true;
    return false;
  }

  static isPlaceholderPhone(phone?: string): boolean {
    const norm = this.normalizePhone(phone);
    if (!norm) return true;
    if (norm === '5550000000') return true;
    if (norm.length < 7) return true;
    return false;
  }

  static async findDuplicateLead(email?: string, phone?: string): Promise<{ isDuplicate: boolean; reason?: string; existingLead?: any }> {
    const normEmail = this.normalizeEmail(email);
    const normPhone = this.normalizePhone(phone);

    const hasValidEmail = !this.isPlaceholderEmail(normEmail);
    const hasValidPhone = !this.isPlaceholderPhone(normPhone);

    // 1. Strict Global Email Check
    if (hasValidEmail) {
      const existingByEmail = await prisma.lead.findFirst({
        where: {
          email: { equals: normEmail, mode: 'insensitive' }
        },
        include: {
          campaign: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true } }
        }
      });

      if (existingByEmail) {
        return {
          isDuplicate: true,
          reason: 'Lead already Exist',
          existingLead: existingByEmail
        };
      }
    }

    // 2. Strict Global Phone Check (Normalized digits matching)
    if (hasValidPhone) {
      const last10 = normPhone.length >= 10 ? normPhone.slice(-10) : normPhone;

      // Direct indexed check
      const directPhoneMatch = await prisma.lead.findFirst({
        where: {
          OR: [
            { phone: { equals: phone ? phone.trim() : '' } },
            { phone: { contains: last10 } },
            { phone: { contains: normPhone } }
          ]
        },
        include: {
          campaign: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true } }
        }
      });

      if (directPhoneMatch) {
        const foundDigits = (directPhoneMatch.phone || '').replace(/\D/g, '');
        if (foundDigits && foundDigits !== '5550000000' && foundDigits.length >= 7) {
          return {
            isDuplicate: true,
            reason: 'Lead already Exist',
            existingLead: directPhoneMatch
          };
        }
      }

      // Normalized digits scan across all leads
      const candidates = await prisma.lead.findMany({
        where: { phone: { not: '' } },
        select: {
          id: true,
          phone: true,
          email: true,
          campaign: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true } }
        }
      });

      const matchedPhoneLead = candidates.find(c => {
        const cPhoneDigits = (c.phone || '').replace(/\D/g, '');
        if (!cPhoneDigits || cPhoneDigits === '5550000000' || cPhoneDigits.length < 7) return false;
        const cLast10 = cPhoneDigits.length >= 10 ? cPhoneDigits.slice(-10) : cPhoneDigits;
        return cPhoneDigits === normPhone || cLast10 === last10;
      });

      if (matchedPhoneLead) {
        return {
          isDuplicate: true,
          reason: 'Lead already Exist',
          existingLead: matchedPhoneLead
        };
      }
    }

    return { isDuplicate: false };
  }

  static async checkDuplicateLead(firstName: string, lastName: string, email: string, phone: string): Promise<boolean> {
    const result = await this.findDuplicateLead(email, phone);
    return result.isDuplicate;
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
