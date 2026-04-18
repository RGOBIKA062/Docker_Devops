/**
 * ==========================================
 * LOGGER UTILITY - CENTRALIZED LOGGING
 * ==========================================
 * Production-grade logging with file rotation
 */

import fs from 'fs';
import path from 'path';
import config from '../config/env.js';

class Logger {
  constructor() {
    this.logDir = config.LOG_DIR;
    this.logLevel = config.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      formatted += ` ${JSON.stringify(data)}`;
    }

    return formatted;
  }

  /**
   * Write to console and file
   */
  write(level, message, data = null) {
    // Check log level
    if (this.levels[level] > this.levels[this.logLevel]) {
      return;
    }

    const formatted = this.formatMessage(level, message, data);

    // Console output
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      info: '\x1b[36m', // Cyan
      debug: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';

    console.log(`${colors[level]}${formatted}${reset}`);

    // File output
    this.writeToFile(level, formatted);
  }

  /**
   * Write to log file
   */
  writeToFile(level, message) {
    const filename = path.join(this.logDir, `${level}.log`);
    fs.appendFileSync(filename, message + '\n');
  }

  error(message, data = null) {
    this.write('error', message, data);
  }

  warn(message, data = null) {
    this.write('warn', message, data);
  }

  info(message, data = null) {
    this.write('info', message, data);
  }

  debug(message, data = null) {
    this.write('debug', message, data);
  }
}

export default new Logger();
