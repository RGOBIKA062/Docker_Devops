import IndustryProfessional from '../models/IndustryProfessional.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Get Industry Professional Dashboard Stats
 * @route GET /api/industry/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    let industry = await IndustryProfessional.findOne({ userId });
    
    // Auto-create if doesn't exist
    if (!industry) {
      industry = new IndustryProfessional({
        userId,
        company: { 
          name: 'Company Name', 
          industry: 'Technology',
          companySize: 'Medium (51-500)'
        },
        contact: {
          email: 'company@example.com'
        },
        status: 'Active',
      });
      await industry.save();
    }

    const stats = {
      activeCollaborations: industry.statistics?.activeCollaborations || 0,
      campusVisits: industry.statistics?.campusVisits || 0,
      totalHired: industry.statistics?.totalHired || 0,
      eventsHosted: industry.statistics?.eventsHosted || 0,
      overallRating: industry.overallRating || 0,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Industry Profile
 * @route GET /api/industry/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    let industry = await IndustryProfessional.findOne({ userId }).populate('userId', 'fullName email');

    // Auto-create if doesn't exist
    if (!industry) {
      industry = new IndustryProfessional({
        userId,
        company: { 
          name: 'Company Name', 
          industry: 'Technology',
          companySize: 'Medium (51-500)'
        },
        contact: {
          email: 'company@example.com'
        },
        status: 'Active',
      });
      await industry.save();
      industry = await industry.populate('userId', 'fullName email');
    }

    res.status(200).json({
      success: true,
      data: industry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create or Update Industry Profile
 * @route POST /api/industry/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { company, contact, talentPreferences, preferences } = req.body;

    // Validate required fields
    if (!company || !company.name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const updatedProfile = await IndustryProfessional.findOneAndUpdate(
      { userId },
      {
        company,
        contact,
        talentPreferences,
        preferences,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Post a New Job Opening
 * @route POST /api/industry/job-openings
 */
export const postJobOpening = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { title, description, positions, salary, jobType, skills, experience, deadline } = req.body;

    // Validate required fields
    if (!title || !description || !positions) {
      return res.status(400).json({ success: false, message: 'Title, description, and positions are required' });
    }

    let industry = await IndustryProfessional.findOne({ userId });
    
    // Auto-create if doesn't exist
    if (!industry) {
      industry = new IndustryProfessional({
        userId,
        company: { 
          name: 'Company Name', 
          industry: 'Technology',
          companySize: 'Medium (51-500)'
        },
        contact: {
          email: 'company@example.com'
        },
        status: 'Active',
      });
    }

    const newJob = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      positions,
      salary,
      jobType,
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      experience,
      deadline,
      status: 'Open',
      applications: [],
      createdAt: new Date(),
    };

    industry.jobOpenings.push(newJob);
    industry.subscription = industry.subscription || { totalPostings: 999, usedPostings: 0 };
    industry.subscription.usedPostings = (industry.subscription.usedPostings || 0) + 1;

    await industry.save();

    res.status(201).json({
      success: true,
      message: 'Job opening posted successfully',
      data: newJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get All Job Openings by Industry
 * @route GET /api/industry/job-openings
 */
export const getJobOpenings = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    let industry = await IndustryProfessional.findOne({ userId });
    
    // Auto-create if doesn't exist
    if (!industry) {
      industry = new IndustryProfessional({
        userId,
        company: { 
          name: 'Company Name', 
          industry: 'Technology',
          companySize: 'Medium (51-500)'
        },
        contact: {
          email: 'company@example.com'
        },
        status: 'Active',
      });
      await industry.save();
    }

    res.status(200).json({
      success: true,
      data: industry.jobOpenings || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Schedule Campus Visit
 * @route POST /api/industry/campus-visits
 */
export const scheduleCampusVisit = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { college, date, time, location, purpose, expectedStudents, recruitmentTeam, interviewProcess } = req.body;

    // Validate required fields
    if (!college || !date || !location) {
      return res.status(400).json({ success: false, message: 'College, date, and location are required' });
    }

    let industry = await IndustryProfessional.findOne({ userId });
    
    // Auto-create if doesn't exist
    if (!industry) {
      industry = new IndustryProfessional({
        userId,
        company: { 
          name: 'Company Name', 
          industry: 'Technology',
          companySize: 'Medium (51-500)'
        },
        contact: {
          email: 'company@example.com'
        },
        status: 'Active',
      });
    }

    const newVisit = {
      _id: new mongoose.Types.ObjectId(),
      college,
      date: new Date(date),
      time,
      location,
      purpose,
      expectedStudents,
      recruitmentTeam,
      interviewProcess,
      status: 'Scheduled',
      registeredStudents: [],
      createdAt: new Date(),
    };

    industry.campusVisits.push(newVisit);
    if (industry.statistics) {
      industry.statistics.campusVisits = (industry.statistics.campusVisits || 0) + 1;
    }

    await industry.save();

    res.status(201).json({
      success: true,
      message: 'Campus visit scheduled successfully',
      data: newVisit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Campus Visits
 * @route GET /api/industry/campus-visits
 */
export const getCampusVisits = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    let industry = await IndustryProfessional.findOne({ userId });
    
    // Auto-create if doesn't exist
    if (!industry) {
      industry = new IndustryProfessional({
        userId,
        company: { 
          name: 'Company Name', 
          industry: 'Technology',
          companySize: 'Medium (51-500)'
        },
        contact: {
          email: 'company@example.com'
        },
        status: 'Active',
      });
      await industry.save();
    }

    res.status(200).json({
      success: true,
      data: industry.campusVisits || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create Campaign
 * @route POST /api/industry/campaigns
 */
export const createCampaign = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, description, startDate, endDate, type, budget, targetAudience } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'Title and type are required' });
    }

    const industry = await IndustryProfessional.findOne({ userId });
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Industry profile not found' });
    }

    const newCampaign = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type,
      budget,
      targetAudience,
      status: 'Planning',
      registrations: 0,
    };

    industry.campaigns.push(newCampaign);
    await industry.save();

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: newCampaign,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get All Talent Categories (Aggregate)
 * @route GET /api/industry/talent-categories
 */
export const getTalentCategories = async (req, res) => {
  try {
    const categories = await IndustryProfessional.aggregate([
      {
        $unwind: '$talentPreferences.skillsNeeded',
      },
      {
        $group: {
          _id: '$talentPreferences.skillsNeeded',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get All Industry Professionals (Public)
 * @route GET /api/industry/directory
 */
export const getIndustryDirectory = async (req, res) => {
  try {
    const { industry, search, page = 1, limit = 10 } = req.query;

    const query = { status: 'Active', 'preferences.showInPublicDirectory': true };

    if (industry) {
      query['company.industry'] = industry;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const professionals = await IndustryProfessional.find(query)
      .select('company contact statistics overallRating')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await IndustryProfessional.countDocuments(query);

    res.status(200).json({
      success: true,
      data: professionals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Campus Visit Status
 * @route PUT /api/industry/campus-visits/:visitId
 */
export const updateCampusVisitStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { visitId } = req.params;
    const { status } = req.body;

    const industry = await IndustryProfessional.findOne({ userId });
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Industry profile not found' });
    }

    const visit = industry.campusVisits.id(visitId);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Campus visit not found' });
    }

    visit.status = status;
    await industry.save();

    res.status(200).json({
      success: true,
      message: 'Campus visit status updated',
      data: visit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
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
};
