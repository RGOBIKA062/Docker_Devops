/**
 * Advanced Industry Job & Campus Drive Controller
 * Enterprise-Grade API Management for Recruitment Features
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import JobOpening from '../models/JobOpening.js';
import JobApplication from '../models/JobApplication.js';
import CampusDrive from '../models/CampusDrive.js';
import IndustryProfessional from '../models/IndustryProfessional.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// ============================================
// JOB OPENING CONTROLLERS
// ============================================

/**
 * Create a new job opening
 * @route POST /api/jobs/create
 */
export const createJobOpening = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const {
      title,
      description,
      responsibilities,
      positions,
      jobType,
      salary,
      location,
      requirements,
      eligibility,
      applicationDeadline,
      contact,
      tags,
      category,
    } = req.body;

    // Validate required fields
    if (!title || !description || !positions || !jobType || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, positions, jobType, applicationDeadline',
      });
    }

    // Get industry professional profile
    let industryProf = await IndustryProfessional.findOne({ userId });
    if (!industryProf) {
      return res.status(404).json({
        success: false,
        message: 'Industry professional profile not found. Please complete your profile first.',
      });
    }

    // Create job opening
    const jobOpening = new JobOpening({
      industryProfessionalId: industryProf._id,
      title: title.trim(),
      description: description.trim(),
      responsibilities: responsibilities || [],
      positions,
      jobType,
      salary: salary || {},
      location: location || {},
      requirements: requirements || {},
      eligibility: eligibility || {},
      applicationDeadline: new Date(applicationDeadline),
      contact: contact || { email: industryProf.contact.email },
      tags: tags || [],
      category: category || 'IT',
      company: {
        name: industryProf.company.name,
        logo: industryProf.company.logo,
        industry: industryProf.company.industry,
      },
      createdBy: userId,
      status: 'Active',
      visibility: 'Public',
      isActive: true,
    });

    await jobOpening.save();

    // Populate response
    await jobOpening.populate('industryProfessionalId', 'company.name company.logo');

    res.status(201).json({
      success: true,
      message: 'Job opening created successfully',
      data: jobOpening,
    });
  } catch (error) {
    console.error('Error creating job opening:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
};

/**
 * Mark applicant as hired or not hired
 * @route POST /api/jobs/applications/:appId/hire
 */
export const markApplicantHired = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { appId } = req.params;
    const { hired = true, notes = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }

    const app = await JobApplication.findById(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify permissions - only job owner (industry) can mark hired
    const job = await JobOpening.findById(app.jobOpeningId);
    if (!job || job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const previouslyHired = app.hired === true || app.status === 'Hired';

    if (hired) {
      if (!previouslyHired) {
        app.status = 'Hired';
        app.hired = true;
        app.hiredAt = new Date();
        app.statusHistory.push({ status: 'Hired', changedAt: new Date(), changedBy: userId, notes });

        // Increment counters
        job.statistics.joined = (job.statistics.joined || 0) + 1;
        job.filledPositions = (job.filledPositions || 0) + 1;
      }
    } else {
      // mark as not hired -> map to Rejected status
      if (previouslyHired) {
        // undo increments
        job.statistics.joined = Math.max(0, (job.statistics.joined || 0) - 1);
        job.filledPositions = Math.max(0, (job.filledPositions || 0) - 1);
      }
      if (app.status !== 'Rejected') {
        app.status = 'Rejected';
        app.hired = false;
        app.hiredAt = undefined;
        app.statusHistory.push({ status: 'Rejected', changedAt: new Date(), changedBy: userId, notes });
      }
    }

    await app.save();
    await job.save();

    // Notify applicant in-app (and optionally via email later)
    try {
      const applicantUser = await User.findById(app.applicantId);
      if (applicantUser) {
        const message = hired
          ? `Congratulations — you have been marked as Hired for the role "${job.title}".`
          : `Update on your application for "${job.title}": Not hired.`;
        const notification = {
          type: 'hiring',
          message,
          data: { jobId: job._id, appId: app._id, hired },
          read: false,
          createdAt: new Date(),
        };
        applicantUser.notifications = applicantUser.notifications || [];
        applicantUser.notifications.unshift(notification);
        await applicantUser.save();
      }
    } catch (notifyErr) {
      console.warn('Failed to save in-app notification:', notifyErr);
    }

    res.status(200).json({ success: true, message: 'Applicant hire status updated', data: { application: app } });
  } catch (error) {
    console.error('Error marking applicant hired:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all job openings (with filtering)
 * @route GET /api/jobs/all
 */
export const getAllJobOpenings = async (req, res) => {
  try {
    const {
      keyword,
      jobType,
      city,
      skills,
      minSalary,
      maxSalary,
      status,
      limit = 20,
      page = 1,
    } = req.query;

    let query = {};

    if (keyword) {
      query.$text = { $search: keyword };
    }
    if (jobType) {
      query.jobType = jobType;
    }
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query['requirements.skills'] = { $in: skillsArray };
    }
    if (minSalary || maxSalary) {
      query['salary.min'] = { $gte: parseInt(minSalary) || 0 };
      if (maxSalary) {
        query['salary.max'] = { $lte: parseInt(maxSalary) };
      }
    }

    // Filter for active jobs - accept both 'Active' and 'Published' status
    query.$or = [
      { status: 'Active' },
      { status: 'Published' },
    ];
    query.isActive = { $ne: false }; // Include true or undefined

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobOpening.countDocuments(query);

    console.log(`📋 Job Query: ${JSON.stringify(query)}`);
    console.log(`📊 Total jobs matching query: ${total}`);

    const jobs = await JobOpening.find(query)
      .populate('industryProfessionalId', 'company.name company.logo company.industry')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    console.log(`✅ Returned ${jobs.length} jobs to client`);

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get industry's own job openings
 * @route GET /api/jobs/my-jobs
 */
export const getMyJobOpenings = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { status, limit = 50, page = 1 } = req.query;

    let query = { createdBy: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobOpening.countDocuments(query);

    const jobs = await JobOpening.find(query)
      .populate('industryProfessionalId')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single job opening details
 * @route GET /api/jobs/:jobId
 */
export const getJobOpeningDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }

    const job = await JobOpening.findById(jobId)
      .populate('industryProfessionalId')
      .populate('applicantIds');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update job opening
 * @route PUT /api/jobs/:jobId
 */
export const updateJobOpening = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { jobId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }

    const job = await JobOpening.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }

    // Verify ownership
    if (job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this job',
      });
    }

    Object.assign(job, updateData);
    job.lastModifiedBy = userId;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job opening updated successfully',
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Close/archive job opening
 * @route PUT /api/jobs/:jobId/close
 */
export const closeJobOpening = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { jobId } = req.params;

    const job = await JobOpening.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }

    if (job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await job.closeJob();

    res.status(200).json({
      success: true,
      message: 'Job opening closed successfully',
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// JOB APPLICATION CONTROLLERS
// ============================================

/**
 * Register/Apply for a job
 * @route POST /api/jobs/:jobId/apply
 */
export const applyForJob = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { jobId } = req.params;
    const { 
      applicantType, 
      applicantInfo, 
      applicantSkills, 
      experience, 
      education, 
      motivationMessage 
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }

    if (!applicantType || !['student', 'freelancer'].includes(applicantType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid applicant type. Must be "student" or "freelancer"',
      });
    }

    // Validate required fields
    if (!applicantInfo?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!applicantSkills || applicantSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill is required',
      });
    }

    if (!experience) {
      return res.status(400).json({
        success: false,
        message: 'Experience information is required',
      });
    }

    // Get job details
    const job = await JobOpening.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.applicationDeadline < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed',
      });
    }

    // Check if already applied
    const existingApp = await JobApplication.findOne({
      jobOpeningId: jobId,
      applicantId: userId,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Get applicant details
    const applicant = await User.findById(userId);
    if (!applicant) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('📝 Creating job application with data:', {
      skills: applicantSkills,
      experience,
      education,
    });

    // Create job application
    const application = new JobApplication({
      jobOpeningId: jobId,
      applicantId: userId,
      applicantType,
      industryProfessionalId: job.industryProfessionalId,
      applicantInfo: {
        name: applicant.fullName,
        email: applicant.email,
        phone: applicantInfo?.phone,
        resume: applicantInfo?.resume,
        portfolio: applicantInfo?.portfolio,
        linkedIn: applicantInfo?.linkedIn,
        bio: applicantInfo?.bio,
      },
      applicantSkills: Array.isArray(applicantSkills) ? applicantSkills : [applicantSkills],
      experience,
      education,
      motivationMessage,
      status: 'Pending',
      source: 'Website',
    });

    await application.save();

    // Update job statistics
    await job.incrementApplicationCount(applicantType);

    console.log('✅ Application saved with ID:', application._id);

    // Populate response
    await application.populate('jobOpeningId', 'title salary positions');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('❌ Error applying for job:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get applications for a job (industry view)
 * @route GET /api/jobs/:jobId/applications
 */
export const getJobApplications = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { jobId } = req.params;
    const { status, limit = 50, page = 1 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }

    // Verify job ownership
    const job = await JobOpening.findById(jobId);
    if (!job || job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to these applications',
      });
    }

    let query = { jobOpeningId: jobId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobApplication.countDocuments(query);

    const applications = await JobApplication.find(query)
      .populate('applicantId', 'fullName email phone')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user's job applications
 * @route GET /api/jobs/my-applications
 */
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { status, limit = 20, page = 1 } = req.query;

    let query = { applicantId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobApplication.countDocuments(query);

    const applications = await JobApplication.find(query)
      .populate('jobOpeningId', 'title salary positions company')
      .populate('industryProfessionalId', 'company.name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update application status
 * @route PUT /api/jobs/applications/:appId/status
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { appId } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }

    const app = await JobApplication.findById(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify permissions
    const job = await JobOpening.findById(app.jobOpeningId);
    if (!job || job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await app.updateStatus(status, notes);

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: app,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get application details
 * @route GET /api/jobs/applications/:appId
 */
export const getApplicationDetails = async (req, res) => {
  try {
    const { appId } = req.params;

    const application = await JobApplication.findById(appId)
      .populate('jobOpeningId')
      .populate('applicantId', 'fullName email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CAMPUS DRIVE CONTROLLERS
// ============================================

/**
 * Create a new campus drive
 * @route POST /api/drives/create
 */
export const createCampusDrive = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const {
      title,
      description,
      driveType,
      schedule,
      location,
      recruitment,
      eligibility,
      recruitmentTeam,
      interviewProcess,
      contact,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !description || !driveType || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const industryProf = await IndustryProfessional.findOne({ userId });
    if (!industryProf) {
      return res.status(404).json({
        success: false,
        message: 'Industry profile not found',
      });
    }

    const drive = new CampusDrive({
      industryProfessionalId: industryProf._id,
      title: title.trim(),
      description: description.trim(),
      driveType,
      schedule: {
        startDate: new Date(schedule.startDate),
        endDate: new Date(schedule.endDate),
        registrationDeadline: new Date(schedule.registrationDeadline),
        sessions: schedule.sessions || [],
      },
      location: location || {},
      recruitment: recruitment || {},
      eligibility: eligibility || {},
      recruitmentTeam: recruitmentTeam || [],
      interviewProcess: interviewProcess || {},
      contact: contact || { email: industryProf.contact.email },
      company: {
        name: industryProf.company.name,
        logo: industryProf.company.logo,
      },
      tags: tags || [],
      createdBy: userId,
      status: 'Scheduled',
    });

    await drive.save();
    await drive.populate('industryProfessionalId', 'company.name');

    res.status(201).json({
      success: true,
      message: 'Campus drive created successfully',
      data: drive,
    });
  } catch (error) {
    console.error('Error creating campus drive:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all campus drives (with filtering)
 * @route GET /api/drives/all
 */
export const getAllCampusDrives = async (req, res) => {
  try {
    const {
      keyword,
      driveType,
      startDate,
      endDate,
      status,
      limit = 20,
      page = 1,
    } = req.query;

    let query = {};

    if (keyword) {
      query.$text = { $search: keyword };
    }
    if (driveType) {
      query.driveType = driveType;
    }
    if (startDate && endDate) {
      query['schedule.startDate'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    query.status = status || 'Scheduled';
    query.isActive = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CampusDrive.countDocuments(query);

    const drives = await CampusDrive.find(query)
      .populate('industryProfessionalId', 'company.name company.logo')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'schedule.startDate': 1 });

    res.status(200).json({
      success: true,
      data: {
        drives,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get my campus drives
 * @route GET /api/drives/my-drives
 */
export const getMyCampusDrives = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { limit = 50, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CampusDrive.countDocuments({ createdBy: userId });

    const drives = await CampusDrive.find({ createdBy: userId })
      .populate('industryProfessionalId')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'schedule.startDate': -1 });

    res.status(200).json({
      success: true,
      data: {
        drives,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single campus drive details
 * @route GET /api/drives/:driveId
 */
export const getCampusDriveDetails = async (req, res) => {
  try {
    const { driveId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(driveId)) {
      return res.status(400).json({ success: false, message: 'Invalid drive ID' });
    }

    const drive = await CampusDrive.findById(driveId).populate('industryProfessionalId');

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Campus drive not found' });
    }

    // Increment views
    drive.views += 1;
    await drive.save();

    res.status(200).json({
      success: true,
      data: drive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Register for campus drive
 * @route POST /api/drives/:driveId/register
 */
export const registerForCampusDrive = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { driveId } = req.params;
    const { registrationType, registrationData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(driveId)) {
      return res.status(400).json({ success: false, message: 'Invalid drive ID' });
    }

    if (!['student', 'freelancer'].includes(registrationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration type',
      });
    }

    const drive = await CampusDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Campus drive not found' });
    }

    if (drive.schedule.registrationDeadline < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed',
      });
    }

    // Check if already registered
    const registrations =
      registrationType === 'student'
        ? drive.registration.studentRegistrations
        : drive.registration.freelancerRegistrations;

    const alreadyRegistered = registrations.some(
      (r) => r.userId.toString() === userId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this drive',
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const regData = {
      userId,
      email: user.email,
      name: user.fullName,
      ...registrationData,
    };

    if (registrationType === 'student') {
      await drive.registerStudent(regData);
    } else {
      await drive.registerFreelancer(regData);
    }

    res.status(200).json({
      success: true,
      message: `Registered for ${drive.title} successfully`,
      data: drive,
    });
  } catch (error) {
    console.error('Error registering for drive:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get drive registrations (industry view)
 * @route GET /api/drives/:driveId/registrations
 */
export const getDriveRegistrations = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { driveId } = req.params;
    const { type = 'all', limit = 50, page = 1 } = req.query;

    const drive = await CampusDrive.findById(driveId);
    if (!drive || drive.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let registrations = [];

    if (type === 'student' || type === 'all') {
      registrations = registrations.concat(
        drive.registration.studentRegistrations.map((r) => ({
          ...r.toObject?.() || r,
          registrationType: 'student',
        }))
      );
    }

    if (type === 'freelancer' || type === 'all') {
      registrations = registrations.concat(
        drive.registration.freelancerRegistrations.map((r) => ({
          ...r.toObject?.() || r,
          registrationType: 'freelancer',
        }))
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedRegs = registrations.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        registrations: paginatedRegs,
        pagination: {
          total: registrations.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(registrations.length / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user's campus drive registrations
 * @route GET /api/drives/my-registrations
 */
export const getMyDriveRegistrations = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { limit = 20, page = 1 } = req.query;

    let query = {
      $or: [
        { 'registration.studentRegistrations.userId': userId },
        { 'registration.freelancerRegistrations.userId': userId },
      ],
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CampusDrive.countDocuments(query);

    const drives = await CampusDrive.find(query)
      .populate('industryProfessionalId', 'company.name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'schedule.startDate': -1 });

    res.status(200).json({
      success: true,
      data: {
        drives,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get industry talent pool view
 * @route GET /api/industry/talent-pool
 */
export const getIndustryTalentPool = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { status, applicantType, limit = 50, page = 1 } = req.query;

    // Get industry profile
    const industryProf = await IndustryProfessional.findOne({ userId });
    if (!industryProf) {
      return res.status(404).json({
        success: false,
        message: 'Industry profile not found',
      });
    }

    let query = { industryProfessionalId: industryProf._id };

    if (status) {
      query.status = status;
    }
    if (applicantType) {
      query.applicantType = applicantType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobApplication.countDocuments(query);

    const applications = await JobApplication.find(query)
      .populate('jobOpeningId', 'title salary positions')
      .populate('applicantId', 'fullName email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const talentPool = applications.map((app) => ({
      _id: app._id,
      jobId: app.jobOpeningId?._id,
      jobTitle: app.jobOpeningId?.title,
      applicantId: app.applicantId?._id,
      applicantName: app.applicantInfo.name,
      email: app.applicantInfo.email,
      phone: app.applicantInfo.phone,
      applicantType: app.applicantType,
      skills: app.applicantSkills,
      experience: app.experience,
      education: app.education,
      status: app.status,
      appliedAt: app.appliedAt,
      resume: app.applicantInfo.resume,
      portfolio: app.applicantInfo.portfolio,
      rating: app.evaluation?.rating || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        talentPool,
        statistics: {
          total,
          byStatus: {
            pending: await JobApplication.countDocuments({ ...query, status: 'Pending' }),
            reviewed: await JobApplication.countDocuments({ ...query, status: 'Reviewed' }),
            shortlisted: await JobApplication.countDocuments({
              ...query,
              status: 'Shortlisted',
            }),
            accepted: await JobApplication.countDocuments({ ...query, status: 'Accepted' }),
            hired: await JobApplication.countDocuments({ ...query, status: 'Hired' }),
          },
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching talent pool:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Schedule interview for a job application
 * @route POST /api/jobs/applications/:appId/schedule-interview
 */
export const scheduleInterview = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { appId } = req.params;
    const {
      driveDate,
      driveTime,
      location,
      venue,
      rounds,
      totalPositions,
      description,
      requirements,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }
    const app = await JobApplication.findById(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    // Only industry owner can schedule
    const job = await JobOpening.findById(app.jobOpeningId);
    if (!job || job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    // Add interview schedule to application
    app.interviews.push({
      type: 'Technical',
      scheduledDate: driveDate,
      scheduledTime: driveTime,
      interviewerEmail: req.user?.email,
      meetingLink: '',
      status: 'Scheduled',
      notes: description,
    });
    app.status = 'Reviewed';
    app.statusHistory.push({ status: 'Reviewed', changedAt: new Date(), changedBy: userId, notes: 'Interview scheduled' });
    await app.save();
    // TODO: Send notification/email to applicant
    res.status(200).json({ success: true, message: 'Interview scheduled', data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
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
};
