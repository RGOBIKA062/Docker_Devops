/**
 * ==========================================
 * CODE EXECUTION ROUTES
 * ==========================================
 * RESTful endpoints for code execution
 * /api/execute - Execute code
 * /api/test-code - Test code with test cases
 */

import express from 'express';
import codeExecutionService from '../services/codeExecutionService.js';
import codeValidators from '../utils/codeValidators.js';
import languageValidators from '../utils/languageValidators.js';
import { codeExecutionLimiter } from '../middleware/security.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/execute
 * Execute code and return output
 * 
 * Request body:
 * {
 *   code: string,
 *   language: string (javascript|python|java|cpp),
 *   input?: string
 * }
 */
router.post('/execute', codeExecutionLimiter, async (req, res) => {
  try {
    const { code, language, input } = req.body;

    // Validate request structure
    const validation = codeValidators.validateExecuteRequest(req.body);
    if (!validation.valid) {
      logger.warn('Invalid code execution request', { errors: validation.errors });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Validate language-specific syntax
    logger.info(`Validating ${language} syntax`);
    const syntaxValidation = languageValidators.validate(code, language);
    if (!syntaxValidation.valid) {
      logger.warn('Syntax validation failed', { language, errors: syntaxValidation.errors });
      return res.status(400).json({
        success: false,
        message: 'Syntax error in code',
        errors: syntaxValidation.errors,
        language,
      });
    }

    // Validate that code matches declared language
    const languageMatchValidation = languageValidators.validateLanguageMatch(code, language);
    if (!languageMatchValidation.valid) {
      logger.warn('Language mismatch detected', { language, errors: languageMatchValidation.errors });
      return res.status(400).json({
        success: false,
        message: 'Language mismatch',
        errors: languageMatchValidation.errors,
        language,
      });
    }

    // Execute code
    logger.info('Executing code', { language, codeLength: code.length });
    const result = await codeExecutionService.executeCode(code, language, input);

    // Return result
    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      language: result.language,
    });
  } catch (error) {
    logger.error('Code execution endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/test-code
 * Test code with multiple test cases
 * 
 * Request body:
 * {
 *   code: string,
 *   language: string,
 *   testCases: [
 *     { input: string, expected: string },
 *     ...
 *   ]
 * }
 */
router.post('/test-code', codeExecutionLimiter, async (req, res) => {
  try {
    const { code, language, testCases } = req.body;

    // Validate request
    const validation = codeValidators.validateTestRequest(req.body);
    if (!validation.valid) {
      logger.warn('Invalid test request', { errors: validation.errors });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Test code
    logger.info('Testing code', {
      language,
      testCaseCount: testCases.length,
    });

    const testResults = await codeExecutionService.testCode(code, testCases, language);

    const passedCount = testResults.filter((t) => t.passed).length;
    const accuracy = ((passedCount / testResults.length) * 100).toFixed(2);

    res.json({
      success: true,
      results: testResults,
      stats: {
        total: testResults.length,
        passed: passedCount,
        failed: testResults.length - passedCount,
        accuracy: `${accuracy}%`,
      },
      language,
    });
  } catch (error) {
    logger.error('Test code endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Test execution failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/languages
 * Get list of supported languages
 */
router.get('/languages', (req, res) => {
  const config = require('../config/env');
  res.json({
    success: true,
    languages: config.ALLOWED_LANGUAGES,
  });
});

/**
 * POST /api/validate-code
 * Validate code syntax without execution
 */
router.post('/validate-code', async (req, res) => {
  try {
    const { code, language } = req.body;

    const validation = codeValidators.validateExecuteRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    res.json({
      success: true,
      message: 'Code is valid',
      language,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
