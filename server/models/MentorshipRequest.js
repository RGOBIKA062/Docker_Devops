import mongoose from 'mongoose';

/**
 * MENTORSHIP REQUEST MODEL
 * Manages all mentorship requests from mentees to mentors
 * Workflow: requested → accepted/rejected → active → completed/cancelled
 */
const mentorshipRequestSchema = new mongoose.Schema(
  {
    // Participants
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
      index: true,
    },

    // Request Details
    skillsRequested: [
      {
        skillName: String,
        proficiencyTarget: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High'],
          default: 'Medium',
        },
      },
    ],

    requestMessage: {
      type: String,
      maxlength: 1000,
      required: true,
    },

    mentorshipType: {
      type: String,
      enum: ['oneOnOne', 'groupSessions', 'projectBased', 'careerguidance', 'other'],
      required: true,
    },

    // Duration & Timeline
    desiredStartDate: Date,
    preferredDuration: {
      type: String,
      enum: ['1_session', '1_month', '3_months', '6_months', '1_year'],
      required: true,
    },
    preferredSessionDuration: {
      type: String,
      enum: ['30min', '1hour', '2hours', 'flexible'],
      default: '1hour',
    },
    preferredFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'asneeded', 'flexible'],
      default: 'weekly',
    },

    // Goals & Objectives
    goals: [
      {
        goalDescription: String,
        targetDate: Date,
        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High'],
        },
      },
    ],

    // Background Information
    menteeBackground: {
      currentLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
      },
      yearsOfExperience: Number,
      currentRole: String,
      targetRole: String,
      industry: String,
      targetIndustry: String,
    },

    // Status
    status: {
      type: String,
      enum: [
        'pending',
        'under_review',
        'accepted',
        'rejected',
        'active',
        'paused',
        'completed',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    // Response Information
    mentorResponse: {
      responseDate: Date,
      responseMessage: String,
      isAccepted: Boolean,
      rejectionReason: String,
    },

    // Active Mentorship Details (after acceptance)
    activationDetails: {
      startDate: Date,
      endDate: Date,
      totalSessionsPlanned: Number,
      sessionsCompleted: {
        type: Number,
        default: 0,
      },
      totalHoursCommitted: Number,
      totalHoursCompleted: {
        type: Number,
        default: 0,
      },
    },

    // Pricing & Payment
    pricing: {
      ratePerHour: Number,
      totalCost: Number,
      currency: {
        type: String,
        default: 'INR',
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed'],
        default: 'pending',
      },
      paymentMethod: {
        type: String,
        enum: ['stripe', 'razorpay', 'bank_transfer', 'other'],
      },
      invoiceId: String,
      transactionId: String,
    },

    // Communication
    communicationChannels: [
      {
        channel: {
          type: String,
          enum: ['video_call', 'audio_call', 'chat', 'email', 'in_app'],
        },
        link: String,
      },
    ],

    // Attachments
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedDate: Date,
      },
    ],

    // Sessions Scheduled (references to sessions collection)
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorshipSession',
      },
    ],

    // Performance Tracking
    performanceMetrics: {
      progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      goalsAchieved: {
        type: Number,
        default: 0,
      },
      skillsImproved: [String],
      menteeRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      mentorRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      overallSatisfaction: {
        type: String,
        enum: ['very_dissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'very_satisfied'],
      },
    },

    // Feedback & Reviews
    feedback: {
      menteeFeedback: String,
      mentorFeedback: String,
      recommendations: [String],
      improvementAreas: [String],
    },

    // Outcomes
    outcomes: [
      {
        outcomeType: {
          type: String,
          enum: ['skill_gained', 'project_completed', 'interview_success', 'career_change', 'other'],
        },
        description: String,
        date: Date,
      },
    ],

    // Flag/Report System
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Notifications Sent
    notificationsSent: {
      requestCreated: Boolean,
      requestAccepted: Boolean,
      reminderSent: Boolean,
      completionNotified: Boolean,
    },

    // Tags for categorization
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Time since request was made
mentorshipRequestSchema.virtual('daysInProgress').get(function () {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual: Time remaining for mentorship
mentorshipRequestSchema.virtual('daysRemaining').get(function () {
  if (!this.activationDetails?.endDate) return null;
  return Math.floor((this.activationDetails.endDate - new Date()) / (1000 * 60 * 60 * 24));
});

// Virtual: Progress percentage
mentorshipRequestSchema.virtual('progressPercentage').get(function () {
  if (!this.activationDetails?.totalSessionsPlanned) return 0;
  return (
    (this.activationDetails.sessionsCompleted / this.activationDetails.totalSessionsPlanned) *
    100
  ).toFixed(0);
});

// Indexes
mentorshipRequestSchema.index({ menteeId: 1, status: 1 });
mentorshipRequestSchema.index({ mentorId: 1, status: 1 });
mentorshipRequestSchema.index({ status: 1 });
mentorshipRequestSchema.index({ createdAt: -1 });
mentorshipRequestSchema.index({ 'activationDetails.startDate': 1 });

export default mongoose.model('MentorshipRequest', mentorshipRequestSchema);
