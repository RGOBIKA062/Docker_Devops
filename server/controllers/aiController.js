import Faculty from '../models/Faculty.js';
import Event from '../models/Event.js';
import GroqAIService from '../services/groqAIService.js';
import logger from '../utils/logger.js';

/**
 * AI-POWERED FACULTY CONTROLLER
 * Extraordinary features: Smart recommendations, predictive analytics, intelligent search
 */

export const aiGetSmartRecommendations = async (req, res) => {
  try {
    const { facultyId } = req.params;
    logger.info(`Fetching smart recommendations for faculty: ${facultyId}`);

    // Get faculty profile
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Get all available events
    const allEvents = await Event.find({ facultyId: { $ne: facultyId } })
      .sort({ createdAt: -1 })
      .limit(20);

    if (allEvents.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: { recommendations: [], message: 'No events available' } 
      });
    }

    // Get AI recommendations
    const recommendations = await GroqAIService.recommendEvents(faculty, allEvents);

    // Enrich with event details
    const enrichedRecommendations = recommendations.recommendations
      .map(rec => ({
        ...rec,
        event: allEvents[rec.eventIndex],
      }))
      .filter(rec => rec.event)
      .sort((a, b) => b.matchScore - a.matchScore);

    logger.info(`Generated ${enrichedRecommendations.length} recommendations`);

    res.status(200).json({
      success: true,
      data: enrichedRecommendations,
      message: 'Smart recommendations generated',
    });
  } catch (error) {
    logger.error('Error fetching smart recommendations:', error);
    res.status(500).json({ success: false, message: 'Error generating recommendations', error: error.message });
  }
};

export const aiGenerateEventDescription = async (req, res) => {
  try {
    const { topic, targetAudience = 'Faculty & Students' } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    logger.info(`Generating description for topic: ${topic}`);

    const description = await GroqAIService.generateEventDescription(topic, targetAudience);

    res.status(200).json({
      success: true,
      data: { description },
      message: 'Description generated successfully',
    });
  } catch (error) {
    logger.error('Error generating description:', error);
    res.status(500).json({ success: false, message: 'Error generating description', error: error.message });
  }
};

export const aiPredictEventSuccess = async (req, res) => {
  try {
    const { eventId } = req.params;
    logger.info(`Predicting success for event: ${eventId}`);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const prediction = await GroqAIService.predictEventSuccess(event);

    res.status(200).json({
      success: true,
      data: prediction,
      message: 'Event success prediction generated',
    });
  } catch (error) {
    logger.error('Error predicting event success:', error);
    res.status(500).json({ success: false, message: 'Error predicting success', error: error.message });
  }
};

export const aiSemanticSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    logger.info(`Performing semantic search: ${query}`);

    // Get all events
    const allEvents = await Event.find().limit(50);

    // Perform semantic search
    const searchResults = await GroqAIService.semanticSearch(query, allEvents);

    // Get detailed event info
    const relevantEvents = searchResults.relevant_indices
      .map(idx => allEvents[idx])
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        searchIntent: searchResults.search_intent,
        events: relevantEvents,
        count: relevantEvents.length,
      },
      message: `Found ${relevantEvents.length} relevant events`,
    });
  } catch (error) {
    logger.error('Error in semantic search:', error);
    res.status(500).json({ success: false, message: 'Error in search', error: error.message });
  }
};

export const aiAnalyzeAttendancePatterns = async (req, res) => {
  try {
    const { facultyId } = req.params;
    logger.info(`Analyzing attendance patterns for faculty: ${facultyId}`);

    const events = await Event.find({ facultyId }).select('title registrations attended');

    const patterns = await GroqAIService.analyzeAttendancePatterns(events);

    res.status(200).json({
      success: true,
      data: patterns,
      message: 'Attendance patterns analyzed',
    });
  } catch (error) {
    logger.error('Error analyzing attendance patterns:', error);
    res.status(500).json({ success: false, message: 'Error analyzing patterns', error: error.message });
  }
};

export const aiGenerateMarketingCopy = async (req, res) => {
  try {
    const { eventId, targetAudience = 'Students' } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    logger.info(`Generating marketing copy for event: ${eventId}`);

    const marketingCopy = await GroqAIService.generateMarketingCopy(event, targetAudience);

    res.status(200).json({
      success: true,
      data: { marketingCopy },
      message: 'Marketing copy generated',
    });
  } catch (error) {
    logger.error('Error generating marketing copy:', error);
    res.status(500).json({ success: false, message: 'Error generating copy', error: error.message });
  }
};

export const aiGenerateEventInsights = async (req, res) => {
  try {
    const { eventId } = req.params;
    logger.info(`Generating insights for event: ${eventId}`);

    const event = await Event.findById(eventId).populate('feedback');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const insights = await GroqAIService.generateEventInsights(event.feedback || []);

    res.status(200).json({
      success: true,
      data: insights,
      message: 'Event insights generated',
    });
  } catch (error) {
    logger.error('Error generating event insights:', error);
    res.status(500).json({ success: false, message: 'Error generating insights', error: error.message });
  }
};

export const aiGetCollaborativeScheduling = async (req, res) => {
  try {
    const { facultyIds, preferredDate, duration = 2 } = req.body;

    if (!facultyIds || facultyIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Faculty IDs required' });
    }

    logger.info(`Generating collaborative schedule for ${facultyIds.length} faculty`);

    // Get availability for each faculty
    const faculties = await Faculty.find({ _id: { $in: facultyIds } });
    const events = await Event.find({
      facultyId: { $in: facultyIds },
      startDate: { $gte: new Date(preferredDate) }
    }).sort({ startDate: 1 });

    // Calculate available slots (simple algorithm - can be enhanced with AI)
    const availableSlots = generateAvailableSlots(preferredDate, duration, events);

    res.status(200).json({
      success: true,
      data: {
        faculties,
        suggestedSlots: availableSlots.slice(0, 5),
      },
      message: 'Collaborative scheduling suggestions generated',
    });
  } catch (error) {
    logger.error('Error in collaborative scheduling:', error);
    res.status(500).json({ success: false, message: 'Error generating schedule', error: error.message });
  }
};

// Helper function for collaborative scheduling
function generateAvailableSlots(baseDate, duration, busyEvents) {
  const slots = [];
  const date = new Date(baseDate);

  for (let i = 0; i < 7; i++) {
    for (let hour = 9; hour <= 17 - duration; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hour + duration, 0, 0, 0);

      // Check if slot conflicts with any event
      const hasConflict = busyEvents.some(event => 
        new Date(event.startDate) <= slotEnd && new Date(event.endDate) >= slotStart
      );

      if (!hasConflict) {
        slots.push({
          date: slotStart.toISOString().split('T')[0],
          time: `${hour}:00 - ${hour + duration}:00`,
          capacity: 50,
        });
      }
    }

    date.setDate(date.getDate() + 1);
  }

  return slots;
}

export default {
  aiGetSmartRecommendations,
  aiGenerateEventDescription,
  aiPredictEventSuccess,
  aiSemanticSearch,
  aiAnalyzeAttendancePatterns,
  aiGenerateMarketingCopy,
  aiGenerateEventInsights,
  aiGetCollaborativeScheduling,
};
