import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';

const settingsFilePath = path.join(process.cwd(), 'utils', 'systemSettings.json');

const defaultSettings = {
  id: 'sys-settings',
  companyName: 'MassCore CRM Inc.',
  primaryColor: '#7367F0',
  smtpHost: 'smtp.mailtrap.io',
  smtpPort: 2525,
  smtpUser: 'mock_smtp_user',
  smtpPass: 'mock_smtp_pass',
  twilioSid: 'ACxxxxxxxxxxxxxxxxxxxxxx',
  twilioToken: 'tokenxxxxxxxxxxxxxxxxxxxx',
};

async function readSettings() {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    await fs.mkdir(path.dirname(settingsFilePath), { recursive: true });
    await fs.writeFile(settingsFilePath, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    return defaultSettings;
  }
}

async function writeSettings(settings: any) {
  await fs.mkdir(path.dirname(settingsFilePath), { recursive: true });
  await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:settings')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const settings = await readSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'write:settings')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const currentSettings = await readSettings();
    const updatedSettings = { ...currentSettings, ...body };

    await writeSettings(updatedSettings);

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SETTINGS_UPDATED',
        tableName: 'SystemSettings',
        recordId: updatedSettings.id,
        newValues: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, message: 'System settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Settings PUT error:', error);
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
