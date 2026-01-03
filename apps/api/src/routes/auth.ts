import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticateWallet } from '../middleware/auth';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const connectWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

/**
 * POST /api/auth/connect
 * Connect wallet and receive JWT token
 */
router.post('/connect', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = connectWalletSchema.parse(req.body);
    logger.info(`Wallet connection attempt: ${walletAddress}`);

    const result = await authenticateWallet(walletAddress);

    res.json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        user: {
          id: result.user.id,
          walletAddress: result.user.walletAddress,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        token: result.token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid wallet address format', 400));
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
