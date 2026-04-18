/**
 * Advanced Industry Dashboard
 * Enterprise-Grade Industry Management Page
 * Includes Job Openings, Campus Drives, and Talent Pool Management
 * @author Senior Software Developer (25+ Years)
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TalentPool from '@/components/TalentPool';
import {
  Briefcase,
  Calendar,
  Users,
  BarChart3,
  Plus,
  X,
  Send,
  AlertCircle,
  CheckCircle,
  Loader,
  Settings,
  LogOut,
  Home,
  Target,
  TrendingUp,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const AdvancedIndustryPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    campusDrives: 0,
    totalHired: 0,
  });
  const [error, setError] = useState(null);

  const [showJobModal, setShowJobModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    positions: '',
    jobType: 'Full-time',
    salary: { min: '', max: '' },
    location: { city: '', isRemote: false },
    applicationDeadline: '',
    requirements: { skills: '' },
  });

  const [driveFormData, setDriveFormData] = useState({
    title: '',
    description: '',
    driveType: 'Placement Drive',
    schedule: {
      startDate: '',
      endDate: '',
      registrationDeadline: '',
    },
    recruitment: { positions: '' },
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [myDrives, setMyDrives] = useState([]);

  // Fetch stats on load
  useEffect(() => {
    fetchStats();
    fetchMyJobs();
    fetchMyDrives();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }
      const response = await fetch(`${API_BASE}/industry/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('Session expired. Please log in again.');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics.');
    }
  };

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }
      const response = await fetch(`${API_BASE}/jobs/my-jobs?limit=5`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('Session expired. Please log in again.');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setMyJobs(data.data.jobs || []);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs.');
    }
  };

  const fetchMyDrives = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }
      const response = await fetch(`${API_BASE}/drives/my-drives?limit=5`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('Session expired. Please log in again.');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setMyDrives(data.data.drives || []);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
      setError('Failed to load campus drives.');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE}/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...jobFormData,
          requirements: {
            skills: jobFormData.requirements.skills.split(',').map((s) => s.trim()),
          },
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('Session expired. Please log in again.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStatusMessage('Job posting created successfully!');
        setShowJobModal(false);
        setJobFormData({
          title: '',
          description: '',
          positions: '',
          jobType: 'Full-time',
          salary: { min: '', max: '' },
          location: { city: '', isRemote: false },
          applicationDeadline: '',
          requirements: { skills: '' },
        });
        setError(null);
        fetchMyJobs();
        fetchStats();
      } else {
        setStatusMessage(`Error: ${data.message}`);
        setError(data.message);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`${API_BASE}/drives/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(driveFormData),
      });

      // Check for 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('Session expired. Please log in again.');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStatusMessage('Campus drive created successfully!');
        setShowDriveModal(false);
        setDriveFormData({
          title: '',
          description: '',
          driveType: 'Placement Drive',
          schedule: {
            startDate: '',
            endDate: '',
            registrationDeadline: '',
          },
          recruitment: { positions: '' },
        });
        fetchMyDrives();
        fetchStats();
      } else {
        setStatusMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 right-4 z-40 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              statusMessage.includes('successfully')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.includes('successfully') ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Industry Dashboard</h1>
          <p className="text-gray-600">Manage job openings, campus drives, and talent recruitment</p>
        </motion.div>

        {/* Statistics Cards */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold">Active Job Openings</h3>
                <Briefcase className="text-orange-600 w-8 h-8" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.activeJobs}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold">Total Applications</h3>
                <Users className="text-purple-600 w-8 h-8" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold">Campus Drives</h3>
                <Calendar className="text-emerald-600 w-8 h-8" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.campusDrives}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold">Total Hired</h3>
                <TrendingUp className="text-green-600 w-8 h-8" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalHired}</p>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 mb-8 flex-wrap"
        >
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'jobs', label: 'Job Openings', icon: Briefcase },
            { id: 'drives', label: 'Campus Drives', icon: Calendar },
            { id: 'talent', label: 'Talent Pool', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === id
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-600'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowJobModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
                >
                  <Plus size={20} />
                  Post New Job Opening
                </button>
                <button
                  onClick={() => setShowDriveModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                >
                  <Plus size={20} />
                  Schedule Campus Drive
                </button>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Job Openings</h2>
              {myJobs.length > 0 ? (
                <div className="space-y-3">
                  {myJobs.map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300">
                      <div>
                        <h4 className="font-bold text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.positions} positions</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          job.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No job openings yet</p>
              )}
            </div>

            {/* Recent Drives */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Scheduled Campus Drives</h2>
              {myDrives.length > 0 ? (
                <div className="space-y-3">
                  {myDrives.map((drive) => (
                    <div key={drive._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-300">
                      <div>
                        <h4 className="font-bold text-gray-900">{drive.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(drive.schedule.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          drive.status === 'Scheduled'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {drive.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No campus drives scheduled yet</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Job Openings</h2>
              <button
                onClick={() => setShowJobModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
              >
                <Plus size={20} />
                New Job
              </button>
            </div>

            {myJobs.length > 0 ? (
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600 mt-2">{job.description.substring(0, 150)}...</p>
                    <div className="mt-4 flex gap-4 text-sm text-gray-600">
                      <span>📍 {job.location?.city || 'Remote'}</span>
                      <span>💼 {job.jobType}</span>
                      <span>👥 {job.positions} positions</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No job openings yet. Create one to get started!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Drives Tab */}
        {activeTab === 'drives' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Campus Drives</h2>
              <button
                onClick={() => setShowDriveModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
              >
                <Plus size={20} />
                New Drive
              </button>
            </div>

            {myDrives.length > 0 ? (
              <div className="space-y-4">
                {myDrives.map((drive) => (
                  <div key={drive._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold text-gray-900">{drive.title}</h3>
                    <p className="text-gray-600 mt-2">{drive.description.substring(0, 150)}...</p>
                    <div className="mt-4 flex gap-4 text-sm text-gray-600">
                      <span>📅 {new Date(drive.schedule.startDate).toLocaleDateString()}</span>
                      <span>🎓 {drive.driveType}</span>
                      <span>👥 {drive.recruitment?.positions || '50'} positions</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No campus drives scheduled yet. Create one to start recruiting!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Talent Pool Tab */}
        {activeTab === 'talent' && <TalentPool />}
      </div>

      {/* Job Creation Modal */}
      <AnimatePresence>
        {showJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create Job Opening</h2>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={jobFormData.title}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, title: e.target.value })
                  }
                />

                <textarea
                  placeholder="Job Description"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="4"
                  value={jobFormData.description}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, description: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Number of Positions"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={jobFormData.positions}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, positions: e.target.value })
                    }
                  />

                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={jobFormData.jobType}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, jobType: e.target.value })
                    }
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Minimum Salary"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={jobFormData.salary.min}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        salary: { ...jobFormData.salary, min: e.target.value },
                      })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Maximum Salary"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={jobFormData.salary.max}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        salary: { ...jobFormData.salary, max: e.target.value },
                      })
                    }
                  />
                </div>

                <input
                  type="text"
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={jobFormData.location.city}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      location: { ...jobFormData.location, city: e.target.value },
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Required Skills (comma separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={jobFormData.requirements.skills}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      requirements: { skills: e.target.value },
                    })
                  }
                />

                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={jobFormData.applicationDeadline}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      applicationDeadline: e.target.value,
                    })
                  }
                />

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Create Job
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drive Creation Modal */}
      <AnimatePresence>
        {showDriveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Schedule Campus Drive</h2>
                <button
                  onClick={() => setShowDriveModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateDrive} className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Drive Title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={driveFormData.title}
                  onChange={(e) =>
                    setDriveFormData({ ...driveFormData, title: e.target.value })
                  }
                />

                <textarea
                  placeholder="Drive Description"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows="4"
                  value={driveFormData.description}
                  onChange={(e) =>
                    setDriveFormData({ ...driveFormData, description: e.target.value })
                  }
                />

                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={driveFormData.driveType}
                  onChange={(e) =>
                    setDriveFormData({ ...driveFormData, driveType: e.target.value })
                  }
                >
                  <option value="Placement Drive">Placement Drive</option>
                  <option value="Internship Drive">Internship Drive</option>
                  <option value="Campus Hiring">Campus Hiring</option>
                  <option value="Fresher Drive">Fresher Drive</option>
                </select>

                <label className="text-sm font-medium text-gray-700">Registration Deadline *</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={driveFormData.schedule.registrationDeadline}
                  onChange={(e) =>
                    setDriveFormData({
                      ...driveFormData,
                      schedule: {
                        ...driveFormData.schedule,
                        registrationDeadline: e.target.value,
                      },
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Drive Start Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      value={driveFormData.schedule.startDate}
                      onChange={(e) =>
                        setDriveFormData({
                          ...driveFormData,
                          schedule: {
                            ...driveFormData.schedule,
                            startDate: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Drive End Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      value={driveFormData.schedule.endDate}
                      onChange={(e) =>
                        setDriveFormData({
                          ...driveFormData,
                          schedule: {
                            ...driveFormData.schedule,
                            endDate: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <input
                  type="number"
                  placeholder="Number of Positions"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={driveFormData.recruitment.positions}
                  onChange={(e) =>
                    setDriveFormData({
                      ...driveFormData,
                      recruitment: { positions: e.target.value },
                    })
                  }
                />

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDriveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Schedule Drive
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedIndustryPage;
