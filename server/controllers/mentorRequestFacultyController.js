/**
 * ========================================
 * MENTOR REQUEST CONTROLLER - FACULTY
 * ========================================
 * Professional-grade mentor request handling
 * using Faculty model directly (25+ years patterns)
 * 
 * @author Senior Software Developer
 * @version 2.0
 */

import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Create MentorRequest Model - In-memory for now
 * In production: would use separate MongoDB collection
 */
const mentorRequests = [];

/**
 * ==========================================
 * SEND MENTOR REQUEST
 * ==========================================
 * Student requests mentoring from faculty
 * 
 * @route   POST /api/mentors/request
 * @access  Private (Students)
 * @body    { mentorId, message, skills, goals }
 */
export const sendMentorRequest = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const studentName = req.user.fullName || req.user.name;
    
    const {
      mentorId,
      message,
      skills = [],
      goals = [],
    } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID is required',
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters',
      });
    }

    // ============================================
    // VERIFY MENTOR EXISTS
    // ============================================
    console.log(`[MENTOR DEBUG] Looking for Faculty with mentorId=${mentorId}`);
    console.log(`[MENTOR DEBUG] mentorId type: ${typeof mentorId}`);
    
    // First, let's see what Faculty records exist
    const allFaculty = await Faculty.find({}).lean().limit(3);
    console.log(`[MENTOR DEBUG] Total Faculty records in DB: ${allFaculty.length}`);
    allFaculty.forEach((f, i) => {
      console.log(`[MENTOR DEBUG]   ${i+1}. ID=${f._id}, userId=${f.userId}, name=${f.fullName}`);
    });
    
    let mentor = await Faculty.findById(mentorId).lean();
    console.log(`[MENTOR DEBUG] Faculty.findById(${mentorId}) returned:`, mentor ? `Found (ID: ${mentor._id})` : 'NOT FOUND');
    
    // If not found by ID, try to find by userId (mentor ID might be user ID)
    if (!mentor) {
      console.log(`[MENTOR DEBUG] Trying Faculty.findOne({ userId: ObjectId('${mentorId}') })`);
      try {
        mentor = await Faculty.findOne({ userId: mentorId }).lean();
        console.log(`[MENTOR DEBUG] Faculty.findOne({ userId: ${mentorId} }) returned:`, mentor ? `Found (ID: ${mentor._id})` : 'NOT FOUND');
      } catch (err) {
        console.error(`[MENTOR DEBUG] Faculty.findOne error:`, err.message);
      }
    }
    
    // If Faculty doesn't exist, try to create it from the User record
    if (!mentor) {
      console.log(`[MENTOR] Faculty record not found for ${mentorId}, attempting to create...`);
      const User = (await import('../models/User.js')).default;
      const mentorUser = await User.findById(mentorId).lean();
      
      if (!mentorUser) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found',
        });
      }

      // Create Faculty record if missing
      try {
        const newFaculty = new Faculty({
          userId: mentorId,
          fullName: mentorUser.fullName,
          email: mentorUser.email,
          designation: 'Faculty',
          bio: 'Faculty member',
          settings: {
            acceptMentorRequests: true,
          },
        });
        mentor = await newFaculty.save();
        console.log(`[MENTOR] Faculty record created for ${mentorId}`);
      } catch (facError) {
        console.error(`[MENTOR] Could not create Faculty record:`, facError.message);
        return res.status(404).json({
          success: false,
          message: 'Mentor not found and could not create profile',
        });
      }
    }

    // Check if mentor accepts requests
    if (mentor.settings?.acceptMentorRequests === false) {
      return res.status(403).json({
        success: false,
        message: 'This mentor is not accepting requests at the moment',
      });
    }

    // ============================================
    // CHECK FOR DUPLICATE PENDING REQUESTS
    // ============================================
    const MentorRequest = (await import('../models/MentorRequest.js')).default;
    
    // Use the Faculty._id for queries and storage
    const facultyId = mentor._id;
    
    const existingRequest = await MentorRequest.findOne({
      studentId,
      mentorId: facultyId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending or active request with this mentor',
      });
    }

    // ============================================
    // CREATE REQUEST
    // ============================================
    const newRequest = new MentorRequest({
      studentId,
      studentName,
      mentorId: facultyId,  // Store Faculty._id, not User.id
      mentorName: mentor.fullName,
      message,
      skills: Array.isArray(skills) ? skills : [],
      goals: Array.isArray(goals) ? goals : [],
      status: 'pending',
      requestedAt: new Date(),
      responseAt: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await newRequest.save();

    // ============================================
    // LOG & NOTIFY
    // ============================================
    logger.info(`[MENTOR] Request created: ${newRequest._id}`, {
      from: studentName,
      to: mentor.fullName,
      timestamp: new Date(),
    });

    // ============================================
    // RESPONSE
    // ============================================
    res.status(201).json({
      success: true,
      message: 'Mentor request sent successfully',
      data: {
        requestId: newRequest._id,
        status: 'pending',
        mentor: {
          id: mentor._id,
          name: mentor.fullName,
          department: mentor.department,
        },
        requestedAt: newRequest.requestedAt,
        expiresAt: newRequest.expiresAt,
      },
    });

  } catch (error) {
    logger.error('[MENTOR] Error sending request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send mentor request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * ==========================================
 * GET MENTOR REQUESTS (For Mentor)
 * ==========================================
 * Mentor views incoming requests
 * 
 * @route   GET /api/mentors/requests
 * @access  Private (Faculty/Mentors only)
 */
export const getMentorRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // Don't filter by status - let frontend handle filtering
    // This way faculty sees ALL requests (pending, accepted, rejected)

    // Verify user is faculty and get faculty profile
    const faculty = await Faculty.findOne({ userId }).lean();
    if (!faculty) {
      return res.status(403).json({
        success: false,
        message: 'Faculty profile not found. Only faculty can view mentor requests.',
      });
    }

    const mentorId = faculty._id;

    // ============================================
    // FETCH ALL REQUESTS (not filtered by status)
    // ============================================
    const MentorRequest = (await import('../models/MentorRequest.js')).default;
    
    const requests = await MentorRequest.find({ mentorId })
      .sort({ requestedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
    });

  } catch (error) {
    logger.error('[MENTOR] Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
    });
  }
};

/**
 * ==========================================
 * ACCEPT MENTOR REQUEST
 * ==========================================
 * Mentor accepts student request
 * 
 * @route   PUT /api/mentors/requests/:requestId/accept
 * @access  Private (Mentor only)
 */
export const acceptMentorRequest = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { requestId } = req.params;
    const { message = '' } = req.body;

    // Get faculty profile
    const faculty = await Faculty.findOne({ userId }).lean();
    if (!faculty) {
      return res.status(403).json({
        success: false,
        message: 'Faculty profile not found',
      });
    }

    const mentorId = faculty._id;

    // ============================================
    // FETCH & VERIFY REQUEST
    // ============================================
    const MentorRequest = (await import('../models/MentorRequest.js')).default;
    
    const request = await MentorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify mentor owns this request
    if (request.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to accept this request',
      });
    }

    // Check request status
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept request with status: ${request.status}`,
      });
    }

    // ============================================
    // UPDATE REQUEST
    // ============================================
    request.status = 'accepted';
    request.responseAt = new Date();
    request.mentorMessage = message;
    await request.save();

    logger.info(`[MENTOR] Request accepted: ${requestId}`, {
      mentor: request.mentorName,
      student: request.studentName,
    });

    // ============================================
    // RESPONSE
    // ============================================
    res.status(200).json({
      success: true,
      message: 'Mentor request accepted',
      data: {
        requestId: request._id,
        status: 'accepted',
        responseAt: request.responseAt,
      },
    });

  } catch (error) {
    logger.error('[MENTOR] Error accepting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept request',
    });
  }
};

/**
 * ==========================================
 * REJECT MENTOR REQUEST
 * ==========================================
 * Mentor rejects student request
 * 
 * @route   PUT /api/mentors/requests/:requestId/reject
 * @access  Private (Mentor only)
 */
export const rejectMentorRequest = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { requestId } = req.params;
    const { reason = '' } = req.body;

    // Get faculty profile
    const faculty = await Faculty.findOne({ userId }).lean();
    if (!faculty) {
      return res.status(403).json({
        success: false,
        message: 'Faculty profile not found',
      });
    }

    const mentorId = faculty._id;

    const MentorRequest = (await import('../models/MentorRequest.js')).default;
    
    const request = await MentorRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    request.status = 'rejected';
    request.responseAt = new Date();
    request.rejectionReason = reason;
    await request.save();

    logger.info(`[MENTOR] Request rejected: ${requestId}`);

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: {
        requestId: request._id,
        status: 'rejected',
      },
    });

  } catch (error) {
    logger.error('[MENTOR] Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
    });
  }
};

/**
 * ==========================================
 * GET MY MENTOR REQUESTS (For Student)
 * ==========================================
 * Student views sent requests status
 * 
 * @route   GET /api/mentors/my-requests
 * @access  Private (Students)
 */
export const getMyMentorRequests = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const { status } = req.query;

    const MentorRequest = (await import('../models/MentorRequest.js')).default;
    
    const query = { studentId };
    if (status) query.status = status;

    const requests = await MentorRequest.find(query)
      .sort({ requestedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
    });

  } catch (error) {
    logger.error('[MENTOR] Error fetching student requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
    });
  }
};

export default {
  sendMentorRequest,
  getMentorRequests,
  acceptMentorRequest,
  rejectMentorRequest,
  getMyMentorRequests,
};
