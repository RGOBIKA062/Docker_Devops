import { useState, useCallback } from 'react';

/**
 * Custom hook for managing user data including wishlists, reminders, and created events
 */
export const useUserManager = () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  // Get the current user ID (from localStorage or any other source)
  const getCurrentUserId = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 'anonymous_' + Math.random().toString(36).substr(2, 9);
    } catch {
      return 'anonymous_' + Math.random().toString(36).substr(2, 9);
    }
  }, []);

  const userId = getCurrentUserId();

  // Add event to wishlist
  const addToWishlist = useCallback((eventId, eventData) => {
    try {
      const wishlists = JSON.parse(localStorage.getItem(`wishlists_${userId}`) || '[]');
      const exists = wishlists.some(e => e.id === eventId || e._id === eventId);
      if (exists) return;

      const newWishlist = [...wishlists, { ...eventData, id: eventId }];
      localStorage.setItem(`wishlists_${userId}`, JSON.stringify(newWishlist));
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    }
  }, [userId]);

  // Remove from wishlist
  const removeFromWishlist = useCallback((eventId) => {
    try {
      const wishlists = JSON.parse(localStorage.getItem(`wishlists_${userId}`) || '[]');
      const filtered = wishlists.filter(e => e.id !== eventId && e._id !== eventId);
      localStorage.setItem(`wishlists_${userId}`, JSON.stringify(filtered));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  }, [userId]);

  // Check if event is in wishlist
  const isInWishlist = useCallback((eventId) => {
    try {
      const wishlists = JSON.parse(localStorage.getItem(`wishlists_${userId}`) || '[]');
      return wishlists.some(e => e.id === eventId || e._id === eventId);
    } catch {
      return false;
    }
  }, [userId]);

  // Add reminder for event
  const addReminder = useCallback((eventId, reminderData = {}) => {
    try {
      const reminders = JSON.parse(localStorage.getItem(`reminders_${userId}`) || '[]');
      const exists = reminders.some(r => r.eventId === eventId);
      if (exists) return;

      const newReminder = { eventId, ...reminderData, createdAt: new Date().toISOString() };
      const updated = [...reminders, newReminder];
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(updated));
    } catch (err) {
      console.error('Error adding reminder:', err);
    }
  }, [userId]);

  // Remove reminder
  const removeReminder = useCallback((eventId) => {
    try {
      const reminders = JSON.parse(localStorage.getItem(`reminders_${userId}`) || '[]');
      const filtered = reminders.filter(r => r.eventId !== eventId);
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(filtered));
    } catch (err) {
      console.error('Error removing reminder:', err);
    }
  }, [userId]);

  // Check if reminder exists
  const hasReminder = useCallback((eventId) => {
    try {
      const reminders = JSON.parse(localStorage.getItem(`reminders_${userId}`) || '[]');
      return reminders.some(r => r.eventId === eventId);
    } catch {
      return false;
    }
  }, [userId]);

  // Mark event as created by user
  const markEventAsCreated = useCallback((eventId, eventData) => {
    try {
      const createdEvents = JSON.parse(localStorage.getItem(`createdEvents_${userId}`) || '[]');
      const exists = createdEvents.some(e => e.id === eventId || e._id === eventId);
      if (exists) return;

      const newEvent = { ...eventData, id: eventId, createdAt: new Date().toISOString() };
      const updated = [...createdEvents, newEvent];
      localStorage.setItem(`createdEvents_${userId}`, JSON.stringify(updated));
    } catch (err) {
      console.error('Error marking event as created:', err);
    }
  }, [userId]);

  // Mark event as registered
  const markEventAsRegistered = useCallback((eventId, eventData) => {
    try {
      const registeredEvents = JSON.parse(localStorage.getItem(`registeredEvents_${userId}`) || '[]');
      const exists = registeredEvents.some(e => e.id === eventId || e._id === eventId);
      if (exists) return;

      const newEvent = { ...eventData, id: eventId, registeredAt: new Date().toISOString() };
      const updated = [...registeredEvents, newEvent];
      localStorage.setItem(`registeredEvents_${userId}`, JSON.stringify(updated));
    } catch (err) {
      console.error('Error marking event as registered:', err);
    }
  }, [userId]);

  // Unregister from event
  const unregisterFromEvent = useCallback((eventId) => {
    try {
      const registeredEvents = JSON.parse(localStorage.getItem(`registeredEvents_${userId}`) || '[]');
      const filtered = registeredEvents.filter(e => e.id !== eventId && e._id !== eventId);
      localStorage.setItem(`registeredEvents_${userId}`, JSON.stringify(filtered));
    } catch (err) {
      console.error('Error unregistering:', err);
    }
  }, [userId]);

  // Check if registered
  const isRegistered = useCallback((eventId) => {
    try {
      const registeredEvents = JSON.parse(localStorage.getItem(`registeredEvents_${userId}`) || '[]');
      return registeredEvents.some(e => e.id === eventId || e._id === eventId);
    } catch {
      return false;
    }
  }, [userId]);

  // Get all created events
  const getCreatedEvents = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(`createdEvents_${userId}`) || '[]');
    } catch {
      return [];
    }
  }, [userId]);

  // Get all registered events
  const getRegisteredEvents = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(`registeredEvents_${userId}`) || '[]');
    } catch {
      return [];
    }
  }, [userId]);

  // Get all wishlisted events
  const getWishlists = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(`wishlists_${userId}`) || '[]');
    } catch {
      return [];
    }
  }, [userId]);

  // Get all reminders
  const getReminders = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(`reminders_${userId}`) || '[]');
    } catch {
      return [];
    }
  }, [userId]);

  return {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addReminder,
    removeReminder,
    hasReminder,
    markEventAsCreated,
    markEventAsRegistered,
    unregisterFromEvent,
    isRegistered,
    getCreatedEvents,
    getRegisteredEvents,
    getWishlists,
    getReminders
  };
};
