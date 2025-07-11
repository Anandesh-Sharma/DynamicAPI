import { Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { 
            team: {
              members: {
                some: {
                  userId: userId,
                  status: 'ACTIVE'
                }
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        team: {
          select: { id: true, name: true }
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { projects }
    });
  } catch (error) {
    logger.error('Get projects error:', error);
    next(error);
  }
};

export const getProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { 
            team: {
              members: {
                some: {
                  userId: userId,
                  status: 'ACTIVE'
                }
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    logger.error('Get project error:', error);
    next(error);
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, privacy, teamId } = req.body;
    const userId = req.user!.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        privacy,
        ownerId: userId,
        teamId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        team: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Project created: ${project.name} by ${req.user!.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Create project error:', error);
    next(error);
  }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, status, privacy } = req.body;
    const userId = req.user!.id;

    // Check if user owns the project
    const existingProject = await prisma.project.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingProject) {
      return next(new AppError('Project not found or access denied', 404));
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(privacy && { privacy }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        team: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Project updated: ${project.name} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Update project error:', error);
    next(error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user owns the project
    const existingProject = await prisma.project.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingProject) {
      return next(new AppError('Project not found or access denied', 404));
    }

    await prisma.project.delete({
      where: { id }
    });

    logger.info(`Project deleted: ${existingProject.name} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Delete project error:', error);
    next(error);
  }
};