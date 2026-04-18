import Mentor from '../models/Mentor.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import MentorshipSession from '../models/MentorshipSession.js';
import MentorReview from '../models/MentorReview.js';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import logger from '../utils/logger.js';

/**
 * MENTOR CONTROLLER - Enterprise-Grade Mentorship Platform
 * All business logic for mentor profiles, leaderboard, and analytics
 */

/**
 * 1. CREATE/UPDATE MENTOR PROFILE
 * Faculty creates or updates their mentor profile
 */
export const createOrUpdateMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      professionalTitle,
      yearsOfExperience,
      currentCompany,
      linkedinProfile,
      githubProfile,
      portfolioUrl,
      professionalBio,
      skills,
      industries,
      mentorshipTypes,
      languages,
      specializations,
      settings,
      pricingType,
      weeklyHours,
      timezone,
      maxConcurrentMentees,
      avgResponseTime,
    } = req.body;

    // Validate required fields
    if (!professionalTitle || !yearsOfExperience || !professionalBio) {
      return res.status(400).json({
        success: false,
        message: 'Professional title, years of experience, and bio are required',
      });
    }

    // Find or create mentor profile
    let mentor = await Mentor.findOne({ userId });

    if (mentor) {
      // Update existing profile
      mentor.professionalTitle = professionalTitle;
      mentor.yearsOfExperience = yearsOfExperience;
      mentor.currentCompany = currentCompany;
      mentor.linkedinProfile = linkedinProfile;
      mentor.githubProfile = githubProfile;
      mentor.portfolioUrl = portfolioUrl;
      mentor.professionalBio = professionalBio;
      mentor.skills = skills || mentor.skills;
      mentor.industries = industries || mentor.industries;
      mentor.mentorshipTypes = mentorshipTypes || mentor.mentorshipTypes;
      mentor.languages = languages || mentor.languages;
      mentor.specializations = specializations || mentor.specializations;
      mentor.pricingType = pricingType || 'free';
      mentor.weeklyHours = weeklyHours || mentor.weeklyHours;
      mentor.timezone = timezone || 'IST';
      mentor.maxConcurrentMentees = maxConcurrentMentees || mentor.maxConcurrentMentees;
      mentor.avgResponseTime = avgResponseTime || '24hours';
      mentor.settings = { ...mentor.settings, ...settings };

      logger.info(`Mentor profile updated: ${userId}`);
    } else {
      // Create new profile
      mentor = new Mentor({
        userId,
        professionalTitle,
        yearsOfExperience,
        currentCompany,
        linkedinProfile,
        githubProfile,
        portfolioUrl,
        professionalBio,
        skills: skills || [],
        industries: industries || [],
        mentorshipTypes: mentorshipTypes || {},
        languages: languages || [],
        specializations: specializations || [],
        pricingType: pricingType || 'free',
        weeklyHours: weeklyHours || 10,
        timezone: timezone || 'IST',
        maxConcurrentMentees: maxConcurrentMentees || 5,
        avgResponseTime: avgResponseTime || '24hours',
        settings: settings || {
          isPublicProfile: true,
          acceptingNewMentees: true,
        },
      });

      logger.info(`New mentor profile created: ${userId}`);
    }

    await mentor.save();

    // SYNC: Also update Faculty record with mentor profile data
    // This ensures StudentDashboard can fetch all mentor info from Faculty collection
    try {
      const facultyUpdateData = {
        yearsOfExperience,
        currentCompany: currentCompany || '',
        linkedinProfile: linkedinProfile || '',
        githubProfile: githubProfile || '',
        specializations: specializations || [],
        // Convert mentor skills format (objects) to Faculty skills format (strings)
        skills: skills && Array.isArray(skills) 
          ? skills.map(s => typeof s === 'string' ? s : s.skillName)
          : [],
      };

      await Faculty.findOneAndUpdate(
        { userId },
        facultyUpdateData,
        { new: true }
      );

      logger.info(`Faculty record synced for mentor: ${userId}`);
    } catch (facultyError) {
      logger.warn(`Failed to sync Faculty record: ${facultyError.message}`);
      // Don't fail the whole request if Faculty sync fails
    }

    res.status(200).json({
      success: true,
      message: 'Mentor profile updated successfully',
      mentor,
    });
  } catch (error) {
    logger.error(`Error in createOrUpdateMentorProfile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating mentor profile',
      error: error.message,
    });
  }
};

/**
 * 2. GET MENTOR PROFILE
 * Retrieve complete mentor profile with all details
 */
export const getMentorProfile = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentor = await Mentor.findById(mentorId)
      .populate('userId', 'fullName email phone institution profileImage')
      .populate('reviews');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // Calculate live statistics
    const stats = await calculateMentorStats(mentorId);

    res.status(200).json({
      success: true,
      mentor: {
        ...mentor.toObject(),
        liveStats: stats,
      },
    });
  } catch (error) {
    logger.error(`Error in getMentorProfile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving mentor profile',
      error: error.message,
    });
  }
};

/**
 * 3. GET MENTORS LIST (For Students)
 * Search and filter mentors with intelligent matching
 */
export const getMentorsList = async (req, res) => {
  try {
    const { skill, industry, rating, experience, sort = 'rating', limit = 20, page = 1 } = req.query;

    // Build filter
    const filter = {
      verificationStatus: { $ne: 'unverified' },
      accountStatus: 'active',
      'settings.isPublicProfile': true,
      'settings.acceptingNewMentees': true,
    };

    if (skill) {
      filter['skills.skillName'] = { $regex: skill, $options: 'i' };
    }

    if (industry) {
      filter.industries = industry;
    }

    if (rating) {
      filter['metrics.averageRating'] = { $gte: parseFloat(rating) };
    }

    if (experience) {
      filter.yearsOfExperience = { $gte: parseInt(experience) };
    }

    // Build sort
    let sortOptions = {};
    switch (sort) {
      case 'rating':
        sortOptions = { 'metrics.averageRating': -1 };
        break;
      case 'experience':
        sortOptions = { yearsOfExperience: -1 };
        break;
      case 'rank':
        sortOptions = { 'leaderboardScores.rank': 1 };
        break;
      case 'latest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { 'metrics.averageRating': -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const mentors = await Mentor.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'fullName email profileImage');

    const total = await Mentor.countDocuments(filter);

    res.status(200).json({
      success: true,
      mentors,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    logger.error(`Error in getMentorsList: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving mentors list',
      error: error.message,
    });
  }
};

/**
 * 4. GET MENTOR LEADERBOARD
 * Comprehensive leaderboard with multiple ranking metrics
 */
export const getMentorLeaderboard = async (req, res) => {
  try {
    const { metric = 'overall', limit = 50, offset = 0 } = req.query;

    let sortField = 'leaderboardScores.overallScore';

    switch (metric) {
      case 'rating':
        sortField = 'metrics.averageRating';
        break;
      case 'earnings':
        sortField = 'earnings.totalEarnings';
        break;
      case 'sessions':
        sortField = 'metrics.totalMenteesSessions';
        break;
      case 'impact':
        sortField = 'leaderboardScores.impactScore';
        break;
      default:
        sortField = 'leaderboardScores.overallScore';
    }

    const mentors = await Mentor.find({
      verificationStatus: { $ne: 'unverified' },
      accountStatus: 'active',
    })
      .sort({ [sortField]: -1, 'leaderboardScores.rank': 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('userId', 'fullName profileImage')
      .select(
        'userId professionalTitle yearsOfExperience metrics leaderboardScores earnings verificationStatus'
      );

    // Add rank to response
    const leaderboard = mentors.map((mentor, index) => ({
      ...mentor.toObject(),
      dynamicRank: parseInt(offset) + index + 1,
    }));

    const total = await Mentor.countDocuments({
      verificationStatus: { $ne: 'unverified' },
      accountStatus: 'active',
    });

    res.status(200).json({
      success: true,
      leaderboard,
      pagination: {
        total,
        returned: mentors.length,
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error(`Error in getMentorLeaderboard: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaderboard',
      error: error.message,
    });
  }
};

/**
 * 5. GET MENTOR ANALYTICS DASHBOARD
 * Comprehensive analytics for mentor's own dashboard
 */
export const getMentorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const mentor = await Mentor.findOne({ userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
      });
    }

    // Get all mentorship requests
    const requests = await MentorshipRequest.find({ mentorId: mentor._id }).countDocuments();
    const acceptedRequests = await MentorshipRequest.find({
      mentorId: mentor._id,
      status: 'active',
    }).countDocuments();
    const pendingRequests = await MentorshipRequest.find({
      mentorId: mentor._id,
      status: 'pending',
    }).countDocuments();

    // Get all sessions
    const completedSessions = await MentorshipSession.find({
      mentorId: mentor._id,
      status: 'completed',
    }).countDocuments();

    // Calculate earnings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const monthlyEarnings = await MentorshipSession.aggregate([
      {
        $match: {
          mentorId: mentor._id,
          status: 'completed',
          updatedAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$billing.amountCharged' },
        },
      },
    ]);

    // Get recent reviews
    const recentReviews = await MentorReview.find({ mentorId: mentor._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('menteeId', 'fullName profileImage');

    // Get upcoming sessions
    const upcomingSessions = await MentorshipSession.find({
      mentorId: mentor._id,
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledStartTime: { $gte: new Date() },
    })
      .sort({ scheduledStartTime: 1 })
      .limit(5)
      .populate('menteeId', 'fullName profileImage');

    const analytics = {
      overview: {
        totalRequests: requests,
        activeMentees: mentor.stats.activeMentees,
        pendingRequests,
        acceptedRequests,
      },
      performance: {
        totalSessionsCompleted: completedSessions,
        totalHoursMentored: mentor.metrics.totalHoursMentored,
        averageRating: mentor.metrics.averageRating,
        responseRate: mentor.metrics.responseRate,
        menteeRetentionRate: mentor.metrics.menteeRetentionRate,
      },
      earnings: {
        totalEarnings: mentor.earnings.totalEarnings,
        monthlyEarnings: monthlyEarnings[0]?.total || 0,
        pendingPayout: mentor.earnings.pendingPayout,
        lastPayoutDate: mentor.earnings.lastPayoutDate,
        nextPayoutDate: mentor.earnings.nextPayoutDate,
      },
      leaderboard: {
        rank: mentor.leaderboardScores.rank,
        tier: mentor.leaderboardScores.tier,
        overallScore: mentor.leaderboardScores.overallScore,
      },
      recentReviews,
      upcomingSessions,
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error(`Error in getMentorAnalytics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analytics',
      error: error.message,
    });
  }
};

/**
 * 6. GET MY MENTEES
 * Retrieve all mentees for a mentor
 */
export const getMyMentees = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'active', limit = 50, page = 1 } = req.query;

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
      status,
    })
      .populate('menteeId', 'fullName email profileImage')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await MentorshipRequest.countDocuments({
      mentorId: mentor._id,
      status,
    });

    res.status(200).json({
      success: true,
      mentees: requests,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    logger.error(`Error in getMyMentees: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving mentees',
      error: error.message,
    });
  }
};

/**
 * Helper Function: Calculate Mentor Statistics
 */
async function calculateMentorStats(mentorId) {
  try {
    const completedSessions = await MentorshipSession.countDocuments({
      mentorId,
      status: 'completed',
    });

    const activeMentorships = await MentorshipRequest.countDocuments({
      mentorId,
      status: 'active',
    });

    const avgRating = await MentorReview.aggregate([
      { $match: { mentorId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const totalHours = await MentorshipSession.aggregate([
      {
        $match: {
          mentorId,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $divide: ['$duration', 60] } },
        },
      },
    ]);

    return {
      completedSessions,
      activeMentorships,
      averageRating: avgRating[0]?.avgRating || 0,
      totalReviews: avgRating[0]?.totalReviews || 0,
      totalHours: totalHours[0]?.totalHours || 0,
    };
  } catch (error) {
    logger.error(`Error calculating mentor stats: ${error.message}`);
    return {};
  }
}

export default {
  createOrUpdateMentorProfile,
  getMentorProfile,
  getMentorsList,
  getMentorLeaderboard,
  getMentorAnalytics,
  getMyMentees,
};
