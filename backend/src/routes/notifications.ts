import { Router } from 'express';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  deleteNotification
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);
router.delete('/:id', deleteNotification);

export default router;