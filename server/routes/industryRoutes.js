import express from 'express';
import {
  getDashboardStats,
  getProfile,
  updateProfile,
  postJobOpening,
  getJobOpenings,
  scheduleCampusVisit,
  getCampusVisits,
  createCampaign,
  getTalentCategories,
  getIndustryDirectory,
  updateCampusVisitStatus,
} from '../controllers/industryController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Dashboard Routes
 */
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/directory', getIndustryDirectory);
router.get('/talent-categories', getTalentCategories);

/**
 * Profile Routes
 */
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

/**
 * Job Opening Routes
 */
router.post('/job-openings', authMiddleware, postJobOpening);
router.get('/job-openings', authMiddleware, getJobOpenings);

/**
 * Campus Visit Routes
 */
router.post('/campus-visits', authMiddleware, scheduleCampusVisit);
router.get('/campus-visits', authMiddleware, getCampusVisits);
router.put('/campus-visits/:visitId', authMiddleware, updateCampusVisitStatus);

/**
 * Campaign Routes
 */
router.post('/campaigns', authMiddleware, createCampaign);

export default router;
