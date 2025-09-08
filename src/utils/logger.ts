import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Get configured log level from environment or default to INFO
const getConfiguredLogLevel = (): LogLevel => {
  const configuredLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  switch (configuredLevel) {
    case 'error': return LogLevel.ERROR;
    case 'warn': return LogLevel.WARN;
    case 'info': return LogLevel.INFO;
    case 'debug': return LogLevel.DEBUG;
    default: return LogLevel.INFO;
  }
};

const currentLogLevel = getConfiguredLogLevel();

// Create log file streams
const errorStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });
const combinedStream = fs.createWriteStream(path.join(logsDir, 'combined.log'), { flags: 'a' });

// Format log message
const formatLogMessage = (level: string, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (meta) {
    try {
      logMessage += ` ${typeof meta === 'object' ? JSON.stringify(meta) : meta}`;
    } catch (err) {
      logMessage += ` [Error serializing metadata]`;
    }
  }
  
  return logMessage;
};

// Write to both console and file
const logToTransports = (level: string, message: string, meta?: any) => {
  const formattedMessage = formatLogMessage(level, message, meta);
  
  // Always write to combined log file
  combinedStream.write(formattedMessage + '\n');
  
  // Write errors to error log file
  if (level === 'error') {
    errorStream.write(formattedMessage + '\n');
  }
  
  // In development, also log to console
  if (process.env.NODE_ENV !== 'production') {
    if (level === 'error') {
      console.error(formattedMessage);
    } else if (level === 'warn') {
      console.warn(formattedMessage);
    } else if (level === 'info') {
      console.info(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }
};

// Logger implementation
export const logger = {
  error: (message: string, meta?: any) => {
    if (currentLogLevel >= LogLevel.ERROR) {
      logToTransports('error', message, meta);
    }
  },
  
  warn: (message: string, meta?: any) => {
    if (currentLogLevel >= LogLevel.WARN) {
      logToTransports('warn', message, meta);
    }
  },
  
  info: (message: string, meta?: any) => {
    if (currentLogLevel >= LogLevel.INFO) {
      logToTransports('info', message, meta);
    }
  },
  
  debug: (message: string, meta?: any) => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      logToTransports('debug', message, meta);
    }
  }
};
