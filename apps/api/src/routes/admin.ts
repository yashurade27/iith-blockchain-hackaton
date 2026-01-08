import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { distributeTokens, batchDistributeTokens } from '../services/blockchain';
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

const batchDistributionSchema = z.array(
  z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    amount: z.number().positive(),
    activityType: z.enum(['CONTEST_PARTICIPATION', 'EVENT_ATTENDANCE', 'WORKSHOP_COMPLETION', 'CONTENT_CREATION', 'VOLUNTEERING']),
    description: z.string().min(1).max(255),
  })
);

const verifyActivitySchema = z.object({
  userId: z.string().min(1),
  activityType: z.enum(['CONTEST_PARTICIPATION', 'EVENT_ATTENDANCE', 'WORKSHOP_COMPLETION', 'CONTENT_CREATION', 'VOLUNTEERING']),
  points: z.number().positive(),
  metadata: z.object({
    eventId: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

const rewardSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().int().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1),
  isActive: z.boolean().optional(),
});

const rewardUpdateSchema = rewardSchema.partial();

/**
 * POST /api/admin/rewards
 * Create a new reward
 */
router.post('/rewards', async (req: AuthRequest, res: Response, next) => {
  try {
    const data = rewardSchema.parse(req.body);
    
    const reward = await prisma.reward.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });

    logger.info(`Reward created: ${reward.name}`);

    res.json({
      success: true,
      data: { reward },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid reward data', 400));
    } else {
      next(error);
    }
  }
});

/**
 * PATCH /api/admin/rewards/:id
 * Update an existing reward
 */
router.patch('/rewards/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const data = rewardUpdateSchema.parse(req.body);

    const reward = await prisma.reward.update({
      where: { id },
      data,
    });

    logger.info(`Reward updated: ${reward.name}`);

    res.json({
      success: true,
      data: { reward },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid reward update data', 400));
    } else {
      next(error);
    }
  }
});

/**
 * DELETE /api/admin/rewards/:id
 * Delete a reward
 */
router.delete('/rewards/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    // Check if reward exists and has redemptions
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

    if (reward._count.redemptions > 0) {
      // Soft delete if it has redemptions history
      const updated = await prisma.reward.update({
        where: { id },
        data: { isActive: false },
      });
      logger.info(`Reward soft-deleted (archived): ${reward.name}`);
      res.json({
        success: true,
        message: 'Reward has history, archived instead of deleted',
        data: { reward: updated },
      });
    } else {
      // Hard delete if no history
      await prisma.reward.delete({
        where: { id },
      });
      logger.info(`Reward deleted: ${reward.name}`);
      res.json({
        success: true,
        message: 'Reward deleted successfully',
      });
    }
  } catch (error) {
    next(error);
  }
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
 * POST /api/admin/batch-distribute
 * Batch distribute G-CORE tokens to multiple users
 */
router.post('/batch-distribute', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const distributions = batchDistributionSchema.parse(req.body);
    logger.info(`Batch distribution: ${distributions.length} distributions initiated`);

    const results: any[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const dist of distributions) {
      try {
        const { walletAddress, amount, activityType, description } = dist;

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

        const txHash = await distributeTokens(
          walletAddress,
          amount,
          activityType,
          description
        );

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
              batchOperation: true,
            },
          },
        });

        results.push({
          walletAddress,
          amount,
          status: 'SUCCESS',
          txHash,
          transactionId: transaction.id,
        });

        successCount++;
      } catch (error: any) {
        failureCount++;
        results.push({
          walletAddress: dist.walletAddress,
          amount: dist.amount,
          status: 'FAILED',
          error: error.message,
        });
        logger.error(`Failed to distribute to ${dist.walletAddress}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Batch distribution completed: ${successCount} successful, ${failureCount} failed`,
      data: {
        totalRequests: distributions.length,
        successCount,
        failureCount,
        results,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid batch distribution data', 400));
    } else {
      next(error);
    }
  }
});

/**
 * POST /api/admin/verify-activity
 * Verify and create activity records for users
 */
router.post('/verify-activity', async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { userId, activityType, points, metadata } = verifyActivitySchema.parse(req.body);
    logger.info(`Verifying activity for user ${userId}: ${activityType} (${points} points)`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const activity = await prisma.activity.create({
      data: {
        userId,
        type: activityType as any,
        points,
        verifiedAt: new Date(),
        metadata: {
          ...metadata,
          verifiedBy: req.user.id,
          verificationTimestamp: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      message: 'Activity verified successfully',
      data: {
        activity: {
          id: activity.id,
          userId,
          type: activity.type,
          points: activity.points,
          verifiedAt: activity.verifiedAt,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid activity verification data', 400));
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
      status: z.enum(['PENDING', 'APPROVED', 'FULFILLED', 'DELIVERED', 'CANCELLED']),
      txHash: z.string().optional(),
    }).parse(req.body);

    const redemption = await prisma.redemption.findUnique({
      where: { id },
      include: {
        reward: true,
      },
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

    // Create notification for the user
    try {
      let message = `The status of your redemption for ${redemption.reward.name} has been updated to ${status}.`;
      if (status === 'DELIVERED') {
        message = `Congratulations! Your reward (${redemption.reward.name}) has been delivered. Enjoy your swag!`;
      }

      await prisma.notification.create({
        data: {
          userId: redemption.userId,
          title: 'Redemption Update',
          message,
          type: status === 'DELIVERED' ? 'SUCCESS' : 'INFO',
          link: '/profile',
        },
      });
    } catch (notifyError) {
      logger.error('Failed to notify user about redemption update:', notifyError);
    }

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
