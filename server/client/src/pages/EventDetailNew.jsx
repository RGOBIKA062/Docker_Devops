import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserManager } from '@/hooks/useUserManager';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Share2,
  Heart,
  Clock,
  CheckCircle,
  Trophy,
  BookOpen,
  Briefcase,
  Send,
  Download,
  Copy,
  Facebook,
  Linkedin,
  Twitter,
  ArrowLeft,
  Bell,
  Shield,
  Zap,
  Target,
  MessageCircle,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

const EventDetailNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userManager = useUserManager();

  const [event, setEvent] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data.event);
        setSimilarEvents(data.data.similarEvents || []);
        
        // Load wishlist and reminder state from persistent storage
        if (id) {
          setIsWishlisted(userManager.isInWishlist(id));
          setIsReminderSet(userManager.hasReminder(id));
        }
      } else {
        toast({ description: '❌ Event not found', variant: 'destructive' });
        navigate('/student');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({ description: '❌ Error loading event', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // If registrationUrl exists, open it in a new tab first
    if (event?.registrationUrl) {
      window.open(event.registrationUrl, '_blank');
    }

    try {
      setRegistering(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsRegistered(true);
        toast({
          description: '✅ Successfully registered for event!',
        });
        setEvent(data.event);
      } else {
        toast({ description: `❌ ${data.message}`, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast({ description: '❌ Error registering for event', variant: 'destructive' });
    } finally {
      setRegistering(false);
    }
  };

  const handleWishlist = async () => {
    try {
      const newState = !isWishlisted;
      setIsWishlisted(newState);
      
      // Persist to localStorage
      if (id && event) {
        if (newState) {
          userManager.addToWishlist(id, {
            title: event.title,
            organizer: event.organizer?.organizerName,
            date: event.startDate,
            time: event.startTime,
            location: event.location?.city || event.location?.venue,
            imageUrl: event.bannerImage
          });
        } else {
          userManager.removeFromWishlist(id);
        }
      }
      
      // Try to sync with backend (only if user is logged in)
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const method = newState ? 'POST' : 'DELETE';
          const endpoint = `${API_BASE_URL}/events/${id}/wishlist`;

          const response = await fetch(endpoint, {
            method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            console.warn('Backend sync failed with status:', response.status);
          }
        } catch (err) {
          console.log('Backend sync failed, using local storage:', err.message);
        }
      }

      toast({
        description: newState ? '❤️ Added to wishlist' : '💔 Removed from wishlist',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({ description: '❌ Error updating wishlist', variant: 'destructive' });
    }
  };

  const handleReminder = async () => {
    try {
      const newState = !isReminderSet;
      setIsReminderSet(newState);
      
      // Persist to localStorage
      if (id && event) {
        if (newState) {
          userManager.addReminder(id, {
            title: event.title,
            date: event.startDate,
            time: event.startTime,
            location: event.location?.city || event.location?.venue,
          });
        } else {
          userManager.removeReminder(id);
        }
      }

      toast({
        description: newState ? '🔔 Reminder set for this event' : '🔔 Reminder removed',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({ description: '❌ Error updating reminder', variant: 'destructive' });
    }
  };

  const handleShare = async (type) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = window.location.href;
      const text = `Check out: ${event.title} — ${event.startDate} @ ${event.location?.city || event.location?.venue} — Organized by ${event.organizer?.organizerName}`;
      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(url);

      switch (type) {
        case 'whatsapp':
          window.open(`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
          break;
        case 'copy':
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            const tmp = document.createElement('input');
            document.body.appendChild(tmp);
            tmp.value = url;
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
          }
          toast({ description: '✅ Event link copied to clipboard!' });
          break;
        case 'native':
          if (navigator?.share) {
            await navigator.share({ title: event.title, text, url });
          } else {
            if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(url);
            toast({ description: 'Link copied to clipboard instead' });
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Share failed', error);
      toast({ description: '❌ Sharing failed', variant: 'destructive' });
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast({ description: 'Please write a review', variant: 'destructive' });
      return;
    }

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/events/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment: reviewText }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ description: '⭐ Review submitted successfully!' });
        setReviewText('');
        setRating(5);
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ description: '❌ Error submitting review', variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 rounded-full blur-lg opacity-75"></div>
          <div className="absolute inset-2 bg-white rounded-full"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"></div>
        </motion.div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Event not found</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const capacityPercentage = ((event.registeredCount / event.totalCapacity) * 100).toFixed(0);
  const spotsLeft = Math.max(0, event.totalCapacity - event.registeredCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/50">
      <Navbar />

      <main className="w-full">
        {/* Hero Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-auto overflow-hidden"
        >
          {/* Background Image */}
          <div className="relative w-full h-[400px] lg:h-[500px] overflow-hidden rounded-b-3xl">
            <img
              src={event.bannerImage || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200'}
              alt={event.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            {/* Back Button */}
            <motion.button
              onClick={() => navigate('/student')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4"
              >
                {/* Event Type Badge */}
                <div className="flex gap-3 flex-wrap">
                  <Badge className="bg-primary/90 text-primary-foreground backdrop-blur text-sm px-4 py-2">
                    {event.eventType || 'Event'}
                  </Badge>
                  <Badge className="bg-orange-500/90 text-white backdrop-blur text-sm px-4 py-2">
                    {event.skillLevel || 'All Levels'}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                  {event.title}
                </h1>

                {/* Organizer */}
                <p className="text-lg text-white/90 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                  Organized by <span className="font-semibold">{event.organizer?.organizerName || 'Event Organizer'}</span>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Info Bar Below Hero */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200/50 bg-white/50 backdrop-blur">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Date & Time</p>
                  <p className="text-sm lg:text-base font-bold text-foreground">{formattedDate}</p>
                  <p className="text-xs text-muted-foreground">{event.startTime}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="text-sm lg:text-base font-bold text-foreground">
                    {event.location?.type === 'Online' ? '🌐 Online' : event.location?.city || 'TBD'}
                  </p>
                </div>
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Attendees</p>
                  <p className="text-sm lg:text-base font-bold text-foreground">
                    {event.registeredCount}/{event.totalCapacity}
                  </p>
                  <p className="text-xs text-muted-foreground">{spotsLeft} spots left</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yellow-100/50">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Rating</p>
                  <p className="text-sm lg:text-base font-bold text-foreground">
                    {event.ratings?.overallRating || 'N/A'} / 5
                  </p>
                  <p className="text-xs text-muted-foreground">{event.ratings?.totalReviews || 0} reviews</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - 2 cols */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="p-8 rounded-3xl border-orange-200/50 bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary to-orange-500 rounded-full"></div>
                      About This Event
                    </h2>
                    <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Features Section */}
              {Object.values(event.features || {}).some(v => v === true) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-8 rounded-3xl border-orange-200/50 bg-white/90 backdrop-blur shadow-lg">
                    <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <Zap className="w-7 h-7 text-primary" />
                      What You'll Get
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {event.features.hasCertificate && (
                        <motion.div
                          whileHover={{ translateY: -4 }}
                          className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="font-semibold text-blue-900">Certificate of Participation</span>
                          </div>
                        </motion.div>
                      )}
                      {event.features.hasJobOpportunity && (
                        <motion.div
                          whileHover={{ translateY: -4 }}
                          className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <Briefcase className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="font-semibold text-green-900">Job Opportunities</span>
                          </div>
                        </motion.div>
                      )}
                      {event.features.hasPrizePool && (
                        <motion.div
                          whileHover={{ translateY: -4 }}
                          className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200/50 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <Trophy className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <span className="font-semibold text-yellow-900">Prize Pool: ₹{event.features.prizeAmount}</span>
                          </div>
                        </motion.div>
                      )}
                      {event.features.hasQA && (
                        <motion.div
                          whileHover={{ translateY: -4 }}
                          className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                            <span className="font-semibold text-purple-900">Live Q&A Session</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 rounded-3xl border-orange-200/50 bg-white/90 backdrop-blur shadow-lg">
                  <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                    <MessageCircle className="w-7 h-7 text-primary" />
                    Reviews & Ratings
                  </h2>

                  {/* Add Review */}
                  <div className="mb-12 p-6 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-2xl border border-primary/20">
                    <p className="font-bold mb-4 text-lg">Leave Your Review</p>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onClick={() => setRating(star)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.95 }}
                          className="transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-4 border border-border rounded-xl mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={4}
                    />
                    <motion.button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </motion.button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {event.reviews && event.reviews.length > 0 ? (
                      event.reviews.map((review, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border border-orange-200/30 rounded-xl bg-gradient-to-r from-white to-orange-50/30 hover:border-orange-300/60 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <p className="font-semibold text-foreground">{review.userName || 'Anonymous'}</p>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-foreground/80">{review.comment}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to leave one!</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-24 space-y-6"
              >
                {/* Registration Card */}
                <Card className="p-8 rounded-3xl border-orange-200/50 bg-gradient-to-br from-white to-orange-50/50 backdrop-blur shadow-xl">
                  {/* Price */}
                  <div className="mb-8">
                    <p className="text-sm text-muted-foreground font-semibold mb-2">Event Price</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                      {event.pricing?.type === 'Paid'
                        ? `₹${event.pricing?.amount}`
                        : 'FREE'}
                    </p>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-3">
                      <p className="text-sm font-semibold text-foreground">Capacity Filled</p>
                      <p className="text-sm font-bold text-primary">
                        {capacityPercentage}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden border border-orange-200/50">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${capacityPercentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {spotsLeft} spots remaining
                    </p>
                  </div>

                  {/* Main CTA Button */}
                  <motion.button
                    onClick={handleRegister}
                    disabled={registering || isRegistered || event.registeredCount >= event.totalCapacity}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none mb-3 flex items-center justify-center gap-2"
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Already Registered
                      </>
                    ) : registering ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <span>Register Now</span>
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Secondary Actions */}
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleWishlist}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                        isWishlisted
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border hover:border-primary text-foreground'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary' : ''}`} />
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </motion.button>
                    
                    <motion.button
                      onClick={handleReminder}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                        isReminderSet
                          ? 'border-blue-500/50 bg-blue-500/10 text-blue-600'
                          : 'border-border hover:border-primary text-foreground'
                      }`}
                    >
                      <Bell className={`w-5 h-5 ${isReminderSet ? 'fill-blue-600' : ''}`} />
                      {isReminderSet ? 'Reminder Set' : 'Set Reminder'}
                    </motion.button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 px-4 rounded-xl border-2 border-border hover:border-primary text-foreground transition-all font-semibold flex items-center justify-center gap-2"
                        >
                          <Share2 className="w-5 h-5" />
                          Share Event
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-center">Share Event</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 cursor-pointer">
                          <MessageSquare className="w-4 h-4 text-emerald-500" />
                          <span>WhatsApp</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('twitter')} className="flex items-center gap-2 cursor-pointer">
                          <Twitter className="w-4 h-4 text-sky-500" />
                          <span>Twitter</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('facebook')} className="flex items-center gap-2 cursor-pointer">
                          <Facebook className="w-4 h-4 text-blue-600" />
                          <span>Facebook</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('linkedin')} className="flex items-center gap-2 cursor-pointer">
                          <Linkedin className="w-4 h-4 text-sky-700" />
                          <span>LinkedIn</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleShare('copy')} className="flex items-center gap-2 cursor-pointer">
                          <Copy className="w-4 h-4" />
                          <span>Copy Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('native')} className="flex items-center gap-2 cursor-pointer">
                          <Share2 className="w-4 h-4" />
                          <span>Use Device Share</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>

                {/* Quick Info Sidebar */}
                <Card className="p-6 rounded-2xl border-orange-200/50 bg-white/90 backdrop-blur shadow-lg space-y-6">
                  {/* Topics */}
                  <div>
                    <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-orange-200/30"></div>

                  {/* Requirements */}
                  <div>
                    <h3 className="font-bold mb-3 text-foreground flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Prerequisites
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {event.skillLevel || 'All Levels'} • Open to all
                    </p>
                  </div>
                </Card>

                {/* Notification Bell */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary text-primary font-semibold transition-all flex items-center justify-center gap-2 bg-primary/5"
                >
                  <Bell className="w-5 h-5" />
                  Set Reminder
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailNew;
