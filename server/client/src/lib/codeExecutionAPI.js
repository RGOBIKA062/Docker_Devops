/**
 * ==========================================
 * CODE EXECUTION API CLIENT
 * ==========================================
 * Frontend service for communicating with
 * backend code execution endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 30000;

class CodeExecutionAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/execute`;
    this.executeEndpoint = '/execute';
    this.testCodeEndpoint = '/test-code';
    this.languagesEndpoint = '/languages';
    this.validateEndpoint = '/validate-code';
  }

  /**
   * Make API request with error handling
   * @private
   */
  async request(endpoint, method = 'GET', data = null, timeout = API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const responseData = await response.json();

      if (!response.ok) {
        // Include full error details in the exception
        const error = new Error(responseData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.errors = responseData.errors || [];
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - code execution took too long');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Execute code
   * @param {string} code - User code
   * @param {string} language - Programming language
   * @param {string} input - Test input (optional)
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(code, language = 'javascript', input = '') {
    return this.request(this.executeEndpoint, 'POST', {
      code,
      language,
      input,
    });
  }

  /**
   * Test code with test cases
   * @param {string} code - User code
   * @param {Array} testCases - Test cases
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Test results
   */
  async testCode(code, testCases, language = 'javascript') {
    return this.request(this.testCodeEndpoint, 'POST', {
      code,
      language,
      testCases,
    });
  }

  /**
   * Get supported languages
   * @returns {Promise<Object>} List of languages
   */
  async getLanguages() {
    return this.request(this.languagesEndpoint, 'GET');
  }

  /**
   * Validate code syntax
   * @param {string} code - Code to validate
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Validation result
   */
  async validateCode(code, language = 'javascript') {
    return this.request(this.validateEndpoint, 'POST', {
      code,
      language,
    });
  }

  /**
   * Handle execution error
   * @private
   */
  handleError(error) {
    console.error('Code execution error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

// Export singleton instance
export default new CodeExecutionAPI();
