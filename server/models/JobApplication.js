/**
 * Job Application Model
 * Enterprise-Grade MongoDB Schema for Job Application Management
 * Features: Application Tracking, Status Management, Analytics
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    // References
    jobOpeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOpening',
      required: [true, 'Job Opening ID is required'],
      index: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
      index: true,
    },
    applicantType: {
      type: String,
      enum: ['student', 'freelancer'],
      required: [true, 'Applicant type is required'],
      index: true,
    },
    industryProfessionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IndustryProfessional',
      required: [true, 'Industry Professional ID is required'],
      index: true,
    },

    // Application Details
    applicantInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      phone: String,
      resume: String, // URL to resume
      portfolio: String, // URL to portfolio
      linkedIn: String,
      bio: String,
    },

    // Skills & Qualifications
    applicantSkills: [String],
    experience: String, // Years of experience
    education: String, // Degree/qualification
    relevantProjects: [
      {
        title: String,
        description: String,
        url: String,
      },
    ],

    // Application Content
    coverLetter: {
      type: String,
      maxlength: 2000,
    },
    motivationMessage: {
      type: String,
      maxlength: 1000,
    },

    // Status & Tracking
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted', 'Hired'],
      default: 'Pending',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: mongoose.Schema.Types.ObjectId,
        notes: String,
      },
    ],

    // Hiring flags
    hired: {
      type: Boolean,
      default: false,
      index: true,
    },
    hiredAt: Date,

    // Assessment & Evaluation
    evaluation: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      feedback: String,
      evaluatedBy: mongoose.Schema.Types.ObjectId,
      evaluatedAt: Date,
      technicalScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      cultureFitScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      interviewScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // Interview Scheduling
    interviews: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        type: {
          type: String,
          enum: ['Phone', 'Video', 'Technical', 'HR', 'Final'],
        },
        scheduledDate: Date,
        scheduledTime: String,
        interviewerEmail: String,
        meetingLink: String,
        status: {
          type: String,
          enum: ['Scheduled', 'Completed', 'Rescheduled', 'No-show'],
          default: 'Scheduled',
        },
        feedback: String,
        score: Number,
        notes: String,
      },
    ],

    // Communication
    notes: [
      {
        addedBy: mongoose.Schema.Types.ObjectId,
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Analytics & Metadata
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    viewedAt: Date,
    viewedBy: [mongoose.Schema.Types.ObjectId],
    lastInteractionAt: Date,
    source: {
      type: String,
      enum: ['Website', 'Mobile', 'Email', 'Direct'],
      default: 'Website',
    },

    // Additional metadata
    customFields: mongoose.Schema.Types.Mixed, // For flexible custom data
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { jobOpeningId: 1, applicantId: 1, unique: true },
      { industryProfessionalId: 1, status: 1 },
      { applicantId: 1, status: 1 },
      { createdAt: -1 },
    ],
  }
);

// Indexes for performance
jobApplicationSchema.index({ jobOpeningId: 1, status: 1 });
jobApplicationSchema.index({ applicantId: 1, applicantType: 1 });
jobApplicationSchema.index({ industryProfessionalId: 1, appliedAt: -1 });

// Virtual for applicant profile
jobApplicationSchema.virtual('applicantProfile').get(function () {
  return {
    id: this.applicantId,
    name: this.applicantInfo.name,
    email: this.applicantInfo.email,
    type: this.applicantType,
  };
});

// Pre-save middleware for status tracking
jobApplicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  this.lastInteractionAt = new Date();
  next();
});

// Method to update application status
jobApplicationSchema.methods.updateStatus = function (newStatus, notes = '') {
  if (this.status !== newStatus) {
    this.status = newStatus;
    // Keep hired flag in sync
    if (newStatus === 'Hired') {
      this.hired = true;
      this.hiredAt = new Date();
    } else if (this.hired && newStatus !== 'Hired') {
      // If previously hired but status changed away, clear hired flag
      this.hired = false;
      this.hiredAt = undefined;
    }

    this.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      notes,
    });
    this.lastInteractionAt = new Date();
    return this.save();
  }
  // If status is same, do not push duplicate
  return Promise.resolve(this);
};

// Method to add interview
jobApplicationSchema.methods.addInterview = function (interviewData) {
  this.interviews.push({
    _id: new mongoose.Types.ObjectId(),
    ...interviewData,
  });
  return this.save();
};

// Static method for filtering applications
jobApplicationSchema.statics.filterApplications = function (query) {
  return this.find(query)
    .populate('jobOpeningId', 'title salary positions')
    .populate('applicantId', 'fullName email')
    .sort({ createdAt: -1 });
};

export default mongoose.model('JobApplication', jobApplicationSchema);
