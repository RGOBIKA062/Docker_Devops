import Faculty from '../models/Faculty.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * =============================================
 * FACULTY PROFILE OPERATIONS
 * =============================================
 */

/**
 * Get Faculty Profile
 * @route GET /api/faculty/profile
 * @access Private
 */
export const getFacultyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let faculty = await Faculty.findOne({ userId })
      .populate('userId', 'fullName email institution profileImage')
      .lean();

    if (!faculty) {
      // Create default profile if doesn't exist
      const user = await User.findById(userId);
      const newFaculty = new Faculty({
        userId,
        fullName: user?.fullName || 'Faculty Member',
        email: user?.email,
        institution: user?.institution || 'Unknown Institution',
        department: 'Department',
        designation: 'Faculty',
        specializations: [],
        yearsOfExperience: 0,
        bio: user?.bio || 'Welcome to my profile',
        profileImage: user?.profileImage,
        averageRating: 0,
        totalReviews: 0,
        analytics: {
          totalEventsCreated: 0,
          totalRegistrations: 0,
          totalAttendees: 0,
          averageAttendanceRate: 0,
          totalRevenueGenerated: 0,
        },
        settings: {
          emailNotifications: true,
          publicProfile: true,
          showAnalytics: true,
        },
      });
      await newFaculty.save();
      faculty = await Faculty.findOne({ userId }).populate('userId', 'fullName email institution profileImage').lean();
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    logger.error('Error fetching faculty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

/**
 * Update Faculty Profile
 * @route PUT /api/faculty/profile
 * @access Private
 */
export const updateFacultyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, designation, department, bio, specializations, yearsOfExperience, profileImage } = req.body;

    const faculty = await Faculty.findOneAndUpdate(
      { userId },
      {
        fullName: fullName || undefined,
        designation: designation || undefined,
        department: department || undefined,
        bio: bio || undefined,
        specializations: specializations || undefined,
        yearsOfExperience: yearsOfExperience || undefined,
        profileImage: profileImage || undefined,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: faculty,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Error updating faculty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

/**
 * =============================================
 * FACULTY EVENTS OPERATIONS
 * =============================================
 */

/**
 * Get All Events Created by Faculty
 * @route GET /api/faculty/events
 * @access Private
 */
export const getFacultyEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, category, sort = '-createdAt' } = req.query;

    let query = { 'organizer.userId': userId };
    
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const events = await Event.find(query)
      .sort(sort)
      .select('title description category startDate endDate status registrations views averageRating')
      .lean();

    res.status(200).json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    logger.error('Error fetching faculty events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

/**
 * Get Event Details with Full Analytics
 * @route GET /api/faculty/events/:eventId
 * @access Private
 */
export const getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findOne({ _id: eventId, 'organizer.userId': userId })
      .populate('registrations.userId', 'fullName email institution')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Calculate analytics
    const totalRegistrations = event.registrations?.length || 0;
    const attendees = event.registrations?.filter(r => r.status === 'Attended').length || 0;
    const attendanceRate = totalRegistrations > 0 ? ((attendees / totalRegistrations) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...event,
        analytics: {
          totalRegistrations,
          attendees,
          attendanceRate: parseFloat(attendanceRate),
          views: event.views || 0,
          averageRating: event.averageRating || 0,
          totalReviews: event.reviews?.length || 0,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching event details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event details',
      error: error.message,
    });
  }
};

/**
 * Create New Event
 * @route POST /api/faculty/events
 * @access Private
 */
export const createEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    const {
      title,
      description,
      shortDescription,
      eventType,
      category,
      skillLevel,
      organizerName,
      organizerEmail,
      organizerPhone,
      organizationType,
      startDate,
      endDate,
      startTime,
      endTime,
      timezone,
      locationType,
      address,
      city,
      state,
      zipCode,
      venue,
      meetingLink,
      totalCapacity,
      pricingType,
      pricingAmount,
      bannerImage,
      hasCertificate,
      hasJobOpportunity,
      hasRecording,
      hasMaterials,
    } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !eventType || !category || 
        !organizerName || !organizationType || !startTime || !endTime || !locationType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, startDate, endDate, eventType, category, organizerName, organizationType, startTime, endTime, locationType',
      });
    }

    // Validate meeting link for online events
    if ((locationType === 'Online' || locationType === 'Hybrid') && !meetingLink) {
      return res.status(400).json({
        success: false,
        message: 'Meeting link is required for online events',
      });
    }

    // Validate venue for offline events
    if ((locationType === 'Offline' || locationType === 'Hybrid') && !venue) {
      return res.status(400).json({
        success: false,
        message: 'Venue is required for offline events',
      });
    }

    // Create comprehensive event object
    const newEvent = new Event({
      title,
      description,
      shortDescription,
      eventType,
      category,
      skillLevel: skillLevel || 'All Levels',
      organizer: {
        userId,
        organizerName: organizerName || user?.fullName || 'Faculty',
        organizerEmail: organizerEmail || user?.email,
        organizerPhone,
        organizationType,
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      timezone: timezone || 'IST',
      location: {
        type: locationType,
        address,
        city,
        state,
        zipCode,
        venue,
        meetingLink,
      },
      totalCapacity: totalCapacity || 100,
      pricing: {
        type: pricingType || 'Free',
        amount: pricingType === 'Paid' ? parseFloat(pricingAmount) || 0 : 0,
      },
      bannerImage,
      features: {
        hasCertificate: hasCertificate === true || hasCertificate === 'true',
        hasJobOpportunity: hasJobOpportunity === true || hasJobOpportunity === 'true',
        hasRecording: hasRecording === true || hasRecording === 'true',
        hasMaterials: hasMaterials === true || hasMaterials === 'true',
      },
      registrations: [],
      status: 'Published',
      publishedAt: new Date(),
    });

    await newEvent.save();

    // Update faculty analytics if Faculty record exists
    try {
      await Faculty.findOneAndUpdate(
        { userId },
        { $inc: { 'analytics.totalEventsCreated': 1 } },
        { new: true }
      );
    } catch (err) {
      // Faculty record might not exist, continue anyway
      console.log('Faculty record update skipped:', err.message);
    }

    res.status(201).json({
      success: true,
      event: newEvent,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('[ERROR] Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
      details: error.errors || {},
    });
  }
};

/**
 * Update Event
 * @route PUT /api/faculty/events/:eventId
 * @access Private
 */
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findOneAndUpdate(
      { _id: eventId, 'organizer.userId': userId },
      { $set: req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    logger.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message,
    });
  }
};

/**
 * Delete Event
 * @route DELETE /api/faculty/events/:eventId
 * @access Private
 */
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findOneAndDelete({ _id: eventId, 'organizer.userId': userId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message,
    });
  }
};

/**
 * =============================================
 * FACULTY ANALYTICS & STATISTICS
 * =============================================
 */

/**
 * Get Faculty Dashboard Statistics
 * @route GET /api/faculty/statistics
 * @access Private
 */
export const getFacultyStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    const faculty = await Faculty.findOne({ userId }).lean();
    const events = await Event.find({ 'organizer.userId': userId }).lean();

    const totalRegistrations = events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);
    const totalAttendees = events.reduce((sum, e) => sum + (e.registrations?.filter(r => r.status === 'Attended').length || 0), 0);
    const totalViews = events.reduce((sum, e) => sum + (e.views || 0), 0);
    const avgAttendanceRate = totalRegistrations > 0 ? ((totalAttendees / totalRegistrations) * 100).toFixed(2) : 0;
    const avgRating = events.length > 0 ? (events.reduce((sum, e) => sum + (e.averageRating || 0), 0) / events.length).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEventsCreated: events.length,
        upcomingEvents: events.filter(e => new Date(e.startDate) > new Date()).length,
        completedEvents: events.filter(e => new Date(e.endDate) < new Date()).length,
        totalRegistrations,
        totalAttendees,
        totalViews,
        averageAttendanceRate: parseFloat(avgAttendanceRate),
        averageRating: parseFloat(avgRating),
        profileRating: faculty?.averageRating || 0,
        profileReviews: faculty?.totalReviews || 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

/**
 * =============================================
 * FACULTY SEARCH & DISCOVERY
 * =============================================
 */

/**
 * Search All Events
 * @route GET /api/faculty/search-events
 * @access Public
 */
export const searchEvents = async (req, res) => {
  try {
    const { query, category, startDate, endDate, location, sortBy = '-views' } = req.query;

    let filter = { status: 'Active' };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const events = await Event.find(filter)
      .sort(sortBy)
      .select('title description category startDate location organizer image views averageRating registrations')
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    logger.error('Error searching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching events',
      error: error.message,
    });
  }
};

/**
 * Get Featured Faculty
 * @route GET /api/faculty/featured
 * @access Public
 */
/**
 * Get All Faculty for Mentoring
 * @route GET /api/faculty
 * @access Public
 * @description Returns all faculty with public profiles available for mentoring
 */
export const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({ 'settings.publicProfile': true })
      .select('userId fullName designation department bio profileImage avatar averageRating totalReviews yearsOfExperience email specializations settings currentCompany linkedinProfile githubProfile skills')
      .lean();

    // Transform data to ensure frontend compatibility with professional defaults
    const transformedFaculty = faculty.map(f => ({
      _id: f._id,
      userId: f.userId,
      fullName: f.fullName,
      designation: f.designation,
      department: f.department,
      bio: f.bio || getDefaultBio(f.department, f.designation, f.fullName),
      profileImage: f.profileImage || f.avatar || getProfessionalAvatar(f.fullName, f.designation),
      averageRating: f.averageRating || 4.8,
      totalReviews: f.totalReviews || 0,
      yearsOfExperience: f.yearsOfExperience || 3,
      email: f.email,
      specializations: f.specializations || [],
      currentCompany: f.currentCompany || 'Available for Mentoring',
      linkedinProfile: f.linkedinProfile || '',
      githubProfile: f.githubProfile || '',
      skills: (f.skills && f.skills.length > 0) ? f.skills : getDefaultSkills(f.department),
      settings: f.settings || {},
    }));

    res.status(200).json({
      success: true,
      data: transformedFaculty,
      count: transformedFaculty.length,
    });
  } catch (error) {
    logger.error('Error fetching all faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message,
    });
  }
};

export const getFeaturedFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({ 'settings.publicProfile': true })
      .sort('-averageRating')
      .limit(10)
      .select('userId fullName designation department bio profileImage avatar averageRating totalReviews yearsOfExperience email specializations currentCompany linkedinProfile githubProfile skills')
      .lean();

    // Transform data to ensure frontend compatibility with professional defaults
    const transformedFaculty = faculty.map(f => ({
      _id: f._id,
      userId: f.userId,
      fullName: f.fullName,
      designation: f.designation,
      department: f.department,
      bio: f.bio || getDefaultBio(f.department, f.designation, f.fullName),
      profileImage: f.profileImage || f.avatar || getProfessionalAvatar(f.fullName, f.designation),
      averageRating: f.averageRating || 4.8,
      totalReviews: f.totalReviews || 0,
      yearsOfExperience: f.yearsOfExperience || 3,
      email: f.email,
      specializations: f.specializations || [],
      currentCompany: f.currentCompany || 'Available for Mentoring',
      linkedinProfile: f.linkedinProfile || '',
      githubProfile: f.githubProfile || '',
      skills: (f.skills && f.skills.length > 0) ? f.skills : getDefaultSkills(f.department),
    }));

    res.status(200).json({
      success: true,
      data: transformedFaculty,
      count: transformedFaculty.length,
    });
  } catch (error) {
    logger.error('Error fetching featured faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured faculty',
      error: error.message,
    });
  }
};

/**
 * Helper: Get letter avatar using first letter of name
 */
const getProfessionalAvatar = (fullName, designation) => {
  if (!fullName || fullName.trim().length === 0) {
    return 'A'; // Default letter if no name provided
  }
  
  // Get first letter of the first name
  const firstLetter = fullName.trim().charAt(0).toUpperCase();
  return firstLetter;
};

/**
 * Helper: Get default professional bio by department
 */
const getDefaultBio = (department, designation, fullName) => {
  const bios = {
    'Computer Science': `Experienced ${designation} with expertise in software development, web technologies, and modern architecture patterns.`,
    'Information Technology': `Professional ${designation} specializing in IT solutions, cloud computing, and digital transformation.`,
    'Engineering': `Skilled ${designation} with deep knowledge in system design, optimization, and engineering best practices.`,
    'Data Science': `Accomplished ${designation} focused on data analytics, machine learning, and business intelligence.`,
    'Business': `Business-minded ${designation} with expertise in strategy, operations, and organizational management.`,
    'Design': `Creative ${designation} with experience in UI/UX design, user experience, and digital products.`,
    'Default': `Passionate ${designation} committed to mentoring and sharing expertise with the next generation of professionals.`,
  };
  return bios[department] || bios['Default'];
};

/**
 * Helper: Get default skills by department
 */
const getDefaultSkills = (department) => {
  const skillsByDept = {
    'Computer Science': ['Python', 'JavaScript', 'C++', 'Data Structures', 'Algorithms', 'System Design'],
    'Information Technology': ['Cloud Computing', 'AWS', 'Azure', 'DevOps', 'Network Security', 'IT Infrastructure'],
    'Engineering': ['CAD', 'System Design', 'Project Management', 'Technical Documentation', 'Problem Solving'],
    'Data Science': ['Machine Learning', 'Python', 'SQL', 'Data Analysis', 'Tableau', 'Statistical Analysis'],
    'Business': ['Business Strategy', 'Leadership', 'Project Management', 'Communication', 'Analytics'],
    'Design': ['UI/UX Design', 'Figma', 'Prototyping', 'User Research', 'Design Systems'],
  };
  return skillsByDept[department] || [];
};

/**
 * Get Faculty with Mentor Profile Enrichment
 * @route GET /api/faculty/with-mentor-profiles
 * @access Public
 * @description Returns all faculty with their mentor profiles merged in
 */
export const getFacultyWithMentorProfiles = async (req, res) => {
  try {
    const Mentor = (await import('../models/Mentor.js')).default;
    
    // Fetch all public faculty
    const faculty = await Faculty.find({ 'settings.publicProfile': true })
      .select('userId fullName designation department bio profileImage avatar averageRating totalReviews yearsOfExperience email specializations currentCompany linkedinProfile githubProfile skills')
      .lean();

    // Fetch all mentor profiles
    const mentors = await Mentor.find()
      .select('userId yearsOfExperience currentCompany linkedinProfile githubProfile skills professionalBio')
      .lean();

    // Create a map for quick lookup by userId
    const mentorMap = {};
    mentors.forEach(mentor => {
      if (mentor.userId) {
        const userIdStr = mentor.userId.toString();
        mentorMap[userIdStr] = mentor;
      }
    });

    // Transform and enrich faculty data with professional defaults
    const enrichedFaculty = faculty.map(f => {
      const userIdStr = f.userId.toString();
      const mentorProfile = mentorMap[userIdStr];

      // Get professional defaults if not provided
      const yearsExp = mentorProfile?.yearsOfExperience || f.yearsOfExperience || 3;
      const bio = mentorProfile?.professionalBio || f.bio || getDefaultBio(f.department, f.designation, f.fullName);
      const skills = mentorProfile?.skills 
        ? mentorProfile.skills.map(s => typeof s === 'string' ? s : s.skillName)
        : (f.skills && f.skills.length > 0 ? f.skills : getDefaultSkills(f.department));
      const avatar = f.profileImage || f.avatar || getProfessionalAvatar(f.fullName, f.designation);

      return {
        _id: f._id,
        userId: f.userId,
        fullName: f.fullName,
        designation: f.designation,
        department: f.department,
        bio: bio,
        profileImage: avatar,
        averageRating: f.averageRating || 4.8, // Professional default
        totalReviews: f.totalReviews || 0,
        yearsOfExperience: yearsExp,
        email: f.email,
        specializations: f.specializations || [],
        currentCompany: mentorProfile?.currentCompany || f.currentCompany || 'Available for Mentoring',
        linkedinProfile: mentorProfile?.linkedinProfile || f.linkedinProfile || '',
        githubProfile: mentorProfile?.githubProfile || f.githubProfile || '',
        skills: skills,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedFaculty,
      count: enrichedFaculty.length,
    });
  } catch (error) {
    logger.error('Error fetching faculty with mentor profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message,
    });
  }
};

/**
 * Get Faculty by ID
 * @route GET /api/faculty/:facultyId
 * @access Public
 */
export const getFacultyById = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId)
      .populate('userId', 'fullName email profileImage')
      .lean();

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    // Get faculty events
    const events = await Event.find({ 'organizer.userId': faculty.userId._id })
      .select('title category startDate registrations views averageRating')
      .lean();

    // Transform data with proper field mapping
    const transformedFaculty = {
      _id: faculty._id,
      fullName: faculty.fullName,
      designation: faculty.designation,
      department: faculty.department,
      bio: faculty.bio,
      profileImage: faculty.profileImage || faculty.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.fullName}`,
      averageRating: faculty.averageRating || 4.5,
      totalReviews: faculty.totalReviews || 0,
      yearsOfExperience: faculty.yearsOfExperience || 0,
      email: faculty.email,
      specializations: faculty.specializations || [],
      userId: faculty.userId,
      events: events || [],
    };

    res.status(200).json({
      success: true,
      data: transformedFaculty,
    });
  } catch (error) {
    logger.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message,
    });
  }
};

/**
 * =============================================
 * ATTENDANCE & MANAGEMENT
 * =============================================
 */

/**
 * Get Event Registrations
 * @route GET /api/faculty/events/:eventId/registrations
 * @access Private
 */
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findOne({ _id: eventId, 'organizer.userId': userId })
      .populate('registrations.userId', 'fullName email institution')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event.registrations || [],
      count: event.registrations?.length || 0,
    });
  } catch (error) {
    logger.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message,
    });
  }
};

/**
 * Mark Attendance
 * @route PUT /api/faculty/events/:eventId/attendance
 * @access Private
 */
export const markAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, status } = req.body;
    const facultyUserId = req.user._id;

    const event = await Event.findOne({ _id: eventId, 'organizer.userId': facultyUserId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const registration = event.registrations.find(r => r.userId.toString() === userId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    registration.status = status;
    registration.markedAt = new Date();
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Attendance updated',
      data: registration,
    });
  } catch (error) {
    logger.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message,
    });
  }
};

/**
 * Bulk Mark Attendance
 * @route POST /api/faculty/events/:eventId/bulk-attendance
 * @access Private
 */
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendanceList } = req.body;
    const userId = req.user._id;

    const event = await Event.findOne({ _id: eventId, 'organizer.userId': userId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    let updated = 0;
    for (const { userId: studentId, status } of attendanceList) {
      const registration = event.registrations.find(r => r.userId.toString() === studentId);
      if (registration) {
        registration.status = status;
        registration.markedAt = new Date();
        updated++;
      }
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: `Updated ${updated} attendance records`,
      data: { updated, total: attendanceList.length },
    });
  } catch (error) {
    logger.error('Error bulk marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message,
    });
  }
};

export default {
  getFacultyProfile,
  updateFacultyProfile,
  getAllFaculty,
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
};
