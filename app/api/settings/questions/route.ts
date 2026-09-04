import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../../lib/authHelper';
import { DEFAULT_TORT_QUESTIONS, TortQuestionsMap } from '../../../../store/tortQuestionsStore';

const questionsFilePath = path.join(process.cwd(), 'utils', 'tortQuestionsSettings.json');

interface QuestionsContainer {
  version: number;
  updatedAt: string;
  updatedBy?: string;
  questionsMap: TortQuestionsMap;
}

const defaultContainer: QuestionsContainer = {
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Default',
  questionsMap: DEFAULT_TORT_QUESTIONS,
};

async function readQuestionsMapFromDisk(): Promise<QuestionsContainer> {
  try {
    const data = await fs.readFile(questionsFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed.questionsMap === 'object') {
      return {
        ...defaultContainer,
        ...parsed,
        questionsMap: {
          ...DEFAULT_TORT_QUESTIONS,
          ...parsed.questionsMap,
        },
      };
    }
    return defaultContainer;
  } catch (error) {
    await fs.mkdir(path.dirname(questionsFilePath), { recursive: true });
    await fs.writeFile(questionsFilePath, JSON.stringify(defaultContainer, null, 2), 'utf-8');
    return defaultContainer;
  }
}

async function writeQuestionsMapToDisk(container: QuestionsContainer) {
  await fs.mkdir(path.dirname(questionsFilePath), { recursive: true });
  await fs.writeFile(questionsFilePath, JSON.stringify(container, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const container = await readQuestionsMapFromDisk();
    return NextResponse.json({
      success: true,
      version: container.version,
      updatedAt: container.updatedAt,
      updatedBy: container.updatedBy,
      questionsMap: container.questionsMap,
    });
  } catch (error) {
    console.error('API /api/settings/questions GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch tort questions' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    const body = await req.json();

    if (!body || typeof body.questionsMap !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload. questionsMap object required.' }, { status: 400 });
    }

    const currentContainer = await readQuestionsMapFromDisk();
    const newVersion = (currentContainer.version || 0) + 1;
    const updatedMap: TortQuestionsMap = {
      ...currentContainer.questionsMap,
      ...body.questionsMap,
    };

    const updatedContainer: QuestionsContainer = {
      version: newVersion,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name || user?.email || 'Admin User',
      questionsMap: updatedMap,
    };

    await writeQuestionsMapToDisk(updatedContainer);

    // Record audit log if user is logged in
    if (user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'TORT_QUESTIONS_UPDATED',
            tableName: 'TortQuestionsSettings',
            recordId: `v${newVersion}`,
            oldValues: JSON.stringify({ version: currentContainer.version }),
            newValues: JSON.stringify({ version: newVersion, updatedBy: updatedContainer.updatedBy }),
          },
        });
      } catch (auditErr) {
        console.warn('Audit log write skipped for tort questions update:', auditErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tort questions updated and synced centrally (Version ${newVersion})`,
      version: newVersion,
      questionsMap: updatedMap,
    });
  } catch (error) {
    console.error('API /api/settings/questions PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save tort questions' }, { status: 500 });
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
