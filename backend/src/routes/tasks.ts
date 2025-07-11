import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask,
  updateTaskStatus,
  assignTask
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createTaskValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional().isISO8601(),
  body('assigneeId').optional().isString(),
  body('projectId').isString().withMessage('Project ID is required'),
  body('parentId').optional().isString(),
];

const updateTaskValidation = [
  param('id').isString().withMessage('Valid task ID is required'),
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Task title cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional().isISO8601(),
  body('assigneeId').optional().isString(),
];

// Routes
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTaskValidation, validateRequest, createTask);
router.put('/:id', updateTaskValidation, validateRequest, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/assign', assignTask);

export default router;