import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Lightbulb, Trophy, Users, Zap } from 'lucide-react';

const MentorProfileSetup = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [mentorData, setMentorData] = useState({
    professionalTitle: '',
    yearsOfExperience: 0,
    currentCompany: '',
    linkedinProfile: '',
    githubProfile: '',
    portfolioUrl: '',
    professionalBio: '',
    skills: [],
    industries: [],
    languages: [],
    specializations: [],
    pricingType: 'free', // 'free' or 'paid'
    weeklyHours: 0,
    timezone: 'IST',
    maxConcurrentMentees: 0,
    avgResponseTime: '24hours',
    mentorshipTypes: {
      oneOnOne: { enabled: false, ratePerHour: 0, maxSlotsPerWeek: 5 },
      groupSessions: { enabled: false, ratePerHour: 0, maxParticipants: 20 },
      projectBased: { enabled: false, ratePerProject: 0 },
      careerguidance: { enabled: false, ratePerSession: 0 },
    },
  });

  const [skillInput, setSkillInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'faculty') {
      navigate('/auth');
    }
  }, [isAuthenticated, user]);

  // Fetch existing mentor profile if editing
  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/mentors/profile/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (data.success && data.mentor) {
          // Pre-fill the form with existing data
          setMentorData({
            professionalTitle: data.mentor.professionalTitle || '',
            yearsOfExperience: data.mentor.yearsOfExperience || 0,
            currentCompany: data.mentor.currentCompany || '',
            linkedinProfile: data.mentor.linkedinProfile || '',
            githubProfile: data.mentor.githubProfile || '',
            portfolioUrl: data.mentor.portfolioUrl || '',
            professionalBio: data.mentor.professionalBio || '',
            skills: data.mentor.skills || [],
            industries: data.mentor.industries || [],
            languages: data.mentor.languages || [],
            specializations: data.mentor.specializations || [],
            pricingType: data.mentor.pricingType || 'free',
            weeklyHours: data.mentor.weeklyHours || 0,
            timezone: data.mentor.timezone || 'IST',
            maxConcurrentMentees: data.mentor.maxConcurrentMentees || 0,
            avgResponseTime: data.mentor.avgResponseTime || '24hours',
            mentorshipTypes: data.mentor.mentorshipTypes || {
              oneOnOne: { enabled: false, ratePerHour: 0, maxSlotsPerWeek: 5 },
              groupSessions: { enabled: false, ratePerHour: 0, maxParticipants: 20 },
              projectBased: { enabled: false, ratePerProject: 0 },
              careerguidance: { enabled: false, ratePerSession: 0 },
            },
          });
          setIsEditMode(true);
        }
      } catch (error) {
        console.log('No existing mentor profile, starting fresh');
        setIsEditMode(false);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated && user?.userType === 'faculty') {
      fetchMentorProfile();
    }
  }, [isAuthenticated, user]);

  const steps = [
    {
      title: 'Professional Details',
      description: 'Share your expertise and background',
      icon: '👨‍💼',
    },
    {
      title: 'Skills & Expertise',
      description: 'List your technical and professional skills',
      icon: '⚡',
    },
    {
      title: 'Mentorship Services',
      description: 'Define your mentoring offerings',
      icon: '🎓',
    },
    {
      title: 'Pricing & Availability',
      description: 'Set rates and availability',
      icon: '💰',
    },
    {
      title: 'Review & Publish',
      description: 'Review and go live!',
      icon: '🚀',
    },
  ];

  const handleInputChange = (field, value) => {
    setMentorData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setMentorData(prev => ({
        ...prev,
        skills: [
          ...prev.skills,
          {
            skillName: skillInput,
            category: 'Other',
            proficiencyLevel: 'Expert',
            yearsOfExperience: mentorData.yearsOfExperience,
          },
        ],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = index => {
    setMentorData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addIndustry = () => {
    if (industryInput && !mentorData.industries.includes(industryInput)) {
      setMentorData(prev => ({
        ...prev,
        industries: [...prev.industries, industryInput],
      }));
      setIndustryInput('');
    }
  };

  const removeIndustry = index => {
    setMentorData(prev => ({
      ...prev,
      industries: prev.industries.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!mentorData.professionalTitle || !mentorData.professionalBio) {
        toast({
          title: 'Required Fields',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      if (mentorData.skills.length === 0) {
        toast({
          title: 'Add Skills',
          description: 'Please add at least one skill',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch('http://localhost:5000/api/mentors/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mentorData),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: isEditMode 
            ? 'Your mentor profile has been updated successfully!' 
            : 'Your mentor profile has been created successfully!',
        });
        setTimeout(() => navigate('/faculty'), 2000);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to create mentor profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating mentor profile:', error);
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Loading State */}
        {loadingData && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading your profile...</p>
            </div>
          </div>
        )}

        {!loadingData && (
        <>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isEditMode ? '✏️ Edit Your Mentor Profile' : '🚀 Become a Mentor'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isEditMode 
              ? 'Update your mentor profile details and make it even better' 
              : 'Set up your mentor profile and start guiding the next generation of tech professionals. Earn money while sharing your expertise.'}
          </p>
        </motion.div>

        {/* Benefits Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Trophy, title: 'Build Reputation', desc: 'Get verified badges and ratings' },
            { icon: Users, title: 'Help Others', desc: 'Mentor 100s of passionate learners' },
            { icon: Zap, title: 'Flexible Hours', desc: 'Mentor on your own schedule' },
            { icon: Lightbulb, title: 'Earn Income', desc: 'Competitive mentor pay' },
          ].map((benefit, idx) => (
            <Card key={idx} className="p-4 text-center hover:shadow-lg transition">
              <benefit.icon className="mx-auto mb-2 text-blue-600" size={28} />
              <h3 className="font-bold mb-1">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.desc}</p>
            </Card>
          ))}
        </motion.div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="font-bold mb-6 text-lg">Setup Progress</h3>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      activeStep === idx
                        ? 'bg-blue-600 text-white'
                        : activeStep > idx
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {activeStep > idx ? <Check size={20} /> : <span>{idx + 1}</span>}
                      <div className="text-sm">
                        <p className="font-bold">{step.title}</p>
                        <p className="text-xs opacity-75">{step.icon}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              {/* Step 1: Professional Details */}
              {activeStep === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Professional Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Professional Title *
                      </label>
                      <input
                        type="text"
                        value={mentorData.professionalTitle}
                        onChange={e => handleInputChange('professionalTitle', e.target.value)}
                        placeholder="e.g., Senior Software Architect"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        value={mentorData.yearsOfExperience || ''}
                        onChange={e => {
                          const val = e.target.value ? parseInt(e.target.value) : 0;
                          handleInputChange('yearsOfExperience', val);
                        }}
                        min="0"
                        max="60"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter years of experience"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Current Company</label>
                      <input
                        type="text"
                        value={mentorData.currentCompany}
                        onChange={e => handleInputChange('currentCompany', e.target.value)}
                        placeholder="e.g., Google, Microsoft"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={mentorData.linkedinProfile}
                        onChange={e => handleInputChange('linkedinProfile', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">GitHub Profile</label>
                      <input
                        type="url"
                        value={mentorData.githubProfile}
                        onChange={e => handleInputChange('githubProfile', e.target.value)}
                        placeholder="https://github.com/yourprofile"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Professional Bio *</label>
                      <textarea
                        value={mentorData.professionalBio}
                        onChange={e => handleInputChange('professionalBio', e.target.value)}
                        placeholder="Describe your expertise, achievements, and mentoring philosophy..."
                        rows={5}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Skills */}
              {activeStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Your Skills & Expertise</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Add Skills</label>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          placeholder="e.g., React, Node.js, Python..."
                          onKeyPress={e => e.key === 'Enter' && addSkill()}
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button onClick={addSkill}>Add</Button>
                      </div>

                      {/* Skills List */}
                      <div className="flex flex-wrap gap-2">
                        {mentorData.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                          >
                            <span>{skill.skillName}</span>
                            <button
                              onClick={() => removeSkill(idx)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Industries</label>
                      <div className="flex gap-2 mb-4">
                        <select
                          value={industryInput}
                          onChange={e => setIndustryInput(e.target.value)}
                          className="flex-1 px-4 py-2 border rounded-lg"
                        >
                          <option value="">Select Industry</option>
                          <option value="FinTech">FinTech</option>
                          <option value="HealthTech">HealthTech</option>
                          <option value="EdTech">EdTech</option>
                          <option value="SaaS">SaaS</option>
                          <option value="Enterprise">Enterprise</option>
                          <option value="Startup">Startup</option>
                        </select>
                        <Button onClick={addIndustry}>Add</Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {mentorData.industries.map((industry, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                          >
                            <span>{industry}</span>
                            <button
                              onClick={() => removeIndustry(idx)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Services */}
              {activeStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Mentorship Services</h2>

                  <div className="space-y-4">
                    {[
                      { key: 'oneOnOne', label: '1-on-1 Sessions', icon: '👤' },
                      { key: 'groupSessions', label: 'Group Sessions', icon: '👥' },
                      { key: 'projectBased', label: 'Project-Based', icon: '🛠️' },
                      { key: 'careerguidance', label: 'Career Guidance', icon: '🎯' },
                    ].map(service => (
                      <Card key={service.key} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={mentorData.mentorshipTypes[service.key].enabled}
                            onChange={e => {
                              setMentorData(prev => ({
                                ...prev,
                                mentorshipTypes: {
                                  ...prev.mentorshipTypes,
                                  [service.key]: {
                                    ...prev.mentorshipTypes[service.key],
                                    enabled: e.target.checked,
                                  },
                                },
                              }));
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-lg">{service.icon}</span>
                          <span className="font-bold">{service.label}</span>
                        </div>

                        {mentorData.mentorshipTypes[service.key].enabled && (
                          <div className="ml-7 space-y-2">
                            {service.key === 'oneOnOne' && (
                              <>
                                <div>
                                  <label className="text-sm">Rate per hour (₹)</label>
                                  <input
                                    type="number"
                                    value={mentorData.mentorshipTypes[service.key].ratePerHour || ''}
                                    onChange={e => {
                                      const val = e.target.value ? parseInt(e.target.value) : 0;
                                      setMentorData(prev => ({
                                        ...prev,
                                        mentorshipTypes: {
                                          ...prev.mentorshipTypes,
                                          [service.key]: {
                                            ...prev.mentorshipTypes[service.key],
                                            ratePerHour: val,
                                          },
                                        },
                                      }));
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 border rounded"
                                    placeholder="Enter rate"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm">Max slots per week</label>
                                  <input
                                    type="number"
                                    value={mentorData.mentorshipTypes[service.key].maxSlotsPerWeek || ''}
                                    onChange={e => {
                                      const val = e.target.value ? parseInt(e.target.value) : 0;
                                      setMentorData(prev => ({
                                        ...prev,
                                        mentorshipTypes: {
                                          ...prev.mentorshipTypes,
                                          [service.key]: {
                                            ...prev.mentorshipTypes[service.key],
                                            maxSlotsPerWeek: val,
                                          },
                                        },
                                      }));
                                    }}
                                    min="1"
                                    className="w-full px-2 py-1 border rounded"
                                    placeholder="Enter max slots"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Pricing & Availability */}
              {activeStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">💰 Pricing & Availability</h2>
                  
                  {/* Pricing Type Selection */}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-4">Mentorship Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Free Mentorship Card */}
                      <Card className="p-4 border-2 cursor-pointer transition hover:border-green-500 hover:bg-green-50" 
                        onClick={() => setMentorData(prev => ({...prev, pricingType: 'free'}))}>
                        <div className="flex items-center gap-3 mb-2">
                          <input 
                            type="radio" 
                            name="pricing"
                            checked={mentorData.pricingType === 'free'}
                            onChange={() => setMentorData(prev => ({...prev, pricingType: 'free'}))}
                            className="cursor-pointer"
                          />
                          <label className="font-bold text-lg cursor-pointer">🎁 Free Mentorship</label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          Offer free mentorship to build reputation and help students
                        </p>
                      </Card>

                      {/* Paid Mentorship Card */}
                      <Card className="p-4 border-2 cursor-pointer transition hover:border-blue-500 hover:bg-blue-50"
                        onClick={() => setMentorData(prev => ({...prev, pricingType: 'paid'}))}>
                        <div className="flex items-center gap-3 mb-2">
                          <input 
                            type="radio" 
                            name="pricing"
                            checked={mentorData.pricingType === 'paid'}
                            onChange={() => setMentorData(prev => ({...prev, pricingType: 'paid'}))}
                            className="cursor-pointer"
                          />
                          <label className="font-bold text-lg cursor-pointer">💎 Paid Mentorship</label>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          Charge students for premium mentorship sessions
                        </p>
                      </Card>
                    </div>
                  </div>

                  {/* Pricing Details - Shown only for Paid */}
                  {mentorData.pricingType === 'paid' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 space-y-4">
                      <h3 className="font-bold text-lg mb-4">📊 Set Your Rates</h3>
                      
                      {/* 1-on-1 Session Rate */}
                      <div className="bg-white rounded-lg p-4">
                        <label className="block font-semibold mb-2">💬 1-on-1 Session Rate (₹/hour)</label>
                        <input
                          type="number"
                          value={mentorData.mentorshipTypes.oneOnOne.ratePerHour || ''}
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : 0;
                            setMentorData(prev => ({
                              ...prev,
                              mentorshipTypes: {
                                ...prev.mentorshipTypes,
                                oneOnOne: {
                                  ...prev.mentorshipTypes.oneOnOne,
                                  ratePerHour: val,
                                },
                              },
                            }));
                          }}
                          min="0"
                          step="100"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 1000"
                        />
                        <p className="text-xs text-gray-600 mt-1">Recommended: ₹500-2000 per hour based on your experience</p>
                      </div>

                      {/* Group Session Rate */}
                      <div className="bg-white rounded-lg p-4">
                        <label className="block font-semibold mb-2">👥 Group Session Rate (₹/hour)</label>
                        <input
                          type="number"
                          value={mentorData.mentorshipTypes.groupSessions.ratePerHour || ''}
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : 0;
                            setMentorData(prev => ({
                              ...prev,
                              mentorshipTypes: {
                                ...prev.mentorshipTypes,
                                groupSessions: {
                                  ...prev.mentorshipTypes.groupSessions,
                                  ratePerHour: val,
                                },
                              },
                            }));
                          }}
                          min="0"
                          step="100"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 500"
                        />
                        <p className="text-xs text-gray-600 mt-1">Typically 30-50% less than 1-on-1 rate</p>
                      </div>

                      {/* Project-Based Rate */}
                      <div className="bg-white rounded-lg p-4">
                        <label className="block font-semibold mb-2">🎯 Project-Based Rate (₹/project)</label>
                        <input
                          type="number"
                          value={mentorData.mentorshipTypes.projectBased.ratePerProject || ''}
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : 0;
                            setMentorData(prev => ({
                              ...prev,
                              mentorshipTypes: {
                                ...prev.mentorshipTypes,
                                projectBased: {
                                  ...prev.mentorshipTypes.projectBased,
                                  ratePerProject: val,
                                },
                              },
                            }));
                          }}
                          min="0"
                          step="500"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 5000"
                        />
                        <p className="text-xs text-gray-600 mt-1">Recommended: ₹5000-20000 depending on scope</p>
                      </div>

                      {/* Career Guidance Rate */}
                      <div className="bg-white rounded-lg p-4">
                        <label className="block font-semibold mb-2">🚀 Career Guidance Rate (₹/session)</label>
                        <input
                          type="number"
                          value={mentorData.mentorshipTypes.careerguidance.ratePerSession || ''}
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : 0;
                            setMentorData(prev => ({
                              ...prev,
                              mentorshipTypes: {
                                ...prev.mentorshipTypes,
                                careerguidance: {
                                  ...prev.mentorshipTypes.careerguidance,
                                  ratePerSession: val,
                                },
                              },
                            }));
                          }}
                          min="0"
                          step="100"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 1500"
                        />
                        <p className="text-xs text-gray-600 mt-1">Recommended: ₹1000-3000 per session</p>
                      </div>
                    </div>
                  )}

                  {/* Free Mentorship Info */}
                  {mentorData.pricingType === 'free' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <h3 className="font-bold text-lg mb-3">🎁 Free Mentorship Benefits</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Build your reputation and credibility</li>
                        <li>✓ Get positive reviews and ratings</li>
                        <li>✓ Help students in your area of expertise</li>
                        <li>✓ Upgrade to paid mentorship later</li>
                      </ul>
                    </div>
                  )}

                  {/* Availability Section */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-4">📅 Your Availability</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Weekly Hours */}
                      <div>
                        <label className="block font-semibold mb-2">Hours Available Per Week</label>
                        <input
                          type="number"
                          value={mentorData.weeklyHours || ''}
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : 0;
                            setMentorData(prev => ({
                              ...prev,
                              weeklyHours: val,
                            }));
                          }}
                          min="0"
                          max="100"
                          step="5"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., 10"
                        />
                        <p className="text-xs text-gray-600 mt-1">How many hours per week can you mentor?</p>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block font-semibold mb-2">Timezone</label>
                        <select
                          value={mentorData.timezone || 'IST'}
                          onChange={e => setMentorData(prev => ({...prev, timezone: e.target.value}))}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="IST">IST (Indian Standard Time)</option>
                          <option value="PST">PST (Pacific Standard Time)</option>
                          <option value="EST">EST (Eastern Standard Time)</option>
                          <option value="GMT">GMT (Greenwich Mean Time)</option>
                          <option value="UTC">UTC (Coordinated Universal Time)</option>
                        </select>
                      </div>

                      {/* Max Concurrent Mentees */}
                      <div>
                        <label className="block font-semibold mb-2">Max Concurrent Mentees</label>
                        <input
                          type="number"
                          value={mentorData.maxConcurrentMentees || ''}
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : 0;
                            setMentorData(prev => ({
                              ...prev,
                              maxConcurrentMentees: val,
                            }));
                          }}
                          min="1"
                          max="100"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., 5"
                        />
                        <p className="text-xs text-gray-600 mt-1">How many students can you mentor at once?</p>
                      </div>

                      {/* Response Time */}
                      <div>
                        <label className="block font-semibold mb-2">Avg Response Time</label>
                        <select
                          value={mentorData.avgResponseTime || '24hours'}
                          onChange={e => setMentorData(prev => ({...prev, avgResponseTime: e.target.value}))}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="1hour">Within 1 hour</option>
                          <option value="6hours">Within 6 hours</option>
                          <option value="24hours">Within 24 hours</option>
                          <option value="2days">Within 2 days</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Set competitive rates based on your experience level and expertise. You can always adjust these later!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review */}
              {activeStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold mb-6">Review Your Profile</h2>

                  <div className="space-y-4">
                    <Card className="p-4 bg-gray-50">
                      <h3 className="font-bold mb-2">{mentorData.professionalTitle}</h3>
                      <p className="text-sm text-gray-600 mb-4">{mentorData.professionalBio}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentorData.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {skill.skillName}
                          </span>
                        ))}
                      </div>
                    </Card>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Check className="text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-green-900">All set!</p>
                          <p className="text-sm text-green-800">
                            Your mentor profile is complete and ready to go live. Students will be
                            able to find and request mentorship from you.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                >
                  Previous
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveStep(activeStep + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Publishing...' : isEditMode ? 'Update Profile' : 'Publish Profile'}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
        </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MentorProfileSetup;
