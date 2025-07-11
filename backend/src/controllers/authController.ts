import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: tokens
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid refresh token', 401));
    }
    logger.error('Token refresh error:', error);
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        status: 'success',
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate reset token (in production, store this in database with expiry)
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, we'll just log the token
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, we have sent a password reset link.',
      // In development, include the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    logger.info(`Password reset successful for user: ${decoded.userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid or expired reset token', 400));
    }
    logger.error('Password reset error:', error);
    next(error);
  }
};