/**
 * PROBLEM MODEL - Competitive Programming Problems
 * Stores coding problems with test cases and submission tracking
 */

import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, 'Problem description is required']
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Medium'
    },
    category: {
      type: String,
      enum: ['Array', 'String', 'Tree', 'Graph', 'DP', 'Greedy', 'Math', 'Other'],
      required: true
    },
    tags: [String],

    // Problem Details
    problemStatement: {
      type: String,
      required: true
    },
    constraints: [String],
    examples: [{
      input: String,
      output: String,
      explanation: String
    }],
    notes: [String],

    // Language Support
    supportedLanguages: {
      type: [String],
      default: ['JavaScript', 'Python', 'Java', 'C++'],
      enum: ['JavaScript', 'Python', 'Java', 'C++']
    },

    // Starter Code
    starterCode: {
      javascript: String,
      python: String,
      java: String,
      cpp: String
    },

    // Time & Space Complexity
    timeComplexity: {
      optimal: String,
      bruteForce: String
    },
    spaceComplexity: String,

    // Meta Information
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    difficulty_score: Number,
    acceptance_rate: {
      type: Number,
      default: 0
    },
    submissions: {
      total: {
        type: Number,
        default: 0
      },
      accepted: {
        type: Number,
        default: 0
      }
    },

    // Flags
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
problemSchema.index({ difficulty: 1, category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ isActive: 1 });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
