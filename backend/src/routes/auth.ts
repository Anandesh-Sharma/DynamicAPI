import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, refreshToken, forgotPassword, resetPassword } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Register validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail(),
];

// Reset password validation
const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('token').notEmpty().withMessage('Reset token is required'),
];

// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

export default router;