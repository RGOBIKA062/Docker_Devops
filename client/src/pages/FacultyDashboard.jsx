import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Plus, Users, Calendar, BookOpen, BarChart3, Eye, Star, Search, 
  Edit, Trash2, TrendingUp, CheckCircle, AlertCircle, Download
} from 'lucide-react';

/**
 * FACULTY DASHBOARD - PRODUCTION GRADE V2
 * Complete faculty portal with event management, analytics, and search
 */
const FacultyDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Faculty Data
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [featuredFaculty, setFeaturedFaculty] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [mentorStats, setMentorStats] = useState(null);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState('all');

  // UI State
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestResponseDialog, setShowRequestResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    eventType: 'Workshop',
    category: 'Other',
    skillLevel: 'All Levels',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    organizationType: 'Individual',
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '11:00',
    timezone: 'IST',
    locationType: 'Online',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    venue: '',
    meetingLink: '',
    totalCapacity: 100,
    pricingType: 'Free',
    pricingAmount: 0,
    earlyBirdEnabled: false,
    earlyBirdPercentage: 0,
    earlyBirdEndDate: '',
    bannerImage: '',
    tags: '',
    skillsOffered: '',
    skillsRequired: '',
    targetBatch: '',
    targetRole: '',
    speakers: [],
    hasCertificate: false,
    hasJobOpportunity: false,
    hasPrizePool: false,
    prizeAmount: 0,
    hasQA: false,
    hasRecording: false,
    hasMaterials: false,
    materialsUrl: '',
    hasLiveChat: false,
    hasGiveaways: false,
    agenda: [],
    faq: [],
    requirements: [],
    deliverables: [],
  });

  // Authentication Check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch Faculty Profile
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        // Fetch profile
        const profileRes = await fetch('http://localhost:5000/api/faculty/profile', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        const profileData = await profileRes.json();

        if (profileData.success) {
          setFacultyProfile(profileData.data);
        }

        // Fetch statistics
        const statsRes = await fetch('http://localhost:5000/api/faculty/statistics', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        const statsData = await statsRes.json();

        if (statsData.success) {
          setStatistics(statsData.data);
        }

        // Fetch my events
        const eventsRes = await fetch('http://localhost:5000/api/faculty/my-events', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        const eventsData = await eventsRes.json();

        if (eventsData.success) {
          setMyEvents(eventsData.data);
        }

        // Fetch mentor profile
        try {
          const mentorRes = await fetch('http://localhost:5000/api/mentors/profile/me', {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          const mentorData = await mentorRes.json();

          if (mentorData.success && mentorData.mentor) {
            setMentorProfile(mentorData.mentor);
          }
        } catch (mentorError) {
          // Mentor profile doesn't exist yet, which is fine
          console.log('No mentor profile yet');
        }

        // Calculate mentor stats from requests
        try {
          const requestsRes = await fetch('http://localhost:5000/api/mentors/faculty-requests', {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          const requestsData = await requestsRes.json();

          if (requestsData.success && Array.isArray(requestsData.data)) {
            const activeMentees = requestsData.data.filter(req => req.status === 'accepted').length;
            const pendingRequests = requestsData.data.filter(req => req.status === 'pending').length;
            
            setMentorStats({
              activeMentees: activeMentees,
              pendingRequests: pendingRequests,
              completedSessions: 0,
              averageRating: 'N/A',
              totalEarnings: 0,
            });
            
            setMentorRequests(requestsData.data);
          }
        } catch (requestsError) {
          console.log('No mentor requests yet');
          setMentorStats({
            activeMentees: 0,
            pendingRequests: 0,
            completedSessions: 0,
            averageRating: 'N/A',
            totalEarnings: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load faculty data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [isAuthenticated, user, toast]);

  // Fetch event participants
  const fetchEventParticipants = async (eventId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const res = await fetch(`http://localhost:5000/api/faculty/events/${eventId}/registrations`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();

      if (data.success) {
        setEventParticipants(data.data);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load participants',
        variant: 'destructive',
      });
    }
  };

  // Search Events
  const handleSearchEvents = async () => {
    try {
      let url = `http://localhost:5000/api/faculty/search-events?`;
      if (searchQuery) url += `query=${searchQuery}&`;
      if (searchCategory) url += `category=${searchCategory}&`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setSearchResults(data.data);
        toast({
          title: 'Success',
          description: `Found ${data.count} events`,
        });
      }
    } catch (error) {
      console.error('Error searching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to search events',
        variant: 'destructive',
      });
    }
  };

  // Fetch Featured Faculty
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/faculty/featured');
        const data = await res.json();
        if (data.success) {
          setFeaturedFaculty(data.data);
        }
      } catch (error) {
        console.error('Error fetching featured faculty:', error);
      }
    };

    fetchFeatured();
  }, []);

  // Create Event
  const handleCreateEvent = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || 
          !formData.eventType || !formData.category || !formData.organizerName || !formData.organizationType ||
          !formData.startTime || !formData.endTime || !formData.locationType) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const res = await fetch('http://localhost:5000/api/faculty/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Event created successfully',
        });
        setShowCreateModal(false);
        // Reset form to defaults
        setFormData({
          title: '',
          description: '',
          shortDescription: '',
          eventType: 'Workshop',
          category: 'Other',
          skillLevel: 'All Levels',
          organizerName: '',
          organizerEmail: '',
          organizerPhone: '',
          organizationType: 'Individual',
          startDate: '',
          endDate: '',
          startTime: '10:00',
          endTime: '11:00',
          timezone: 'IST',
          locationType: 'Online',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          venue: '',
          meetingLink: '',
          totalCapacity: 100,
          pricingType: 'Free',
          pricingAmount: 0,
          earlyBirdEnabled: false,
          earlyBirdPercentage: 0,
          earlyBirdEndDate: '',
          bannerImage: '',
          tags: '',
          skillsOffered: '',
          skillsRequired: '',
          targetBatch: '',
          targetRole: '',
          speakers: [],
          hasCertificate: false,
          hasJobOpportunity: false,
          hasPrizePool: false,
          prizeAmount: 0,
          hasQA: false,
          hasRecording: false,
          hasMaterials: false,
          materialsUrl: '',
          hasLiveChat: false,
          hasGiveaways: false,
          agenda: [],
          faq: [],
          requirements: [],
          deliverables: [],
        });
        // Refresh events
        const eventsRes = await fetch('http://localhost:5000/api/faculty/my-events', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        const eventsData = await eventsRes.json();
        if (eventsData.success) setMyEvents(eventsData.data);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create event',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  // Handle banner image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select a valid image file',
          variant: 'destructive',
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          bannerImage: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const res = await fetch(`http://localhost:5000/api/faculty/events/${eventId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Event deleted successfully',
        });
        setMyEvents(myEvents.filter(e => e._id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  // Mark Attendance
  const handleMarkAttendance = async (eventId, userId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const newStatus = status === 'Attended' ? 'Registered' : 'Attended';
      
      const res = await fetch(`http://localhost:5000/api/faculty/events/${eventId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Attendance updated',
        });
        fetchEventParticipants(eventId);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update attendance',
        variant: 'destructive',
      });
    }
  };

  // Handle Accept Mentor Request
  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token');

      const res = await fetch(`http://localhost:5000/api/mentors/faculty-request/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: responseMessage }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Request accepted!',
        });
        setMentorRequests(mentorRequests.map(r => 
          r._id === requestId ? { ...r, status: 'accepted' } : r
        ));
        setShowRequestResponseDialog(false);
        setResponseMessage('');
        setSelectedRequest(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive',
      });
    }
  };

  // Handle Reject Mentor Request
  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token');

      const res = await fetch(`http://localhost:5000/api/mentors/faculty-request/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: responseMessage }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Request rejected',
        });
        setMentorRequests(mentorRequests.map(r => 
          r._id === requestId ? { ...r, status: 'rejected' } : r
        ));
        setShowRequestResponseDialog(false);
        setResponseMessage('');
        setSelectedRequest(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Faculty Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Faculty Portal
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {facultyProfile?.fullName || 'Faculty'}! • {facultyProfile?.designation}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
              <Button
                onClick={() => setShowSearchModal(true)}
                variant="outline"
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Search Events
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.totalEventsCreated}</p>
                </div>
                <BookOpen className="w-8 h-8 text-indigo-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Registrations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.totalRegistrations}</p>
                </div>
                <Users className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Attendance Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.averageAttendanceRate}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.averageRating} ⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full bg-white shadow-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="mentoring">Mentoring</TabsTrigger>
            <TabsTrigger value="requests">
              Requests {mentorRequests.length > 0 && `(${mentorRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Upcoming Events</span>
                    <span className="font-bold text-indigo-600">{statistics?.upcomingEvents || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Completed Events</span>
                    <span className="font-bold text-green-600">{statistics?.completedEvents || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Total Attendees</span>
                    <span className="font-bold text-blue-600">{statistics?.totalAttendees || 0}</span>
                  </div>
                </div>
              </Card>

              {/* Profile Card */}
              {facultyProfile && (
                <Card className="p-6 bg-white border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Department:</strong> {facultyProfile.department || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><strong>Experience:</strong> {facultyProfile.yearsOfExperience} years</p>
                    <p className="text-sm text-gray-600"><strong>Bio:</strong> {facultyProfile.bio}</p>
                  </div>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* My Events Tab */}
          <TabsContent value="events" className="mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {myEvents.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-gray-200">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">No events created yet</p>
                  <Button onClick={() => setShowCreateModal(true)} className="mt-4">Create First Event</Button>
                </Card>
              ) : (
                myEvents.map((event, idx) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-6 bg-white border border-gray-200 hover:shadow-lg transition">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{event.description?.substring(0, 100)}...</p>
                          <div className="flex gap-4 mt-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.registrations?.length || 0} registered
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {event.views || 0} views
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                              fetchEventParticipants(event._id);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </TabsContent>

          {/* Mentoring Tab */}
          <TabsContent value="mentoring" className="mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Show Mentor Profile if exists */}
              {mentorProfile ? (
                <>
                  {/* Mentor Profile Header */}
                  <Card className="p-8 bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">✅ Your Mentor Profile is Live!</h2>
                        <p className="text-indigo-100 mb-4">Your profile is visible to students looking for mentors</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-white text-indigo-600 font-bold">
                            {mentorProfile.yearsOfExperience}+ Years
                          </Badge>
                          <Badge className="bg-white text-indigo-600 font-bold">
                            {mentorProfile.skills?.length || 0} Skills
                          </Badge>
                          <Badge className="bg-white text-indigo-600 font-bold">
                            Rating: {mentorProfile.averageRating?.toFixed(1) || 'N/A'}⭐
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/mentor-setup')}
                        variant="outline"
                        className="bg-white text-indigo-600 hover:bg-gray-100 border-white"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </Card>

                  {/* Mentor Profile Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Profile Info */}
                    <div className="lg:col-span-2">
                      <Card className="p-8 bg-white border border-gray-200">
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{mentorProfile.professionalTitle}</h3>
                          <p className="text-gray-600 mb-4">{mentorProfile.currentCompany && `at ${mentorProfile.currentCompany}`}</p>
                          <p className="text-gray-700 mb-4">{mentorProfile.professionalBio}</p>
                        </div>

                        {/* Skills */}
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-900 mb-3">🎯 Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentorProfile.skills?.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                                {typeof skill === 'string' ? skill : skill.skillName}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Industries */}
                        {mentorProfile.industries?.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-bold text-gray-900 mb-3">🏢 Industries</h4>
                            <div className="flex flex-wrap gap-2">
                              {mentorProfile.industries.map((industry, idx) => (
                                <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                                  {industry}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pricing Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <h4 className="font-bold text-gray-900 mb-3">💰 Mentorship Model</h4>
                          <p className="text-gray-700 font-semibold">
                            {mentorProfile.pricingType === 'free' ? '🎁 Free Mentorship' : '💎 Paid Mentorship'}
                          </p>
                          {mentorProfile.pricingType === 'paid' && mentorProfile.mentorshipTypes?.oneOnOne?.ratePerHour && (
                            <p className="text-gray-600 mt-2">
                              ₹{mentorProfile.mentorshipTypes.oneOnOne.ratePerHour}/hour for 1-on-1 sessions
                            </p>
                          )}
                        </div>

                        {/* Contact Links */}
                        <div className="flex gap-3">
                          {mentorProfile.linkedinProfile && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={mentorProfile.linkedinProfile} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                              </a>
                            </Button>
                          )}
                          {mentorProfile.githubProfile && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={mentorProfile.githubProfile} target="_blank" rel="noopener noreferrer">
                                GitHub
                              </a>
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* Analytics Card */}
                    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                      <h3 className="font-bold text-gray-900 mb-4">📊 Your Stats</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-xs text-gray-600 mb-1">Active Mentees</p>
                          <p className="text-3xl font-bold text-indigo-600">{mentorStats?.activeMentees || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-xs text-gray-600 mb-1">Pending Requests</p>
                          <p className="text-3xl font-bold text-purple-600">{mentorStats?.pendingRequests || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-xs text-gray-600 mb-1">Sessions Completed</p>
                          <p className="text-3xl font-bold text-green-600">{mentorStats?.completedSessions || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-xs text-gray-600 mb-1">Total Earnings</p>
                          <p className="text-3xl font-bold text-green-700">₹{mentorStats?.totalEarnings || 0}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Pending Requests Section */}
                  <Card className="p-8 bg-white border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📥 Mentorship Requests ({mentorStats?.pendingRequests || 0})</h3>
                    {mentorStats?.pendingRequests > 0 ? (
                      <p className="text-gray-600">You have {mentorStats.pendingRequests} pending mentorship requests. View them on the mentor dashboard.</p>
                    ) : (
                      <p className="text-gray-600">No pending requests yet. When students request mentorship, they'll appear here.</p>
                    )}
                  </Card>
                </>
              ) : (
                <>
                  {/* Setup Mentor Profile Card - Show when no profile exists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Become a Mentor</h3>
                          <p className="text-gray-600 text-sm">Create your mentor profile and start mentoring students</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center py-8">
                          <BookOpen className="w-12 h-12 text-indigo-600" />
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/mentor-setup')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Mentor Profile
                      </Button>
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">👥 My Mentees</h3>
                          <p className="text-gray-600 text-sm">View and manage your mentorship relationships</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center py-8">
                          <Users className="w-12 h-12 text-green-600" />
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                        disabled
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Mentees (Coming Soon)
                      </Button>
                    </Card>
                  </div>

                  <Card className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Why Become a Mentor?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Help students achieve their career goals</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Earn additional income with flexible hours</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Build your professional reputation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Get featured on our platform leaderboard</span>
                      </li>
                    </ul>
                  </Card>
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* Featured Faculty Tab */}
          <TabsContent value="featured" className="mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredFaculty.length === 0 ? (
                  <Card className="p-12 text-center bg-white border border-gray-200 md:col-span-2 lg:col-span-3">
                    <p className="text-gray-600 font-medium">No featured faculty available</p>
                  </Card>
                ) : (
                  featuredFaculty.map((faculty) => (
                    <motion.div
                      key={faculty._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 hover:shadow-lg transition cursor-pointer">
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-gray-900">{faculty.fullName}</h4>
                          <p className="text-sm text-gray-600">{faculty.designation}</p>
                          <p className="text-xs text-gray-500 mt-1">{faculty.department}</p>
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">{faculty.averageRating}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-3 line-clamp-2">{faculty.bio}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Mentor Requests Tab */}
          <TabsContent value="requests" className="mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'accepted', 'rejected'].map(filter => (
                  <Button
                    key={filter}
                    onClick={() => setRequestFilter(filter)}
                    variant={requestFilter === filter ? 'default' : 'outline'}
                    className={requestFilter === filter ? 'bg-indigo-600' : ''}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Requests List */}
              <div className="space-y-4">
                {mentorRequests.length === 0 ? (
                  <Card className="p-12 text-center bg-white border border-gray-200">
                    <p className="text-gray-600 font-medium">No mentor requests yet</p>
                    <p className="text-sm text-gray-500 mt-2">Students will see your profile and send requests</p>
                  </Card>
                ) : (
                  mentorRequests
                    .filter(req => requestFilter === 'all' || req.status === requestFilter)
                    .map((request) => (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-indigo-600">
                                    {request.studentName?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{request.studentName}</h4>
                                  <p className="text-sm text-gray-600">
                                    Requested {new Date(request.requestedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <p className="text-gray-700 mb-4">{request.message}</p>

                              {request.skills?.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Skills:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {request.skills.map((skill, idx) => (
                                      <Badge key={idx} variant="secondary">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              <Badge className={
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {request.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          {/* Action Buttons - Only for Pending */}
                          {request.status === 'pending' && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                              <Button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRequestResponseDialog(true);
                                  setResponseMessage('');
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                Accept Request
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRequestResponseDialog(true);
                                  setResponseMessage('');
                                }}
                                variant="destructive"
                                className="flex-1"
                              >
                                Reject Request
                              </Button>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    ))
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Event Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Fill in event details - fields marked with * are required</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                placeholder="Enter event description (min 20 characters)"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Event Type & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Conference">Conference</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Training">Training</option>
                  <option value="Networking">Networking</option>
                  <option value="Career Fair">Career Fair</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="AI/ML">AI/ML</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Organizer Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Organizer Name *</label>
                <input
                  type="text"
                  name="organizerName"
                  placeholder="Your name or organization"
                  value={formData.organizerName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Organizer Type *</label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Individual">Individual</option>
                  <option value="Club">Club</option>
                  <option value="Company">Company</option>
                  <option value="College">College</option>
                  <option value="NGO">NGO</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location Type *</label>
              <select
                name="locationType"
                value={formData.locationType}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Conditional: Meeting Link for Online */}
            {(formData.locationType === 'Online' || formData.locationType === 'Hybrid') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Meeting Link {formData.locationType === 'Online' ? '*' : '(optional)'}
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={formData.meetingLink}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Conditional: Venue for Offline */}
            {(formData.locationType === 'Offline' || formData.locationType === 'Hybrid') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
                <input
                  type="text"
                  name="venue"
                  placeholder="Event venue name and address"
                  value={formData.venue}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Participants</label>
              <input
                type="number"
                name="totalCapacity"
                placeholder="100"
                value={formData.totalCapacity}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Banner Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Image (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {formData.bannerImage && (
                  <div className="text-green-600 text-sm font-semibold">✓ Image selected</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 5MB. Supported: JPG, PNG, GIF, WebP</p>
              {formData.bannerImage && formData.bannerImage.startsWith('data:') && (
                <div className="mt-2 relative">
                  <img 
                    src={formData.bannerImage} 
                    alt="Banner preview" 
                    className="h-20 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pricing Type</label>
                <select
                  name="pricingType"
                  value={formData.pricingType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {formData.pricingType === 'Paid' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (INR)</label>
                  <input
                    type="number"
                    name="pricingAmount"
                    placeholder="500"
                    value={formData.pricingAmount}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Features</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasCertificate"
                    checked={formData.hasCertificate}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Certificate</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasJobOpportunity"
                    checked={formData.hasJobOpportunity}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Job Opportunities</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasRecording"
                    checked={formData.hasRecording}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Recording Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasMaterials"
                    checked={formData.hasMaterials}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Study Materials</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleCreateEvent} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                Create Event
              </Button>
              <Button onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Events Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Events on AllCollegeEvents</DialogTitle>
            <DialogDescription>Find events by title, category, location, or date</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Search Query</label>
              <input
                type="text"
                placeholder="Enter event name, title, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Conference">Conference</option>
                <option value="Webinar">Webinar</option>
                <option value="Training">Training</option>
              </select>
            </div>

            <Button onClick={handleSearchEvents} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>

            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                <p className="text-sm font-semibold text-gray-700">{searchResults.length} events found</p>
                {searchResults.map((event) => (
                  <div key={event._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 cursor-pointer">
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{event.description?.substring(0, 60)}...</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                      <span>{event.category}</span>
                      <span>{event.registrations?.length || 0} registered</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={() => setShowSearchModal(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Response Dialog */}
      <Dialog open={showRequestResponseDialog} onOpenChange={setShowRequestResponseDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedRequest?.status === 'accepted' ? 'Accept' : 'Reject'} Mentor Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Student Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">From:</p>
              <p className="font-bold text-gray-900">{selectedRequest?.studentName}</p>
              <p className="text-sm text-gray-700 mt-2">"{selectedRequest?.message}"</p>
            </div>

            {/* Response Message */}
            <div>
              <Label className="font-semibold text-gray-900">
                {selectedRequest?.status === 'accepted' ? 'Acceptance Message' : 'Rejection Reason'}
              </Label>
              <p className="text-sm text-gray-600 mb-2">Optional - Share your response with the student</p>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={selectedRequest?.status === 'accepted' ? 'E.g., Great! I\'d love to mentor you. Let\'s schedule a meeting...' : 'E.g., I\'m currently at capacity...'}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => setShowRequestResponseDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest?.status === 'pending') {
                  handleAcceptRequest(selectedRequest._id);
                } else {
                  handleRejectRequest(selectedRequest._id);
                }
                setShowRequestResponseDialog(false);
              }}
              className={selectedRequest?.status === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {selectedRequest?.status === 'pending' ? 'Confirm' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FacultyDashboard;
