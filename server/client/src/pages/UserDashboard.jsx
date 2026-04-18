import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManager } from '@/hooks/useUserManager';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  MapPin,
  Trash2,
  Eye,
  Plus,
  Heart,
  Users,
  Trophy,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('created');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ description: 'Please login first', variant: 'destructive' });
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  // Get user manager hook
  const userManager = useUserManager();
  const {
    getCreatedEvents,
    getRegisteredEvents,
    getWishlists,
    getReminders,
    removeFromWishlist,
    unregisterFromEvent,
    isInWishlist,
    hasReminder,
  } = userManager;

  const createdEvents = getCreatedEvents();
  const registeredEvents = getRegisteredEvents();
  const wishlists = getWishlists();
  const reminders = getReminders();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  const EventCard = ({ event, type }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-orange-300">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="w-32 h-24 rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 flex-shrink-0 overflow-hidden">
            {event.bannerImage || event.imageUrl ? (
              <img
                src={event.bannerImage || event.imageUrl}
                alt={event.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Eye className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-orange-600">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                  by {event.organizerName || event.organizer || 'Unknown'}
                </p>
              </div>
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {type === 'created' && 'Created by You'}
                {type === 'registered' && 'Registered'}
                {type === 'wishlisted' && '❤️ Saved'}
              </Badge>
            </div>

            {/* Info */}
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>{event.date || event.startDate?.slice(0, 10) || 'Date TBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span className="truncate">{event.location || event.city || 'Location TBA'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => navigate(`/event/${event.id || event._id}`)}
              className="bg-orange-500 hover:bg-orange-600 h-8 text-xs"
            >
              View
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>

            {type === 'wishlisted' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  removeFromWishlist(event.id || event._id);
                  toast({ description: 'Removed from wishlist' });
                }}
                className="h-8 text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove
              </Button>
            )}

            {type === 'registered' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  unregisterFromEvent(event.id || event._id);
                  toast({ description: 'Unregistered from event' });
                }}
                className="h-8 text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const EmptyState = ({ title, description, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="font-bold text-lg text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-orange-100">Manage your events, registrations, and wishlist</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Events Created</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{createdEvents.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Registered Events</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{registeredEvents.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Saved Events</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{wishlists.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Reminders Set</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{reminders.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 p-1">
            <TabsTrigger value="created" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              📌 Created ({createdEvents.length})
            </TabsTrigger>
            <TabsTrigger value="registered" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              ✅ Registered ({registeredEvents.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              ❤️ Saved ({wishlists.length})
            </TabsTrigger>
          </TabsList>

          {/* Created Events Tab */}
          <TabsContent value="created" className="mt-6">
            {createdEvents.length === 0 ? (
              <EmptyState
                title="No Events Created Yet"
                description="Create your first event to get started!"
                icon={Trophy}
              />
            ) : (
              <div className="space-y-4">
                {createdEvents.map((event) => (
                  <EventCard key={event.id || event._id} event={event} type="created" />
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/create-event')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
            </div>
          </TabsContent>

          {/* Registered Events Tab */}
          <TabsContent value="registered" className="mt-6">
            {registeredEvents.length === 0 ? (
              <EmptyState
                title="Not Registered Yet"
                description="Explore events and register to join them!"
                icon={Users}
              />
            ) : (
              <div className="space-y-4">
                {registeredEvents.map((event) => (
                  <EventCard key={event.id || event._id} event={event} type="registered" />
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/student')}
                variant="outline"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="mt-6">
            {wishlists.length === 0 ? (
              <EmptyState
                title="Wishlist is Empty"
                description="Save events you love to view them later!"
                icon={Heart}
              />
            ) : (
              <div className="space-y-4">
                {wishlists.map((event) => (
                  <EventCard key={event.id || event._id} event={event} type="wishlisted" />
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/student')}
                variant="outline"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Find Events
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
