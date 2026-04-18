import express from 'express';
import {
  getAllFaculty,
  getFacultyProfile,
  updateFacultyProfile,
  getFacultyEvents,
  getEventDetails,
  createEvent,
  updateEvent,
  deleteEvent,
  getFacultyStatistics,
  searchEvents,
  getFeaturedFaculty,
  getFacultyWithMentorProfiles,
  getFacultyById,
  getEventRegistrations,
  markAttendance,
  bulkMarkAttendance,
} from '../controllers/facultyController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * ================================================
 * PRIVATE ROUTES (Require Authentication)
 * ================================================
 */

// Faculty Profile
router.get('/profile', authMiddleware, getFacultyProfile);
router.put('/profile', authMiddleware, updateFacultyProfile);

// Faculty Events
router.get('/my-events', authMiddleware, getFacultyEvents);
router.post('/events', authMiddleware, createEvent);
router.get('/events/:eventId', authMiddleware, getEventDetails);
router.put('/events/:eventId', authMiddleware, updateEvent);
router.delete('/events/:eventId', authMiddleware, deleteEvent);

// Event Registrations & Attendance
router.get('/events/:eventId/registrations', authMiddleware, getEventRegistrations);
router.put('/events/:eventId/attendance', authMiddleware, markAttendance);
router.post('/events/:eventId/bulk-attendance', authMiddleware, bulkMarkAttendance);

// Statistics
router.get('/statistics', authMiddleware, getFacultyStatistics);

/**
 * ================================================
 * PUBLIC ROUTES (No Authentication Required)
 * ================================================
 */

// Get all faculty (for mentoring)
router.get('/', getAllFaculty);

// Get all faculty with mentor profiles enriched (best for complete data)
router.get('/mentors/complete', getFacultyWithMentorProfiles);

// Search and Discovery
router.get('/search-events', searchEvents);
router.get('/featured', getFeaturedFaculty);
router.get('/:facultyId', getFacultyById);

export default router;
