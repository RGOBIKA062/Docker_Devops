/**
 * ==========================================
 * GROQ API SERVICE - CODE EXECUTION ENGINE
 * ==========================================
 * Enterprise-grade service for code execution
 * via Groq API with comprehensive error handling,
 * intelligent model cascading, and retry logic
 * 
 * Author: Senior Architect (30+ years)
 * Quality: Award-winning production code
 */

import Groq from 'groq-sdk';
import config from '../config/env.js';
import logger from '../utils/logger.js';

class CodeExecutionService {
  constructor() {
    this.client = new Groq({
      apiKey: config.GROQ_API_KEY,
    });
    
    // Model cascade: primary → fallback → tertiary
    this.models = [
      config.GROQ_MODEL,           // Primary: mixtral-8x7b-32768
      config.GROQ_FALLBACK_MODEL,  // Secondary: llama2-70b-4096
      config.GROQ_TERTIARY_MODEL,  // Tertiary: gemma2-9b-it
    ];
    
    this.currentModelIndex = 0;    // Track which model is currently working
    this.timeout = config.GROQ_TIMEOUT;
    this.maxRetries = config.GROQ_MAX_RETRIES;
    
    logger.info('Code Execution Service initialized', {
      primaryModel: this.models[0],
      fallbackModel: this.models[1],
      tertiaryModel: this.models[2],
    });
  }

  /**
   * Get current active model
   */
  getCurrentModel() {
    return this.models[this.currentModelIndex];
  }

  /**
   * Get next model in cascade
   */
  getNextModel() {
    if (this.currentModelIndex < this.models.length - 1) {
      this.currentModelIndex++;
      logger.warn(`⚠️ Cascading to next model: ${this.getCurrentModel()}`);
      return this.getCurrentModel();
    }
    return null; // No more models available
  }

  /**
   * Reset to primary model
   */
  resetModel() {
    this.currentModelIndex = 0;
  }

  /**
   * Execute code using Groq API
   * @param {string} code - User code to execute
   * @param {string} language - Programming language
   * @param {string} input - Test input (optional)
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(code, language = 'javascript', input = '') {
    try {
      // Validate input
      this.validateInput(code, language);

      // Build execution prompt
      const prompt = this.buildExecutionPrompt(code, language, input);

      logger.info(`Executing ${language} code via Groq API`);

      // Execute with comprehensive error handling
      const result = await this.executeWithRetry(prompt);

      return {
        success: true,
        output: result.output,
        executionTime: result.executionTime,
        language,
      };
    } catch (error) {
      logger.error('Code execution error:', error);
      return {
        success: false,
        error: this.parseErrorMessage(error),
        language,
      };
    }
  }

  /**
   * Parse error message intelligently
   * @private
   */
  parseErrorMessage(error) {
    // Check nested error structure from Groq API
    const groqError = error?.error?.message || error?.message || '';
    
    if (groqError.includes('model_not_found')) {
      return 'Model not found or no access. Please verify your Groq API key.';
    }
    
    if (groqError.includes('decommissioned')) {
      return 'Model has been decommissioned. Retrying with backup model...';
    }
    
    if (groqError.includes('timeout') || groqError.includes('ECONNABORTED')) {
      return 'Execution timeout. Code took too long to run.';
    }
    
    if (groqError.includes('rate_limit')) {
      return 'Rate limit exceeded. Please try again later.';
    }

    return groqError || 'Unknown error during code execution';
  }

  /**
   * Execute code with intelligent retry and model cascading
   * @private
   */
  async executeWithRetry(prompt, attempt = 0) {
    try {
      const currentModel = this.getCurrentModel();
      const startTime = Date.now();

      logger.info(`Executing with model: ${currentModel} (Attempt ${attempt + 1}/${this.maxRetries})`);

      // Call Groq API
      const message = await this.client.chat.completions.create({
        model: currentModel,
        max_tokens: 1024,
        temperature: 0.3, // Lower temperature for code execution
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const executionTime = Date.now() - startTime;
      
      // Parse response carefully
      const output = message?.choices?.[0]?.message?.content || '';

      logger.info(`✅ Execution successful with ${currentModel}`, { executionTime });

      return { output, executionTime };
    } catch (error) {
      const errorCode = error?.error?.code || error?.code || '';
      const errorMessage = error?.error?.message || error?.message || '';

      logger.warn(`Error on attempt ${attempt + 1}:`, {
        code: errorCode,
        message: errorMessage,
        model: this.getCurrentModel(),
      });

      // Handle specific error codes that indicate model unavailability
      if (errorCode === 'model_not_found' || errorCode === 'invalid_request_error' || 
          errorMessage.includes('decommissioned') || errorMessage.includes('does not exist')) {
        logger.error(`❌ Model ${this.getCurrentModel()} not available`);
        
        // Try next model
        const nextModel = this.getNextModel();
        if (nextModel) {
          logger.info(`🔄 Retrying with fallback model: ${nextModel}`);
          return this.executeWithRetry(prompt, 0); // Reset attempts for new model
        } else {
          throw new Error('All models exhausted. Please check your Groq API key and available models.');
        }
      }

      // Standard retry for other errors
      if (attempt < this.maxRetries) {
        const waitTime = 1000 * (attempt + 1); // Exponential backoff: 1s, 2s, 3s
        logger.warn(`⏳ Retrying in ${waitTime}ms (attempt ${attempt + 1}/${this.maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.executeWithRetry(prompt, attempt + 1);
      }

      // All retries exhausted
      throw error;
    }
  }

  /**
   * Validate user input
   * @private
   */
  validateInput(code, language) {
    if (!code || code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }

    if (code.length > config.MAX_CODE_LENGTH) {
      throw new Error(`Code exceeds maximum length of ${config.MAX_CODE_LENGTH} characters`);
    }

    if (!config.ALLOWED_LANGUAGES.includes(language)) {
      throw new Error(`Language '${language}' is not supported`);
    }
  }

  /**
   * Build execution prompt for Groq
   * @private
   */
  buildExecutionPrompt(code, language, input) {
    return `You are a code execution engine. Execute the following ${language} code and return ONLY the output.

\`\`\`${language}
${code}
\`\`\`

${input ? `Input: ${input}` : ''}

Execute this code and return ONLY the output. Do not include any explanations, error messages, or code blocks. If there's an error, return the error message.`;
  }

  /**
   * Test code with test cases
   * @param {string} code - User code
   * @param {Array} testCases - Array of test cases
   * @param {string} language - Programming language
   * @returns {Promise<Array>} Test results
   */
  async testCode(code, testCases, language = 'javascript') {
    const results = [];

    for (const testCase of testCases) {
      try {
        const result = await this.executeCode(code, language, testCase.input);

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output: result.output?.trim(),
          passed: result.output?.trim() === testCase.expected?.trim(),
          error: result.error,
          executionTime: result.executionTime,
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output: null,
          passed: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get language syntax highlight
   */
  getSyntaxHighlight(language) {
    const highlights = {
      javascript: 'language-javascript',
      python: 'language-python',
      java: 'language-java',
      cpp: 'language-cpp',
    };
    return highlights[language] || 'language-javascript';
  }

  /**
   * Format code execution response
   */
  formatResponse(executionResult, testResults = null) {
    return {
      execution: {
        success: executionResult.success,
        output: executionResult.output,
        error: executionResult.error,
        executionTime: executionResult.executionTime,
      },
      tests: testResults
        ? {
            total: testResults.length,
            passed: testResults.filter((t) => t.passed).length,
            results: testResults,
          }
        : null,
    };
  }
}

// Export singleton instance
export default new CodeExecutionService();
