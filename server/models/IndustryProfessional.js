import mongoose from 'mongoose';

/**
 * Industry Professional Schema - Complete profile management for industry partners
 */
const industryProfessionalSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Company Information
    company: {
      name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
      },
      website: String,
      logo: String,
      industry: {
        type: String,
        enum: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Consulting', 'Education', 'Energy', 'Telecommunications', 'Other'],
        required: true,
      },
      companySize: {
        type: String,
        enum: ['Startup', 'Small (1-50)', 'Medium (51-500)', 'Large (500+)'],
        required: true,
      },
      about: {
        type: String,
        maxlength: 2000,
      },
      yearsInBusiness: Number,
      headquarters: String,
    },

    // Contact Information
    contact: {
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      phone: String,
      website: String,
      linkedin: String,
    },

    // Job Openings Posted
    jobOpenings: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        description: String,
        positions: Number,
        salary: String,
        jobType: {
          type: String,
          enum: ['Full-time', 'Part-time', 'Internship', 'Freelance'],
        },
        skills: [String],
        experience: String,
        deadline: Date,
        status: {
          type: String,
          enum: ['Open', 'Closed', 'On Hold'],
          default: 'Open',
        },
        applications: [
          {
            studentId: mongoose.Schema.Types.ObjectId,
            appliedAt: Date,
            status: {
              type: String,
              enum: ['Pending', 'Shortlisted', 'Rejected', 'Hired'],
              default: 'Pending',
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Campus Visits
    campusVisits: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        college: String,
        date: Date,
        time: String,
        location: String,
        purpose: {
          type: String,
          enum: ['Recruitment', 'Campus Hiring', 'Campus Drive', 'Internship Drive', 'Placement Drive'],
        },
        expectedStudents: Number,
        recruitmentTeam: [
          {
            name: String,
            designation: String,
            email: String,
          },
        ],
        interviewProcess: String,
        status: {
          type: String,
          enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
          default: 'Scheduled',
        },
        registeredStudents: [mongoose.Schema.Types.ObjectId],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Statistics & Analytics
    statistics: {
      totalApplications: { type: Number, default: 0 },
      totalHired: { type: Number, default: 0 },
      activeCollaborations: { type: Number, default: 0 },
      campusVisits: { type: Number, default: 0 },
      eventsHosted: { type: Number, default: 0 },
    },

    // Talent Preferences
    talentPreferences: {
      skillsNeeded: [String],
      educationLevel: [
        {
          type: String,
          enum: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Any'],
        },
      ],
      preferredDegrees: [String],
      minimumGPA: Number,
      experience: String,
    },

    // Collaborations & Partnerships
    collaborations: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        collegeName: String,
        startDate: Date,
        endDate: Date,
        type: {
          type: String,
          enum: ['Research', 'Internship', 'Training', 'Mentoring', 'Recruitment', 'Sponsorship'],
        },
        description: String,
        contactPerson: String,
        email: String,
        status: {
          type: String,
          enum: ['Active', 'Inactive', 'Completed'],
          default: 'Active',
        },
      },
    ],

    // Events & Campaigns
    campaigns: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        type: {
          type: String,
          enum: ['Recruitment', 'Awareness', 'Workshop', 'Sponsorship', 'Contest'],
        },
        budget: Number,
        targetAudience: String,
        status: {
          type: String,
          enum: ['Planning', 'Active', 'Completed', 'Cancelled'],
          default: 'Planning',
        },
        registrations: Number,
      },
    ],

    // Documents & Certificates
    documents: [
      {
        name: String,
        type: String,
        url: String,
        uploadedAt: Date,
      },
    ],

    // Verification Status
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationDate: Date,
      verificationNotes: String,
    },

    // Subscription & Pricing
    subscription: {
      plan: {
        type: String,
        enum: ['Free', 'Professional', 'Enterprise'],
        default: 'Free',
      },
      startDate: Date,
      endDate: Date,
      jobPostingLimit: Number,
      usedPostings: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    },

    // Reviews & Ratings
    reviews: [
      {
        studentId: mongoose.Schema.Types.ObjectId,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    overallRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Preferences & Settings
    preferences: {
      notificationEmail: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      showInPublicDirectory: { type: Boolean, default: true },
    },

    // Status
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'industryProfessionals',
  }
);

// Indexes for better query performance
industryProfessionalSchema.index({ userId: 1 });
industryProfessionalSchema.index({ 'company.industry': 1 });
industryProfessionalSchema.index({ 'company.name': 'text' });
industryProfessionalSchema.index({ status: 1 });
industryProfessionalSchema.index({ createdAt: -1 });

// Virtual for average rating
industryProfessionalSchema.virtual('averageRating').get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Middleware to update statistics
industryProfessionalSchema.pre('save', function (next) {
  if (this.jobOpenings) {
    this.statistics.totalHired = this.jobOpenings.reduce((acc, job) => {
      return acc + job.applications.filter(app => app.status === 'Hired').length;
    }, 0);
  }
  if (this.collaborations) {
    this.statistics.activeCollaborations = this.collaborations.filter(
      collab => collab.status === 'Active'
    ).length;
    this.statistics.campusVisits = this.campusVisits.length;
  }
  next();
});

export default mongoose.model('IndustryProfessional', industryProfessionalSchema);
