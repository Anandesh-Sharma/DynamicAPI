import { Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getTeams = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                status: 'ACTIVE'
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { members: true, projects: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { teams }
    });
  } catch (error) {
    logger.error('Get teams error:', error);
    next(error);
  }
};

export const getTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const team = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                status: 'ACTIVE'
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        projects: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  } catch (error) {
    logger.error('Get team error:', error);
    next(error);
  }
};

export const createTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.id;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    logger.info(`Team created: ${team.name} by ${req.user!.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Team created successfully',
      data: { team }
    });
  } catch (error) {
    logger.error('Create team error:', error);
    next(error);
  }
};

export const updateTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user!.id;

    // Check if user is owner or admin
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: userId,
        role: { in: ['OWNER', 'ADMIN'] },
        status: 'ACTIVE'
      }
    });

    if (!teamMember) {
      return next(new AppError('Access denied', 403));
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    logger.info(`Team updated: ${team.name} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Team updated successfully',
      data: { team }
    });
  } catch (error) {
    logger.error('Update team error:', error);
    next(error);
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user is owner
    const team = await prisma.team.findFirst({
      where: { id, ownerId: userId }
    });

    if (!team) {
      return next(new AppError('Team not found or access denied', 404));
    }

    await prisma.team.delete({
      where: { id }
    });

    logger.info(`Team deleted: ${team.name} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Team deleted successfully'
    });
  } catch (error) {
    logger.error('Delete team error:', error);
    next(error);
  }
};

export const getTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check team access
    const hasAccess = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: userId,
        status: 'ACTIVE'
      }
    });

    if (!hasAccess) {
      return next(new AppError('Access denied', 403));
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { role: 'asc' }
    });

    res.status(200).json({
      status: 'success',
      data: { members }
    });
  } catch (error) {
    logger.error('Get team members error:', error);
    next(error);
  }
};

export const inviteTeamMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { email, role = 'MEMBER' } = req.body;
    const userId = req.user!.id;

    // Check if user can invite (owner or admin)
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: userId,
        role: { in: ['OWNER', 'ADMIN'] },
        status: 'ACTIVE'
      }
    });

    if (!teamMember) {
      return next(new AppError('Access denied', 403));
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: user.id
      }
    });

    if (existingMember) {
      return next(new AppError('User is already a team member', 400));
    }

    // Create team membership
    const newMember = await prisma.teamMember.create({
      data: {
        teamId: id,
        userId: user.id,
        role,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    logger.info(`User invited to team: ${email} by ${req.user!.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Team member invited successfully',
      data: { member: newMember }
    });
  } catch (error) {
    logger.error('Invite team member error:', error);
    next(error);
  }
};

export const removeTeamMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const userId = req.user!.id;

    // Check if user can remove members (owner or admin)
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: userId,
        role: { in: ['OWNER', 'ADMIN'] },
        status: 'ACTIVE'
      }
    });

    if (!teamMember) {
      return next(new AppError('Access denied', 403));
    }

    // Cannot remove the owner
    const targetMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: targetUserId
      }
    });

    if (!targetMember) {
      return next(new AppError('Team member not found', 404));
    }

    if (targetMember.role === 'OWNER') {
      return next(new AppError('Cannot remove team owner', 400));
    }

    await prisma.teamMember.delete({
      where: { id: targetMember.id }
    });

    logger.info(`Team member removed from team ${id} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Team member removed successfully'
    });
  } catch (error) {
    logger.error('Remove team member error:', error);
    next(error);
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const { role } = req.body;
    const userId = req.user!.id;

    // Check if user is owner
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: userId,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    });

    if (!teamMember) {
      return next(new AppError('Access denied', 403));
    }

    const targetMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: targetUserId
      }
    });

    if (!targetMember) {
      return next(new AppError('Team member not found', 404));
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: targetMember.id },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Member role updated successfully',
      data: { member: updatedMember }
    });
  } catch (error) {
    logger.error('Update member role error:', error);
    next(error);
  }
};