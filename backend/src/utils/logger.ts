import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'taskmanager-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? json() 
        : combine(colorize(), simple())
    }),
    
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: combine(timestamp(), json())
    }),
    
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: combine(timestamp(), json())
    })
  ]
});

// If we're not in production, log to the console with simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      simple()
    )
  }));
}