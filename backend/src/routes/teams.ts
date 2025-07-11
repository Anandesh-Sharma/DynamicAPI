import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getTeams, 
  getTeam, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateMemberRole
} from '../controllers/teamController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createTeamValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Team name is required'),
  body('description').optional().trim(),
];

const updateTeamValidation = [
  param('id').isString().withMessage('Valid team ID is required'),
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Team name cannot be empty'),
  body('description').optional().trim(),
];

const inviteMemberValidation = [
  param('id').isString().withMessage('Valid team ID is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['OWNER', 'ADMIN', 'MEMBER']),
];

// Routes
router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', createTeamValidation, validateRequest, createTeam);
router.put('/:id', updateTeamValidation, validateRequest, updateTeam);
router.delete('/:id', deleteTeam);

// Team member routes
router.get('/:id/members', getTeamMembers);
router.post('/:id/invite', inviteMemberValidation, validateRequest, inviteTeamMember);
router.delete('/:id/members/:userId', removeTeamMember);
router.patch('/:id/members/:userId/role', updateMemberRole);

export default router;