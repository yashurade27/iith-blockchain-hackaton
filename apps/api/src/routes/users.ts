import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getTokenBalance } from '../services/blockchain';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';

const router = Router();

router.get('/:address/balance', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { address } = req.params;
    const balance = await getTokenBalance(address);
    res.json(balance);
  } catch (error) {
    next(error);
  }
});

router.get('/:address', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { address } = req.params;
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
