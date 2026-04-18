import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Star, Search, Filter, MapPin, Clock, Users, TrendingUp, Award, Heart } from 'lucide-react';

const MentorDiscovery = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMentorDetail, setShowMentorDetail] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');

  // Request Form
  const [requestForm, setRequestForm] = useState({
    message: '',
    skillsRequested: [],
    mentorshipType: 'oneOnOne',
    preferredDuration: '3_months',
    preferredFrequency: 'weekly',
  });

  const [favorites, setFavorites] = useState([]);

  // Fetch mentors on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchMentors();
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated]);

  // Apply filters
  useEffect(() => {
    let filtered = mentors;

    if (searchQuery) {
      filtered = filtered.filter(
        m =>
          m.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.professionalTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSkill) {
      filtered = filtered.filter(m =>
        m.skills?.some(s => s.skillName.includes(selectedSkill))
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter(m => m.industries?.includes(selectedIndustry));
    }

    if (minRating > 0) {
      filtered = filtered.filter(m => m.metrics?.averageRating >= minRating);
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.metrics?.averageRating || 0) - (a.metrics?.averageRating || 0);
        case 'experience':
          return b.yearsOfExperience - a.yearsOfExperience;
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredMentors(filtered);
  }, [mentors, searchQuery, selectedSkill, selectedIndustry, minRating, sortBy]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/mentors/list?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch mentors',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast({
        title: 'Error',
        description: 'Error loading mentors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      if (!requestForm.message.trim()) {
        toast({
          title: 'Required',
          description: 'Please write a message for your request',
        });
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/mentors/request/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          skillsRequested: requestForm.skillsRequested,
          requestMessage: requestForm.message,
          mentorshipType: requestForm.mentorshipType,
          preferredDuration: requestForm.preferredDuration,
          preferredFrequency: requestForm.preferredFrequency,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Mentorship request sent! Waiting for mentor approval.',
        });
        setShowRequestModal(false);
        setRequestForm({
          message: '',
          skillsRequested: [],
          mentorshipType: 'oneOnOne',
          preferredDuration: '3_months',
          preferredFrequency: 'weekly',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to send request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: 'Error',
        description: 'Error sending request',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = (mentorId) => {
    if (favorites.includes(mentorId)) {
      setFavorites(favorites.filter(id => id !== mentorId));
    } else {
      setFavorites([...favorites, mentorId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Mentor</h1>
          <p className="text-xl text-gray-600">
            Connect with experienced professionals who'll guide you to success
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none"
            >
              <option value="">All Skills</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="Python">Python</option>
              <option value="AWS">AWS</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none"
            >
              <option value="">All Industries</option>
              <option value="FinTech">FinTech</option>
              <option value="SaaS">SaaS</option>
              <option value="Startup">Startup</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={e => setMinRating(parseFloat(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={3.5}>3.5+ Stars</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="latest">Newest</option>
            </select>
          </div>
        </motion.div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor, index) => (
            <motion.div
              key={mentor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Header with Cover */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 relative">
                  <button
                    onClick={() => toggleFavorite(mentor._id)}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition"
                  >
                    <Heart
                      size={20}
                      className={favorites.includes(mentor._id) ? 'fill-red-500 text-red-500' : ''}
                    />
                  </button>
                </div>

                {/* Profile Section */}
                <div className="px-6 pb-6">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4 -mt-12 mb-4">
                    <img
                      src={mentor.userId?.profileImage || '/default-avatar.png'}
                      alt={mentor.userId?.fullName}
                      className="w-16 h-16 rounded-full border-4 border-white object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {mentor.userId?.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">{mentor.professionalTitle}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={16} />
                      <span className="font-semibold">
                        {mentor.metrics?.averageRating?.toFixed(1) || '0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="text-blue-600" size={16} />
                      <span>{mentor.stats?.activeMentees || 0} Mentees</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="text-green-600" size={16} />
                      <span>{mentor.yearsOfExperience} yrs</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {mentor.professionalBio}
                  </p>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {mentor.skills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {skill.skillName}
                        </span>
                      ))}
                      {mentor.skills?.length > 3 && (
                        <span className="text-xs text-gray-500">+{mentor.skills.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    {mentor.leaderboardScores?.tier && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        <Award size={14} />
                        {mentor.leaderboardScores.tier}
                      </span>
                    )}
                    {mentor.verificationStatus === 'verified' && (
                      <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowMentorDetail(true);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestModal(true);
                      }}
                    >
                      Request Mentorship
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No mentors found matching your criteria</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading mentors...</p>
          </div>
        )}
      </div>

      {/* Mentorship Request Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Mentorship from {selectedMentor?.userId?.fullName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message */}
            <div>
              <label className="block text-sm font-semibold mb-2">Your Message *</label>
              <textarea
                value={requestForm.message}
                onChange={e => setRequestForm({ ...requestForm, message: e.target.value })}
                placeholder="Tell them why you want to be mentored and what you hope to achieve..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Mentorship Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">Mentorship Type</label>
              <select
                value={requestForm.mentorshipType}
                onChange={e => setRequestForm({ ...requestForm, mentorshipType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="oneOnOne">One-on-One Sessions</option>
                <option value="groupSessions">Group Sessions</option>
                <option value="projectBased">Project-Based</option>
                <option value="careerguidance">Career Guidance</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Duration</label>
              <select
                value={requestForm.preferredDuration}
                onChange={e => setRequestForm({ ...requestForm, preferredDuration: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="1_session">1 Session</option>
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="1_year">1 Year</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Frequency</label>
              <select
                value={requestForm.preferredFrequency}
                onChange={e => setRequestForm({ ...requestForm, preferredFrequency: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="asneeded">As Needed</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSendRequest}>
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MentorDiscovery;
