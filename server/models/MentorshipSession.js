import mongoose from 'mongoose';

/**
 * MENTORSHIP SESSION MODEL
 * Tracks individual mentorship sessions with scheduling, recording, and analytics
 */
const mentorshipSessionSchema = new mongoose.Schema(
  {
    // Reference to mentorship request
    mentorshipRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorshipRequest',
      required: true,
      index: true,
    },

    // Participants
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
      index: true,
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Session Details
    title: {
      type: String,
      required: true,
    },
    description: String,

    // Schedule
    scheduledStartTime: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      // in minutes
    },

    // Actual Session
    actualStartTime: Date,
    actualEndTime: Date,
    actualDuration: Number,

    // Status
    status: {
      type: String,
      enum: [
        'scheduled',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show',
        'rescheduled',
      ],
      default: 'scheduled',
      index: true,
    },

    // Cancellation Details
    cancellationDetails: {
      cancelledBy: {
        type: String,
        enum: ['mentor', 'mentee', 'system'],
      },
      reason: String,
      cancelledAt: Date,
      refundIssued: Boolean,
    },

    // Meeting Details
    meetingLink: String,
    meetingRoom: {
      roomId: String,
      platform: {
        type: String,
        enum: ['zoom', 'google_meet', 'teams', 'discord', 'other'],
      },
    },

    // Session Content
    agenda: [
      {
        topic: String,
        duration: Number,
        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High'],
        },
      },
    ],

    sessionNotes: {
      mentorNotes: String,
      keyPoints: [String],
      actionItems: [
        {
          task: String,
          assignedTo: {
            type: String,
            enum: ['mentor', 'mentee', 'both'],
          },
          dueDate: Date,
          status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
            default: 'pending',
          },
        },
      ],
    },

    // Recording
    recording: {
      isRecorded: Boolean,
      recordingUrl: String,
      recordingDuration: Number,
      uploadedAt: Date,
      accessLevel: {
        type: String,
        enum: ['mentee_only', 'both', 'none'],
        default: 'both',
      },
    },

    // Resources Shared
    resourcesShared: [
      {
        resourceName: String,
        resourceType: {
          type: String,
          enum: ['document', 'video', 'link', 'code', 'other'],
        },
        url: String,
        description: String,
        sharedDate: Date,
      },
    ],

    // Attendance
    attendance: {
      mentorAttended: Boolean,
      menteeAttended: Boolean,
      mentorJoinedAt: Date,
      menteeJoinedAt: Date,
      mentorLeftAt: Date,
      menteeLeftAt: Date,
    },

    // Performance & Quality
    sessionQuality: {
      overallRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      clarity: {
        type: Number,
        min: 1,
        max: 5,
      },
      engagement: {
        type: Number,
        min: 1,
        max: 5,
      },
      helpfulness: {
        type: Number,
        min: 1,
        max: 5,
      },
      menteeComments: String,
    },

    // Feedback
    mentorFeedback: String,
    menteeFeedback: String,
    improvementAreas: [String],

    // Follow-up
    followUpRequired: Boolean,
    followUpScheduledFor: Date,
    followUpTopics: [String],

    // Payment
    billing: {
      ratePerHour: Number,
      amountCharged: Number,
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
    },

    // Goals Progress
    goalsProgress: [
      {
        goalId: String,
        goal: String,
        progressPercentage: Number,
        status: {
          type: String,
          enum: ['not_started', 'in_progress', 'completed'],
        },
      },
    ],

    // Skills Development
    skillsDeveloped: [
      {
        skillName: String,
        improvementLevel: {
          type: String,
          enum: ['significant', 'moderate', 'slight', 'none'],
        },
      },
    ],

    // Certificate (if applicable)
    certificate: {
      issued: Boolean,
      certificateUrl: String,
      issuedDate: Date,
      uniqueId: String,
    },

    // Tags
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Is session in past
mentorshipSessionSchema.virtual('isPast').get(function () {
  return this.scheduledEndTime < new Date();
});

// Virtual: Time until session
mentorshipSessionSchema.virtual('minutesUntilStart').get(function () {
  return Math.max(0, Math.floor((this.scheduledStartTime - new Date()) / (1000 * 60)));
});

// Indexes
mentorshipSessionSchema.index({ mentorId: 1, status: 1 });
mentorshipSessionSchema.index({ menteeId: 1, status: 1 });
mentorshipSessionSchema.index({ scheduledStartTime: 1 });
mentorshipSessionSchema.index({ status: 1 });
mentorshipSessionSchema.index({ createdAt: -1 });

export default mongoose.model('MentorshipSession', mentorshipSessionSchema);
