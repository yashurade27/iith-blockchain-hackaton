import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { redeemTokens } from '../services/blockchain';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const redeemSchema = z.object({
  rewardId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { category, isActive = 'true' } = req.query;

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isActive === 'true') {
      where.isActive = true;
    }

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: { cost: 'asc' },
    });

    res.json({ rewards });
  } catch (error) {
    next(error);
  }
});

router.post('/redeem', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rewardId, quantity } = redeemSchema.parse(req.body);
    const userId = req.userId!;

    // Get reward
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
      throw new AppError('Insufficient stock', 400);
    }

    const totalCost = reward.cost * quantity;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Redeem tokens on blockchain
    const txHash = await redeemTokens(user.walletAddress, rewardId, totalCost, quantity);

    // Create redemption record
    const redemption = await prisma.redemption.create({
      data: {
        userId,
        rewardId,
        quantity,
        txHash,
        status: 'PENDING',
      },
      include: {
        reward: true,
      },
    });

    // Update stock
    await prisma.reward.update({
      where: { id: rewardId },
      data: { stock: { decrement: quantity } },
    });

    res.json({ redemption, txHash });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid request data', 400));
    } else {
      next(error);
    }
  }
});

export default router;
