/**
 * FREELANCER MODEL
 * Enterprise-Grade MongoDB Schema for Freelancer Management
 * Features: Profile Management, Skills, Portfolio, Ratings, Earnings Tracking
 * @author Senior Software Developer (25+ Years)
 * @version 2.0.0
 */

import mongoose from 'mongoose';

/**
 * Freelancer Schema - Comprehensive Profile Management
 */
const freelancerSchema = new mongoose.Schema(
  {
    // User Reference - Can be ObjectId or string (for demo mode)
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },

    // Basic Profile Information
    profile: {
      firstName: {
        type: String,
        trim: true,
        default: '',
      },
      lastName: {
        type: String,
        trim: true,
        default: '',
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
        default: '',
      },
      phone: {
        type: String,
        match: [/^$|^[0-9]{10}$/, 'Phone number must be 10 digits'],
        default: '',
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio must not exceed 500 characters'],
        default: '',
      },
      profileImage: {
        type: String,
        default: null,
      },
      headline: {
        type: String,
        maxlength: [100, 'Headline must not exceed 100 characters'],
        default: 'Freelancer at AllCollegeEvents',
      },
    },

    // Skills Management
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Intermediate',
        },
        yearsOfExperience: {
          type: Number,
          min: 0,
          default: 1,
        },
        endorsements: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Portfolio & Samples
    portfolio: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          maxlength: [300, 'Description must not exceed 300 characters'],
        },
        image: {
          type: String,
          default: null,
        },
        link: {
          type: String,
          default: null,
        },
        category: {
          type: String,
          default: 'General',
        },
      },
    ],

    // Certifications & Credentials
    certifications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        issuer: {
          type: String,
          required: true,
          trim: true,
        },
        issueDate: {
          type: Date,
          required: true,
        },
        expiryDate: {
          type: Date,
          default: null,
        },
        credentialUrl: {
          type: String,
          default: null,
        },
        certificateImage: {
          type: String,
          default: null,
        },
      },
    ],

    // Active Projects & Gigs
    activeProjects: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        status: {
          type: String,
          enum: ['Active', 'Paused', 'Completed'],
          default: 'Active',
        },
        budget: {
          type: Number,
          default: 0,
        },
        deadline: {
          type: Date,
          default: null,
        },
        location: {
          type: String,
          default: '',
        },
        category: {
          type: String,
          default: 'General',
        },
      },
    ],

    // Financial Information
    financials: {
      totalEarnings: {
        type: Number,
        default: 0,
        min: 0,
      },
      monthlyEarnings: {
        type: Number,
        default: 0,
        min: 0,
      },
      completedProjects: {
        type: Number,
        default: 0,
        min: 0,
      },
      ongoingProjects: {
        type: Number,
        default: 0,
        min: 0,
      },
      bankAccount: {
        accountHolder: {
          type: String,
          default: '',
        },
        bankName: {
          type: String,
          default: '',
        },
        accountNumber: {
          type: String,
          default: '',
          select: false, // Don't return by default for security
        },
        ifscCode: {
          type: String,
          default: '',
          select: false,
        },
      },
    },

    // Ratings & Reviews
    ratings: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      reviews: [
        {
          clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          comment: {
            type: String,
            maxlength: [300, 'Review must not exceed 300 characters'],
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Preferences & Settings
    preferences: {
      availability: {
        type: String,
        enum: ['Available', 'Busy', 'Not Available'],
        default: 'Available',
      },
      hourlyRate: {
        type: Number,
        default: 0,
        min: 0,
      },
      minProjectBudget: {
        type: Number,
        default: 0,
        min: 0,
      },
      preferedCategories: [
        {
          type: String,
          default: [],
        },
      ],
      responseTime: {
        type: String,
        enum: ['Within 1 hour', 'Within 4 hours', 'Within 24 hours'],
        default: 'Within 24 hours',
      },
    },

    // Social & Verification
    social: {
      github: {
        type: String,
        default: '',
      },
      linkedin: {
        type: String,
        default: '',
      },
      portfolio: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      },
    },

    verification: {
      emailVerified: {
        type: Boolean,
        default: false,
      },
      phoneVerified: {
        type: Boolean,
        default: false,
      },
      identityVerified: {
        type: Boolean,
        default: false,
      },
      bankVerified: {
        type: Boolean,
        default: false,
      },
    },

    // Activity & Analytics
    analytics: {
      profileViews: {
        type: Number,
        default: 0,
      },
      lastProfileUpdate: {
        type: Date,
        default: Date.now,
      },
      jobSuccessRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    // Admin Fields
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: '',
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'freelancers',
  }
);

// Indexes for performance
freelancerSchema.index({ 'profile.email': 1 });
freelancerSchema.index({ 'profile.phone': 1 });
freelancerSchema.index({ 'skills.name': 1 });
freelancerSchema.index({ 'ratings.averageRating': -1 });
freelancerSchema.index({ createdAt: -1 });
freelancerSchema.index({ 'financials.totalEarnings': -1 });

// Virtual for full name
freelancerSchema.virtual('fullName').get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Middleware to update timestamps
freelancerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Middleware to exclude sensitive data
freelancerSchema.pre(/^find/, function (next) {
  if (!this.getOptions().select?.includes('financials.bankAccount.accountNumber')) {
    this.select('-financials.bankAccount.accountNumber -financials.bankAccount.ifscCode');
  }
  next();
});

/**
 * Instance Methods
 */

// Update earnings
freelancerSchema.methods.updateEarnings = function (amount) {
  this.financials.totalEarnings += amount;
  this.financials.monthlyEarnings += amount;
  return this.save();
};

// Add review
freelancerSchema.methods.addReview = function (clientId, rating, comment) {
  const review = { clientId, rating, comment };
  this.ratings.reviews.push(review);
  
  // Recalculate average rating
  const totalRating = this.ratings.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.ratings.averageRating = totalRating / this.ratings.reviews.length;
  this.ratings.totalReviews = this.ratings.reviews.length;
  
  return this.save();
};

// Add skill
freelancerSchema.methods.addSkill = function (skillData) {
  const existingSkill = this.skills.find(s => s.name.toLowerCase() === skillData.name.toLowerCase());
  if (!existingSkill) {
    this.skills.push(skillData);
  }
  return this.save();
};

// Add portfolio item
freelancerSchema.methods.addPortfolioItem = function (item) {
  this.portfolio.push(item);
  return this.save();
};

// Add certification
freelancerSchema.methods.addCertification = function (certData) {
  this.certifications.push(certData);
  return this.save();
};

// Get freelancer statistics
freelancerSchema.methods.getStatistics = function () {
  return {
    totalEarnings: this.financials.totalEarnings,
    completedProjects: this.financials.completedProjects,
    averageRating: this.ratings.averageRating,
    totalReviews: this.ratings.totalReviews,
    totalSkills: this.skills.length,
    profileCompleteness: this.calculateProfileCompleteness(),
  };
};

// Calculate profile completeness percentage
freelancerSchema.methods.calculateProfileCompleteness = function () {
  let completeness = 0;
  const fields = [
    this.profile.profileImage,
    this.profile.bio,
    this.skills.length > 0,
    this.portfolio.length > 0,
    this.certifications.length > 0,
    this.verification.emailVerified,
  ];

  completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  return completeness;
};

const Freelancer = mongoose.model('Freelancer', freelancerSchema);
export default Freelancer;
