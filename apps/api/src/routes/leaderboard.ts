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
      select: {
        id: true,
        walletAddress: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
            activities: true,
            redemptions: true,
          }
        }
      },
    });

    const totalUsers = users.length;

    // Fetch blockchain balances for each user
    const leaderboardWithBalances = await Promise.all(
      users.map(async (user) => {
        try {
          const balance = await getTokenBalance(user.walletAddress);
          return {
            id: user.id,
            walletAddress: user.walletAddress,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            balance: balance.formatted,
            transactionCount: user._count.transactions,
            activityCount: user._count.activities,
            redemptionCount: user._count.redemptions,
          };
        } catch (error) {
          return {
            id: user.id,
            walletAddress: user.walletAddress,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            balance: '0',
            transactionCount: user._count.transactions,
            activityCount: user._count.activities,
            redemptionCount: user._count.redemptions,
          };
        }
      })
    );

    // Sort all users by balance (descending)
    const sorted = leaderboardWithBalances.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

    // Apply pagination AFTER sorting
    const paginated = sorted.slice(offset, offset + limit);

    // Add rank based on full sorted list
    const ranked = paginated.map((user) => ({
      ...user,
      rank: sorted.findIndex(u => u.id === user.id) + 1,
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
