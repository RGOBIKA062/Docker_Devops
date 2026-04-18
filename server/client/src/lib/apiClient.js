/**
 * API CLIENT MODULE (v2.0)
 * Enterprise-Grade API Wrapper with Error Handling & Retry Logic
 * 
 * Features:
 * - Automatic retry on network errors
 * - Request/Response validation
 * - Detailed error classification
 * - Timeout management
 * - Fallback mechanisms
 * 
 * @author 25+ Years Senior Software Developer
 * @version 2.0.0
 */

const API_BASE_URL = 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

/**
 * ============================================
 * ERROR CLASSIFICATIONS
 * ============================================
 */

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  PARSING_ERROR: 'PARSING_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet.',
  TIMEOUT_ERROR: 'Request timed out. Server took too long to respond.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  CLIENT_ERROR: 'Invalid request. Please check your input.',
  PARSING_ERROR: 'Failed to parse server response.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

/**
 * ============================================
 * REQUEST INTERCEPTOR
 * ============================================
 */

class APIError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.message = message;
    this.details = details;
    this.isRetryable = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.TIMEOUT_ERROR,
      ERROR_CODES.SERVER_ERROR,
    ].includes(code);
  }
}

/**
 * ============================================
 * REQUEST HANDLER
 * ============================================
 */

async function makeRequest(url, options = {}, retryCount = 0) {
  try {
    // Check network status
    if (!navigator.onLine) {
      throw new APIError(
        ERROR_CODES.NETWORK_ERROR,
        ERROR_MESSAGES.NETWORK_ERROR,
        { offline: true }
      );
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Validate response status
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status >= 500) {
        throw new APIError(
          ERROR_CODES.SERVER_ERROR,
          ERROR_MESSAGES.SERVER_ERROR,
          { status: response.status, details: errorData }
        );
      } else if (response.status >= 400) {
        throw new APIError(
          ERROR_CODES.CLIENT_ERROR,
          errorData.message || ERROR_MESSAGES.CLIENT_ERROR,
          { status: response.status, details: errorData }
        );
      }
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new APIError(
        ERROR_CODES.PARSING_ERROR,
        ERROR_MESSAGES.PARSING_ERROR,
        { originalError: e.message }
      );
    }

    return { success: true, data };
  } catch (error) {
    // Handle timeout
    if (error.name === 'AbortError') {
      throw new APIError(
        ERROR_CODES.TIMEOUT_ERROR,
        ERROR_MESSAGES.TIMEOUT_ERROR
      );
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        ERROR_CODES.NETWORK_ERROR,
        ERROR_MESSAGES.NETWORK_ERROR,
        { originalError: error.message }
      );
    }

    // Rethrow API errors
    if (error instanceof APIError) {
      throw error;
    }

    // Unknown error
    throw new APIError(
      ERROR_CODES.UNKNOWN_ERROR,
      ERROR_MESSAGES.UNKNOWN_ERROR,
      { originalError: error.message }
    );
  }
}

/**
 * ============================================
 * RETRY LOGIC
 * ============================================
 */

async function requestWithRetry(url, options = {}, retryCount = 0) {
  try {
    return await makeRequest(url, options, retryCount);
  } catch (error) {
    if (error.isRetryable && retryCount < MAX_RETRIES) {
      console.warn(`🔄 Retry attempt ${retryCount + 1}/${MAX_RETRIES} for ${url}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return requestWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
}

/**
 * ============================================
 * API METHODS
 * ============================================
 */

export const API = {
  /**
   * Fetch all events with error handling
   */
  async fetchEvents(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/events/all${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await requestWithRetry(url, {
        method: 'GET',
      });

      if (!response.data?.data?.events) {
        console.warn('⚠️ Unexpected response format');
        return { success: true, data: { events: [] } };
      }

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          isRetryable: error.isRetryable,
        },
      };
    }
  },

  /**
   * Fetch single event
   */
  async fetchEventById(id) {
    try {
      const response = await requestWithRetry(`${API_BASE_URL}/events/${id}`, {
        method: 'GET',
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error(`❌ Error fetching event ${id}:`, error);
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }
  },

  /**
   * Execute code (compiler)
   */
  async executeCode(payload) {
    try {
      // Validate payload
      if (!payload.code || !payload.language) {
        throw new APIError(
          ERROR_CODES.CLIENT_ERROR,
          'Code and language are required'
        );
      }

      const response = await requestWithRetry(
        `${API_BASE_URL}/compiler/execute`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ Error executing code:', error);
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }
  },

  /**
   * Get user submissions
   */
  async getUserSubmissions(token) {
    try {
      const response = await requestWithRetry(
        `${API_BASE_URL}/compiler/submissions`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }
  },
};

/**
 * ============================================
 * HOOKS FOR REACT COMPONENTS
 * ============================================
 */

export const useAPICall = (apiFunction, dependencies = []) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const execute = React.useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      const result = await apiFunction(...args);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
      return result;
    },
    dependencies
  );

  return { data, loading, error, execute };
};

export default API;
