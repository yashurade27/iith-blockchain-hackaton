import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  user?: {
    id: string;
    walletAddress: string;
    email?: string;
    name?: string;
    role: string;
  };
}

export interface JWTPayload {
  userId: string;
  walletAddress: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (payload: JWTPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401);
    } else {
      throw new AppError('Token verification failed', 401);
    }
  }
};

/**
 * Find or create user by wallet address
 */
export const findOrCreateUser = async (walletAddress: string) => {
  try {
    // Normalize wallet address to lowercase
    const normalizedAddress = walletAddress.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      // Check if admin wallet
      const isAdmin = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase() === normalizedAddress;

      user = await prisma.user.create({
        data: {
          walletAddress: normalizedAddress,
          role: isAdmin ? 'ADMIN' : 'USER',
        },
      });

      logger.info(`New user created: ${user.id} (${user.walletAddress})`);
    }

    return user;
  } catch (error) {
    logger.error('Error finding or creating user:', error);
    throw new AppError('Failed to authenticate user', 500);
  }
};

/**
 * JWT Authentication middleware
 * Verifies JWT token and augments request with user data
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Authorization header missing', 401);
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    // Verify and decode token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify wallet address matches (extra security)
    if (user.walletAddress !== decoded.walletAddress) {
      throw new AppError('Token wallet address mismatch', 401);
    }

    // Augment request with user data
    req.userId = user.id;
    req.userRole = user.role;
    req.user = {
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email || undefined,
      name: user.name || undefined,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Adds user data if token is present, but doesn't require it
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(); // No token, continue without user data
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return next(); // No token, continue without user data
    }

    // Verify and decode token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user && user.walletAddress === decoded.walletAddress) {
      // Augment request with user data
      req.userId = user.id;
      req.userRole = user.role;
      req.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email || undefined,
        name: user.name || undefined,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we ignore errors and continue without user data
    logger.debug('Optional authentication failed, continuing without user data');
    next();
  }
};

/**
 * Require admin role middleware
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userRole) {
    throw new AppError('Authentication required', 401);
  }

  if (req.userRole !== 'ADMIN' && req.userRole !== 'SUPER_ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  next();
};

/**
 * Require super admin role middleware
 */
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userRole) {
    throw new AppError('Authentication required', 401);
  }

  if (req.userRole !== 'SUPER_ADMIN') {
    throw new AppError('Super admin access required', 403);
  }

  next();
};

/**
 * Wallet-based authentication helper
 * Used for wallet connection endpoints
 */
export const authenticateWallet = async (
  walletAddress: string
): Promise<{ user: any; token: string }> => {
  try {
    const user = await findOrCreateUser(walletAddress);

    const tokenPayload: JWTPayload = {
      userId: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    return { user, token };
  } catch (error) {
    logger.error('Wallet authentication failed:', error);
    throw new AppError('Authentication failed', 500);
  }
};
