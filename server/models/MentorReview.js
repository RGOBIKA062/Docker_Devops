import mongoose from 'mongoose';

/**
 * MENTOR REVIEW MODEL
 * Stores reviews and ratings from mentees about their mentors
 * Used for mentor verification and leaderboard ranking
 */
const mentorReviewSchema = new mongoose.Schema(
  {
    // Reviewer & Reviewed
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
    mentorshipRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorshipRequest',
      required: true,
    },

    // Rating
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Detailed Ratings
    detailedRatings: {
      expertise: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      availability: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5,
      },
      goalAchievement: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // Review Text
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    reviewText: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Highlights
    positives: [String],
    negatives: [String],
    suggestions: [String],

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    mentorshipDuration: {
      type: String,
      enum: ['1_month', '3_months', '6_months', '1_year', 'more'],
    },

    // Visibility & Moderation
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: String,

    // Engagement
    helpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulCount: {
      type: Number,
      default: 0,
    },

    // Response from Mentor
    mentorResponse: {
      hasResponded: Boolean,
      response: String,
      respondedAt: Date,
    },

    // Outcomes
    studentOutcomes: [
      {
        outcome: String,
        description: String,
      },
    ],

    // Endorsements
    skillsEndorsed: [
      {
        skillName: String,
        confidence: {
          type: String,
          enum: ['low', 'medium', 'high', 'very_high'],
        },
      },
    ],

    // Context
    context: {
      focusAreas: [String],
      sessionCount: Number,
      totalHours: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mentorReviewSchema.index({ mentorId: 1 });
mentorReviewSchema.index({ menteeId: 1 });
mentorReviewSchema.index({ overallRating: -1 });
mentorReviewSchema.index({ createdAt: -1 });

export default mongoose.model('MentorReview', mentorReviewSchema);
