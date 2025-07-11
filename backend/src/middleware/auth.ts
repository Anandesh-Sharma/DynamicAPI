import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return next(new AppError('Access token is required', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Access denied', 403));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};