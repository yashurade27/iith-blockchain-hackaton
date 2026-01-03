import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { getTokenBalance } from '../services/blockchain';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { timeframe = 'all', category = 'all', page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Calculate date filter based on timeframe
    let dateFilter = {};
    if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    } else if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    }

    // Build activity filter
    const activityFilter: any = {};
    if (Object.keys(dateFilter).length > 0) {
      activityFilter.verifiedAt = dateFilter;
    }
    if (category !== 'all') {
      activityFilter.type = category;
    }

    // Get users with their activity points
    const users = await prisma.user.findMany({
      include: {
        activities: {
          where: activityFilter,
        },
      },
    });

    // Calculate total points and get balances
    const leaderboardEntries = await Promise.all(
      users.map(async (user) => {
        const totalPoints = user.activities.reduce((sum, activity) => sum + activity.points, 0);
        let balance = '0';
        try {
          const tokenBalance = await getTokenBalance(user.walletAddress);
          balance = tokenBalance.formatted;
        } catch (error) {
          console.error(`Failed to get balance for ${user.walletAddress}`);
        }

        return {
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            name: user.name,
          },
          totalTokens: parseFloat(balance),
          totalActivities: user.activities.length,
          totalPoints,
        };
      })
    );

    // Sort by tokens and assign ranks
    const sortedEntries = leaderboardEntries
      .sort((a, b) => b.totalTokens - a.totalTokens)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    // Paginate
    const paginatedEntries = sortedEntries.slice(skip, skip + parseInt(limit as string));

    res.json({
      entries: paginatedEntries,
      total: sortedEntries.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
