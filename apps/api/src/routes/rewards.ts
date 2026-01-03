import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

const redeemSchema = z.object({
  rewardId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

/**
 * GET /api/rewards
 * List all available rewards
 */
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const { category, isActive } = req.query;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (category) {
      where.category = String(category);
    }

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    res.json({
      success: true,
      data: {
        rewards: rewards.map((r) => ({
          ...r,
          redemptionCount: r._count.redemptions,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rewards/:id
 * Get reward details
 */
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const reward = await prisma.reward.findUnique({
      where: { id },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    res.json({
      success: true,
      data: {
        reward: {
          ...reward,
          redemptionCount: reward._count.redemptions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/rewards/redeem
 * Redeem reward with G-CORE tokens
 */
router.post('/redeem', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { rewardId, quantity } = redeemSchema.parse(req.body);
    logger.info(`Redemption: user=${req.user.id}, reward=${rewardId}, qty=${quantity}`);

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new AppError('Reward not found', 404);
    }

    if (!reward.isActive) {
      throw new AppError('Reward is not available', 400);
    }

    if (reward.stock < quantity) {
      throw new AppError(`Insufficient stock. Available: ${reward.stock}`, 400);
    }

    const totalCost = reward.cost * quantity;

    const redemption = await prisma.redemption.create({
      data: {
        userId: req.user.id,
        rewardId: rewardId,
        quantity,
      },
      include: {
        user: true,
        reward: true,
      },
    });

    await prisma.reward.update({
      where: { id: rewardId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount: totalCost,
        type: 'REDEEM',
        description: `Redeemed ${quantity}x ${reward.name}`,
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      message: 'Redemption created successfully',
      data: {
        redemption: {
          id: redemption.id,
          rewardId: reward.id,
          rewardName: reward.name,
          quantity,
          totalCost,
          status: redemption.status,
          createdAt: redemption.createdAt,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid redemption data', 400));
    } else {
      next(error);
    }
  }
});

export default router;
