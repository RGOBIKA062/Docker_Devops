import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import FiltersBar from '@/components/FiltersBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { eventsAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Globe, BookmarkPlus } from 'lucide-react';

/**
 * Student Feed Page - Professional Implementation
 * Shows both "All Events" and "My Events" (Created by user)
 * Senior Developer Grade with proper database integration
 */
const StudentFeed = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Tab State - Check URL for initial tab
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab); // 'all' | 'mine'
  
  // Refresh trigger for My Events (incremented after event creation)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // All Events State
  const [allEvents, setAllEvents] = useState([]);
  const [filteredAllEvents, setFilteredAllEvents] = useState([]);
  const [allEventsLoading, setAllEventsLoading] = useState(false);

  // My Events State
  const [myEvents, setMyEvents] = useState([]);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [myEventsCount, setMyEventsCount] = useState(0);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Handle tab changes and update URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Listen for URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
      // Trigger refresh of my events if coming from create-event
      if (tabParam === 'mine') {
        setRefreshTrigger(prev => prev + 1);
      }
    }
  }, [searchParams]);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch All Events
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'all') return;

    const fetchAllEvents = async () => {
      try {
        setAllEventsLoading(true);
        const response = await eventsAPI.getAllEvents();
        const eventsList = Array.isArray(response) 
          ? response 
          : response.data?.events || response.events || [];
        setAllEvents(eventsList);
        setFilteredAllEvents(eventsList);
      } catch (error) {
        console.error('Error fetching all events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again.',
          variant: 'destructive',
        });
        setAllEvents([]);
        setFilteredAllEvents([]);
      } finally {
        setAllEventsLoading(false);
      }
    };

    fetchAllEvents();
  }, [isAuthenticated, activeTab, toast]);

  // Fetch My Events (User Created)
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'mine') return;

    const fetchMyEvents = async () => {
      try {
        setMyEventsLoading(true);
        const response = await eventsAPI.getUserEvents();
        const eventsList = Array.isArray(response.events) 
          ? response.events 
          : [];
        setMyEvents(eventsList);
      } catch (error) {
        console.error('Error fetching my events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your events.',
          variant: 'destructive',
        });
        setMyEvents([]);
      } finally {
        setMyEventsLoading(false);
      }
    };

    fetchMyEvents();
  }, [isAuthenticated, activeTab, toast, refreshTrigger]);

  // Fetch My Events Count (Always runs when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMyEventsCount = async () => {
      try {
        const response = await eventsAPI.getUserEvents();
        const eventsList = Array.isArray(response.events) 
          ? response.events 
          : [];
        setMyEventsCount(eventsList.length);
      } catch (error) {
        console.error('Error fetching my events count:', error);
        setMyEventsCount(0);
      }
    };

    fetchMyEventsCount();
  }, [isAuthenticated, refreshTrigger]);

  // Apply filters and search to All Events
  useEffect(() => {
    let filtered = allEvents;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((event) =>
        activeFilters.some(
          (filter) =>
            event.category?.toLowerCase().includes(filter.toLowerCase()) ||
            event.tags?.some((tag) => tag.toLowerCase().includes(filter.toLowerCase()))
        )
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'trending') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.startDate || new Date()) - new Date(b.startDate || new Date()));
    }

    setFilteredAllEvents(filtered);
  }, [searchQuery, activeFilters, sortBy, allEvents]);

  // Render Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render All Events Tab Content
  const renderAllEventsTab = () => (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <FiltersBar 
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </motion.div>

      {allEventsLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredAllEvents.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-12 text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4 text-lg">No events found matching your criteria</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setActiveFilters([]);
              setSortBy('newest');
            }}>
              Reset Filters
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAllEvents.map((event, index) => (
            <motion.div
              key={event._id || event.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <EventCard 
                id={event._id || event.id}
                title={event.title}
                organizer={event.organizer?.organizerName || event.organizerName || "Unknown"}
                description={event.description}
                date={event.startDate ? new Date(event.startDate).toLocaleDateString() : "TBD"}
                time={event.startTime || "TBD"}
                location={event.location?.address || event.address || "TBD"}
                tags={event.tags || event.skillsRequired || []}
                imageUrl={event.bannerImage || event.imageUrl}
                attendees={event.registeredCount || 0}
                registrationUrl={event.registrationUrl}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  // Render My Events Tab Content
  const renderMyEventsTab = () => (
    <div>
      {myEventsLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : myEvents.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-12 text-center">
            <BookmarkPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4 text-lg">You haven't created any events yet</p>
            <Button onClick={() => navigate('/create-event')} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Event
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground mb-6">
            You have created {myEvents.length} event{myEvents.length !== 1 ? 's' : ''}
          </p>
          {myEvents.map((event, index) => (
            <motion.div
              key={event._id || event.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Event Image */}
                <div className="md:w-48 flex-shrink-0">
                  <img
                    src={event.bannerImage || 'https://via.placeholder.com/300x200?text=Event'}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Date TBD'}
                        {event.startTime && ` • ${event.startTime}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.isPublished 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {event.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-sm text-foreground mb-4 line-clamp-2">{event.description}</p>

                  {/* Event Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded p-2">
                      <div className="text-lg font-bold text-foreground">{event.registeredCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Registered</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded p-2">
                      <div className="text-lg font-bold text-foreground">{event.views || 0}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded p-2">
                      <div className="text-lg font-bold text-foreground">{event.totalCapacity || 0}</div>
                      <div className="text-xs text-muted-foreground">Capacity</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => navigate(`/event/${event._id}`)}
                    >
                      <Globe className="w-4 h-4" />
                      View Event
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate(`/edit-event/${event._id}`)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="gap-2"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          // TODO: Implement delete logic
                          toast({
                            title: 'Coming Soon',
                            description: 'Event deletion will be available soon',
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Events</h1>
              <p className="text-muted-foreground mt-1">Discover events or manage your created events</p>
            </div>
            <Button 
              onClick={() => navigate('/create-event')} 
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleTabChange('all')}
              className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="inline w-4 h-4 mr-2" />
              All Events
              <span className="ml-2 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-foreground">
                {allEvents.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('mine')}
              className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'mine'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookmarkPlus className="inline w-4 h-4 mr-2" />
              My Events
              <span className="ml-2 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-foreground">
                {myEventsCount}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'all' ? renderAllEventsTab() : renderMyEventsTab()}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentFeed;
