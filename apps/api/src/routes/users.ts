import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { getTokenBalance } from '../services/blockchain';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/users/:address
 * Get user profile by wallet address
 */
router.get('/:address', async (req: AuthRequest, res: Response, next) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        redemptions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:address/balance
 * Get G-CORE token balance for a user
 */
router.get('/:address/balance', async (req: AuthRequest, res: Response, next) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new AppError('Invalid Ethereum address', 400);
    }

    logger.info(`Fetching G-CORE balance for: ${address}`);
    const balance = await getTokenBalance(address);

    // Get database user if exists
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      select: { id: true, walletAddress: true, role: true },
    });

    res.json({
      success: true,
      data: {
        address: address,
        balance: balance.formatted,
        balanceRaw: balance.balance,
        user: user || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/rank/:address
 * Get user rank in leaderboard
 */
router.get('/rank/:address', async (req: AuthRequest, res: Response, next) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get user rank (count users with more total points)
    const rank = await prisma.user.count({
      where: {
        id: {
          not: user.id,
        },
      },
    });

    res.json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        rank: rank + 1,
        totalUsers: rank + 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
