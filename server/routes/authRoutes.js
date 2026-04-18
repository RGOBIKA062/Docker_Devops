import express from 'express';
import {
  signup,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
} from '../utils/validators.js';

const router = express.Router();

/**
 * Public Routes
 */

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateSignup, signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * Private Routes (require authentication)
 */

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', authMiddleware, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, validateUpdateProfile, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authMiddleware, changePassword);

export default router;
