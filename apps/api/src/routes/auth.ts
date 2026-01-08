import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticate, generateToken, JWTPayload } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

const loginSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

const registerSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  collegeEmail: z.string().email('Invalid email format'), // .endsWith('.edu.in') removed for flexibility but logic can be added
  rollNo: z.string().min(1, 'Roll number is required'),
  year: z.enum(['FE', 'SE', 'TE', 'BE']),
  branch: z.enum(['COMPUTER', 'IT', 'CIVIL', 'MECHANICAL', 'ENTC']),
  codeforcesHandle: z.string().optional(),
});

/**
 * POST /api/auth/login
 * Check if user exists and logging in.
 */
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { walletAddress } = loginSchema.parse(req.body);
    const normalizedAddress = walletAddress.toLowerCase();

    logger.info(`Login attempt: ${normalizedAddress}`);

    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    // Check if this is the predefined admin wallet
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();
    if (!user && adminWallet && normalizedAddress === adminWallet) {
      logger.info(`Auto-creating admin user for: ${normalizedAddress}`);
      user = await prisma.user.create({
        data: {
          walletAddress: normalizedAddress,
          role: 'ADMIN',
          status: 'APPROVED',
          name: 'Admin User',
        },
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not registered',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.status === 'REJECTED') {
      throw new AppError('Your account has been rejected by the admin.', 403);
    }

    const tokenPayload: JWTPayload = {
      userId: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.collegeEmail || user.email,
          role: user.role,
          status: user.status,
        },
        token,
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
 * POST /api/auth/register
 * Register a new user with details
 */
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const normalizedAddress = data.walletAddress.toLowerCase();

    logger.info(`Registration attempt: ${normalizedAddress}`);

    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (existingUser) {
      throw new AppError('User already registered', 400);
    }

    const existingEmail = await prisma.user.findUnique({
      where: { collegeEmail: data.collegeEmail },
    });

    if (existingEmail) {
      throw new AppError('College email already in use', 400);
    }

    const isAdmin = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase() === normalizedAddress;

    const user = await prisma.user.create({
      data: {
        walletAddress: normalizedAddress,
        name: data.name,
        collegeEmail: data.collegeEmail,
        rollNo: data.rollNo,
        year: data.year,
        branch: data.branch,
        codeforcesHandle: data.codeforcesHandle,
        role: isAdmin ? 'ADMIN' : 'USER',
        status: isAdmin ? 'APPROVED' : 'PENDING',
      },
    });

    // Notify all admins about new registration
    try {
      if (!isAdmin) {
        const admins = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
          select: { id: true }
        });

        if (admins.length > 0) {
          await prisma.notification.createMany({
            data: admins.map(admin => ({
              userId: admin.id,
              title: 'New Registration',
              message: `New student registration from ${data.name}. Please review and approve.`,
              type: 'INFO',
              link: '/admin'
            }))
          });
        }
      }
    } catch (notifyError) {
      logger.error('Failed to notify admins about new registration:', notifyError);
    }

    const tokenPayload: JWTPayload = {
      userId: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Waiting for admin approval.',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.collegeEmail,
          role: user.role,
          status: user.status,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
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
    
    // Refresh user data from DB to get latest status
    const freshUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    if (!freshUser) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: freshUser.id,
          walletAddress: freshUser.walletAddress,
          name: freshUser.name,
          email: freshUser.collegeEmail || freshUser.email,
          role: freshUser.role,
          status: freshUser.status,
          details: {
            rollNo: freshUser.rollNo,
            year: freshUser.year,
            branch: freshUser.branch,
            codeforcesHandle: freshUser.codeforcesHandle,
          }
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
