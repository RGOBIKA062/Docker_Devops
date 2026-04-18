import MentorshipRequest from '../models/MentorshipRequest.js';
import Mentor from '../models/Mentor.js';
import User from '../models/User.js';
import MentorshipSession from '../models/MentorshipSession.js';
import logger from '../utils/logger.js';

/**
 * MENTORSHIP REQUEST CONTROLLER
 * Manages mentorship request workflow and matching
 */

/**
 * 1. SEND MENTORSHIP REQUEST
 * Student sends request to mentor
 */
export const sendMentorshipRequest = async (req, res) => {
  try {
    const menteeId = req.user.id;
    const {
      mentorId,
      skillsRequested,
      requestMessage,
      mentorshipType,
      desiredStartDate,
      preferredDuration,
      preferredSessionDuration,
      preferredFrequency,
      goals,
      menteeBackground,
    } = req.body;

    // Validate inputs
    if (!mentorId || !requestMessage || !mentorshipType) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID, message, and mentorship type are required',
      });
    }

    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // Check if already has pending request
    const existingRequest = await MentorshipRequest.findOne({
      menteeId,
      mentorId,
      status: { $in: ['pending', 'under_review', 'active'] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or active request with this mentor',
      });
    }

    // Create new request
    const request = new MentorshipRequest({
      menteeId,
      mentorId,
      skillsRequested: skillsRequested || [],
      requestMessage,
      mentorshipType,
      desiredStartDate,
      preferredDuration,
      preferredSessionDuration,
      preferredFrequency,
      goals: goals || [],
      menteeBackground: menteeBackground || {},
      status: 'pending',
    });

    await request.save();

    // Update mentor's pending requests count
    await Mentor.findByIdAndUpdate(mentorId, {
      $inc: { 'stats.pendingRequests': 1 },
    });

    logger.info(`Mentorship request created: ${request._id} from ${menteeId} to ${mentorId}`);

    // Populate for response
    const populatedRequest = await request
      .populate('menteeId', 'fullName email profileImage')
      .populate('mentorId', 'userId professionalTitle');

    res.status(201).json({
      success: true,
      message: 'Mentorship request sent successfully',
      request: populatedRequest,
    });
  } catch (error) {
    logger.error(`Error in sendMentorshipRequest: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error sending mentorship request',
      error: error.message,
    });
  }
};

/**
 * 2. GET PENDING REQUESTS (For Mentor)
 * Mentor views all pending requests
 */
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, page = 1 } = req.query;

    const mentor = await Mentor.findOne({ userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const requests = await MentorshipRequest.find({
      mentorId: mentor._id,
      status: { $in: ['pending', 'under_review'] },
    })
      .populate('menteeId', 'fullName email profileImage institution')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await MentorshipRequest.countDocuments({
      mentorId: mentor._id,
      status: { $in: ['pending', 'under_review'] },
    });

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    logger.error(`Error in getPendingRequests: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving pending requests',
      error: error.message,
    });
  }
};

/**
 * 3. ACCEPT MENTORSHIP REQUEST
 * Mentor accepts a mentorship request
 */
export const acceptMentorshipRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { responseMessage, startDate, endDate, totalSessionsPlanned } = req.body;

    const request = await MentorshipRequest.findById(requestId).populate('mentorId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify mentor ownership
    const mentor = await Mentor.findOne({ userId });
    if (!mentor || mentor._id.toString() !== request.mentorId._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this request',
      });
    }

    // Update request
    request.status = 'accepted';
    request.mentorResponse = {
      responseDate: new Date(),
      responseMessage,
      isAccepted: true,
    };
    request.activationDetails = {
      startDate: startDate || new Date(),
      endDate,
      totalSessionsPlanned: totalSessionsPlanned || 4,
    };

    await request.save();

    // Update mentor stats
    await Mentor.findByIdAndUpdate(mentor._id, {
      $inc: {
        'stats.pendingRequests': -1,
        'stats.activeMentees': 1,
        'stats.successfulMatches': 1,
      },
    });

    logger.info(`Mentorship request accepted: ${requestId}`);

    const populatedRequest = await request
      .populate('menteeId', 'fullName email')
      .populate('mentorId', 'userId professionalTitle');

    res.status(200).json({
      success: true,
      message: 'Mentorship request accepted',
      request: populatedRequest,
    });
  } catch (error) {
    logger.error(`Error in acceptMentorshipRequest: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error accepting request',
      error: error.message,
    });
  }
};

/**
 * 4. REJECT MENTORSHIP REQUEST
 * Mentor rejects a mentorship request
 */
export const rejectMentorshipRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    const request = await MentorshipRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify mentor ownership
    const mentor = await Mentor.findOne({ userId });
    if (!mentor || mentor._id.toString() !== request.mentorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this request',
      });
    }

    // Update request
    request.status = 'rejected';
    request.mentorResponse = {
      responseDate: new Date(),
      isAccepted: false,
      rejectionReason,
    };

    await request.save();

    // Update mentor stats
    await Mentor.findByIdAndUpdate(mentor._id, {
      $inc: { 'stats.pendingRequests': -1 },
    });

    logger.info(`Mentorship request rejected: ${requestId}`);

    res.status(200).json({
      success: true,
      message: 'Request rejected',
    });
  } catch (error) {
    logger.error(`Error in rejectMentorshipRequest: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error rejecting request',
      error: error.message,
    });
  }
};

/**
 * 5. GET MY REQUESTS (For Student)
 * Student views their mentorship requests
 */
export const getMyRequests = async (req, res) => {
  try {
    const menteeId = req.user.id;
    const { status, limit = 50, page = 1 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let filter = { menteeId };
    if (status) {
      filter.status = status;
    }

    const requests = await MentorshipRequest.find(filter)
      .populate('mentorId')
      .populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'fullName profileImage' },
      })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await MentorshipRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    logger.error(`Error in getMyRequests: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving requests',
      error: error.message,
    });
  }
};

/**
 * 6. CANCEL MENTORSHIP REQUEST
 * Either mentee or mentor can cancel
 */
export const cancelMentorshipRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await MentorshipRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify authorization
    const user = await User.findById(userId);
    if (
      request.menteeId.toString() !== userId &&
      (await Mentor.findOne({ userId }))._id.toString() !== request.mentorId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request',
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Update mentor stats if was active
    if (request.status === 'active') {
      const mentor = await Mentor.findById(request.mentorId);
      if (mentor) {
        await Mentor.findByIdAndUpdate(request.mentorId, {
          $inc: { 'stats.activeMentees': -1 },
        });
      }
    }

    logger.info(`Mentorship request cancelled: ${requestId}`);

    res.status(200).json({
      success: true,
      message: 'Mentorship request cancelled',
    });
  } catch (error) {
    logger.error(`Error in cancelMentorshipRequest: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message,
    });
  }
};

export default {
  sendMentorshipRequest,
  getPendingRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  getMyRequests,
  cancelMentorshipRequest,
};
