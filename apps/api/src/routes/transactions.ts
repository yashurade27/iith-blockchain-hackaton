import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/transactions/public
 * Get latest transactions globally (public)
 */
router.get('/public', async (req: Request, res: Response, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    
    const transactions = await prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            walletAddress: true,
            name: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: { transactions },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions
 * Get current user's transaction history
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    logger.info(`Fetching transactions for user ${req.user.id}`);

    const where: any = {
      userId: req.user.id,
    };

    if (req.query.type) {
      where.type = String(req.query.type);
    }
    if (req.query.status) {
      where.status = String(req.query.status);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          page: Math.floor(offset / limit) + 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions/:id
 * Get transaction details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.userId !== req.user.id && req.user.role === 'USER') {
      throw new AppError('Unauthorized', 403);
    }

    res.json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
