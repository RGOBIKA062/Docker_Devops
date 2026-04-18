import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validateCreateEvent, validateUpdateEvent, validateReview } from '../utils/eventValidators.js';
import {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  addToWishlist,
  removeFromWishlist,
  getUserEvents,
  getUserRegisteredEvents,
  updateEvent,
  deleteEvent,
  addReview,
  trackShare,
} from '../controllers/eventController.js';

const router = express.Router();

// PROTECTED ROUTES - Must come BEFORE /:id to avoid route conflicts
router.get('/user/events', authMiddleware, getUserEvents);
router.get('/user/registered', authMiddleware, getUserRegisteredEvents);

// PUBLIC ROUTES
router.get('/all', getAllEvents);
router.get('/:id', getEventById);

// PROTECTED ROUTES - Other protected endpoints
router.post('/create', authMiddleware, validateCreateEvent, createEvent);
router.post('/:eventId/register', authMiddleware, registerForEvent);
router.post('/:eventId/wishlist', authMiddleware, addToWishlist);
router.delete('/:eventId/wishlist', authMiddleware, removeFromWishlist);
router.put('/:eventId/update', authMiddleware, validateUpdateEvent, updateEvent);
router.delete('/:eventId/delete', authMiddleware, deleteEvent);
router.post('/:eventId/review', authMiddleware, validateReview, addReview);
router.post('/:eventId/track-share', authMiddleware, trackShare);

export default router;
