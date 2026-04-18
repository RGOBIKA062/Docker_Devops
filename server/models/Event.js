import mongoose from 'mongoose';

/**
 * Event Schema - Complete event management with advanced features
 * Supports: Internships, Workshops, Hackathons, Career Fairs, Conferences
 */
const eventSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [5, 'Event title must be at least 5 characters'],
      maxlength: [100, 'Event title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },

    // Event Type & Category
    eventType: {
      type: String,
      enum: ['Workshop', 'Hackathon', 'Conference', 'Webinar', 'Networking', 'Career Fair', 'Internship Drive', 'Placement Drive', 'Competition', 'Seminar', 'Training', 'Other'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['AI/ML', 'Web Development', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Data Science', 'Blockchain', 'IoT', 'Robotics', 'Business', 'Marketing', 'Finance', 'Leadership', 'Entrepreneurship', 'Other'],
      required: true,
      index: true,
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },

    // Organizer Information
    organizer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      organizerName: {
        type: String,
        required: true,
      },
      organizerEmail: String,
      organizerPhone: String,
      organizationType: {
        type: String,
        enum: ['Individual', 'Club', 'Company', 'College', 'NGO', 'Other'],
        required: true,
      },
    },

    // Date & Time
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      default: 'IST',
    },
    duration: {
      type: String,
      enum: ['30 min', '1 hour', '2 hours', '3 hours', '4 hours', '1 day', '2 days', '3 days', '1 week', 'Multi-week'],
    },

    // Location
    location: {
      type: {
        type: String,
        enum: ['Online', 'Offline', 'Hybrid'],
        required: true,
      },
      address: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
        },
      },
      meetingLink: String, // For online events
      venue: String,
    },

    // Capacity & Registration
    totalCapacity: {
      type: Number,
      default: 100,
      min: 1,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    registrations: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['Registered', 'Attended', 'Cancelled'],
          default: 'Registered',
        },
        attendanceMarked: Boolean,
      },
    ],
    waitlist: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: Date,
      },
    ],

    // Pricing
    pricing: {
      type: {
        type: String,
        enum: ['Free', 'Paid'],
        default: 'Free',
      },
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      earlyBirdDiscount: {
        enabled: Boolean,
        percentage: Number,
        endDate: Date,
      },
      groupDiscount: {
        enabled: Boolean,
        minMembers: Number,
        percentage: Number,
      },
    },

    // Media
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
    },
    images: [String],
    videoUrl: String,

    // Tags & Skills
    tags: [String], // AI, ML, Web Development, etc.
    skillsOffered: [String], // Skills participants will learn
    skillsRequired: [String], // Prerequisites
    targetBatch: [String], // 1st year, 2nd year, 3rd year, Final year
    targetRole: [String], // Intern, Fresher, Experienced

    // Speaker/Mentor Information
    speakers: [
      {
        name: String,
        title: String,
        company: String,
        bio: String,
        imageUrl: String,
        linkedinProfile: String,
      },
    ],
    mentors: [
      {
        name: String,
        expertise: [String],
        bio: String,
        availableFor1on1: Boolean,
      },
    ],

    // Event Features (Winning Features)
    features: {
      hasCertificate: {
        type: Boolean,
        default: false,
      },
      certificateTemplate: String,
      hasJobOpportunity: {
        type: Boolean,
        default: false,
      },
      hasPrizePool: {
        type: Boolean,
        default: false,
      },
      prizeAmount: Number,
      hasNetworking: {
        type: Boolean,
        default: true,
      },
      hasQA: {
        type: Boolean,
        default: false,
      },
      hasRecording: {
        type: Boolean,
        default: false,
      },
      recordingAvailableAfter: Date,
      hasMaterials: {
        type: Boolean,
        default: false,
      },
      materialsUrl: String,
      hasLiveChat: {
        type: Boolean,
        default: false,
      },
      hasGiveaways: {
        type: Boolean,
        default: false,
      },
    },

    // Agenda
    agenda: [
      {
        time: String,
        activity: String,
        speaker: String,
        duration: String,
      },
    ],

    // Ratings & Reviews
    ratings: {
      overallRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      totalRatings: Number,
      contentQuality: Number,
      speakerQuality: Number,
      organization: Number,
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Wishlist
    wishlisted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    wishlistCount: {
      type: Number,
      default: 0,
    },

    // Social & Sharing
    sharingStats: {
      whatsappShares: {
        type: Number,
        default: 0,
      },
      emailShares: {
        type: Number,
        default: 0,
      },
      socialShares: {
        type: Number,
        default: 0,
      },
    },

    // Status & Visibility
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Published',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Restricted'],
      default: 'Public',
    },

    // SEO & Analytics
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    registrationConversionRate: Number,
    attendanceRate: Number,

    // Additional Features
    faq: [
      {
        question: String,
        answer: String,
      },
    ],
    requirements: [String],
    deliverables: [String],
    campusPartners: [String],
    companyPartners: [String],
    maxAttempts: Number,
    certificateValidity: String,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    publishedAt: Date,
    deletedAt: Date, // Soft delete
  },
  { timestamps: true }
);

// Indexes for performance
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1, skillLevel: 1 });
eventSchema.index({ 'organizer.userId': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial indexing

// Pre-save middleware
eventSchema.pre('save', function (next) {
  // Generate slug
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      + '-' + Date.now();
  }

  // Update duration
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    const hours = diff / (1000 * 60 * 60);
    if (hours <= 0.5) this.duration = '30 min';
    else if (hours <= 1) this.duration = '1 hour';
    else if (hours <= 2) this.duration = '2 hours';
    else if (hours <= 3) this.duration = '3 hours';
    else if (hours <= 4) this.duration = '4 hours';
    else if (hours <= 24) this.duration = '1 day';
    else if (hours <= 48) this.duration = '2 days';
    else if (hours <= 72) this.duration = '3 days';
    else if (hours <= 168) this.duration = '1 week';
    else this.duration = 'Multi-week';
  }

  next();
});

// Methods
eventSchema.methods.getRegisteredUsers = function () {
  return this.registrations.filter(r => r.status === 'Registered').length;
};

eventSchema.methods.getAttendanceRate = function () {
  const attended = this.registrations.filter(r => r.status === 'Attended').length;
  return this.registeredCount > 0 ? ((attended / this.registeredCount) * 100).toFixed(2) : 0;
};

eventSchema.methods.isEventUpcoming = function () {
  return this.startDate > new Date();
};

eventSchema.methods.isEventOngoing = function () {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
};

eventSchema.methods.isEventCompleted = function () {
  return this.endDate < new Date();
};

eventSchema.methods.canUserRegister = function (userId) {
  const alreadyRegistered = this.registrations.some(r => r.userId.toString() === userId.toString());
  if (alreadyRegistered) return { canRegister: false, reason: 'Already registered' };
  if (this.registeredCount >= this.totalCapacity) return { canRegister: false, reason: 'Event is full' };
  if (this.status === 'Cancelled') return { canRegister: false, reason: 'Event cancelled' };
  return { canRegister: true };
};

eventSchema.methods.toJSON = function () {
  const obj = this.toObject();
  // Don't expose internal fields
  delete obj.__v;
  return obj;
};

// Static methods
eventSchema.statics.findUpcomingEvents = function () {
  return this.find({
    startDate: { $gte: new Date() },
    status: { $ne: 'Cancelled' },
    isPublished: true,
  }).sort({ startDate: 1 });
};

eventSchema.statics.findByCategory = function (category) {
  return this.find({ category, isPublished: true, status: { $ne: 'Cancelled' } });
};

eventSchema.statics.findByOrganizer = function (userId) {
  return this.find({ 'organizer.userId': userId }).sort({ createdAt: -1 });
};

const Event = mongoose.model('Event', eventSchema);

export default Event;
