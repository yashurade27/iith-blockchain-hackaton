import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { getTokenBalance } from '../services/blockchain';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/leaderboard
 * Get G-CORE leaderboard with rankings
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    logger.info(`Fetching leaderboard: limit=${limit}, offset=${offset}`);

    const users = await prisma.user.findMany({
      skip: offset,
      take: limit,
      select: {
        id: true,
        walletAddress: true,
        name: true,
        role: true,
        createdAt: true,
        transactions: true,
        activities: true,
        redemptions: true,
      },
    });

    const totalUsers = await prisma.user.count();

    // Fetch blockchain balances for each user
    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        try {
          const balance = await getTokenBalance(user.walletAddress);
          logger.info(`Fetched balance for ${user.walletAddress}: ${balance.formatted}`);
          return {
            ...user,
            balance: balance.formatted,
            transactionCount: user.transactions.length,
            activityCount: user.activities.length,
            redemptionCount: user.redemptions.length,
          };
        } catch (error) {
          logger.warn(`Failed to fetch balance for ${user.walletAddress}`);
          return {
            ...user,
            balance: '0',
            transactionCount: user.transactions.length,
            activityCount: user.activities.length,
            redemptionCount: user.redemptions.length,
          };
        }
      })
    );

    // Sort by balance (descending)
    const sorted = leaderboardData.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

    // Add rank
    const ranked = sorted.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
    }));

    res.json({
      success: true,
      data: {
        leaderboard: ranked,
        pagination: {
          total: totalUsers,
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

export default router;
