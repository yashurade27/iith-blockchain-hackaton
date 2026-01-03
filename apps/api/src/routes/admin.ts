import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import prisma from '../utils/prisma';
import { distributeTokens, batchDistributeTokens } from '../services/blockchain';
import { AppError } from '../middleware/errorHandler';
import { ActivityType } from '@prisma/client';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

const distributeSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.number().int().positive(),
  activityType: z.enum([
    'CONTEST_PARTICIPATION',
    'EVENT_ATTENDANCE',
    'WORKSHOP_COMPLETION',
    'CONTENT_CREATION',
    'VOLUNTEERING',
  ]),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const batchDistributeSchema = z.object({
  distributions: z.array(
    z.object({
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      amount: z.number().int().positive(),
      description: z.string().min(1),
    })
  ),
});

const verifyActivitySchema = z.object({
  userId: z.string().uuid(),
  activityId: z.string().uuid(),
});

router.post('/distribute', async (req: AuthRequest, res, next) => {
  try {
    const { walletAddress, amount, activityType, description, metadata } =
      distributeSchema.parse(req.body);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: walletAddress.toLowerCase() },
      });
    }

    // Create activity record
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        type: activityType as ActivityType,
        points: amount,
        metadata: metadata || {},
        verifiedAt: new Date(),
      },
    });

    // Distribute tokens on blockchain
    const txHash = await distributeTokens(walletAddress, amount, activityType, description);

    // Create transaction record
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

    res.json({ activity, transaction, txHash });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid request data', 400));
    } else {
      next(error);
    }
  }
});

router.post('/batch-distribute', async (req: AuthRequest, res, next) => {
  try {
    const { distributions } = batchDistributeSchema.parse(req.body);

    // Process batch distribution on blockchain
    const recipients = distributions.map((d) => d.walletAddress);
    const amounts = distributions.map((d) => d.amount);
    const descriptions = distributions.map((d) => d.description);

    const txHash = await batchDistributeTokens(recipients, amounts, descriptions);

    // Create records for each distribution
    const results = await Promise.all(
      distributions.map(async ({ walletAddress, amount, description }) => {
        let user = await prisma.user.findUnique({
          where: { walletAddress: walletAddress.toLowerCase() },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { walletAddress: walletAddress.toLowerCase() },
          });
        }

        return prisma.transaction.create({
          data: {
            userId: user.id,
            amount,
            type: 'EARN',
            description: `Batch Distribution: ${description}`,
            txHash,
            status: 'COMPLETED',
          },
        });
      })
    );

    res.json({ transactions: results, txHash });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid request data', 400));
    } else {
      next(error);
    }
  }
});

router.post('/verify-activity', async (req: AuthRequest, res, next) => {
  try {
    const { userId, activityId } = verifyActivitySchema.parse(req.body);

    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId,
      },
    });

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    if (activity.verifiedAt) {
      throw new AppError('Activity already verified', 400);
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: { verifiedAt: new Date() },
    });

    res.json({ activity: updatedActivity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid request data', 400));
    } else {
      next(error);
    }
  }
});

router.get('/redemptions', async (req: AuthRequest, res, next) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [redemptions, total] = await Promise.all([
      prisma.redemption.findMany({
        where,
        include: {
          user: true,
          reward: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.redemption.count({ where }),
    ]);

    res.json({
      redemptions,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/redemptions/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(['PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED']) }).parse(req.body);

    const redemption = await prisma.redemption.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        reward: true,
      },
    });

    res.json({ redemption });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid request data', 400));
    } else {
      next(error);
    }
  }
});

export default router;
