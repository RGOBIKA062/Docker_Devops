/**
 * ==========================================
 * CODE EXECUTION VALIDATORS
 * ==========================================
 * Validate code execution requests
 */

import config from '../config/env.js';

class CodeValidators {
  /**
   * Validate execute code request
   */
  validateExecuteRequest(body) {
    const errors = [];

    if (!body.code || typeof body.code !== 'string') {
      errors.push('Code is required and must be a string');
    } else if (body.code.length > config.MAX_CODE_LENGTH) {
      errors.push(`Code exceeds maximum length of ${config.MAX_CODE_LENGTH}`);
    } else if (body.code.trim().length === 0) {
      errors.push('Code cannot be empty');
    }

    if (!body.language || !config.ALLOWED_LANGUAGES.includes(body.language)) {
      errors.push(`Language must be one of: ${config.ALLOWED_LANGUAGES.join(', ')}`);
    }

    if (body.input && typeof body.input !== 'string') {
      errors.push('Input must be a string');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate test code request
   */
  validateTestRequest(body) {
    const codeValidation = this.validateExecuteRequest(body);
    if (!codeValidation.valid) {
      return codeValidation;
    }

    const errors = [];

    if (!Array.isArray(body.testCases)) {
      errors.push('Test cases must be an array');
    } else if (body.testCases.length === 0) {
      errors.push('Test cases cannot be empty');
    } else if (body.testCases.length > config.MAX_TEST_CASES) {
      errors.push(`Test cases exceed maximum of ${config.MAX_TEST_CASES}`);
    } else {
      // Validate each test case
      body.testCases.forEach((testCase, index) => {
        if (!testCase.input || typeof testCase.input !== 'string') {
          errors.push(`Test case ${index + 1}: input is required and must be a string`);
        }
        if (!testCase.expected || typeof testCase.expected !== 'string') {
          errors.push(`Test case ${index + 1}: expected output is required and must be a string`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate language
   */
  isValidLanguage(language) {
    return config.ALLOWED_LANGUAGES.includes(language);
  }
}

export default new CodeValidators();
