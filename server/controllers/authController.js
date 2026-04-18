import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';

/**
 * Generate JWT Token
 * @param {String} id - User ID
 * @returns {String} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_environment', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Send token response
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  const userData = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    userType: user.userType,
    profileImage: user.profileImage,
    isVerified: user.isVerified,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData,
  });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { fullName, email, password, confirmPassword, userType } = req.body;
    console.log(`📝 Signup attempt for email: ${email}, fullName: ${fullName}, userType: ${userType}`);

    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log(`⚠️  Email already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.',
      });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      userType: userType || 'student',
    });

    await user.save();
    console.log(`✅ User created successfully: ${email}, userType in user object: ${user.userType}`);

    // If user type is faculty, create a Faculty record
    console.log(`📌 Checking if faculty creation needed: userType=${userType}, user.userType=${user.userType}`);
    if (userType === 'faculty' || user.userType === 'faculty') {
      try {
        console.log(`📚 Creating Faculty record for user: ${user._id}`);
        const faculty = new Faculty({
          userId: user._id,
          fullName,
          email,
          profileImage: user.profileImage || '',
          designation: 'Faculty',
          bio: 'Faculty member at AllCollegeEvents',
          specializations: [],
          yearsOfExperience: 0,
          settings: {
            acceptMentorRequests: true,
          },
        });
        const savedFaculty = await faculty.save();
        console.log(`✅ Faculty profile created: ${savedFaculty._id}`);
      } catch (facultyError) {
        console.warn(`⚠️  Could not create faculty profile: ${facultyError.message}`);
        // Don't fail the signup if faculty profile creation fails
      }
    } else {
      console.log(`✅ Not a faculty user, skipping Faculty creation`);
    }

    sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to AllCollegeEvents.');
  } catch (error) {
    console.error(`❌ Signup error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { email, password } = req.body;
    console.log(`📝 Login attempt for email: ${email}`);

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    console.log(`🔍 User found: ${user ? 'Yes' : 'No'}`);

    if (!user) {
      console.log(`❌ User not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log(`⚠️  Account inactive for user: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Verify password
    const isPasswordMatched = await user.matchPassword(password);
    console.log(`🔐 Password matched: ${isPasswordMatched}`);

    if (!isPasswordMatched) {
      console.log(`❌ Password mismatch for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log(`✅ Login successful for user: ${email}`);

    sendTokenResponse(user, 200, res, 'Welcome back! You have successfully logged in.');
  } catch (error) {
    console.error(`❌ Login error: ${error.message}`);
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (token invalidation handled on client-side)
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'You have been successfully logged out',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, bio, institution, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(institution && { institution }),
        ...(profileImage && { profileImage }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old password, new password, and confirm password',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.userId).select('+password');

    const isPasswordMatched = await user.matchPassword(oldPassword);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
