/**
 * Advanced Job Opening & Campus Drive Routes
 * Enterprise-Grade API Endpoints
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createJobOpening,
  getAllJobOpenings,
  getMyJobOpenings,
  getJobOpeningDetails,
  updateJobOpening,
  closeJobOpening,
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  getApplicationDetails,
  createCampusDrive,
  getAllCampusDrives,
  getMyCampusDrives,
  getCampusDriveDetails,
  registerForCampusDrive,
  getDriveRegistrations,
  getMyDriveRegistrations,
  getIndustryTalentPool,
  scheduleInterview,
  markApplicantHired,
} from '../controllers/jobAndDriveController.js';

const router = express.Router();

// ============================================
// JOB OPENING ROUTES (Specific routes FIRST)
// ============================================

/**
 * Job Opening Management
 */
router.post('/jobs/create', authMiddleware, createJobOpening);
router.get('/jobs/all', getAllJobOpenings); // Public
router.get('/jobs/my-jobs', authMiddleware, getMyJobOpenings); // BEFORE :jobId
router.get('/jobs/my-applications', authMiddleware, getMyApplications); // BEFORE :jobId

/**
 * Job Application Management - Specific routes BEFORE generic :jobId
 */
router.post('/jobs/:jobId/apply', authMiddleware, applyForJob);
router.get('/jobs/:jobId/applications', authMiddleware, getJobApplications);
router.put('/jobs/applications/:appId/status', authMiddleware, updateApplicationStatus); // BEFORE :jobId
router.get('/jobs/applications/:appId', authMiddleware, getApplicationDetails); // BEFORE :jobId
router.post('/jobs/applications/:appId/schedule-interview', authMiddleware, scheduleInterview);
router.post('/jobs/applications/:appId/hire', authMiddleware, markApplicantHired);

/**
 * Generic job ID route - MUST BE LAST
 */
router.get('/jobs/:jobId', getJobOpeningDetails); // Public
router.put('/jobs/:jobId', authMiddleware, updateJobOpening);
router.put('/jobs/:jobId/close', authMiddleware, closeJobOpening);

// ============================================
// CAMPUS DRIVE ROUTES (Specific routes FIRST)
// ============================================

/**
 * Campus Drive Management
 */
router.post('/drives/create', authMiddleware, createCampusDrive);
router.get('/drives/all', getAllCampusDrives); // Public
router.get('/drives/my-drives', authMiddleware, getMyCampusDrives); // BEFORE :driveId
router.get('/drives/my-registrations', authMiddleware, getMyDriveRegistrations); // BEFORE :driveId

/**
 * Campus Drive Registration - Specific routes BEFORE generic :driveId
 */
router.post('/drives/:driveId/register', authMiddleware, registerForCampusDrive);
router.get('/drives/:driveId/registrations', authMiddleware, getDriveRegistrations);

/**
 * Generic drive ID route - MUST BE LAST
 */
router.get('/drives/:driveId', getCampusDriveDetails); // Public

// ============================================
// INDUSTRY DASHBOARD ROUTES
// ============================================

/**
 * Talent Pool & Analytics
 */
router.get('/industry/talent-pool', authMiddleware, getIndustryTalentPool);

export default router;
