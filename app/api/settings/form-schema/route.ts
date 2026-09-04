import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

const schemaFilePath = path.join(process.cwd(), 'utils', 'formSchemaSettings.json');

export interface FormFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'checkbox' | 'textarea';
  section: 'leadInfo' | 'contactInfo' | 'poa' | 'diagnosis' | 'screening';
  required: boolean;
  active?: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormSchemaContainer {
  version: number;
  updatedAt: string;
  updatedBy?: string;
  fields: FormFieldDefinition[];
  overrides?: Record<string, FormFieldDefinition[]>;
}

const DEFAULT_FORM_FIELDS: FormFieldDefinition[] = [
  // 1. Lead Information
  { id: '1', name: 'contactName', label: 'Contact Name', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'e.g. Jane Doe' },
  { id: '2', name: 'type', label: 'Tort Category', type: 'select', section: 'leadInfo', required: true, active: true, options: ['PFAS', 'Rideshare', 'Roblox', 'LA County JDC Sexual Abuse', 'Roundup', 'Storm', 'Talcum', 'Wildfire', 'Camp Lejeune', 'NEC Baby Formula', 'Hair Straightener', 'Personal Injury', 'Other'] },
  { id: '3', name: 'status', label: 'Initial Status', type: 'select', section: 'leadInfo', required: true, active: true, options: ['New', 'In Progress', 'Sent'] },
  { id: '4', name: 'leadName', label: 'Lead Full Name', type: 'text', section: 'leadInfo', required: false, active: true, placeholder: 'e.g. Jane Doe' },
  { id: '5', name: 'substatus', label: 'TCPA Substatus', type: 'select', section: 'leadInfo', required: false, active: true, options: ['None', 'No TCPA', 'Redo TCPA', 'TCPA OK'] },
  { id: '6', name: 'tier', label: 'Intake Tier Allocation', type: 'select', section: 'leadInfo', required: false, active: true, options: ['Tier 1', 'Tier 2', 'Tier 3'] },

  // 2. Contact Information
  { id: '7', name: 'firstName', label: 'First Name', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'First Name' },
  { id: '8', name: 'lastName', label: 'Last Name', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'Last Name' },
  { id: '9', name: 'gender', label: 'Gender', type: 'select', section: 'contactInfo', required: false, active: true, options: ['Male', 'Female', 'Other', 'Prefer Not to Say'] },
  { id: '10', name: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'contactInfo', required: false, active: true },
  { id: '11', name: 'phoneNumber', label: 'Phone Number', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: '(555) 000-0000' },
  { id: '12', name: 'email', label: 'Email Address', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'claimant@example.com' },
  { id: '13', name: 'state', label: 'State Jurisdiction', type: 'text', section: 'contactInfo', required: true, active: true, placeholder: 'e.g. CA' },
  { id: '14', name: 'addressStreet', label: 'Address Street & City', type: 'text', section: 'contactInfo', required: false, active: true, placeholder: '123 Main St, Suite 4' },

  // 3. Power of Attorney
  { id: '15', name: 'powerOfAttorney', label: 'Power of Attorney Active?', type: 'select', section: 'poa', required: false, active: true, options: ['No', 'Yes'] },
  { id: '16', name: 'victimName', label: 'Victim / Primary Claimant Name', type: 'text', section: 'poa', required: false, active: true, placeholder: 'Victim Name if different' },

  // 4. Medical & Diagnosis
  { id: '17', name: 'incidentType', label: 'Incident Classification', type: 'select', section: 'diagnosis', required: false, active: true, options: ['Oral Vaginal/anal – Rape', 'Vaginal/anal – Penetration', 'Digital penetration', 'Grooming / Sexual Exploitation', 'Physical Abuse', 'Other'] },
  { id: '18', name: 'diagnosis', label: 'Medical Diagnosis', type: 'select', section: 'diagnosis', required: true, active: true, options: ['PTSD (Post-Traumatic Stress Disorder)', 'Sexual Dysfunction', 'Anxiety', 'Depression', 'Non-Hodgkin Lymphoma', 'Renal Carcinoma / Kidney Cancer', 'Leukemia / Blood Cancer', 'Ovarian Cancer', 'Parkinson\'s Disease', 'Other Medical Condition'] },
  { id: '19', name: 'diagnosingHospitalName', label: 'Diagnosing Hospital / Clinic', type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'St. Jude Medical Center' },
  { id: '20', name: 'treatingDoctorName', label: 'Treating Doctor Name', type: 'text', section: 'diagnosis', required: false, active: true, placeholder: 'Dr. Smith' },

  // 5. Screening & Qualifier Criteria
  { id: '21', name: 'rideshareProvider', label: 'Rideshare Provider', type: 'select', section: 'screening', required: false, active: true, options: ['Uber', 'Lyft'] },
  { id: '22', name: 'rideshareAssaulted', label: 'Assaulted in Rideshare?', type: 'select', section: 'screening', required: false, active: true, options: ['Yes', 'No'] },
  { id: '23', name: 'rideshareNarrative', label: 'Full Incident Narrative', type: 'textarea', section: 'screening', required: false, active: true, placeholder: 'Detailed narrative description of exposure or incident...' },
  { id: '24', name: 'hasMedicalRecords', label: 'Medical Records Available?', type: 'select', section: 'screening', required: false, active: true, options: ['Yes', 'No'] },
];

const defaultContainer: FormSchemaContainer = {
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Default',
  fields: DEFAULT_FORM_FIELDS,
  overrides: {},
};

async function readSchema(): Promise<FormSchemaContainer> {
  try {
    const data = await fs.readFile(schemaFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed && Array.isArray(parsed.fields)) {
      return {
        ...defaultContainer,
        ...parsed,
        overrides: parsed.overrides || {},
      };
    }
    return defaultContainer;
  } catch (error) {
    await fs.mkdir(path.dirname(schemaFilePath), { recursive: true });
    await fs.writeFile(schemaFilePath, JSON.stringify(defaultContainer, null, 2), 'utf-8');
    return defaultContainer;
  }
}

async function writeSchema(container: FormSchemaContainer) {
  await fs.mkdir(path.dirname(schemaFilePath), { recursive: true });
  await fs.writeFile(schemaFilePath, JSON.stringify(container, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const campaignId = searchParams.get('campaignId');

    const container = await readSchema();
    let fields = container.fields;

    // Check specific vendor/campaign override if available
    const overrides = container.overrides || {};
    if (vendorId && campaignId && overrides[`${vendorId}_${campaignId}`]) {
      fields = overrides[`${vendorId}_${campaignId}`];
    } else if (vendorId && overrides[vendorId]) {
      fields = overrides[vendorId];
    }

    return NextResponse.json({
      success: true,
      vendorId: vendorId || null,
      campaignId: campaignId || null,
      schema: {
        ...container,
        fields,
      },
    });
  } catch (error) {
    console.error('Form Schema GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    const body = await req.json();
    const vendorId = body.vendorId || null;
    const campaignId = body.campaignId || null;

    const currentSchema = await readSchema();
    const newVersion = (currentSchema.version || 0) + 1;
    const newFields: FormFieldDefinition[] = Array.isArray(body.fields) ? body.fields : currentSchema.fields;

    const overrides = { ...(currentSchema.overrides || {}) };
    let mainFields = currentSchema.fields;

    if (vendorId && campaignId) {
      overrides[`${vendorId}_${campaignId}`] = newFields;
    } else if (vendorId) {
      overrides[vendorId] = newFields;
    } else {
      mainFields = newFields;
    }

    const updatedContainer: FormSchemaContainer = {
      version: newVersion,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name || user?.email || 'Admin User',
      fields: mainFields,
      overrides,
    };

    await writeSchema(updatedContainer);

    // Audit Log Creation if user exists
    if (user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'FORM_SCHEMA_UPDATED',
            tableName: 'FormSchemaSettings',
            recordId: `v${newVersion}`,
            oldValues: JSON.stringify({ version: currentSchema.version, count: currentSchema.fields.length }),
            newValues: JSON.stringify({ version: newVersion, count: newFields.length, vendorId, campaignId }),
          },
        });
      } catch (auditErr) {
        console.warn('Could not write audit log for form schema update:', auditErr);
      }
    }

    return NextResponse.json({
      success: true,
      vendorId,
      campaignId,
      message: `Form schema saved successfully (Version ${newVersion})`,
      schema: {
        ...updatedContainer,
        fields: newFields,
      },
    });
  } catch (error) {
    console.error('Form Schema PUT error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
