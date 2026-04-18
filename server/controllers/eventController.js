import Event from '../models/Event.js';
import { validationResult } from 'express-validator';

/**
 * Event Controller - Complete CRUD & Business Logic
 * Senior Developer Grade Implementation
 */

// ✅ CREATE EVENT
const createEvent = async (req, res) => {
  try {
    console.log('📝 Creating event...');
    // Avoid printing full base64 payloads in logs.
    const requestSummary = {
      title: req.body?.title,
      eventType: req.body?.eventType,
      category: req.body?.category,
      organizerEmail: req.body?.organizerEmail,
      startDate: req.body?.startDate,
      startTime: req.body?.startTime,
      hasBannerImage: Boolean(req.body?.bannerImage),
      tagCount: Array.isArray(req.body?.tags) ? req.body.tags.length : 0,
    };
    console.log('📋 Received payload summary:', requestSummary);
    
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const userId = req.userId;
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
      earlyBirdEnabled,
      earlyBirdPercentage,
      earlyBirdEndDate,
      bannerImage,
      tags,
      skillsOffered,
      skillsRequired,
      targetBatch,
      targetRole,
      speakers,
      hasCertificate,
      hasJobOpportunity,
      hasPrizePool,
      prizeAmount,
      hasQA,
      hasRecording,
      hasMaterials,
      materialsUrl,
      hasLiveChat,
      hasGiveaways,
      agenda,
      faq,
      requirements,
      deliverables,
    } = req.body;

    // Check if event start datetime is in the future.
    const eventStartDateTime = startTime
      ? new Date(`${startDate}T${startTime}:00`)
      : new Date(startDate);

    if (Number.isNaN(eventStartDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date or time',
      });
    }

    if (eventStartDateTime <= new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event start date/time must be in the future' 
      });
    }

    // Create event object
    const eventData = {
      title,
      description,
      shortDescription,
      eventType,
      category,
      skillLevel,
      organizer: {
        userId,
        organizerName,
        organizerEmail,
        organizerPhone,
        organizationType,
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      timezone,
      location: {
        type: locationType,
        address,
        city,
        state,
        zipCode,
        venue,
        meetingLink,
      },
      totalCapacity: parseInt(totalCapacity),
      pricing: {
        type: pricingType,
        amount: pricingType === 'Paid' ? parseFloat(pricingAmount) : 0,
        earlyBirdDiscount: earlyBirdEnabled ? {
          enabled: true,
          percentage: parseInt(earlyBirdPercentage),
          endDate: earlyBirdEndDate,
        } : { enabled: false },
      },
      bannerImage,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(t => t.trim()) : [],
      skillsOffered: Array.isArray(skillsOffered) ? skillsOffered : skillsOffered ? skillsOffered.split(',').map(s => s.trim()) : [],
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : [],
      targetBatch: Array.isArray(targetBatch) ? targetBatch : targetBatch ? targetBatch.split(',').map(b => b.trim()) : [],
      targetRole: Array.isArray(targetRole) ? targetRole : targetRole ? targetRole.split(',').map(r => r.trim()) : [],
      speakers: speakers || [],
      features: {
        hasCertificate: hasCertificate === 'true' || hasCertificate === true,
        hasJobOpportunity: hasJobOpportunity === 'true' || hasJobOpportunity === true,
        hasPrizePool: hasPrizePool === 'true' || hasPrizePool === true,
        prizeAmount,
        hasQA: hasQA === 'true' || hasQA === true,
        hasRecording: hasRecording === 'true' || hasRecording === true,
        hasMaterials: hasMaterials === 'true' || hasMaterials === true,
        materialsUrl,
        hasLiveChat: hasLiveChat === 'true' || hasLiveChat === true,
        hasGiveaways: hasGiveaways === 'true' || hasGiveaways === true,
      },
      agenda: agenda || [],
      faq: faq || [],
      requirements: requirements || [],
      deliverables: deliverables || [],
      publishedAt: new Date(),
    };

    // Create event
    const event = await Event.create(eventData);

    console.log('✅ Event created successfully:', event._id);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('❌ Error creating event:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
      details: error.errors || {},
    });
  }
};

// ✅ GET ALL EVENTS
const getAllEvents = async (req, res) => {
  try {
    console.log('🔍 Fetching all events...');
    
    const {
      category,
      eventType,
      skillLevel,
      searchQuery,
      sortBy = 'createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    // Build filter object
    const filter = {
      isPublished: true,
      status: { $ne: 'Cancelled' },
      deletedAt: null,
    };

    if (category) filter.category = category;
    if (eventType) filter.eventType = eventType;
    if (skillLevel) filter.skillLevel = skillLevel;
    
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } },
      ];
    }

    // Sort options
    const sortOptions = {
      'createdAt': { createdAt: -1 },
      'upcoming': { startDate: 1 },
      'trending': { views: -1 },
      'rating': { 'ratings.overallRating': -1 },
      'popular': { registeredCount: -1 },
    };

    const sort = sortOptions[sortBy] || { createdAt: -1 };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    // Get total count
    const total = await Event.countDocuments(filter);

    console.log(`✅ Found ${events.length} events (Total: ${total})`);

    res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      data: {
        events,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

// ✅ GET EVENT BY ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching event: ${id}`);

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    // Increment views
    const event = await Event.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('organizer.userId', 'fullName email phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Get similar events
    const similarEvents = await Event.find({
      category: event.category,
      _id: { $ne: id },
      isPublished: true,
      status: { $ne: 'Cancelled' },
    }).limit(3);

    console.log('✅ Event fetched successfully');

    res.status(200).json({
      success: true,
      message: 'Event fetched successfully',
      data: {
        event,
        similarEvents,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message,
    });
  }
};

// ✅ REGISTER FOR EVENT
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    console.log(`📝 Registering user ${userId} for event ${eventId}`);

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if can register
    const { canRegister, reason } = event.canUserRegister(userId);
    if (!canRegister) {
      return res.status(400).json({
        success: false,
        message: reason,
      });
    }

    // Add registration
    event.registrations.push({
      userId,
      registeredAt: new Date(),
      status: 'Registered',
    });
    event.registeredCount = event.registrations.length;
    await event.save();

    console.log('✅ User registered successfully');

    res.status(200).json({
      success: true,
      message: 'Registered for event successfully',
      event,
    });
  } catch (error) {
    console.error('❌ Error registering:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message,
    });
  }
};

// ✅ ADD TO WISHLIST
const addToWishlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    console.log(`❤️ Adding event ${eventId} to wishlist`);

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        $addToSet: { wishlisted: userId },
        $inc: { wishlistCount: 1 },
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log('✅ Added to wishlist');

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      event,
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message,
    });
  }
};

// ✅ REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    console.log(`💔 Removing event ${eventId} from wishlist`);

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        $pull: { wishlisted: userId },
        $inc: { wishlistCount: -1 },
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log('✅ Removed from wishlist');

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      event,
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message,
    });
  }
};

// ✅ GET USER'S EVENTS
const getUserEvents = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`🔍 Fetching events for user ${userId}`);

    const events = await Event.find({
      'organizer.userId': userId,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${events.length} events`);

    res.status(200).json({
      success: true,
      message: 'User events fetched successfully',
      events,
    });
  } catch (error) {
    console.error('❌ Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user events',
      error: error.message,
    });
  }
};

// ✅ GET USER'S REGISTERED EVENTS
const getUserRegisteredEvents = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`🔍 Fetching registered events for user ${userId}`);

    const events = await Event.find({
      'registrations.userId': userId,
      isPublished: true,
    }).sort({ startDate: -1 });

    console.log(`✅ Found ${events.length} registered events`);

    res.status(200).json({
      success: true,
      message: 'Registered events fetched successfully',
      events,
    });
  } catch (error) {
    console.error('❌ Error fetching registered events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registered events',
      error: error.message,
    });
  }
};

// ✅ UPDATE EVENT
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    console.log(`📝 Updating event ${eventId}`);

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.organizer.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own events',
      });
    }

    // Update only allowed fields
    const allowedFields = [
      'title', 'description', 'shortDescription', 'tags', 'skillsOffered',
      'skillsRequired', 'agenda', 'faq', 'requirements', 'deliverables',
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field]) updates[field] = req.body[field];
    });

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    });

    console.log('✅ Event updated successfully');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('❌ Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message,
    });
  }
};

// ✅ DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    console.log(`🗑️ Deleting event ${eventId}`);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.organizer.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own events',
      });
    }

    // Soft delete
    event.deletedAt = new Date();
    event.status = 'Cancelled';
    await event.save();

    console.log('✅ Event deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message,
    });
  }
};

// ✅ ADD REVIEW
const addReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;
    console.log(`⭐ Adding review for event ${eventId}`);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.reviews.push({
      userId,
      rating,
      comment,
      createdAt: new Date(),
    });

    // Update overall rating
    const totalRating = event.reviews.reduce((sum, r) => sum + r.rating, 0);
    event.ratings.overallRating = (totalRating / event.reviews.length).toFixed(1);
    event.ratings.totalRatings = event.reviews.length;

    await event.save();

    console.log('✅ Review added successfully');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      event,
    });
  } catch (error) {
    console.error('❌ Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message,
    });
  }
};

// ✅ TRACK SHARES
const trackShare = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { platform } = req.body;
    console.log(`📤 Tracking share for event ${eventId} on ${platform}`);

    const updateField = `sharingStats.${platform}Shares`;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { [updateField]: 1 } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log('✅ Share tracked');

    res.status(200).json({
      success: true,
      message: 'Share tracked successfully',
    });
  } catch (error) {
    console.error('❌ Error tracking share:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking share',
      error: error.message,
    });
  }
};

export {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  addToWishlist,
  removeFromWishlist,
  getUserEvents,
  getUserRegisteredEvents,
  updateEvent,
  deleteEvent,
  addReview,
  trackShare,
};
