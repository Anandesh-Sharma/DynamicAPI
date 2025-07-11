import { Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { limit = 20, offset = 0, unreadOnly } = req.query;

    const whereClause: any = { userId };
    
    if (unreadOnly === 'true') {
      whereClause.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.status(200).json({
      status: 'success',
      data: { 
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    next(error);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: { notification: updatedNotification }
    });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    next(error);
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    });

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    next(error);
  }
};