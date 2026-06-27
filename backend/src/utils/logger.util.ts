import winston from 'winston';

// Define custom log colors for easy terminal scanning
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white',
};

winston.addColors(colors);

// Define log message format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Captures the full error trace from Mongoose errors
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    // If a stack trace exists (like in connection errors), print it. Otherwise, print the message.
    return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Format specifically for clean development terminal visualization
const devConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  logFormat
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: winston.config.npm.levels,
  format: logFormat,
  transports: [
    // Output logs directly to the console terminal
    new winston.transports.Console({
      format: devConsoleFormat,
    }),
    // Create dedicated files for tracking system database errors
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// ESM default export matching your database class import expectation
export default logger;
