import { Router } from 'express';
import { getUserProfile, updateUserProfile, searchUsers } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/search', searchUsers);

export default router;