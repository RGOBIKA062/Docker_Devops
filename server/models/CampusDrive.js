/**
 * Campus Drive Model
 * Enterprise-Grade MongoDB Schema for Campus Recruitment Drive Management
 * Features: Drive Scheduling, Registration, Analytics
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const campusDriveSchema = new mongoose.Schema(
  {
    // Industry Reference
    industryProfessionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IndustryProfessional',
      required: [true, 'Industry Professional ID is required'],
      index: true,
    },

    // Drive Details
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Drive description is required'],
      maxlength: 3000,
    },
    driveType: {
      type: String,
      enum: ['Placement Drive', 'Internship Drive', 'Campus Hiring', 'Fresher Drive', 'Specialized Drive'],
      required: [true, 'Drive type is required'],
      index: true,
    },

    // Company Information
    company: {
      name: String,
      logo: String,
      website: String,
      industry: String,
      description: String,
    },

    // Scheduling
    schedule: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        index: true,
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required'],
      },
      registrationDeadline: {
        type: Date,
        required: [true, 'Registration deadline is required'],
      },
      sessions: [
        {
          _id: mongoose.Schema.Types.ObjectId,
          date: Date,
          startTime: String,
          endTime: String,
          venue: String,
          capacity: Number,
          registeredCount: {
            type: Number,
            default: 0,
          },
          sessionType: {
            type: String,
            enum: ['Information Session', 'Test', 'Group Discussion', 'Interview'],
          },
          description: String,
        },
      ],
    },

    // Location Details
    location: {
      college: {
        name: String,
        city: String,
        state: String,
        country: {
          type: String,
          default: 'India',
        },
      },
      venue: {
        name: String,
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      isOnline: {
        type: Boolean,
        default: false,
      },
      meetingLink: String, // For online drives
    },

    // Recruitment Details
    recruitment: {
      positions: {
        type: Number,
        required: true,
        min: 1,
      },
      filledPositions: {
        type: Number,
        default: 0,
      },
      jobProfiles: [
        {
          _id: mongoose.Schema.Types.ObjectId,
          title: String,
          count: Number,
          salary: {
            min: Number,
            max: Number,
            currency: {
              type: String,
              default: 'INR',
            },
          },
          eligibility: {
            minCGPA: Number,
            maxBacklogs: Number,
            allowedBranches: [String],
            allowedYears: [String],
          },
        },
      ],
    },

    // Eligibility & Requirements
    eligibility: {
      allowedYears: {
        type: [String],
        default: ['2nd Year', '3rd Year', '4th Year'],
      },
      allowedBranches: [String],
      minCGPA: {
        type: Number,
        default: 0,
      },
      maxBacklogs: {
        type: Number,
        default: 0,
      },
      requirementDescription: String,
    },

    // Registration Management
    registration: {
      totalRegistered: {
        type: Number,
        default: 0,
      },
      studentRegistrations: [
        {
          _id: mongoose.Schema.Types.ObjectId,
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          email: String,
          name: String,
          phone: String,
          rollNumber: String,
          branch: String,
          year: String,
          cgpa: Number,
          backlogs: Number,
          registeredAt: {
            type: Date,
            default: Date.now,
          },
          status: {
            type: String,
            enum: ['Registered', 'Attended', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'],
            default: 'Registered',
          },
          selectedFor: [String], // Job profiles selected for
          notes: String,
          attendance: {
            date: Date,
            attended: Boolean,
            feedback: String,
          },
        },
      ],
      freelancerRegistrations: [
        {
          _id: mongoose.Schema.Types.ObjectId,
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          email: String,
          name: String,
          phone: String,
          skills: [String],
          experience: String,
          registeredAt: {
            type: Date,
            default: Date.now,
          },
          status: {
            type: String,
            enum: ['Registered', 'Attended', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'],
            default: 'Registered',
          },
          notes: String,
        },
      ],
    },

    // Drive Statistics
    statistics: {
      totalRegistrations: {
        type: Number,
        default: 0,
      },
      studentRegistrations: {
        type: Number,
        default: 0,
      },
      freelancerRegistrations: {
        type: Number,
        default: 0,
      },
      attendedCount: {
        type: Number,
        default: 0,
      },
      shortlistedCount: {
        type: Number,
        default: 0,
      },
      selectedCount: {
        type: Number,
        default: 0,
      },
      offersExtended: {
        type: Number,
        default: 0,
      },
    },

    // Recruitment Team
    recruitmentTeam: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        name: {
          type: String,
          required: true,
        },
        designation: String,
        email: {
          type: String,
          required: true,
        },
        phone: String,
        photo: String,
        expertise: [String], // e.g., Technical, HR, Domain
      },
    ],

    // Interview Process
    interviewProcess: {
      rounds: [
        {
          _id: mongoose.Schema.Types.ObjectId,
          roundNumber: Number,
          roundName: String, // Written Test, Technical, HR, etc.
          description: String,
          date: Date,
          duration: Number, // in minutes
          totalQuestions: Number,
          negativeMarking: Boolean,
          eligibleToApply: String, // Description of who can apply for this round
        },
      ],
      totalRounds: Number,
      estimatedTimeline: String,
    },

    // Drive Status & Visibility
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled', 'Postponed'],
      default: 'Scheduled',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['Public', 'Students Only', 'Freelancers Only', 'Both'],
      default: 'Both',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Attachments & Resources
    resources: [
      {
        title: String,
        description: String,
        url: String,
        type: {
          type: String,
          enum: ['PDF', 'Video', 'Document', 'Other'],
        },
      },
    ],

    // Additional Information
    termsAndConditions: String,
    faqSection: [
      {
        question: String,
        answer: String,
      },
    ],
    specialInstructions: String,

    // Engagement Metrics
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    bookmarks: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        bookmarkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Contact Information
    contact: {
      email: {
        type: String,
        required: true,
      },
      phone: String,
      website: String,
      coordinators: [
        {
          name: String,
          email: String,
          phone: String,
        },
      ],
    },

    // Metadata
    tags: [String],
    category: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: mongoose.Schema.Types.ObjectId,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { industryProfessionalId: 1, status: 1 },
      { 'schedule.startDate': 1, status: 1 },
      { title: 'text', description: 'text' },
      { driveType: 1, status: 1 },
      { createdAt: -1 },
    ],
  }
);

// Indexes for performance
campusDriveSchema.index({ industryProfessionalId: 1, createdAt: -1 });
campusDriveSchema.index({ 'schedule.registrationDeadline': 1, status: 1 });
campusDriveSchema.index({ driveType: 1, 'schedule.startDate': -1 });

// Virtual for registration status
campusDriveSchema.virtual('isRegistrationOpen').get(function () {
  return (
    this.schedule.registrationDeadline > new Date() &&
    this.status === 'Scheduled'
  );
});

// Virtual for available slots
campusDriveSchema.virtual('availableSlots').get(function () {
  const totalCapacity = this.schedule.sessions.reduce(
    (sum, session) => sum + (session.capacity || 0),
    0
  );
  return totalCapacity - this.registration.totalRegistered;
});

// Pre-save middleware
campusDriveSchema.pre('save', function (next) {
  // Update registration counts
  this.registration.totalRegistered =
    this.registration.studentRegistrations.length +
    this.registration.freelancerRegistrations.length;
  this.statistics.totalRegistrations = this.registration.totalRegistered;
  next();
});

// Method to register student
campusDriveSchema.methods.registerStudent = function (studentData) {
  const registration = {
    _id: new mongoose.Types.ObjectId(),
    ...studentData,
    registeredAt: new Date(),
  };
  this.registration.studentRegistrations.push(registration);
  this.statistics.studentRegistrations += 1;
  return this.save();
};

// Method to register freelancer
campusDriveSchema.methods.registerFreelancer = function (freelancerData) {
  const registration = {
    _id: new mongoose.Types.ObjectId(),
    ...freelancerData,
    registeredAt: new Date(),
  };
  this.registration.freelancerRegistrations.push(registration);
  this.statistics.freelancerRegistrations += 1;
  return this.save();
};

// Method to update registration status
campusDriveSchema.methods.updateRegistrationStatus = function (
  registrationId,
  newStatus,
  registrationType
) {
  const registrations =
    registrationType === 'student'
      ? this.registration.studentRegistrations
      : this.registration.freelancerRegistrations;

  const registration = registrations.find(
    (r) => r._id.toString() === registrationId.toString()
  );

  if (registration) {
    const oldStatus = registration.status;
    registration.status = newStatus;

    // Update statistics
    if (oldStatus !== 'Selected' && newStatus === 'Selected') {
      this.statistics.selectedCount += 1;
    }
    if (oldStatus !== 'Shortlisted' && newStatus === 'Shortlisted') {
      this.statistics.shortlistedCount += 1;
    }
  }

  return this.save();
};

// Static method to find upcoming drives
campusDriveSchema.statics.getUpcomingDrives = function (filters = {}) {
  let query = {
    status: { $in: ['Scheduled', 'Ongoing'] },
    'schedule.startDate': { $gte: new Date() },
  };

  if (filters.driveType) {
    query.driveType = filters.driveType;
  }
  if (filters.industry) {
    query['company.industry'] = filters.industry;
  }

  return this.find(query)
    .sort({ 'schedule.startDate': 1 })
    .populate('industryProfessionalId', 'company.name');
};

// Static method to search drives
campusDriveSchema.statics.searchDrives = function (filters) {
  let query = {};

  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }
  if (filters.driveType) {
    query.driveType = filters.driveType;
  }
  if (filters.startDate && filters.endDate) {
    query['schedule.startDate'] = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }
  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = { $in: ['Scheduled', 'Ongoing'] };
  }

  return this.find(query).sort({ 'schedule.startDate': -1 });
};

export default mongoose.model('CampusDrive', campusDriveSchema);
