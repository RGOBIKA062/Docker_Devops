import express from 'express';
import {
  createOrUpdateMentorProfile,
  getMentorProfile,
  getMentorsList,
  getMentorLeaderboard,
  getMentorAnalytics,
  getMyMentees,
} from '../controllers/mentorController.js';
import {
  sendMentorshipRequest,
  getPendingRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  getMyRequests,
  cancelMentorshipRequest,
} from '../controllers/mentorshipRequestController.js';
import {
  sendMentorRequest,
  getMentorRequests,
  acceptMentorRequest,
  rejectMentorRequest,
  getMyMentorRequests,
} from '../controllers/mentorRequestFacultyController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * ==========================================
 * MENTOR PROFILE ROUTES
 * ==========================================
 */

/**
 * @route   POST /api/mentors/profile
 * @desc    Create or update mentor profile
 * @access  Private (Faculty only)
 */
router.post('/profile', authMiddleware, createOrUpdateMentorProfile);

/**
 * @route   GET /api/mentors/profile/me
 * @desc    Get current user's mentor profile
 * @access  Private
 */
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const Mentor = (await import('../models/Mentor.js')).default;
    
    const mentor = await Mentor.findOne({ userId })
      .populate('userId', 'fullName email phone institution profileImage');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
        mentor: null,
      });
    }

    res.status(200).json({
      success: true,
      mentor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving mentor profile',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/mentors/profile/:mentorId
 * @desc    Get mentor profile details
 * @access  Public
 */
router.get('/profile/:mentorId', getMentorProfile);

/**
 * @route   GET /api/mentors/analytics
 * @desc    Get mentor's own analytics dashboard
 * @access  Private (Mentor only)
 */
router.get('/analytics', authMiddleware, getMentorAnalytics);

/**
 * @route   GET /api/mentors/my-mentees
 * @desc    Get all mentees for a mentor
 * @access  Private (Mentor only)
 */
router.get('/my-mentees', authMiddleware, getMyMentees);

/**
 * ==========================================
 * MENTOR DISCOVERY & LEADERBOARD ROUTES
 * ==========================================
 */

/**
 * @route   GET /api/mentors/list
 * @desc    Get mentors list with filters (search, skill, industry, rating)
 * @access  Public
 * @query   skill, industry, rating, experience, sort, limit, page
 */
router.get('/list', getMentorsList);

/**
 * @route   GET /api/mentors/leaderboard
 * @desc    Get mentor leaderboard (rankings by rating, earnings, impact)
 * @access  Public
 * @query   metric (overall|rating|earnings|sessions|impact), limit, offset
 */
router.get('/leaderboard', getMentorLeaderboard);

/**
 * ==========================================
 * MENTORSHIP REQUEST ROUTES
 * ==========================================
 */

/**
 * @route   POST /api/mentors/request/send
 * @desc    Send mentorship request to a mentor
 * @access  Private (Student only)
 */
router.post('/request/send', authMiddleware, sendMentorshipRequest);

/**
 * @route   GET /api/mentors/request/pending
 * @desc    Get all pending requests for mentor
 * @access  Private (Mentor only)
 */
router.get('/request/pending', authMiddleware, getPendingRequests);

/**
 * @route   GET /api/mentors/request/my-requests
 * @desc    Get all requests sent by student
 * @access  Private (Student only)
 */
router.get('/request/my-requests', authMiddleware, getMyRequests);

/**
 * @route   POST /api/mentors/request/:requestId/accept
 * @desc    Accept mentorship request
 * @access  Private (Mentor only)
 */
router.post('/request/:requestId/accept', authMiddleware, acceptMentorshipRequest);

/**
 * @route   POST /api/mentors/request/:requestId/reject
 * @desc    Reject mentorship request
 * @access  Private (Mentor only)
 */
router.post('/request/:requestId/reject', authMiddleware, rejectMentorshipRequest);

/**
 * @route   DELETE /api/mentors/request/:requestId/cancel
 * @desc    Cancel mentorship request
 * @access  Private (Student or Mentor)
 */
router.delete('/request/:requestId/cancel', authMiddleware, cancelMentorshipRequest);

/**
 * ==========================================
 * FACULTY-BASED MENTOR REQUEST ROUTES
 * ==========================================
 * Professional mentoring system using Faculty
 */

/**
 * @route   POST /api/mentors/faculty-request
 * @desc    Send mentor request to faculty
 * @access  Private (Students)
 * @body    { mentorId, message, skills[], goals[] }
 */
router.post('/faculty-request', authMiddleware, sendMentorRequest);

/**
 * @route   GET /api/mentors/faculty-requests
 * @desc    Get incoming mentor requests (for faculty)
 * @access  Private (Faculty/Mentors)
 * @query   status (pending|accepted|rejected)
 */
router.get('/faculty-requests', authMiddleware, getMentorRequests);

/**
 * @route   GET /api/mentors/my-requests
 * @desc    Get student's mentor requests
 * @access  Private (Students)
 * @query   status
 */
router.get('/my-requests', authMiddleware, getMyMentorRequests);

/**
 * @route   PUT /api/mentors/faculty-request/:requestId/accept
 * @desc    Accept mentor request
 * @access  Private (Faculty/Mentors)
 * @body    { message? }
 */
router.put('/faculty-request/:requestId/accept', authMiddleware, acceptMentorRequest);

/**
 * @route   PUT /api/mentors/faculty-request/:requestId/reject
 * @desc    Reject mentor request
 * @access  Private (Faculty/Mentors)
 * @body    { reason? }
 */
router.put('/faculty-request/:requestId/reject', authMiddleware, rejectMentorRequest);

export default router;
