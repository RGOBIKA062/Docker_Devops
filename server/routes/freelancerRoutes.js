/**
 * FREELANCER ROUTES
 * Enterprise-Grade API Routes with Authentication & Validation
 * @author Senior Software Developer (25+ Years)
 * @version 2.0.0
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as freelancerController from '../controllers/freelancerController.js';

const router = express.Router();

/**
 * ==========================================
 * PROFILE MANAGEMENT ROUTES
 * ==========================================
 */

// Create or Update Freelancer Profile (works with or without auth)
router.post('/profile', freelancerController.createOrUpdateProfile);

// Get Freelancer Profile (works with or without auth)
router.get('/profile', freelancerController.getProfile);
router.get('/profile/:id', freelancerController.getProfile);

/**
 * ==========================================
 * SKILLS MANAGEMENT ROUTES
 * ==========================================
 */

// Add Skill
router.post('/skills', freelancerController.addSkill);

// Update Skill
router.put('/skills/:skillName', freelancerController.updateSkill);

// Delete Skill
router.delete('/skills/:skillName', freelancerController.deleteSkill);

/**
 * ==========================================
 * PORTFOLIO MANAGEMENT ROUTES
 * ==========================================
 */

// Add Portfolio Item
router.post('/portfolio', freelancerController.addPortfolioItem);

// Delete Portfolio Item
router.delete('/portfolio/:id', freelancerController.deletePortfolioItem);

/**
 * ==========================================
 * CERTIFICATION MANAGEMENT ROUTES
 * ==========================================
 */

// Add Certification
router.post('/certifications', freelancerController.addCertification);

// Delete Certification
router.delete('/certifications/:id', freelancerController.deleteCertification);

/**
 * ==========================================
 * PROJECT/GIG MANAGEMENT ROUTES
 * ==========================================
 */

// Create Project/Gig
router.post('/projects', freelancerController.createProject);

// Update Project Status
router.put('/projects/:id', freelancerController.updateProjectStatus);

/**
 * ==========================================
 * AI & RECOMMENDATIONS ROUTES
 * ==========================================
 */

// Get AI Job Recommendations (no auth required - works with userId)
router.get('/ai-recommendations', freelancerController.getAIRecommendations);

// Get Skill Boost Suggestions (no auth required - works with userId)
router.get('/skill-boost', freelancerController.getSkillBoost);

/**
 * ==========================================
 * ADVANCED JOB FINDER ROUTES
 * City & Role-Based Recommendations
 * ==========================================
 */

// AI Job Finder - Smart Router (GET with query params)
router.get('/ai-job-finder', freelancerController.aiJobFinder);

// Get Job Recommendations by City and Role
router.post('/recommendations/by-city', freelancerController.getJobRecommendationsByCity);

// Get Job Recommendations by Role (with optional city)
router.post('/recommendations/by-role', freelancerController.getJobRecommendationsByRole);

// Get Comprehensive Job Recommendations (Best Accuracy)
router.post('/recommendations/comprehensive', freelancerController.getComprehensiveJobRecommendations);

/**
 * ==========================================
 * STATISTICS & ANALYTICS ROUTES
 * ==========================================
 */

// Get Freelancer Statistics
router.get('/stats', authMiddleware, freelancerController.getFreelancerStats);

/**
 * ==========================================
 * SEARCH & DISCOVERY ROUTES
 * ==========================================
 */

// Search Freelancers
router.get('/search', freelancerController.searchFreelancers);

/**
 * ==========================================
 * REVIEW & RATING ROUTES
 * ==========================================
 */

// Add Review to Freelancer
router.post('/:freelancerId/reviews', authMiddleware, freelancerController.addReview);

/**
 * ==========================================
 * ADMIN ROUTES
 * ==========================================
 */

// Get All Freelancers (Admin)
router.get('/admin/all', authMiddleware, freelancerController.getAllFreelancers);

export default router;
