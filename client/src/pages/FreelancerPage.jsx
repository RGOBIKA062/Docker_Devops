/**
 * FREELANCER PAGE - EXTRAORDINARY UI
 * Enterprise-Grade Freelancer Dashboard with Full MongoDB Integration
 * Features: Profile Management, Portfolio, AI Recommendations, Real-time Updates
 * @author Senior Software Developer (25+ Years)
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobListings from '@/components/JobListings';
import MyApplications from '@/components/MyApplications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import {
  Plus,
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
  Sparkles,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Award,
  Star,
  AlertCircle,
  CheckIcon,
  Loader,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const FreelancerPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Validation Errors State
  const [validationErrors, setValidationErrors] = useState({});
  
  // Demo User ID - generated once and persisted
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem('freelancer_demo_userId');
    if (stored) return stored;
    const newId = 'demo-user-' + Date.now();
    localStorage.setItem('freelancer_demo_userId', newId);
    return newId;
  });

  // Profile State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    headline: 'Freelancer at AllCollegeEvents',
    profileImage: null,
  });

  // Skills State
  const [skills, setSkills] = useState([]);
  // Portfolio State (array of { title, url })
  const [portfolio, setPortfolio] = useState([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    proficiency: 'Intermediate',
    yearsOfExperience: 1,
  });
  const [showSkillDialog, setShowSkillDialog] = useState(false);

  // Certifications State
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    certificateImage: null,
  });
  const [showCertDialog, setShowCertDialog] = useState(false);

  // Projects State
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'Active',
    budget: 0,
    deadline: '',
    githubLink: '',
    hostedLink: '',
    category: 'General',
  });
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  // Statistics State
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedProjects: 0,
    averageRating: 0,
    totalReviews: 0,
    totalSkills: 0,
    profileCompleteness: 0,
  });

  // AI Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [selectedCity, setSelectedCity] = useState('Bangalore');

  // API Helper
  const API_BASE = 'http://localhost:5000/api/freelancer';

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  // Calculate profile completeness
  const calculateProfileCompleteness = (freelancerData) => {
    if (!freelancerData) return 0;
    
    let completed = 0;
    let total = 6;
    
    if (freelancerData.profile?.firstName) completed++;
    if (freelancerData.profile?.lastName) completed++;
    if (freelancerData.profile?.email) completed++;
    if (freelancerData.profile?.phone) completed++;
    if (freelancerData.profile?.bio) completed++;
    if (freelancerData.portfolio && freelancerData.portfolio.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const apiCall = useCallback(
    async (endpoint, method = 'GET', body = null) => {
      try {
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        };

        // Build the URL with userId as query parameter for GET requests
        let url = `${API_BASE}${endpoint}`;
        if (method === 'GET') {
          const separator = url.includes('?') ? '&' : '?';
          url += `${separator}userId=${userId}`;
        }

        // Always include userId in the body for POST/PUT/DELETE requests
        if (body) {
          options.body = JSON.stringify({ ...body, userId });
        } else if (method !== 'GET') {
          options.body = JSON.stringify({ userId });
        }

        const response = await fetch(url, options);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'API Error');
        }

        return await response.json();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 5000);
        throw err;
      }
    },
    [userId]
  );

  // Validation Helper Functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  const validateProfile = (prof) => {
    const errors = {};

    // First Name
    if (!prof.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    // Last Name
    if (!prof.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Email
    if (!prof.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(prof.email)) {
      errors.email = 'Invalid email format (e.g., john@example.com)';
    }

    // Phone (optional but must be valid if provided)
    if (prof.phone?.trim() && !validatePhone(prof.phone)) {
      errors.phone = 'Phone must be exactly 10 digits (e.g., 9876543210)';
    }

    return errors;
  };

  const validateSkill = (skill) => {
    const errors = {};

    if (!skill.name?.trim()) {
      errors.name = 'Skill name is required';
    }

    if (!skill.proficiency) {
      errors.proficiency = 'Proficiency level is required';
    }

    if (skill.yearsOfExperience < 0) {
      errors.yearsOfExperience = 'Years of experience cannot be negative';
    }

    return errors;
  };

  // Load Profile on Mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiCall('/profile');
        
        if (res && res.success && res.data) {
          // Set profile data from database
          if (res.data.profile) {
            setProfile({
              firstName: res.data.profile.firstName || '',
              lastName: res.data.profile.lastName || '',
              email: res.data.profile.email || '',
              phone: res.data.profile.phone || '',
              bio: res.data.profile.bio || '',
              headline: res.data.profile.headline || 'Freelancer at AllCollegeEvents',
              profileImage: res.data.profile.profileImage || null,
            });
          }
          
          setSkills(res.data.skills || []);
          setCertifications(res.data.certifications || []);
          setProjects(res.data.activeProjects || []);
          setPortfolio(res.data.portfolio || []);
          
          // Calculate stats
          if (res.data.financials) {
            setStats({
              totalEarnings: res.data.financials.totalEarnings || 0,
              completedProjects: res.data.financials.completedProjects || 0,
              activeProjects: res.data.activeProjects?.length || 0,
              averageRating: res.data.ratings?.averageRating || 0,
              profileCompleteness: calculateProfileCompleteness(res.data),
            });
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err.message);
        // Don't fail silently - show error to user
        setError('Failed to load profile. Please try again or create a new profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Update Profile
  const handleSaveProfile = async () => {
    try {
      // Validate profile
      const errors = validateProfile(profile);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError(null); // Clear general error
        return;
      }

      setValidationErrors({}); // Clear errors if validation passes
      setLoading(true);
      setError(null);

      const response = await apiCall('/profile', 'POST', {
        profile: {
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          headline: profile.headline.trim(),
          bio: profile.bio.trim(),
          profileImage: profile.profileImage,
        },
        skills,
        portfolio,
        certifications,
      });

      if (response && response.success) {
        setSuccess('Profile saved to MongoDB successfully!');
        setIsEditing(false);
        
        // Update stats with new profile completeness
        setStats(prev => ({
          ...prev,
          profileCompleteness: calculateProfileCompleteness({
            profile: {
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              phone: profile.phone,
              bio: profile.bio,
            },
            portfolio,
          }),
        }));

        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Error saving profile:', err.message);
      setError(`Failed to save profile: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add Skill
  const handleAddSkill = async () => {
    // Validate skill
    const errors = validateSkill(newSkill);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError(null);
      return;
    }

    setValidationErrors({}); // Clear errors

    try {
      await apiCall('/skills', 'POST', newSkill);
      setSkills([...skills, { ...newSkill, endorsements: 0 }]);
      setNewSkill({ name: '', proficiency: 'Intermediate', yearsOfExperience: 1 });
      setShowSkillDialog(false);
      setSuccess('✅ Skill added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (skillName) => {
    try {
      await apiCall(`/skills/${skillName}`, 'DELETE');
      setSkills(skills.filter(s => s.name !== skillName));
      setSuccess('Skill deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  // Add Certification
  const handleAddCertification = async () => {
    if (!newCert.name.trim() || !newCert.issuer.trim()) {
      setError('Certification name and issuer are required');
      return;
    }

    try {
      await apiCall('/certifications', 'POST', newCert);
      setCertifications([...certifications, { ...newCert, _id: Date.now().toString() }]);
      setNewCert({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: '',
        certificateImage: null,
      });
      setShowCertDialog(false);
      setSuccess('Certification added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding certification:', err);
    }
  };

  // Delete Certification
  const handleDeleteCertification = async (id) => {
    try {
      await apiCall(`/certifications/${id}`, 'DELETE');
      setCertifications(certifications.filter(c => c._id !== id));
      setSuccess('Certification deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting certification:', err);
    }
  };

  // Create Project
  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      setError('Project title is required');
      return;
    }
    if (newProject.budget == null || Number(newProject.budget) <= 0) {
      setError('Please set a valid project budget (> 0)');
      return;
    }

    try {
      await apiCall('/projects', 'POST', newProject);
      setProjects([...projects, { ...newProject, _id: Date.now().toString() }]);
      setNewProject({
        title: '',
        description: '',
        status: 'Active',
        budget: 0,
        deadline: '',
        location: '',
        category: 'General',
      });
      setShowProjectDialog(false);
      setSuccess('Project created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  // Update Project Status
  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      // Find the project to get budget BEFORE updating
      const project = projects.find(p => p._id === projectId);
      const wasNotCompleted = project && project.status !== 'Completed';
      const shouldAddEarnings = newStatus === 'Completed' && wasNotCompleted;
      
      await apiCall(`/projects/${projectId}`, 'PUT', { status: newStatus });
      
      // Update projects list
      setProjects(
        projects.map(p =>
          p._id === projectId ? { ...p, status: newStatus } : p
        )
      );
      
      // If project is being marked as completed, add to total earnings
      if (shouldAddEarnings && project) {
        const newTotalEarnings = (stats.totalEarnings || 0) + (project.budget || 0);
        const newCompletedCount = (stats.completedProjects || 0) + 1;
        
        setStats(prevStats => ({
          ...prevStats,
          totalEarnings: newTotalEarnings,
          completedProjects: newCompletedCount
        }));
        
        // Also save to backend
        await apiCall('/profile', 'POST', {
          financials: {
            totalEarnings: newTotalEarnings,
            completedProjects: newCompletedCount
          }
        });
      }
      
      setSuccess('Project status updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  // Recompute earnings and completed count whenever projects change
  useEffect(() => {
    if (!projects) return;
    const completed = projects.filter(p => p.status === 'Completed');
    const total = completed.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    setStats(prev => ({
      ...prev,
      totalEarnings: total,
      completedProjects: completed.length,
    }));
  }, [projects]);

  // Fetch AI Recommendations - NEW: City & Role Based
  const handleGetAIRecommendations = async () => {
    if (skills.length === 0) {
      setError('Please add at least one skill to your profile first!');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (!selectedRole?.trim()) {
      setError('Please select a job role first!');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    try {
      setLoadingAI(true);
      setError(null);
      
      // Use selected role and city
      const city = selectedCity || 'Bangalore';
      const role = selectedRole || 'Full Stack Developer';
      const experience = profile.yearsOfExperience || 0;
      
      // Use comprehensive recommendations endpoint (BEST ACCURACY)
      const apiUrl = `${API_BASE}/recommendations/comprehensive`;
      console.log(`[AI-Job-Finder] Calling: ${apiUrl}`);
      console.log(`[AI-Job-Finder] Filters: City=${city}, Role=${role}, Experience=${experience}`);
      console.log(`[AI-Job-Finder] Skills: ${skills.map(s => s.name).join(', ')}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          city,
          role,
          userId,
          experience,
          skillsMatched: skills.length,
        }),
      });

      console.log(`[AI-Job-Finder] Response status: ${response.status}`);
      
      // Parse response
      let data;
      try {
        data = await response.json();
        console.log('[AI-Job-Finder] Response data:', data);
      } catch (parseError) {
        console.error('[AI-Job-Finder] Failed to parse response:', parseError);
        throw new Error('Invalid server response. Server returned non-JSON data.');
      }

      if (!response.ok) {
        const errorMsg = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[AI-Job-Finder] Error response:', data);
        throw new Error(errorMsg);
      }

      // Handle successful response
      if (data?.success) {
        const recs = data.data?.recommendations || [];
        console.log(`[AI-Job-Finder] Successfully fetched ${recs.length} job recommendations`);
        
        setRecommendations(recs);
        
        // Show message if no recommendations
        if (recs.length === 0 && data.data?.message) {
          setSuccess(data.data.message);
          setTimeout(() => setSuccess(null), 5000);
        } else if (recs.length > 0) {
          setSuccess(`Found ${recs.length} amazing jobs in ${city} for ${role}!`);
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        throw new Error(data?.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('[AI-Job-Finder] Exception caught:', err);
      const errorMsg = err.message || 'Error fetching job recommendations. Please try again.';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading && !profile.firstName) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Loader className="w-12 h-12 text-blue-500" />
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Validation Errors Alert */}
        {Object.keys(validationErrors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Alert className="border-orange-500 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Please fix the following errors:</strong>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}><strong>{field}:</strong> {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Alert className="border-green-500 bg-green-50">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-bold text-blue-600">
                Freelancer Dashboard
              </h1>
              <p className="text-gray-900 mt-2">
                Manage your profile, portfolio, and opportunities
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4 mb-12">
          <StatCard
            icon={<DollarSign className="w-8 h-8" />}
            label="Total Earnings"
            value={`₹${stats.totalEarnings?.toLocaleString() || 0}`}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8" />}
            label="Completed"
            value={stats.completedProjects || 0}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Briefcase className="w-8 h-8" />}
            label="Active Projects"
            value={projects.filter(p => p.status === 'Active').length}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Award className="w-8 h-8" />}
            label="Skills"
            value={skills.length}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Profile"
            value={`${stats.profileCompleteness || 0}%`}
            color="from-cyan-500 to-blue-500"
          />
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-7 gap-2 bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
              Profile
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-blue-600">
              Skills
            </TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-blue-600">
              Certificates
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-blue-600">
              Projects
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-blue-600">
              AI Hub
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600">
              💼 Jobs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8 space-y-6">
            <OverviewSection profile={profile} stats={stats} skills={skills} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-8">
            <ProfileSection
              profile={profile}
              setProfile={setProfile}
              isEditing={isEditing}
              onSave={handleSaveProfile}
              loading={loading}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
            />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="mt-8">
            <SkillsSection
              skills={skills}
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              onAddSkill={handleAddSkill}
              onDeleteSkill={handleDeleteSkill}
              showDialog={showSkillDialog}
              setShowDialog={setShowSkillDialog}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
            />
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="mt-8">
            <CertificatesSection
              certifications={certifications}
              newCert={newCert}
              setNewCert={setNewCert}
              onAddCertification={handleAddCertification}
              onDeleteCertification={handleDeleteCertification}
              showCertDialog={showCertDialog}
              setShowCertDialog={setShowCertDialog}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-8">
            <ProjectsSection
              projects={projects}
              newProject={newProject}
              setNewProject={setNewProject}
              onCreateProject={handleCreateProject}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              showDialog={showProjectDialog}
              setShowDialog={setShowProjectDialog}
            />
          </TabsContent>

          {/* AI Hub Tab */}
          <TabsContent value="ai" className="mt-8">
            <AIHubSection
              recommendations={recommendations}
              loading={loadingAI}
              selectedRole={selectedRole}
              selectedCity={selectedCity}
              onRoleChange={setSelectedRole}
              onCityChange={setSelectedCity}
              onGetRecommendations={handleGetAIRecommendations}
            />
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-8">
            <div className="space-y-8">
              {/* Jobs Container */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Available Job Openings</h3>
                  <p className="text-sm text-gray-600 mt-1">Browse and apply for jobs posted by industry professionals</p>
                </div>
                <div className="p-6">
                  <JobListings userType="freelancer" />
                </div>
              </div>

              {/* My Applications Container */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">My Applications</h3>
                  <p className="text-sm text-gray-600 mt-1">Track all your job applications and their status</p>
                </div>
                <div className="p-6">
                  <MyApplications userType="freelancer" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

/**
 * ==========================================
 * COMPONENT SECTIONS
 * ==========================================
 */

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <motion.div whileHover={{ y: -5 }} className="h-full">
    <Card className={`p-6 bg-gradient-to-br ${color} bg-opacity-5 border-gray-200 h-full`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-900">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-gray-800 opacity-50`}>{icon}</div>
      </div>
    </Card>
  </motion.div>
);

// Overview Section
const OverviewSection = ({ profile, stats, skills }) => (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-8 bg-white border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Welcome Back!</h2>
        <p className="text-gray-900 mb-6">
          {profile.firstName && profile.lastName
            ? `Welcome back, ${profile.firstName}! You're doing great on your freelancing journey.`
            : 'Complete your profile to get started with amazing opportunities.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/50">
            <p className="text-sm text-gray-800">Profile Completeness</p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all"
                style={{ width: `${stats.profileCompleteness || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-900 mt-2">{stats.profileCompleteness || 0}% Complete</p>
          </div>
          <div className="p-4 rounded-lg bg-white/50">
            <p className="text-sm text-gray-800">Your Skills</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                >
                  {skill.name}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="px-3 py-1 bg-gray-600/50 text-gray-900 rounded-full text-xs">
                  +{skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  </div>
);

// Profile Section
const ProfileSection = ({ profile, setProfile, isEditing, onSave, loading, validationErrors, setValidationErrors }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="p-8 bg-white border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Personal Information</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              First Name
            </label>
            <Input
              disabled={false}
              value={profile.firstName}
              onChange={e => {
                setProfile({ ...profile, firstName: e.target.value });
                setValidationErrors(prev => ({ ...prev, firstName: '' }));
              }}
              className={`bg-white text-gray-900 ${validationErrors.firstName ? 'border-2 border-red-500' : 'border-gray-400'}`}
              placeholder="First Name"
            />
            {validationErrors.firstName && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {validationErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Last Name
            </label>
            <Input
              disabled={false}
              value={profile.lastName}
              onChange={e => setProfile({ ...profile, lastName: e.target.value })}
              className={`bg-white text-gray-900 ${validationErrors.lastName ? 'border-2 border-red-500' : 'border-gray-600'}`}
              placeholder="Last Name"
            />
            {validationErrors.lastName && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {validationErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Mail className="inline w-4 h-4 mr-2" /> Email
            </label>
            <Input
              disabled={false}
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              className={`bg-white text-gray-900 ${validationErrors.email ? 'border-2 border-red-500' : 'border-gray-600'}`}
              placeholder="Email"
            />
            {validationErrors.email && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {validationErrors.email}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Phone className="inline w-4 h-4 mr-2" /> Phone (10 digits)
            </label>
            <Input
              disabled={false}
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              className={`bg-white text-gray-900 ${validationErrors.phone ? 'border-2 border-red-500' : 'border-gray-600'}`}
              placeholder="9876543210"
            />
            {validationErrors.phone && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {validationErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Headline</label>
          <Input
            disabled={false}
            value={profile.headline}
            onChange={e => setProfile({ ...profile, headline: e.target.value })}
            className="bg-white border-gray-600 text-gray-900"
            placeholder="Your Professional Headline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
          <Textarea
            disabled={false}
            value={profile.bio}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
            className="bg-white border-gray-600 text-gray-900 min-h-32"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-600">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Skills Section
const SkillsSection = ({
  skills,
  newSkill,
  setNewSkill,
  onAddSkill,
  onDeleteSkill,
  showDialog,
  setShowDialog,
  validationErrors,
  setValidationErrors,
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <Card className="p-8 bg-white border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Skills</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add New Skill</DialogTitle>
              <DialogDescription className="text-gray-800">
                Add a skill to showcase your expertise
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Skill Name
                </label>
                <Input
                  value={newSkill.name}
                  onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                  className={`bg-white text-gray-900 ${validationErrors.name ? 'border-2 border-red-500' : 'border-gray-600'}`}
                  placeholder="e.g., React, Python, Design"
                />
                {validationErrors.name && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {validationErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Proficiency Level
                </label>
                <Select value={newSkill.proficiency} onValueChange={v => setNewSkill({ ...newSkill, proficiency: v })}>
                  <SelectTrigger className={`bg-white text-gray-900 ${validationErrors.proficiency ? 'border-2 border-red-500' : 'border-gray-600'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-600">
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.proficiency && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {validationErrors.proficiency}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  min="0"
                  value={newSkill.yearsOfExperience || 0}
                  onChange={e =>
                    setNewSkill({ ...newSkill, yearsOfExperience: parseInt(e.target.value) || 0 })
                  }
                  className={`bg-white text-gray-900 ${validationErrors.yearsOfExperience ? 'border-2 border-red-500' : 'border-gray-600'}`}
                />
                {validationErrors.yearsOfExperience && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {validationErrors.yearsOfExperience}
                  </p>
                )}
              </div>
              <Button onClick={onAddSkill} className="w-full bg-blue-600 hover:bg-blue-700">
                Add Skill
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-800">
            No skills added yet. Start by adding your first skill!
          </div>
        ) : (
          skills.map((skill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-4 bg-white/50 border-gray-600 hover:border-gray-500 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteSkill(skill.name)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-800">Proficiency</span>
                    <span className="text-gray-900 font-bold">{skill.proficiency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-800">Experience</span>
                    <span className="text-gray-900 font-bold">{skill.yearsOfExperience} year(s)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-800">Endorsements</span>
                    <span className="text-gray-900 font-bold">{skill.endorsements || 0}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  </motion.div>
);

// Portfolio Section
const CertificatesSection = ({
  certifications,
  newCert,
  setNewCert,
  onAddCertification,
  onDeleteCertification,
  showCertDialog,
  setShowCertDialog,
  validationErrors,
  setValidationErrors,
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    {/* Certifications */}
    <Card className="p-8 bg-white border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6" /> Certifications & Credentials
        </h2>
        <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add Certification</DialogTitle>
              <DialogDescription className="text-gray-800">Provide certification details and an optional image to showcase your credentials.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                value={newCert.name}
                onChange={e => setNewCert({ ...newCert, name: e.target.value })}
                className="bg-white border-gray-600 text-gray-900"
                placeholder="Certification Name"
              />
              <Input
                value={newCert.issuer}
                onChange={e => setNewCert({ ...newCert, issuer: e.target.value })}
                className="bg-white border-gray-600 text-gray-900"
                placeholder="Issuing Organization"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-800 mb-2">Issue Date</label>
                  <Input
                    type="date"
                    value={newCert.issueDate}
                    onChange={e => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="bg-white border-gray-600 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-2">Expiry Date (Optional)</label>
                  <Input
                    type="date"
                    value={newCert.expiryDate}
                    onChange={e => setNewCert({ ...newCert, expiryDate: e.target.value })}
                    className="bg-white border-gray-600 text-gray-900"
                  />
                </div>
              </div>
              <Input
                value={newCert.credentialUrl}
                onChange={e => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                className="bg-white border-gray-600 text-gray-900"
                placeholder="Credential URL (Optional)"
              />
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Certificate Image (Optional)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewCert({ ...newCert, certificateImage: event.target?.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="bg-white border-gray-600 text-gray-900"
                />
                {newCert.certificateImage && (
                  <img
                    src={newCert.certificateImage}
                    alt="Certificate Preview"
                    className="w-full h-32 object-cover rounded mt-3"
                  />
                )}
              </div>
              <Button onClick={onAddCertification} className="w-full bg-blue-600 hover:bg-blue-700">
                Add Certification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-800">
            No certifications added yet. Add your credentials!
          </div>
        ) : (
          certifications.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-4 bg-white/50 border-gray-600">
                {cert.certificateImage && (
                  <div className="w-full mb-3 rounded bg-gray-100 overflow-hidden" style={{ height: '180px' }}>
                    <img
                      src={cert.certificateImage}
                      alt={cert.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{cert.name}</h3>
                    <p className="text-sm font-semibold text-gray-800">{cert.issuer}</p>
                    <div className="flex gap-4 text-xs text-gray-800 mt-2">
                      <span className="font-semibold">Issued: {cert.issueDate}</span>
                      {cert.expiryDate && <span className="font-semibold">Expires: {cert.expiryDate}</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteCertification(cert._id)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  </motion.div>
);

// Projects Section
const ProjectsSection = ({
  projects,
  newProject,
  setNewProject,
  onCreateProject,
  onUpdateProjectStatus,
  showDialog,
  setShowDialog,
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <Card className="p-8 bg-white border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Active Projects & Gigs</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create New Project</DialogTitle>
              <DialogDescription className="text-gray-800">Create a project or gig; set budget, deadline and optional links.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                value={newProject.title}
                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                className="bg-white border-gray-600 text-gray-900"
                placeholder="Project Title"
              />
              <Textarea
                value={newProject.description}
                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                className="bg-white border-gray-600 text-gray-900"
                placeholder="Project Description"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  value={newProject.budget === '' || newProject.budget === null ? '' : newProject.budget}
                  onChange={e => {
                    const v = e.target.value;
                    setNewProject({ ...newProject, budget: v === '' ? '' : Number(v) });
                  }}
                  className="bg-white border-gray-600 text-gray-900"
                  placeholder="Budget (₹)"
                />
                <Input
                  type="date"
                  value={newProject.deadline}
                  onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="bg-white border-gray-600 text-gray-900"
                />
              </div>
              <Input
                value={newProject.githubLink}
                onChange={e => setNewProject({ ...newProject, githubLink: e.target.value })}
                className="bg-white border-gray-600 text-gray-900"
                placeholder="GitHub Link (Optional)"
              />
              <Input
                value={newProject.hostedLink}
                onChange={e => setNewProject({ ...newProject, hostedLink: e.target.value })}
                className="bg-white border-gray-600 text-gray-900"
                placeholder="Hosted Link (Optional)"
              />
              <Button onClick={onCreateProject} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-800">
            No projects yet. Create your first gig!
          </div>
        ) : (
          projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-white/50 border-gray-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-800 mt-1">{project.description}</p>
                  </div>
                  <div className="text-right">
                    <Select
                      value={project.status}
                      onValueChange={v => onUpdateProjectStatus(project._id, v)}
                    >
                      <SelectTrigger className="w-32 bg-white text-gray-900 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-600">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-800">Budget</p>
                    <p className="text-gray-900 font-semibold">₹{project.budget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-800">Deadline</p>
                    <p className="text-gray-900 font-semibold">{project.deadline || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-800">Category</p>
                    <p className="text-gray-900 font-semibold">{project.category}</p>
                  </div>
                </div>
                {(project.githubLink || project.hostedLink) && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-400">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        GitHub →
                      </a>
                    )}
                    {project.hostedLink && (
                      <a
                        href={project.hostedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Live Link →
                      </a>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  </motion.div>
);

// AI Hub Section
const AIHubSection = ({
  recommendations,
  loading,
  selectedRole,
  selectedCity,
  onRoleChange,
  onCityChange,
  onGetRecommendations,
}) => {
  const jobRoles = [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'React Developer',
    'Python Developer',
    'Node.js Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Mobile Developer',
    'UI/UX Designer',
  ];

  const cities = [
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Pune',
    'Chennai',
    'Hyderabad',
    'Kolkata',
    'Ahmedabad',
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-8 bg-white border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-gray-900">AI Job Finder</h2>
        </div>
        <p className="text-gray-800 mb-6">
          Get AI-powered job recommendations based on your skills, role, and location
        </p>

        {/* Role and City Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Job Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Job Role</label>
            <Select value={selectedRole} onValueChange={onRoleChange}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Choose a job role..." />
              </SelectTrigger>
              <SelectContent>
                {jobRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select City</label>
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Choose a city..." />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Get Recommendations Button */}
        <Button
          onClick={onGetRecommendations}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2 mb-6"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Get Recommendations
            </>
          )}
        </Button>

        {/* Job Recommendations Display */}
        {recommendations && Array.isArray(recommendations) && recommendations.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ✨ {recommendations.length} Amazing Jobs Found for {selectedRole}
            </h3>
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow">
                  {/* Company and Title */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{rec.company}</p>
                      <p className="text-gray-700 font-semibold">{rec.title}</p>
                    </div>
                    {rec.matchPercentage && (
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        {rec.matchPercentage}% Match
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-3">{rec.description}</p>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">💰 Salary</p>
                      <p className="font-semibold text-green-600">{rec.salary}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">📍 Location</p>
                      <p className="font-semibold text-gray-900">{rec.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">💼 Type</p>
                      <p className="font-semibold text-gray-900">{rec.jobType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">🌐 Work Mode</p>
                      <p className="font-semibold text-gray-900">{rec.remoteWork}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {rec.requiredSkills && rec.requiredSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.requiredSkills.map((skill, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Reason */}
                  {rec.matchReason && (
                    <p className="text-xs text-purple-600 italic mb-3">✓ {rec.matchReason}</p>
                  )}

                  {/* Benefits */}
                  {rec.benefits && rec.benefits.length > 0 && (
                    <div className="text-xs text-gray-600 mb-3">
                      <p className="font-semibold text-gray-700 mb-1">Benefits:</p>
                      <p>{rec.benefits.slice(0, 3).join(' • ')}</p>
                    </div>
                  )}

                  {/* Apply Button */}
                  {rec.applyUrl && (
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      onClick={() => window.open(rec.applyUrl, '_blank')}
                    >
                      Apply Now
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg text-center border border-gray-200">
            <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Select a role and city, then click "Get Recommendations"</p>
            <p className="text-gray-500 text-sm">to discover AI-powered job opportunities</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default FreelancerPage;





