import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

class AppError extends Error implements CustomError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleDatabaseError = (err: any): AppError => {
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const field = err.meta?.target as string[];
        return new AppError(`Duplicate value for ${field?.join(', ')}`, 400);
      
      case 'P2014':
        // Required relation violation
        return new AppError('Invalid relationship data provided', 400);
      
      case 'P2003':
        // Foreign key constraint violation
        return new AppError('Related record not found', 400);
      
      case 'P2025':
        // Record not found
        return new AppError('Record not found', 404);
      
      default:
        return new AppError('Database operation failed', 500);
    }
  }
  return new AppError('Database operation failed', 500);
};

const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: CustomError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: CustomError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if ((err as any).code && (err as any).code.startsWith('P')) {
      error = handleDatabaseError(err);
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again!', 401);
    } else if (err.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired! Please log in again.', 401);
    }

    sendErrorProd(error, res);
  }
};

export { AppError };