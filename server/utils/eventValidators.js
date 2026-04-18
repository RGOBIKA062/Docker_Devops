import { body } from 'express-validator';

/**
 * Event Validators - Input validation for all event endpoints
 */

// CREATE EVENT VALIDATION
const validateCreateEvent = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Event title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  
  body('eventType')
    .isIn(['Workshop', 'Hackathon', 'Conference', 'Webinar', 'Networking', 'Career Fair', 'Internship Drive', 'Placement Drive', 'Competition', 'Seminar', 'Training', 'Other'])
    .withMessage('Invalid event type'),
  
  body('category')
    .isIn(['AI/ML', 'Web Development', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Data Science', 'Blockchain', 'IoT', 'Robotics', 'Business', 'Marketing', 'Finance', 'Leadership', 'Entrepreneurship', 'Other'])
    .withMessage('Invalid category'),
  
  body('organizerName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Organizer name is required'),
  
  body('organizerEmail')
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  
  body('startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM format)'),
  
  body('endTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM format)'),
  
  body('locationType')
    .isIn(['Online', 'Offline', 'Hybrid'])
    .withMessage('Location type must be Online, Offline, or Hybrid'),
  
  body('totalCapacity')
    .isInt({ min: 1 })
    .withMessage('Total capacity must be at least 1'),
  
  body('pricingType')
    .isIn(['Free', 'Paid'])
    .withMessage('Pricing type must be Free or Paid'),
  
  body('bannerImage')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidUrl(value)) {
        throw new Error('Valid banner image URL is required');
      }
      return true;
    }),
];

// Helper function to validate URLs
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// UPDATE EVENT VALIDATION
const validateUpdateEvent = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Event title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
];

// REVIEW VALIDATION
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

export { validateCreateEvent, validateUpdateEvent, validateReview };
