import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { distributeTokens } from '../services/blockchain';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

const distributionSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.number().positive(),
  activityType: z.enum(['CONTEST_PARTICIPATION', 'EVENT_ATTENDANCE', 'WORKSHOP_COMPLETION', 'CONTENT_CREATION', 'VOLUNTEERING']),
  description: z.string().min(1).max(255),
});

/**
 * POST /api/admin/distribute
 * Distribute G-CORE tokens
 */
router.post('/distribute', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { walletAddress, amount, activityType, description } = distributionSchema.parse(req.body);
    logger.info(`Distribution: ${amount} tokens to ${walletAddress}`);

    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
        },
      });
    }

    const txHash = await distributeTokens(walletAddress, amount, activityType, description);

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'EARN',
        description: `${activityType}: ${description}`,
        txHash,
        status: 'COMPLETED',
      },
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: activityType as any,
        points: amount,
        verifiedAt: new Date(),
        metadata: {
          description,
          distributedBy: req.user.id,
          txHash,
        },
      },
    });

    res.json({
      success: true,
      message: 'Tokens distributed successfully',
      data: {
        transaction: {
          id: transaction.id,
          userId: user.id,
          amount,
          txHash,
          status: transaction.status,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid distribution data', 400));
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/admin/redemptions
 * Get all redemptions
 */
router.get('/redemptions', async (req: AuthRequest, res: Response, next) => {
  try {
    const where: any = {};
    if (req.query.status) {
      where.status = String(req.query.status);
    }

    const redemptions = await prisma.redemption.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            name: true,
            email: true,
          },
        },
        reward: {
          select: {
            id: true,
            name: true,
            cost: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { redemptions },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/redemptions/:id
 * Update redemption status
 */
router.patch('/redemptions/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { status, txHash } = z.object({
      status: z.enum(['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED']),
      txHash: z.string().optional(),
    }).parse(req.body);

    const redemption = await prisma.redemption.findUnique({
      where: { id },
    });

    if (!redemption) {
      throw new AppError('Redemption not found', 404);
    }

    const updated = await prisma.redemption.update({
      where: { id },
      data: {
        status: status as any,
        txHash: txHash || undefined,
      },
      include: {
        user: true,
        reward: true,
      },
    });

    logger.info(`Redemption ${id} updated to ${status}`);

    res.json({
      success: true,
      message: 'Redemption updated successfully',
      data: { redemption: updated },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
