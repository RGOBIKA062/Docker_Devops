/**
 * ========================================
 * MENTOR REQUEST MODEL
 * ========================================
 * Stores mentor-student relationship requests
 * Professional-grade enterprise model
 */

import mongoose from 'mongoose';

const mentorRequestSchema = new mongoose.Schema(
  {
    // ====================================
    // CORE RELATIONSHIPS
    // ====================================
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
      index: true,
    },
    mentorName: {
      type: String,
      required: true,
    },

    // ====================================
    // REQUEST DETAILS
    // ====================================
    message: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    skills: {
      type: [String],
      default: [],
    },
    goals: {
      type: [String],
      default: [],
    },

    // ====================================
    // STATUS & WORKFLOW
    // ====================================
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    responseAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },

    // ====================================
    // MENTOR RESPONSE
    // ====================================
    mentorMessage: {
      type: String,
      default: null,
      maxlength: 500,
    },
    rejectionReason: {
      type: String,
      default: null,
      maxlength: 500,
    },

    // ====================================
    // METADATA
    // ====================================
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: String,
    },

    // ====================================
    // TIMESTAMPS
    // ====================================
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
    collection: 'mentor_requests',
  }
);

// ====================================
// INDEXES FOR PERFORMANCE
// ====================================
mentorRequestSchema.index({ studentId: 1, mentorId: 1 });
mentorRequestSchema.index({ status: 1, requestedAt: -1 });
mentorRequestSchema.index({ expiresAt: 1 }); // For cleanup jobs

// ====================================
// VIRTUALS
// ====================================
mentorRequestSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date() && this.status === 'pending';
});

mentorRequestSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const diff = this.expiresAt - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ====================================
// METHODS
// ====================================

/**
 * Accept request
 */
mentorRequestSchema.methods.accept = async function(mentorMessage = '') {
  if (this.status !== 'pending') {
    throw new Error(`Cannot accept request with status: ${this.status}`);
  }
  this.status = 'accepted';
  this.responseAt = new Date();
  this.mentorMessage = mentorMessage;
  return this.save();
};

/**
 * Reject request
 */
mentorRequestSchema.methods.reject = async function(reason = '') {
  if (this.status !== 'pending') {
    throw new Error(`Cannot reject request with status: ${this.status}`);
  }
  this.status = 'rejected';
  this.responseAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

/**
 * Cancel request (by student)
 */
mentorRequestSchema.methods.cancel = async function() {
  if (['pending', 'accepted'].includes(this.status)) {
    this.status = 'cancelled';
    this.responseAt = new Date();
    return this.save();
  }
  throw new Error(`Cannot cancel request with status: ${this.status}`);
};

/**
 * Mark as expired
 */
mentorRequestSchema.methods.markExpired = async function() {
  if (this.status === 'pending' && this.isExpired) {
    this.status = 'expired';
    return this.save();
  }
  return this;
};

// ====================================
// STATICS
// ====================================

/**
 * Check if student has active request with mentor
 */
mentorRequestSchema.statics.hasActiveRequest = async function(studentId, mentorId) {
  const request = await this.findOne({
    studentId,
    mentorId,
    status: { $in: ['pending', 'accepted'] },
  });
  return !!request;
};

/**
 * Get pending requests for mentor
 */
mentorRequestSchema.statics.getPendingForMentor = async function(mentorId) {
  return this.find({
    mentorId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  }).sort({ requestedAt: -1 });
};

/**
 * Get requests for student
 */
mentorRequestSchema.statics.getForStudent = async function(studentId, status = null) {
  const query = { studentId };
  if (status) query.status = status;
  return this.find(query).sort({ requestedAt: -1 });
};

// ====================================
// HOOKS
// ====================================

/**
 * Auto-update timestamp before save
 */
mentorRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('MentorRequest', mentorRequestSchema);
