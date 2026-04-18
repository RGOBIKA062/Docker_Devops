import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
} from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [event, setEvent] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
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
      const token = localStorage.getItem('authToken');
      const method = isWishlisted ? 'DELETE' : 'POST';
      const endpoint = isWishlisted
        ? `${API_BASE_URL}/events/${id}/wishlist`
        : `${API_BASE_URL}/events/${id}/wishlist`;

      await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setIsWishlisted(!isWishlisted);
      toast({
        description: isWishlisted ? '💔 Removed from wishlist' : '❤️ Added to wishlist',
      });
    } catch (error) {
      console.error('Error:', error);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative h-96 rounded-3xl overflow-hidden">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-white/90">
                Organized by {event.organizer.organizerName}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Info */}
            <Card className="p-6 rounded-2xl border-border">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-semibold text-foreground">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.startTime} - {event.endTime} {event.timezone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">
                      {event.location.type === 'Online'
                        ? 'Online Event'
                        : event.location.venue || event.location.city}
                    </p>
                    {event.location.type !== 'Online' && (
                      <p className="text-sm text-muted-foreground">
                        {event.location.address && `${event.location.address}, `}
                        {event.location.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                    <p className="font-semibold text-foreground">
                      {event.registeredCount}/{event.totalCapacity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {spotsLeft} spots available
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-semibold text-foreground">
                      {event.ratings?.overallRating || 'N/A'} / 5
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.ratings?.totalRatings || 0} reviews
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 rounded-2xl border-border">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </Card>

            {/* Features */}
            {Object.values(event.features || {}).some(v => v === true) && (
              <Card className="p-6 rounded-2xl border-border">
                <h2 className="text-2xl font-bold mb-4">What You'll Get</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {event.features.hasCertificate && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold">Certificate of Participation</span>
                    </div>
                  )}
                  {event.features.hasJobOpportunity && (
                    <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-xl">
                      <Briefcase className="w-6 h-6 text-green-600" />
                      <span className="font-semibold">Job Opportunities</span>
                    </div>
                  )}
                  {event.features.hasPrizePool && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50/50 rounded-xl">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                      <span className="font-semibold">Prize Pool: ₹{event.features.prizeAmount}</span>
                    </div>
                  )}
                  {event.features.hasQA && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                      <span className="font-semibold">Live Q&A Session</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="p-6 rounded-2xl border-border">
              <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>

              {/* Add Review */}
              <div className="mb-8 p-4 bg-muted rounded-xl">
                <p className="font-semibold mb-3">Leave a Review</p>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full p-3 border border-border rounded-lg mb-3 resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {event.reviews && event.reviews.length > 0 ? (
                  event.reviews.map((review, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{review.userName || 'Anonymous'}</p>
                        <div className="flex gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground/80">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first!</p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 space-y-4"
            >
              <Card className="p-6 rounded-2xl border-border">
                {/* Price */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {event.pricing?.type === 'Paid'
                      ? `₹${event.pricing?.amount}`
                      : 'FREE'}
                  </p>
                </div>

                {/* Capacity Bar */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {capacityPercentage}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${capacityPercentage}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>

                {/* Register Button */}
                <Button
                  onClick={handleRegister}
                  disabled={registering || isRegistered || event.registeredCount >= event.totalCapacity}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold mb-3"
                >
                  {isRegistered
                    ? '✅ Already Registered'
                    : registering
                    ? 'Registering...'
                    : 'Register Now'}
                </Button>

                {/* Wishlist & Share */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleWishlist}
                    variant="outline"
                    className="flex-1 rounded-lg"
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isWishlisted ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Tags */}
              <Card className="p-6 rounded-2xl border-border">
                <h3 className="font-bold mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold mb-8">Similar Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarEvents.map((similarEvent, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard {...similarEvent} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default EventDetail;
