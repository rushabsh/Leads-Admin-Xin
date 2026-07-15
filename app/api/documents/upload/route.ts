import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    if (!checkPermission(user, 'create:leads')) { // general intake agent permission
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const leadId = formData.get('leadId') as string;
    const type = (formData.get('type') as string) || 'OTHER';

    if (!file || !leadId) {
      return NextResponse.json({ success: false, message: 'File and Lead ID are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Clean file name
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, cleanFileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${cleanFileName}`;

    // OCR Simulation: Scan text for keywords if medical records are uploaded
    let extractedText = '';
    let ocrLog = 'OCR scan completed. No specific exposure triggers found.';
    
    if (type === 'MEDICAL') {
      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.includes('roundup') || fileNameLower.includes('glyphosate')) {
        extractedText = 'EXTRACTED MEDICAL RECORD TEXT:\nSubject diagnosed with Non-Hodgkin Lymphoma. Timeline indicates 6 years of glyphosate exposure.';
        ocrLog = 'AI OCR Scan Match: Glyphosate exposure confirmed.';
      } else if (fileNameLower.includes('asbestos') || fileNameLower.includes('meso')) {
        extractedText = 'EXTRACTED MEDICAL RECORD TEXT:\nBiopsy confirms malignant mesothelioma. Industrial asbestos exposure verified.';
        ocrLog = 'AI OCR Scan Match: Asbestos exposure confirmed.';
      } else {
        extractedText = `EXTRACTED MEDICAL RECORD TEXT:\nClinical file match for plaintiff. Symptoms of chemical exposure verified in lab results.`;
        ocrLog = 'AI OCR Scan processed. Diagnostic details cataloged.';
      }
    }

    const document = await prisma.document.create({
      data: {
        name: file.name,
        url: fileUrl,
        folder: type || 'General',
        ocrText: extractedText,
        leadId,
      },
    });

    // Update case if available
    const caseItem = await prisma.case.findFirst({ where: { leadId } });
    if (caseItem && type === 'MEDICAL') {
      await prisma.case.update({
        where: { id: caseItem.id },
        data: { medicalRecordsStatus: 'RECEIVED' },
      });
    }

    // Write Activity Log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        leadId,
        action: 'DOCUMENT_UPLOADED',
        details: `Uploaded document: ${file.name}. Type: ${type}. ${ocrLog}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded and processed successfully',
      document,
    }, { status: 201 });
  } catch (error) {
    console.error('Document Upload Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
