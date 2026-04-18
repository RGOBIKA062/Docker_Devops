/**
 * TEST CASE MODEL - Test Cases for Problems
 * Stores test cases with expected outputs for validation
 */

import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    // Reference to Problem
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Problem ID is required']
    },

    // Test Case Data
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Test case input is required']
    },
    expectedOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Expected output is required']
    },

    // Type
    type: {
      type: String,
      enum: ['sample', 'hidden'],
      default: 'sample'
    },

    // Visibility
    isVisible: {
      type: Boolean,
      default: true
    },

    // Metadata
    explanation: String,
    timeLimit: {
      type: Number,
      default: 5000 // milliseconds
    },
    memoryLimit: {
      type: Number,
      default: 256 // MB
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
testCaseSchema.index({ problemId: 1, type: 1 });
testCaseSchema.index({ problemId: 1, isVisible: 1 });

const TestCase = mongoose.model('TestCase', testCaseSchema);

export default TestCase;
