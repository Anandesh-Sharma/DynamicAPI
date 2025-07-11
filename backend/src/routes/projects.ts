import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createProjectValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'ARCHIVED']),
  body('privacy').optional().isIn(['PUBLIC', 'PRIVATE', 'TEAM_ONLY']),
  body('teamId').optional().isString(),
];

const updateProjectValidation = [
  param('id').isString().withMessage('Valid project ID is required'),
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Project name cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'ARCHIVED']),
  body('privacy').optional().isIn(['PUBLIC', 'PRIVATE', 'TEAM_ONLY']),
];

// Routes
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProjectValidation, validateRequest, createProject);
router.put('/:id', updateProjectValidation, validateRequest, updateProject);
router.delete('/:id', deleteProject);

export default router;