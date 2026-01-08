import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import { z } from 'zod';

const router = Router();

/**
 * GET /api/events
 * List active events
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
      include: {
        participations: {
          select: { userId: true, status: true } // Modified to return list for checking in frontend if needed, or just specific user
        },
        _count: {
            select: { participations: true }
        }
      }
    });

    const mappedEvents = events.map(e => ({
      ...e,
      userStatus: e.participations.find(p => p.userId === req.user?.id)?.status || 'NONE'
    }));

    res.json({
      success: true,
      data: { events: mappedEvents }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:id/join
 * User requests to join an event (claim participation)
 */
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    if (!req.user) throw new AppError("Auth required", 401);

    const event = await prisma.event.findUnique({ 
        where: { id },
        include: {
            _count: { select: { participations: true } }
        }
    });

    if (!event) throw new AppError("Event not found", 404);
    if (!event.isActive) throw new AppError("Event is not active", 400);

    // Check if user is approved
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.status !== 'APPROVED') {
        throw new AppError("Only approved GDG members can register for events", 403);
    }

    if (event.totalSlots > 0 && event._count.participations >= event.totalSlots) {
        throw new AppError("Event is full", 400);
    }

    const participation = await prisma.eventParticipation.create({
      data: {
        userId: req.user.id,
        eventId: id,
        status: 'PENDING'
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Event Registration',
        message: `You've registered for ${event.title}. Stay tuned for updates!`,
        type: 'SUCCESS',
        link: '/events'
      }
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    });

    for (const admin of admins) {
        await prisma.notification.create({
            data: {
                userId: admin.id,
                title: 'New Event Registration',
                message: `${user.name || user.walletAddress} has registered for ${event.title}.`,
                type: 'INFO',
                link: `/admin/events/${id}/participants`
            }
        });
    }

    res.json({
      success: true,
      message: 'Participation requested',
      data: { participation }
    });
  } catch (error: any) {
    if (error.code === 'P2002') { // Prisma unique constraint violation
         return next(new AppError("Already joined this event", 400));
    }
    next(error);
  }
});

export default router;
