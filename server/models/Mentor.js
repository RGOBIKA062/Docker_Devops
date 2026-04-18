import mongoose from 'mongoose';

/**
 * MENTOR MODEL - Enterprise-Grade Mentorship Platform
 * Stores comprehensive mentor profiles with skills, expertise, and verification
 * Features:
 * - Skills taxonomy with proficiency levels
 * - Industry experience tracking
 * - Verification & badges system
 * - Availability & rate management
 * - Performance analytics
 * - Revenue tracking
 */
const mentorSchema = new mongoose.Schema(
  {
    // Core Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Professional Profile
    professionalTitle: {
      type: String,
      required: true,
      example: 'Senior Software Architect',
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },
    currentCompany: {
      type: String,
      default: null,
    },
    linkedinProfile: {
      type: String,
      default: null,
    },
    githubProfile: {
      type: String,
      default: null,
    },
    portfolioUrl: {
      type: String,
      default: null,
    },
    professionalBio: {
      type: String,
      maxlength: 1000,
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },

    // Expertise & Skills
    skills: [
      {
        skillName: {
          type: String,
          required: true,
          example: 'Node.js',
        },
        category: {
          type: String,
          enum: [
            'Backend',
            'Frontend',
            'Full Stack',
            'Mobile',
            'DevOps',
            'Data Science',
            'Cloud',
            'Security',
            'AI/ML',
            'Blockchain',
            'QA/Testing',
            'Architecture',
            'Leadership',
            'Other',
          ],
          required: true,
        },
        proficiencyLevel: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Expert',
        },
        yearsOfExperience: {
          type: Number,
          min: 0,
        },
        endorsements: {
          type: Number,
          default: 0,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Industries & Domains
    industries: [
      {
        type: String,
        enum: [
          'FinTech',
          'HealthTech',
          'EdTech',
          'E-commerce',
          'SaaS',
          'Enterprise',
          'Startup',
          'Gaming',
          'AI/ML',
          'Blockchain',
          'IoT',
          'Mobile',
          'Web3',
          'Other',
        ],
      },
    ],

    // Mentorship Services
    mentorshipTypes: {
      oneOnOne: {
        enabled: Boolean,
        ratePerHour: Number,
        maxSlotsPerWeek: Number,
        currentSlots: Number,
      },
      groupSessions: {
        enabled: Boolean,
        ratePerHour: Number,
        maxParticipants: Number,
      },
      projectBased: {
        enabled: Boolean,
        ratePerProject: Number,
        averageProjectDuration: String,
      },
      careerguidance: {
        enabled: Boolean,
        ratePerSession: Number,
      },
      resumeReview: {
        enabled: Boolean,
        ratePerReview: Number,
      },
      interviewPrep: {
        enabled: Boolean,
        ratePerSession: Number,
      },
    },

    // Pricing Model
    pricingType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
    },

    // Availability & Settings
    weeklyHours: {
      type: Number,
      default: 10,
      min: 0,
      max: 168,
    },
    timezone: {
      type: String,
      default: 'IST',
    },
    maxConcurrentMentees: {
      type: Number,
      default: 5,
      min: 1,
      max: 100,
    },
    avgResponseTime: {
      type: String,
      enum: ['immediate', '1hour', '6hours', '24hours', '2days'],
      default: '24hours',
    },

    // Availability
    availability: {
      timezone: {
        type: String,
        default: 'IST',
      },
      weeklyHours: {
        type: Number,
        default: 10,
        min: 1,
        max: 168,
      },
      daySlots: {
        monday: [String],
        tuesday: [String],
        wednesday: [String],
        thursday: [String],
        friday: [String],
        saturday: [String],
        sunday: [String],
      },
      nextAvailableSlot: Date,
      bookedSlots: Number,
      totalCapacitySlots: Number,
    },

    // Verification & Badges
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'premium'],
      default: 'unverified',
    },
    verifiedSkills: [String],
    badges: [
      {
        badgeName: String,
        badgeIcon: String,
        criteriaType: {
          type: String,
          enum: [
            'mentor_sessions_completed',
            'years_of_experience',
            'skill_endorsements',
            'student_satisfaction',
            'certifications',
            'contributions',
          ],
        },
        earnedDate: Date,
      },
    ],
    certifications: [
      {
        certificationName: String,
        issuingOrganization: String,
        issueDate: Date,
        expiryDate: Date,
        credentialUrl: String,
        isVerified: Boolean,
      },
    ],

    // Performance Metrics
    metrics: {
      totalMenteesSessions: {
        type: Number,
        default: 0,
      },
      totalHoursMentored: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      responseRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      averageResponseTime: {
        type: String,
        default: 'N/A',
      },
      menteeRetentionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      completionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    // Revenue & Earnings
    earnings: {
      totalEarnings: {
        type: Number,
        default: 0,
      },
      monthlyEarnings: {
        type: Number,
        default: 0,
      },
      pendingPayout: {
        type: Number,
        default: 0,
      },
      payoutMethod: {
        type: String,
        enum: ['bank_transfer', 'paypal', 'stripe', 'other'],
        default: null,
      },
      payoutSchedule: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
        default: 'monthly',
      },
      lastPayoutDate: Date,
      nextPayoutDate: Date,
    },

    // Specializations
    specializations: [
      {
        name: String,
        description: String,
        successStories: Number,
      },
    ],

    // Languages
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
        },
      },
    ],

    // Reviews & Testimonials
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorReview',
      },
    ],

    // Leaderboard Rankings
    leaderboardScores: {
      overallScore: {
        type: Number,
        default: 0,
        index: true,
      },
      ratingScore: {
        type: Number,
        default: 0,
      },
      registrationsScore: {
        type: Number,
        default: 0,
      },
      revenueScore: {
        type: Number,
        default: 0,
      },
      engagementScore: {
        type: Number,
        default: 0,
      },
      impactScore: {
        type: Number,
        default: 0,
      },
      rank: {
        type: Number,
        default: null,
        index: true,
      },
      tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        default: 'Bronze',
      },
      leaderboardPosition: {
        type: String,
        enum: ['top_10', 'top_50', 'top_100', 'top_500', 'other'],
        default: 'other',
      },
    },

    // Match Preferences
    matchPreferences: {
      preferredMenteeLevel: [
        {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        },
      ],
      preferredMenteeIndustry: [String],
      preferredSessionDuration: {
        type: String,
        enum: ['30min', '1hour', '2hours', 'flexible'],
      },
      minMentorshipDuration: {
        type: String,
        enum: ['1_session', '1_month', '3_months', '6_months', 'flexible'],
      },
      acceptsGroupMentees: Boolean,
      acceptsProjectBased: Boolean,
    },

    // Settings & Preferences
    settings: {
      isPublicProfile: {
        type: Boolean,
        default: true,
      },
      acceptingNewMentees: {
        type: Boolean,
        default: true,
      },
      autoAcceptRequests: {
        type: Boolean,
        default: false,
      },
      allowDirectMessages: {
        type: Boolean,
        default: true,
      },
      notificationPreferences: {
        mentorshipRequests: Boolean,
        sessionReminders: Boolean,
        feedbackRequest: Boolean,
      },
    },

    // Statistics for Dashboard
    stats: {
      activeMentees: {
        type: Number,
        default: 0,
      },
      upcomingSessions: {
        type: Number,
        default: 0,
      },
      completedSessions: {
        type: Number,
        default: 0,
      },
      successfulMatches: {
        type: Number,
        default: 0,
      },
      pendingRequests: {
        type: Number,
        default: 0,
      },
    },

    // Account Status
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deactivated'],
      default: 'active',
    },
    suspensionReason: String,
    lastActivityDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Mentor name from user
mentorSchema.virtual('mentorName').get(function () {
  return this.userId?.fullName || 'Unknown';
});

// Virtual: Expertise summary
mentorSchema.virtual('expertiseSummary').get(function () {
  return this.skills
    .filter(s => s.isVerified)
    .map(s => s.skillName)
    .slice(0, 5)
    .join(', ');
});

// Virtual: Available slots percentage
mentorSchema.virtual('availabilityPercentage').get(function () {
  if (this.availability.totalCapacitySlots === 0) return 100;
  return (
    ((this.availability.totalCapacitySlots -
      this.availability.bookedSlots) /
      this.availability.totalCapacitySlots) *
    100
  ).toFixed(0);
});

// Indexes for performance
mentorSchema.index({ userId: 1 });
mentorSchema.index({ 'leaderboardScores.rank': 1 });
mentorSchema.index({ 'metrics.averageRating': -1 });
mentorSchema.index({ 'earnings.totalEarnings': -1 });
mentorSchema.index({ verificationStatus: 1 });
mentorSchema.index({ 'leaderboardScores.tier': 1 });
mentorSchema.index({ accountStatus: 1 });
mentorSchema.index({ 'skills.skillName': 1 });
mentorSchema.index({ industries: 1 });

export default mongoose.model('Mentor', mentorSchema);
