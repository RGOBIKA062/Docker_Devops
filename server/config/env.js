/**
 * ==========================================
 * ENVIRONMENT CONFIGURATION VALIDATOR
 * ==========================================
 * Validates all environment variables at startup
 * Ensures security and proper configuration
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Environment variable schema with validation
 */
const envSchema = {
  // Server Configuration
  NODE_ENV: {
    value: process.env.NODE_ENV || 'development',
    valid: ['development', 'production', 'testing'],
  },
  PORT: {
    value: parseInt(process.env.PORT) || 5000,
    validate: (val) => val > 0 && val < 65535,
  },
  API_VERSION: {
    value: process.env.API_VERSION || 'v1',
  },
  API_PREFIX: {
    value: process.env.API_PREFIX || '/api',
  },

  // Groq API Configuration
  GROQ_API_KEY: {
    value: process.env.GROQ_API_KEY,
    required: true,
    validate: (val) => val && val.length > 0,
  },
  GROQ_MODEL: {
    value: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  },
  GROQ_FALLBACK_MODEL: {
    value: process.env.GROQ_FALLBACK_MODEL || 'llama-3.3-70b-versatile',
  },
  GROQ_TERTIARY_MODEL: {
    value: process.env.GROQ_TERTIARY_MODEL || 'llama-3.1-8b-instant',
  },
  GROQ_TIMEOUT: {
    value: parseInt(process.env.GROQ_TIMEOUT) || 30000,
  },
  GROQ_MAX_RETRIES: {
    value: parseInt(process.env.GROQ_MAX_RETRIES) || 3,
  },

  // Frontend Configuration
  FRONTEND_URL: {
    value: process.env.FRONTEND_URL || 'http://localhost:8080',
  },
  CORS_ORIGIN: {
    value: process.env.CORS_ORIGIN || 'http://localhost:8080',
  },

  // Security Configuration
  JWT_SECRET: {
    value: process.env.JWT_SECRET,
    required: true,
    validate: (val) => val && val.length >= 32,
  },
  HELMET_ENABLED: {
    value: process.env.HELMET_ENABLED !== 'false',
  },
  CSRF_PROTECTION: {
    value: process.env.CSRF_PROTECTION !== 'false',
  },
  RATE_LIMIT_WINDOW_MS: {
    value: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  },
  RATE_LIMIT_MAX_REQUESTS: {
    value: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Code Execution Configuration
  CODE_EXECUTION_TIMEOUT: {
    value: parseInt(process.env.CODE_EXECUTION_TIMEOUT) || 5000,
  },
  MAX_CODE_LENGTH: {
    value: parseInt(process.env.MAX_CODE_LENGTH) || 10000,
  },
  MAX_OUTPUT_SIZE: {
    value: parseInt(process.env.MAX_OUTPUT_SIZE) || 50000,
  },
  ALLOWED_LANGUAGES: {
    value: (process.env.ALLOWED_LANGUAGES || 'javascript,python,java,cpp,csharp').split(','),
  },

  // Logging Configuration
  LOG_LEVEL: {
    value: process.env.LOG_LEVEL || 'info',
    valid: ['error', 'warn', 'info', 'debug'],
  },
  LOG_DIR: {
    value: process.env.LOG_DIR || './logs',
  },

  // Feature Flags
  ENABLE_COMPILER: {
    value: process.env.ENABLE_COMPILER !== 'false',
  },
  ENABLE_GROQ_EXECUTION: {
    value: process.env.ENABLE_GROQ_EXECUTION !== 'false',
  },

  // Monitoring
  DEBUG_MODE: {
    value: process.env.DEBUG_MODE === 'true',
  },
};

/**
 * Validate environment configuration
 */
function validateConfig() {
  const errors = [];
  const config = {};

  for (const [key, schema] of Object.entries(envSchema)) {
    const { value, required, validate, valid } = schema;

    // Check required fields
    if (required && !value) {
      errors.push(`❌ Missing required environment variable: ${key}`);
      continue;
    }

    // Validate enum values
    if (valid && value && !valid.includes(value)) {
      errors.push(`❌ Invalid value for ${key}: ${value}. Must be one of: ${valid.join(', ')}`);
      continue;
    }

    // Custom validation
    if (validate && value && !validate(value)) {
      errors.push(`❌ Invalid value for ${key}: ${value}`);
      continue;
    }

    config[key] = value;
  }

  // Report errors
  if (errors.length > 0) {
    console.error('\n🚨 ENVIRONMENT CONFIGURATION ERRORS:\n');
    errors.forEach((err) => console.error(err));
    console.error('\n📝 Please check your .env file and try again.\n');
    process.exit(1);
  }

  return config;
}

// Validate and export configuration
const config = validateConfig();

// Log configuration on startup (hide sensitive data)
if (process.env.DEBUG_MODE === 'true') {
  console.log('\n✅ Environment Configuration Loaded:');
  console.log({
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    GROQ_MODEL: config.GROQ_MODEL,
    LOG_LEVEL: config.LOG_LEVEL,
    ENABLE_COMPILER: config.ENABLE_COMPILER,
  });
  console.log('');
}

export default config;
