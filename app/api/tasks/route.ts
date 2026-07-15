import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth, checkPermission } from '../../../lib/authHelper';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'read:tasks')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    const where: any = {};
    if (leadId) {
      where.leadId = leadId;
    } else {
      // General user task limiters
      if (user.roleName !== 'Super Admin' && user.roleName !== 'Admin') {
        where.assignedToId = user.id;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: true,
        lead: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    if (!checkPermission(user, 'create:tasks')) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const { title, description, dueDate, priority, leadId, assignedToId } = await req.json();

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        leadId,
        assignedToId: assignedToId || user.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Task created successfully', task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
