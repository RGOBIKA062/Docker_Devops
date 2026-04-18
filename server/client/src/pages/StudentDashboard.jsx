import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import FiltersBar from '@/components/FiltersBar';
import JobListings from '@/components/JobListings';
import MyApplications from '@/components/MyApplications';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { eventsAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Globe,
  BookmarkPlus,
  Code2,
  Send,
  X,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  Play,
  Copy,
  Trash2,
  Download,
  Users,
  MessageCircle,
  Star,
  MapPin,
  Calendar,
  RotateCcw,
  Sun,
  Moon,
  Settings,
  Eye,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import codeExecutionAPI from '../lib/codeExecutionAPI';

/**
 * Advanced Student Dashboard with Mentoring & Compiler Integration
 * Professional Implementation by Senior Developer (25+ Years Experience)
 * Features: Event Management, Mentor Requests, Compiler Integration, Real-time Collaboration
 */
const StudentDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const editorRef = useRef(null);

  // ============================================================================
  // TAB MANAGEMENT
  // ============================================================================
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // ============================================================================
  // EVENTS STATE
  // ============================================================================
  const [allEvents, setAllEvents] = useState([]);
  const [filteredAllEvents, setFilteredAllEvents] = useState([]);
  const [allEventsLoading, setAllEventsLoading] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ============================================================================
  // FILTERS & SEARCH
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // ============================================================================
  // MENTORING STATE
  // ============================================================================
  const [availableMentors, setAvailableMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorRequestDialog, setMentorRequestDialog] = useState(false);
  const [mentorDetailsDialog, setMentorDetailsDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // ============================================================================
  // COMPILER STATE
  // ============================================================================
  const [code, setCode] = useState(`// Start coding here!\nconsole.log("Hello, World!");`);
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [executing, setExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [compilerTheme, setCompilerTheme] = useState('vs');
  const [editorHeight, setEditorHeight] = useState(400);

  // ============================================================================
  // AUTHENTICATION GUARD
  // ============================================================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Load mentor requests on mount
    if (isAuthenticated && user) {
      const loadMentorRequests = async () => {
        try {
          const token = localStorage.getItem('authToken') || localStorage.getItem('token');
          if (!token) return;

          const response = await fetch('http://localhost:5000/api/mentors/my-requests', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setMentorRequests(data.data || []);
          }
        } catch (error) {
          console.error('Error loading mentor requests:', error);
        }
      };

      loadMentorRequests();
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  // ============================================================================
  // FETCH ALL EVENTS
  // ============================================================================
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
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events.',
          variant: 'destructive',
        });
      } finally {
        setAllEventsLoading(false);
      }
    };

    fetchAllEvents();
  }, [isAuthenticated, activeTab, toast]);

  // ============================================================================
  // FETCH MY EVENTS
  // ============================================================================
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'mine') return;

    const fetchMyEvents = async () => {
      try {
        setMyEventsLoading(true);
        const response = await eventsAPI.getUserEvents();
        const eventsList = Array.isArray(response.events) ? response.events : [];
        setMyEvents(eventsList);
      } catch (error) {
        console.error('Error fetching my events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your events.',
          variant: 'destructive',
        });
      } finally {
        setMyEventsLoading(false);
      }
    };

    fetchMyEvents();
  }, [isAuthenticated, activeTab, toast, refreshTrigger]);

  // ============================================================================
  // FETCH AVAILABLE MENTORS FROM FACULTY
  // ============================================================================
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'mentors') return;

    const fetchMentors = async () => {
      try {
        setMentorsLoading(true);
        
        // Fetch faculty with mentor profiles enriched (new optimized endpoint)
        const response = await fetch('http://localhost:5000/api/faculty/mentors/complete', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch mentors: ${response.status}`);
        }

        const data = await response.json();
        const facultyList = Array.isArray(data) ? data : (data.data || []);

        // Transform faculty data to mentor format
        const mentors = facultyList.map((faculty) => ({
          _id: faculty._id || faculty.id,
          userId: faculty.userId,
          fullName: faculty.fullName || faculty.name || 'Unknown',
          designation: faculty.designation,
          specialization: faculty.specialization || faculty.department,
          specializations: faculty.specializations || [],
          expertise: (faculty.specializations && Array.isArray(faculty.specializations)) ? faculty.specializations : (faculty.expertise || faculty.skills || []),
          yearsOfExperience: faculty.yearsOfExperience || 0,
          currentCompany: faculty.currentCompany || '',
          linkedinProfile: faculty.linkedinProfile || '',
          githubProfile: faculty.githubProfile || '',
          skills: faculty.skills || [],
          bio: faculty.bio || faculty.description,
          rating: faculty.averageRating || faculty.rating,
          averageRating: faculty.averageRating,
          reviewCount: faculty.totalReviews || faculty.reviewCount,
          totalReviews: faculty.totalReviews,
          hourlyRate: faculty.hourlyRate,
          availability: faculty.availability,
          profileImage: faculty.profileImage || faculty.image || faculty.profileImage,
          image: faculty.profileImage || faculty.image || faculty.profileImage,
          email: faculty.email,
          department: faculty.department,
          phone: faculty.phone,
        }));

        setAvailableMentors(mentors);
        console.log('Loaded mentors:', mentors);

        // ===== Load existing requests and mark mentors =====
        try {
          const token = localStorage.getItem('authToken') || localStorage.getItem('token');
          if (!token) return;

          const requestsRes = await fetch('http://localhost:5000/api/mentors/my-requests', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (requestsRes.ok) {
            const requestsData = await requestsRes.json();
            const existingRequests = requestsData.data || [];
            
            const mentorRequestMap = {};
            existingRequests.forEach(req => {
              if (req.status === 'pending' || req.status === 'accepted' || req.status === 'rejected') {
                mentorRequestMap[req.mentorId] = req.status;
              }
            });

            if (Object.keys(mentorRequestMap).length > 0) {
              setAvailableMentors(prev => prev.map(m => ({
                ...m,
                requestStatus: mentorRequestMap[m._id] || null,
                requestSent: !!mentorRequestMap[m._id]
              })));
            }
          }
        } catch (error) {
          console.error('Error checking existing requests:', error);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
        toast({
          title: 'Error',
          description: 'Failed to load mentors. Please try again.',
          variant: 'destructive',
        });
        setAvailableMentors([]);
      } finally {
        setMentorsLoading(false);
      }
    };

    fetchMentors();
  }, [isAuthenticated, activeTab, toast]);

  // ============================================================================
  // APPLY FILTERS & SEARCH
  // ============================================================================
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

  // ============================================================================
  // CHECK FOR EXISTING MENTOR REQUEST
  // ============================================================================
  const hasExistingRequest = useCallback((mentorId) => {
    // Check if already requested this mentor (pending or accepted)
    return availableMentors.some(mentor => {
      if (mentor._id === mentorId && mentor.requestStatus && 
          (mentor.requestStatus === 'pending' || mentor.requestStatus === 'accepted')) {
        return true;
      }
      return false;
    });
  }, [availableMentors]);

  // ============================================================================
  // MENTOR REQUEST HANDLING - REAL BACKEND API
  // ============================================================================
  const handleRequestMentor = async () => {
    if (!selectedMentor || !requestMessage.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please add a message for your request.',
        variant: 'destructive',
      });
      return;
    }

    // Check for existing request BEFORE attempting to send
    if (hasExistingRequest(selectedMentor._id)) {
      toast({
        title: 'Request Already Sent',
        description: `You already have a pending request with ${selectedMentor.fullName}. Please wait for their response.`,
        variant: 'destructive',
      });
      setMentorRequestDialog(false);
      return;
    }

    try {
      setSubmittingRequest(true);

      // Get authentication token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token provided. Please log in again.');
      }

      // Send mentor request to backend - using new faculty-based endpoint
      const response = await fetch('http://localhost:5000/api/mentors/faculty-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          message: requestMessage,
          skills: [],
          goals: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Your session expired. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('This mentor is not accepting requests at the moment.');
        }
        if (response.status === 409) {
          // Mark mentor as having pending request
          setAvailableMentors(prev => prev.map(m => 
            m._id === selectedMentor._id ? { ...m, requestStatus: 'pending', requestSent: true } : m
          ));
          throw new Error(`You already have a pending request with ${selectedMentor.fullName}.`);
        }
        if (response.status === 404) {
          throw new Error('Mentor not found.');
        }
        
        throw new Error(errorData.message || `Request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // SUCCESS: Mark mentor as having pending request with status
      setAvailableMentors(prev => prev.map(m => 
        m._id === selectedMentor._id ? { ...m, requestStatus: 'pending', requestSent: true } : m
      ));

      // SUCCESS: Request sent to faculty - don't add to local state
      // The request will only appear in Faculty's dashboard
      // Student will see it in "My Requests" tab only after faculty responds

      toast({
        title: 'Success! 🎉',
        description: `Your request has been sent to ${selectedMentor.fullName}! They will review and respond soon.`,
      });

      // Close dialogs and clear form
      setMentorRequestDialog(false);
      setMentorDetailsDialog(false);
      setRequestMessage('');
      setSelectedMentor(null);
    } catch (error) {
      // Only log if it's not a duplicate request error (409)
      if (!error.message.includes('already have a pending request')) {
        console.error('Error sending mentor request:', error);
      }
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to send mentor request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  // ============================================================================
  // CODE EXECUTION
  // ============================================================================
  const handleExecuteCode = async () => {
    if (!code.trim()) {
      toast({
        title: 'Error',
        description: 'Code cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setExecuting(true);
      setOutput('');
      setError('');

      const startTime = performance.now();
      const result = await codeExecutionAPI.executeCode(code, language, input);
      const endTime = performance.now();

      setExecutionTime((endTime - startTime).toFixed(2));
      setOutput(result.output || '');
      setError(result.error || '');
    } catch (error) {
      setError(error.message || 'Execution failed. Please try again.');
      toast({
        title: 'Execution Error',
        description: error.message || 'Code execution failed.',
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ description: 'Code copied to clipboard' });
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'js'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // ============================================================================
  // LANGUAGE CONFIGURATION
  // ============================================================================
  const languages = [
    { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
    { id: 'python', label: 'Python', monacoId: 'python' },
    { id: 'java', label: 'Java', monacoId: 'java' },
    { id: 'cpp', label: 'C++', monacoId: 'cpp' },
    { id: 'csharp', label: 'C#', monacoId: 'csharp' },
  ];

  // ============================================================================
  // COMPONENT RENDERS
  // ============================================================================

  // Loading State
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

  // Events Tab - All Events
  const renderAllEventsTab = () => (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredAllEvents.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-12 text-center bg-white">
            <Globe className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4 text-lg font-medium">No events found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveFilters([]);
                setSortBy('newest');
              }}
            >
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
                organizer={event.organizer?.organizerName || event.organizerName || 'Unknown'}
                description={event.description}
                date={event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                time={event.startTime || 'TBD'}
                location={event.location?.address || event.address || 'TBD'}
                tags={event.tags || event.skillsRequired || []}
                imageUrl={event.bannerImage || event.imageUrl}
                attendees={event.registeredCount || 0}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  // My Events Tab
  const renderMyEventsTab = () => (
    <div>
      {myEventsLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : myEvents.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-12 text-center bg-white">
            <BookmarkPlus className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4 text-lg font-medium">No events created yet</p>
            <Button onClick={() => navigate('/create-event')} className="gap-2 bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4" />
              Create Event
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
          {myEvents.map((event, index) => (
            <motion.div
              key={event._id || event.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-48 flex-shrink-0">
                  <img
                    src={event.bannerImage || 'https://via.placeholder.com/300x200?text=Event'}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {event.startDate
                          ? new Date(event.startDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Date TBD'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {event.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 mb-4 line-clamp-2">{event.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div className="bg-slate-100 rounded p-2">
                      <div className="text-lg font-bold text-slate-900">{event.registeredCount || 0}</div>
                      <div className="text-xs text-slate-600">Registered</div>
                    </div>
                    <div className="bg-slate-100 rounded p-2">
                      <div className="text-lg font-bold text-slate-900">{event.views || 0}</div>
                      <div className="text-xs text-slate-600">Views</div>
                    </div>
                    <div className="bg-slate-100 rounded p-2">
                      <div className="text-lg font-bold text-slate-900">{event.totalCapacity || 0}</div>
                      <div className="text-xs text-slate-600">Capacity</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/event/${event._id}`)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  // Mentors Tab - View Available Mentors
  const renderMentorsTab = () => (
    <div>
      {mentorsLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : availableMentors.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="p-12 text-center bg-white">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4 text-lg font-medium">No mentors available</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
        >
          {availableMentors.map((mentor, index) => (
            <motion.div
              key={mentor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border-slate-200 hover:border-orange-300">
                <div className="p-6">
                  {/* Mentor Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {mentor.image && mentor.image.length > 1 ? (
                        <img
                          src={mentor.image}
                          alt={mentor.fullName}
                          className="w-16 h-16 rounded-full border-2 border-orange-500 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-orange-500 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-2xl font-bold text-white">
                            {mentor.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{mentor.fullName}</h3>
                        {mentor.designation && (
                          <p className="text-xs text-slate-500 mb-1">{mentor.designation}</p>
                        )}
                        {mentor.specialization && (
                          <p className="text-sm text-orange-600 font-semibold">{mentor.specialization}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio - Only show if bio exists */}
                  {mentor.bio && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mentor.bio}</p>
                  )}

                  {/* Expertise - Only show if expertise exists */}
                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills - Only show if skills exists */}
                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-700 mb-2">🛠️ Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Grid - Only show if at least one field has data */}
                  {(mentor.yearsOfExperience > 0 || mentor.hourlyRate !== undefined || mentor.availability) && (
                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      {mentor.yearsOfExperience > 0 && (
                        <div className="bg-slate-50 rounded p-2">
                          <p className="text-lg font-bold text-slate-900">{mentor.yearsOfExperience}</p>
                          <p className="text-xs text-slate-600">Years Exp.</p>
                        </div>
                      )}
                      {mentor.hourlyRate !== undefined && mentor.hourlyRate !== null && (
                        <div className="bg-slate-50 rounded p-2">
                          <p className="text-lg font-bold text-slate-900">${mentor.hourlyRate}</p>
                          <p className="text-xs text-slate-600">Per Hour</p>
                        </div>
                      )}
                      {mentor.availability && (
                        <div className="bg-slate-50 rounded p-2">
                          <p className="text-xs text-slate-900 font-medium line-clamp-2">{mentor.availability}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setMentorDetailsDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button
                      className={`flex-1 flex items-center justify-center gap-2 font-bold text-base shadow-lg rounded-lg transition-all ${
                        mentor.requestStatus === 'pending'
                          ? 'bg-yellow-400 hover:bg-yellow-500 cursor-not-allowed text-black border-2 border-yellow-600'
                          : mentor.requestStatus === 'accepted'
                          ? 'hover:opacity-90 cursor-not-allowed text-emerald-700 border-2 font-semibold'
                          : mentor.requestStatus === 'rejected'
                          ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed text-white border-2 border-red-700'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                      style={
                        mentor.requestStatus === 'accepted'
                          ? { backgroundColor: '#17F397', borderColor: '#10B981' }
                          : {}
                      }
                      disabled={!!mentor.requestStatus}
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setMentorRequestDialog(true);
                      }}
                      title={
                        mentor.requestStatus === 'pending'
                          ? 'Awaiting mentor response'
                          : mentor.requestStatus === 'accepted'
                          ? 'Mentor accepted your request'
                          : mentor.requestStatus === 'rejected'
                          ? 'Mentor declined your request'
                          : ''
                      }
                    >
                      <MessageCircle className="w-5 h-5" />
                      {mentor.requestStatus === 'pending'
                        ? '⏳ Pending'
                        : mentor.requestStatus === 'accepted'
                        ? '✓ Accepted'
                        : mentor.requestStatus === 'rejected'
                        ? '❌ Rejected'
                        : 'Request'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  // Compiler Tab
  const renderCompilerTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-slate-900">Code Compiler</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCompilerTheme(compilerTheme === 'vs' ? 'vs-dark' : 'vs')}
              >
                {compilerTheme === 'vs' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor */}
          <div className="mb-6 border border-slate-300 rounded-lg overflow-hidden">
            <Editor
              height={editorHeight}
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={compilerTheme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Input (Optional)</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
                className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white resize-none"
              />
            </div>

            {/* Output */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Output</label>
              <div className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg bg-slate-900 text-white overflow-auto font-mono text-sm">
                {executing && <div className="text-orange-400">Executing...</div>}
                {output && (
                  <div>
                    <div className="text-green-400 mb-2">✓ Output:</div>
                    <div>{output}</div>
                    {executionTime && (
                      <div className="text-blue-400 mt-2 text-xs">
                        Execution time: {executionTime}ms
                      </div>
                    )}
                  </div>
                )}
                {error && (
                  <div>
                    <div className="text-red-400 mb-2">✗ Error:</div>
                    <div>{error}</div>
                  </div>
                )}
                {!executing && !output && !error && (
                  <div className="text-slate-500">Output will appear here...</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleExecuteCode}
              disabled={executing}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {executing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute Code
                </>
              )}
            </Button>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button
              onClick={() => setCode('')}
              variant="outline"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
            <Button
              onClick={handleDownloadCode}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
              <p className="text-orange-100">Events, Mentoring & Development Tools</p>
            </div>
            <Button 
              onClick={() => navigate('/create-event')} 
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-slate-200 p-1 mb-6">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              📌 All Events
            </TabsTrigger>
            <TabsTrigger
              value="mine"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              ✅ My Events
            </TabsTrigger>
            <TabsTrigger
              value="mentors"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              👨‍🏫 Mentors
            </TabsTrigger>
            <TabsTrigger
              value="myrequests"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              📬 My Requests ({mentorRequests.length})
            </TabsTrigger>
            <TabsTrigger
              value="compiler"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              💻 Compiler
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              💼 Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderAllEventsTab()}
          </TabsContent>

          <TabsContent value="mine" className="mt-0">
            {renderMyEventsTab()}
          </TabsContent>

          <TabsContent value="mentors" className="mt-0">
            {renderMentorsTab()}
          </TabsContent>

          <TabsContent value="myrequests" className="mt-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* My Requests Header */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">My Mentor Requests</h3>
                <p className="text-sm text-gray-700">Track your mentor requests and their status</p>
              </div>

              {/* Requests List */}
              {mentorRequests.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-gray-200">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No mentor responses yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    When you send a mentor request, mentors' responses will appear here. Send a request to get started!
                  </p>
                  <Button
                    onClick={() => handleTabChange('mentors')}
                    className="mt-4 bg-orange-500 hover:bg-orange-600"
                  >
                    Browse Mentors & Send Request
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {mentorRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            {/* Mentor Info Header */}
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-lg font-bold text-white">
                                  {request.mentorName?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">{request.mentorName}</h4>
                                <p className="text-xs text-gray-500">
                                  Requested on {new Date(request.requestedAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Student's Request Message */}
                            {request.message && (
                              <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">📝 Your Request</p>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                  <p className="text-sm text-slate-700 leading-relaxed">{request.message}</p>
                                  {request.skills && request.skills.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {request.skills.map((skill, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Mentor's Response (if any) */}
                            {(request.status === 'accepted' || request.status === 'rejected') && (
                              <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                                  {request.status === 'accepted' ? '✅ Mentor Accepted' : '❌ Mentor Declined'}
                                </p>
                                <div className={`p-4 rounded-lg border-l-4 ${
                                  request.status === 'accepted' 
                                    ? 'bg-green-50 border-green-500' 
                                    : 'bg-red-50 border-red-500'
                                }`}>
                                  {request.mentorMessage && (
                                    <div>
                                      <p className="text-xs font-semibold mb-2 text-slate-700">Message from Mentor:</p>
                                      <p className={`text-sm leading-relaxed ${
                                        request.status === 'accepted' 
                                          ? 'text-green-900' 
                                          : 'text-red-900'
                                      }`}>
                                        {request.mentorMessage}
                                      </p>
                                    </div>
                                  )}
                                  {request.status === 'rejected' && request.rejectionReason && (
                                    <div>
                                      <p className="text-xs font-semibold mb-2 text-slate-700">Reason:</p>
                                      <p className="text-sm text-red-900 leading-relaxed">
                                        {request.rejectionReason}
                                      </p>
                                    </div>
                                  )}
                                  {!request.mentorMessage && !request.rejectionReason && (
                                    <p className="text-sm text-slate-600 italic">
                                      {request.status === 'accepted' ? 'Request accepted' : 'Request declined'}
                                    </p>
                                  )}
                                  {request.responseAt && (
                                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-gray-200">
                                      Responded on {new Date(request.responseAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Pending Status */}
                            {request.status === 'pending' && (
                              <div className="mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                <p className="text-sm text-yellow-900 font-medium">
                                  ⏳ Your request is pending review. The mentor will respond soon.
                                </p>
                                <p className="text-xs text-yellow-700 mt-2">
                                  Expires on {new Date(request.expiresAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status Badge - Right Side */}
                          <div className="flex-shrink-0">
                            <div className={`px-4 py-2 rounded-full text-sm font-bold text-center whitespace-nowrap ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                              request.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-300' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                              'bg-gray-100 text-gray-800 border border-gray-300'
                            }`}>
                              {request.status === 'pending' && '⏳ Pending'}
                              {request.status === 'accepted' && '✅ Accepted'}
                              {request.status === 'rejected' && '❌ Declined'}
                              {request.status === 'cancelled' && '🚫 Cancelled'}
                              {request.status === 'expired' && '⌛ Expired'}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="compiler" className="mt-0">
            {renderCompilerTab()}
          </TabsContent>

          <TabsContent value="jobs" className="mt-0">
            <div className="space-y-8">
              {/* Jobs Container */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Available Job Openings</h3>
                  <p className="text-sm text-slate-600 mt-1">Browse and apply for jobs posted by industry professionals</p>
                </div>
                <div className="p-6">
                  <JobListings userType="student" />
                </div>
              </div>

              {/* My Applications Container */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">My Applications</h3>
                  <p className="text-sm text-slate-600 mt-1">Track all your job applications and their status</p>
                </div>
                <div className="p-6">
                  <MyApplications userType="student" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mentor Details Dialog */}
      <Dialog open={mentorDetailsDialog} onOpenChange={setMentorDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMentor && (
            <>
              <DialogHeader>
                <DialogTitle>Mentor Profile</DialogTitle>
                <DialogDescription>
                  Connect with experienced mentor
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex gap-6 items-start mb-6 pb-6 border-b border-slate-200">
                  {selectedMentor.profileImage && selectedMentor.profileImage.length > 1 ? (
                    <img
                      src={selectedMentor.profileImage}
                      alt={selectedMentor.fullName}
                      className="w-28 h-28 rounded-full border-3 border-orange-500 object-cover flex-shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-3 border-orange-500 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-4xl font-bold text-white">
                        {selectedMentor.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-bold text-slate-900 truncate">{selectedMentor.fullName}</h3>
                    {selectedMentor.designation && (
                      <p className="text-orange-600 font-bold text-lg mb-1">{selectedMentor.designation}</p>
                    )}
                    {selectedMentor.department && (
                      <p className="text-slate-600 font-semibold mb-3">{selectedMentor.department}</p>
                    )}
                  </div>
                </div>

                {/* About Section */}
                {selectedMentor.bio && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-2 text-lg">📝 About</h4>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">{selectedMentor.bio}</p>
                  </div>
                )}

                {/* Skills Section */}
                <div className="mb-6">
                  <h4 className="font-bold text-slate-900 mb-3 text-lg flex items-center gap-2">
                    🛠️ Skills
                  </h4>
                  {selectedMentor.skills && selectedMentor.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-300 hover:bg-indigo-200 transition"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-sm bg-slate-50 p-3 rounded-lg">No skills added yet. Mentor profile skills will appear here.</p>
                  )}
                </div>

                {/* Professional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold uppercase mb-1">🏢 Current Company</p>
                    {selectedMentor.currentCompany ? (
                      <p className="text-lg font-bold text-blue-900">{selectedMentor.currentCompany}</p>
                    ) : (
                      <p className="text-slate-500 italic text-sm">Not specified</p>
                    )}
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-semibold uppercase mb-1">⏳ Experience</p>
                    {selectedMentor.yearsOfExperience !== undefined && selectedMentor.yearsOfExperience > 0 ? (
                      <p className="text-lg font-bold text-green-900">{selectedMentor.yearsOfExperience}+ Years</p>
                    ) : (
                      <p className="text-slate-500 italic text-sm">Not specified</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 mb-6">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">Email</p>
                        <a href={`mailto:${selectedMentor.email}`} className="text-blue-600 hover:underline font-semibold break-all">
                          {selectedMentor.email}
                        </a>
                      </div>
                    </div>
                    {selectedMentor.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-600 font-semibold">Phone</p>
                          <a href={`tel:${selectedMentor.phone}`} className="text-blue-600 hover:underline font-semibold">
                            {selectedMentor.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedMentor.linkedinProfile ? (
                      <div className="flex items-start gap-3">
                        <a href={selectedMentor.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold">
                          🔗 LinkedIn Profile →
                        </a>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-sm">LinkedIn profile not added</div>
                    )}
                    {selectedMentor.githubProfile ? (
                      <div className="flex items-start gap-3">
                        <a href={selectedMentor.githubProfile} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-semibold">
                          👨‍💻 GitHub Profile →
                        </a>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-sm">GitHub profile not added</div>
                    )}
                  </div>
                </div>

                {/* Specializations/Expertise */}
                {selectedMentor.specializations && selectedMentor.specializations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3 text-lg flex items-center gap-2">
                      🎯 Specializations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-full text-sm font-semibold border border-orange-300 hover:shadow-md transition"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills/Expertise Array */}
                {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-900 mb-3 text-lg flex items-center gap-2">
                      💡 Expertise Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-300 hover:bg-blue-200 transition"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information Summary */}
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6">
                  <h4 className="font-bold text-slate-900 mb-3">📊 Quick Summary</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMentor.designation && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Position:</span>
                        <span className="font-semibold text-slate-900">{selectedMentor.designation}</span>
                      </div>
                    )}
                    {selectedMentor.department && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Department:</span>
                        <span className="font-semibold text-slate-900">{selectedMentor.department}</span>
                      </div>
                    )}
                    {selectedMentor.currentCompany && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Company:</span>
                        <span className="font-semibold text-slate-900">{selectedMentor.currentCompany}</span>
                      </div>
                    )}
                    {selectedMentor.yearsOfExperience !== undefined && selectedMentor.yearsOfExperience > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Experience:</span>
                        <span className="font-semibold text-slate-900">{selectedMentor.yearsOfExperience} years</span>
                      </div>
                    )}
                    {selectedMentor.hourlyRate !== undefined && selectedMentor.hourlyRate > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Hourly Rate:</span>
                        <span className="font-semibold text-green-600">₹{selectedMentor.hourlyRate}/hr</span>
                      </div>
                    )}
                    {selectedMentor.availability && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Availability:</span>
                        <span className="font-semibold text-slate-900">{selectedMentor.availability}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      setMentorDetailsDialog(false);
                      setMentorRequestDialog(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setMentorDetailsDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mentor Request Dialog */}
      <Dialog open={mentorRequestDialog} onOpenChange={setMentorRequestDialog}>
        <DialogContent className="max-w-md">
          {selectedMentor && (
            <>
              <DialogHeader>
                <DialogTitle>Request Mentoring</DialogTitle>
                <DialogDescription>
                  Send a message to {selectedMentor.fullName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Mentor Info */}
                <div className="flex gap-3 items-center p-3 bg-orange-50 rounded-lg">
                  {selectedMentor.image && selectedMentor.image.length > 1 ? (
                    <img
                      src={selectedMentor.image}
                      alt={selectedMentor.fullName}
                      className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-orange-500 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {selectedMentor.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{selectedMentor.fullName}</p>
                    <p className="text-sm text-orange-600">{selectedMentor.specialization}</p>
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Tell them about your goals
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="E.g., I want to learn React and improve my web development skills..."
                    className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setMentorRequestDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestMentor}
                    disabled={submittingRequest || !requestMessage.trim()}
                    className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    {submittingRequest ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
