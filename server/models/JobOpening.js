/**
 * Job Opening Model
 * Enterprise-Grade MongoDB Schema for Job Posting Management
 * Features: Job Posting, Application Tracking, Analytics
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const jobOpeningSchema = new mongoose.Schema(
  {
    // Industry Reference
    industryProfessionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IndustryProfessional',
      required: [true, 'Industry Professional ID is required'],
      index: true,
    },

    // Job Details
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: 5000,
    },
    responsibilities: [
      {
        type: String,
      },
    ],

    // Company Info
    company: {
      name: String,
      logo: String,
      industry: String,
      size: String,
    },

    // Position Details
    positions: {
      type: Number,
      required: [true, 'Number of positions is required'],
      min: 1,
    },
    filledPositions: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Job Type & Duration
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Temporary'],
      required: [true, 'Job type is required'],
      index: true,
    },
    duration: {
      type: String, // e.g., "6 months", "Permanent"
      default: 'Permanent',
    },

    // Salary & Compensation
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR',
      },
      salaryType: {
        type: String,
        enum: ['Monthly', 'Yearly', 'Hourly', 'Project-based'],
        default: 'Monthly',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
      benefits: [String], // e.g., Health Insurance, Bonus, Remote Work
    },

    // Location
    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India',
      },
      isRemote: {
        type: Boolean,
        default: false,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Requirements & Qualifications
    requirements: {
      experience: {
        min: Number, // in years
        max: Number,
        description: String,
      },
      education: [
        {
          degree: String, // Bachelor, Master, etc.
          specialization: String, // Optional
          minCGPA: Number,
        },
      ],
      skills: [String], // Required skills
      optionalSkills: [String],
      languages: [String],
      certifications: [String],
      preferredQualifications: [String],
    },

    // Eligibility Criteria
    eligibility: {
      minCGPA: Number,
      maxBacklogs: Number,
      allowedBranches: [String],
      allowedYears: [String], // e.g., ['2nd Year', '3rd Year', '4th Year']
      allowFreelancers: {
        type: Boolean,
        default: true,
      },
      allowStudents: {
        type: Boolean,
        default: true,
      },
    },

    // Application Details
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    applicationMethod: {
      type: String,
      enum: ['Online', 'Email', 'Both'],
      default: 'Online',
    },

    // Applications & Statistics
    applicationCount: {
      type: Number,
      default: 0,
    },
    applicantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
      },
    ],
    statistics: {
      totalApplications: {
        type: Number,
        default: 0,
      },
      studentApplications: {
        type: Number,
        default: 0,
      },
      freelancerApplications: {
        type: Number,
        default: 0,
      },
      shortlisted: {
        type: Number,
        default: 0,
      },
      interviewed: {
        type: Number,
        default: 0,
      },
      offered: {
        type: Number,
        default: 0,
      },
      joined: {
        type: Number,
        default: 0,
      },
    },

    // Interview Process
    interviewProcess: {
      stages: [
        {
          name: String, // Written Test, Group Discussion, Technical, HR
          description: String,
          duration: Number, // in minutes
          type: {
            type: String,
            enum: ['Test', 'Interview', 'Discussion', 'Presentation'],
          },
        },
      ],
      estimatedTimeToHire: String, // e.g., "2 weeks"
    },

    // Job Status & Visibility
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Active', 'On Hold', 'Closed', 'Filled'],
      default: 'Draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Students Only', 'Freelancers Only'],
      default: 'Public',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Additional Information
    aboutCompany: String,
    whyJoinUs: String,
    growthOpportunities: String,
    workCulture: String,

    // Metadata & Tags
    tags: [String],
    category: {
      type: String,
      enum: [
        'IT',
        'Finance',
        'Sales',
        'Marketing',
        'HR',
        'Operations',
        'Engineering',
        'Design',
        'Business',
        'Other',
      ],
      default: 'IT',
    },

    // Document Storage
    documents: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['JD', 'Guidelines', 'Process', 'Other'],
        },
      },
    ],

    // Engagement
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    saves: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        savedAt: {
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
      contactPerson: String,
      contactDesignation: String,
    },

    // Important Dates
    publishedAt: Date,
    closedAt: Date,
    nextApplicationRound: Date,

    // Metadata
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
      { applicationDeadline: 1, status: 1 },
      { title: 'text', description: 'text' },
      { createdAt: -1 },
    ],
  }
);

// Indexes for performance
jobOpeningSchema.index({ industryProfessionalId: 1, createdAt: -1 });
jobOpeningSchema.index({ 'location.city': 1, status: 1 });
jobOpeningSchema.index({ category: 1, status: 1 });
jobOpeningSchema.index({ 'requirements.skills': 1 });

// Virtual for availability
jobOpeningSchema.virtual('isOpen').get(function () {
  return (
    this.status === 'Active' &&
    this.applicationDeadline > new Date() &&
    this.filledPositions < this.positions
  );
});

// Virtual for remaining positions
jobOpeningSchema.virtual('remainingPositions').get(function () {
  return this.positions - this.filledPositions;
});

// Pre-save middleware
jobOpeningSchema.pre('save', function (next) {
  if (!this.publishedAt && this.status === 'Active') {
    this.publishedAt = new Date();
  }
  next();
});

// Method to increment applications count
jobOpeningSchema.methods.incrementApplicationCount = function (applicantType) {
  this.statistics.totalApplications += 1;
  if (applicantType === 'student') {
    this.statistics.studentApplications += 1;
  } else if (applicantType === 'freelancer') {
    this.statistics.freelancerApplications += 1;
  }
  return this.save();
};

// Method to close job
jobOpeningSchema.methods.closeJob = function () {
  this.status = 'Closed';
  this.closedAt = new Date();
  return this.save();
};

// Method to reopen job
jobOpeningSchema.methods.reopenJob = function () {
  this.status = 'Active';
  this.publishedAt = new Date();
  return this.save();
};

// Static method to search jobs
jobOpeningSchema.statics.searchJobs = function (filters) {
  let query = {};

  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }
  if (filters.jobType) {
    query.jobType = filters.jobType;
  }
  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }
  if (filters.skills && filters.skills.length > 0) {
    query['requirements.skills'] = { $in: filters.skills };
  }
  if (filters.minSalary || filters.maxSalary) {
    query['salary.min'] = { $gte: filters.minSalary || 0 };
    if (filters.maxSalary) {
      query['salary.max'] = { $lte: filters.maxSalary };
    }
  }
  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = 'Active';
  }

  return this.find(query).sort({ createdAt: -1 }).populate('industryProfessionalId', 'company.name');
};

export default mongoose.model('JobOpening', jobOpeningSchema);
