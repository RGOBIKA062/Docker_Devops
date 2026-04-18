import express from 'express';
import {
  aiGetSmartRecommendations,
  aiGenerateEventDescription,
  aiPredictEventSuccess,
  aiSemanticSearch,
  aiAnalyzeAttendancePatterns,
  aiGenerateMarketingCopy,
  aiGenerateEventInsights,
  aiGetCollaborativeScheduling,
} from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * AI-POWERED ROUTES
 * Extraordinary features: Smart recommendations, predictive analytics, semantic search
 */

// AI Recommendations
router.get('/smart-recommendations/:facultyId', authMiddleware, aiGetSmartRecommendations);

// Auto-generate descriptions
router.post('/generate-description', authMiddleware, aiGenerateEventDescription);

// Predict event success
router.get('/predict-success/:eventId', authMiddleware, aiPredictEventSuccess);

// Semantic search with NLP
router.get('/semantic-search', authMiddleware, aiSemanticSearch);

// Attendance analytics
router.get('/attendance-patterns/:facultyId', authMiddleware, aiAnalyzeAttendancePatterns);

// Marketing copy generation
router.post('/generate-marketing-copy', authMiddleware, aiGenerateMarketingCopy);

// Event feedback insights
router.get('/event-insights/:eventId', authMiddleware, aiGenerateEventInsights);

// Collaborative scheduling
router.post('/collaborative-scheduling', authMiddleware, aiGetCollaborativeScheduling);

export default router;
