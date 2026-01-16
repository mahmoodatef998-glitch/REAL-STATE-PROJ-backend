/**
 * Professional Logger Utility
 * Provides structured logging across the application
 * Note: For production, consider using Winston or Pino
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Current log level (from environment)
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] || LOG_LEVELS.info;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

/**
 * Format timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Write to log file
 */
function writeToFile(filePath, message) {
  try {
    fs.appendFileSync(filePath, message + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

/**
 * Format log message
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = getTimestamp();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Logger class
 */
class Logger {
  error(message, meta = {}) {
    if (LOG_LEVELS.error <= currentLevel) {
      const formatted = formatMessage('error', message, meta);
      console.error(`${colors.red}❌ ${formatted}${colors.reset}`);
      writeToFile(errorLogPath, formatted);
      writeToFile(combinedLogPath, formatted);
    }
  }

  warn(message, meta = {}) {
    if (LOG_LEVELS.warn <= currentLevel) {
      const formatted = formatMessage('warn', message, meta);
      console.warn(`${colors.yellow}⚠️  ${formatted}${colors.reset}`);
      writeToFile(combinedLogPath, formatted);
    }
  }

  info(message, meta = {}) {
    if (LOG_LEVELS.info <= currentLevel) {
      const formatted = formatMessage('info', message, meta);
      console.log(`${colors.green}ℹ️  ${formatted}${colors.reset}`);
      writeToFile(combinedLogPath, formatted);
    }
  }

  http(message, meta = {}) {
    if (LOG_LEVELS.http <= currentLevel) {
      const formatted = formatMessage('http', message, meta);
      console.log(`${colors.magenta}🌐 ${formatted}${colors.reset}`);
      writeToFile(combinedLogPath, formatted);
    }
  }

  debug(message, meta = {}) {
    if (LOG_LEVELS.debug <= currentLevel) {
      const formatted = formatMessage('debug', message, meta);
      console.log(`${colors.cyan}🔍 ${formatted}${colors.reset}`);
      writeToFile(combinedLogPath, formatted);
    }
  }

  success(message, meta = {}) {
    if (LOG_LEVELS.info <= currentLevel) {
      const formatted = formatMessage('success', message, meta);
      console.log(`${colors.green}✅ ${formatted}${colors.reset}`);
      writeToFile(combinedLogPath, formatted);
    }
  }
}

// Create and export logger instance
const logger = new Logger();

module.exports = logger;

