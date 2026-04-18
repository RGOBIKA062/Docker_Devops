/**
 * SUBMISSION MODEL - Tracks Code Submissions
 * Stores user submissions and execution results
 */

import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    // Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },

    // Code & Language
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      enum: ['JavaScript', 'Python', 'Java', 'C++'],
      required: true
    },

    // Execution Results
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error'],
      default: 'Pending'
    },
    executionDetails: {
      runtime: Number, // milliseconds
      memory: Number, // MB
      output: mongoose.Schema.Types.Mixed,
      error: String,
      testsPassed: Number,
      totalTests: Number
    },

    // Score
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Additional Info
    isSuccessful: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for queries
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
