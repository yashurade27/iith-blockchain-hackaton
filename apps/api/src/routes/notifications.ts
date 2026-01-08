import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/notifications
 * Get current user's notifications
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post('/read-all', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
