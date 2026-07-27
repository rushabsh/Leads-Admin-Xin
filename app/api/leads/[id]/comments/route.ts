import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth } from '../../../../../lib/authHelper';

/**
 * GET - Retrieve all comments for a specific lead in reverse chronological order (newest first)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const { id } = await params;

    let comments: any[] = [];

    try {
      // Primary: Try fetching from Comment model
      if ((prisma as any).comment) {
        comments = await (prisma as any).comment.findMany({
          where: { leadId: id },
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (e) {
      console.warn('Fallback to activityLog for comments...', e);
    }

    // Fallback: Fetch from ActivityLog with action 'COMMENT_ADDED'
    if (comments.length === 0) {
      const logs = await prisma.activityLog.findMany({
        where: {
          leadId: id,
          action: 'COMMENT_ADDED',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      comments = logs.map(log => {
        let content = log.details || '';
        let authorName = log.user?.name || log.user?.email || 'Employee';

        try {
          if (log.details && log.details.startsWith('{')) {
            const parsed = JSON.parse(log.details);
            if (parsed.content) content = parsed.content;
            if (parsed.authorName) authorName = parsed.authorName;
          }
        } catch (_) {}

        return {
          id: log.id,
          leadId: log.leadId,
          userId: log.userId,
          authorName,
          content,
          createdAt: log.createdAt,
          user: log.user,
        };
      });
    }

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error('Error fetching lead comments:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST - Save a new comment for a lead along with employee name, date, and time
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, authorName: customAuthorName } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ success: false, message: 'Comment content cannot be empty' }, { status: 400 });
    }

    const employeeName = customAuthorName || user.name || user.email || 'Employee';
    const cleanContent = content.trim();

    let createdComment: any = null;

    try {
      if ((prisma as any).comment) {
        createdComment = await (prisma as any).comment.create({
          data: {
            leadId: id,
            userId: user.id,
            authorName: employeeName,
            content: cleanContent,
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      }
    } catch (e) {
      console.warn('Prisma comment create fallback to ActivityLog...', e);
    }

    // Always create an ActivityLog as backup / audit track
    const log = await prisma.activityLog.create({
      data: {
        leadId: id,
        userId: user.id,
        action: 'COMMENT_ADDED',
        details: JSON.stringify({
          authorName: employeeName,
          content: cleanContent,
        }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!createdComment) {
      createdComment = {
        id: log.id,
        leadId: id,
        userId: user.id,
        authorName: employeeName,
        content: cleanContent,
        createdAt: log.createdAt,
        user: log.user,
      };
    }

    return NextResponse.json({
      success: true,
      comment: createdComment,
      message: 'Comment added successfully'
    });
  } catch (error: any) {
    console.error('Error posting lead comment:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
