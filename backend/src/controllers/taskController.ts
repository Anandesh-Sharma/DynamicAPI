import { Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, status, assigneeId, priority } = req.query;
    const userId = req.user!.id;

    const whereClause: any = {};

    if (projectId) {
      whereClause.projectId = projectId as string;
    }
    if (status) {
      whereClause.status = status as string;
    }
    if (assigneeId) {
      whereClause.assigneeId = assigneeId as string;
    }
    if (priority) {
      whereClause.priority = priority as string;
    }

    const tasks = await prisma.task.findMany({
      where: {
        ...whereClause,
        project: {
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
        }
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        },
        _count: {
          select: { comments: true, subtasks: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: { tasks }
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    next(error);
  }
};

export const getTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
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
        }
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        },
        parent: {
          select: { id: true, title: true }
        },
        subtasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true
      }
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    logger.error('Get task error:', error);
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, priority, dueDate, assigneeId, projectId, parentId } = req.body;
    const userId = req.user!.id;

    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
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
      }
    });

    if (!project) {
      return next(new AppError('Project not found or access denied', 404));
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        creatorId: userId,
        projectId,
        parentId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Task created: ${task.title} by ${req.user!.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Create task error:', error);
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const userId = req.user!.id;

    // Check task access
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
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
        }
      }
    });

    if (!existingTask) {
      return next(new AppError('Task not found or access denied', 404));
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Task updated: ${task.title} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Update task error:', error);
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check task access
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
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
        }
      }
    });

    if (!existingTask) {
      return next(new AppError('Task not found or access denied', 404));
    }

    await prisma.task.delete({
      where: { id }
    });

    logger.info(`Task deleted: ${existingTask.title} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Delete task error:', error);
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
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
        }
      }
    });

    if (!task) {
      return next(new AppError('Task not found or access denied', 404));
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({
      status: 'success',
      message: 'Task status updated successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    logger.error('Update task status error:', error);
    next(error);
  }
};

export const assignTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    const userId = req.user!.id;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
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
        }
      }
    });

    if (!task) {
      return next(new AppError('Task not found or access denied', 404));
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { assigneeId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Task assigned successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    logger.error('Assign task error:', error);
    next(error);
  }
};