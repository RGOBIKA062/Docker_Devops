/**
 * API Service Utility for Frontend
 * Handles all HTTP requests to backend with authentication
 */

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Generic fetch wrapper with auth header
 */
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    let data = {};
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      throw new Error(`Expected JSON response, got ${contentType}`);
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Authentication API Calls
 */

export const authAPI = {
  /**
   * Sign up new user
   */
  signup: (fullName, email, password, confirmPassword, userType = "student") =>
    apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        email,
        password,
        confirmPassword,
        userType,
      }),
    }),

  /**
   * Login user
   */
  login: (email, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Get current user
   */
  getMe: () => apiCall("/auth/me", { method: "GET" }),

  /**
   * Logout user
   */
  logout: () => apiCall("/auth/logout", { method: "POST" }),

  /**
   * Update profile
   */
  updateProfile: (profileData) =>
    apiCall("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  /**
   * Change password
   */
  changePassword: (oldPassword, newPassword, confirmPassword) =>
    apiCall("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({
        oldPassword,
        newPassword,
        confirmPassword,
      }),
    }),
};

/**
 * Events API Calls
 */
export const eventsAPI = {
  /**
   * Get all published events with filters
   */
  getAllEvents: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiCall(`/events/all${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Get event by ID
   */
  getEventById: (eventId) => apiCall(`/events/${eventId}`),

  /**
   * Create a new event (protected)
   */
  createEvent: (eventData) =>
    apiCall("/events/create", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),

  /**
   * Update event (protected)
   */
  updateEvent: (eventId, eventData) =>
    apiCall(`/events/${eventId}/update`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }),

  /**
   * Delete event (protected)
   */
  deleteEvent: (eventId) =>
    apiCall(`/events/${eventId}/delete`, {
      method: "DELETE",
    }),

  /**
   * Register for event (protected)
   */
  registerForEvent: (eventId) =>
    apiCall(`/events/${eventId}/register`, {
      method: "POST",
    }),

  /**
   * Get user's created events (protected)
   */
  getUserEvents: () => apiCall("/events/user/events"),

  /**
   * Get user's registered events (protected)
   */
  getUserRegisteredEvents: () => apiCall("/events/user/registered"),

  /**
   * Add event to wishlist (protected)
   */
  addToWishlist: (eventId) =>
    apiCall(`/events/${eventId}/wishlist`, {
      method: "POST",
    }),

  /**
   * Remove event from wishlist (protected)
   */
  removeFromWishlist: (eventId) =>
    apiCall(`/events/${eventId}/wishlist`, {
      method: "DELETE",
    }),

  /**
   * Add review to event (protected)
   */
  addReview: (eventId, reviewData) =>
    apiCall(`/events/${eventId}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  /**
   * Track share of event (protected)
   */
  trackShare: (eventId) =>
    apiCall(`/events/${eventId}/track-share`, {
      method: "POST",
    }),
};

export default apiCall;
