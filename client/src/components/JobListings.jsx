/**
 * Job Listings Component
 * Enterprise-Grade Job Display with Registration
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Heart,
  Share2,
  X,
  Send,
  Loader,
  ChevronRight,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const JobListings = ({ userType = 'student' }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    phone: '',
    resume: '',
    portfolio: '',
    linkedIn: '',
    skills: '',
    experience: '',
    education: '',
    motivationMessage: '',
  });

  const [filters, setFilters] = useState({
    keyword: '',
    jobType: '',
    city: '',
    skills: '',
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 12 });
  const [totalPages, setTotalPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [applicationStatus, setApplicationStatus] = useState('');

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, [pagination.page, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.city) params.append('city', filters.city);
      if (filters.skills) params.append('skills', filters.skills);

      console.log(`🔍 Fetching jobs: ${API_BASE}/jobs/all?${params}`);
      const response = await fetch(`${API_BASE}/jobs/all?${params}`);
      const data = await response.json();

      console.log('📦 API Response:', data);

      if (data.success && data.data) {
        const jobs = data.data.jobs || [];
        console.log(`✅ Loaded ${jobs.length} jobs`);
        setJobs(jobs);
        setFilteredJobs(jobs);
        setTotalPages(data.data.pagination?.pages || 1);
      } else {
        console.warn('⚠️  Unexpected response format:', data);
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    // Validation
    if (!applicationForm.phone || !applicationForm.skills || !applicationForm.experience) {
      setApplicationStatus('❌ Please fill in all required fields: Phone, Skills, and Experience');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setApplicationStatus('❌ Please log in first');
        return;
      }

      const skillsArray = applicationForm.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (skillsArray.length === 0) {
        setApplicationStatus('❌ Please enter at least one skill (comma-separated)');
        return;
      }

      console.log('📤 Submitting application...');
      const response = await fetch(`${API_BASE}/jobs/${selectedJob._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicantType: userType,
          applicantInfo: {
            phone: applicationForm.phone,
            resume: applicationForm.resume || null,
            portfolio: applicationForm.portfolio || null,
            linkedIn: applicationForm.linkedIn || null,
          },
          applicantSkills: skillsArray,
          experience: applicationForm.experience,
          education: applicationForm.education,
          motivationMessage: applicationForm.motivationMessage,
        }),
      });

      const data = await response.json();
      console.log('📬 Response:', data);

      if (data.success) {
        setApplicationStatus('✅ Application submitted successfully!');
        setTimeout(() => {
          setShowApplicationModal(false);
          setApplicationStatus('');
          setApplicationForm({
            phone: '',
            resume: '',
            portfolio: '',
            linkedIn: '',
            skills: '',
            experience: '',
            education: '',
            motivationMessage: '',
          });
          fetchJobs();
        }, 2000);
      } else {
        setApplicationStatus(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      setApplicationStatus(`❌ Error: ${error.message}`);
    }
  };

  const toggleSaveJob = (jobId) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
    } else {
      newSaved.add(jobId);
    }
    setSavedJobs(newSaved);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
          <p className="text-gray-600">Discover and apply for amazing job opportunities</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
            >
              <option value="">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="City..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Skills..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.skills}
              onChange={(e) => handleFilterChange('skills', e.target.value)}
            />
          </div>
        </motion.div>

        {/* Job Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <>
            {filteredJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-lg p-12 text-center"
              >
                <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 mb-6">
                  There are no jobs matching your filters. Try adjusting your search criteria.
                </p>
                <button
                  onClick={() => {
                    setFilters({ keyword: '', jobType: '', city: '', skills: '' });
                    setPagination({ page: 1, limit: 12 });
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence>
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {job.company?.name || 'Company'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job._id);
                          }}
                          className={`p-2 rounded-lg transition ${
                            savedJobs.has(job._id)
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Heart size={20} fill={savedJobs.has(job._id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Job Type & Location */}
                      <div className="flex gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Briefcase size={16} />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{job.location?.city || 'Remote'}</span>
                        </div>
                      </div>

                      {/* Salary */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <IndianRupee size={18} />
                          <span>
                            {job.salary?.min || 'N/A'} - {job.salary?.max || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {(job.requirements?.skills || []).slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {(job.requirements?.skills || []).length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              +{job.requirements.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deadline */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock size={16} />
                        <span>
                          Deadline:{' '}
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setShowApplicationModal(true);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        Apply Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-4 mb-8"
              >
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination((p) => ({ ...p, page }))}
                      className={`px-3 py-2 rounded-lg transition ${
                        pagination.page === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  disabled={pagination.page === totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Application Modal */}
        <AnimatePresence>
          {showApplicationModal && selectedJob && (
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
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                    <p className="text-blue-100">{selectedJob.company?.name}</p>
                  </div>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  {applicationStatus && (
                    <div
                      className={`p-4 rounded-lg mb-6 ${
                        applicationStatus.includes('Error')
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {applicationStatus}
                    </div>
                  )}

                  {/* Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApply();
                    }}
                    className="space-y-6"
                  >
                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        📋 Contact Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={applicationForm.phone}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            LinkedIn Profile
                          </label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/yourname"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={applicationForm.linkedIn}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                linkedIn: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Experience & Skills */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        💼 Experience & Skills
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Years of Experience *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 3 years in Full Stack Development"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={applicationForm.experience}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                experience: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">Include relevant experience description</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Your Skills *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., JavaScript, React, Node.js, MongoDB, AWS"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={applicationForm.skills}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                skills: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">Comma-separated list of skills</p>
                        </div>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        🎓 Education
                      </h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Highest Qualification
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., B.Tech in Computer Science, IIT Delhi"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          value={applicationForm.education}
                          onChange={(e) =>
                            setApplicationForm({
                              ...applicationForm,
                              education: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-5 border border-orange-200">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        📎 Documents & Links
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Resume Link
                          </label>
                          <input
                            type="url"
                            placeholder="https://drive.google.com/file/... or https://example.com/resume.pdf"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            value={applicationForm.resume}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                resume: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">Link to your resume (Google Drive, Dropbox, etc.)</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Portfolio Link
                          </label>
                          <input
                            type="url"
                            placeholder="https://yourportfolio.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            value={applicationForm.portfolio}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                portfolio: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">Your portfolio, GitHub, or personal website</p>
                        </div>
                      </div>
                    </div>

                    {/* Motivation */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-5 border border-indigo-200">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        ✨ Why This Role?
                      </h3>
                      <textarea
                        rows="4"
                        placeholder="Tell the hiring manager why you're excited about this role and what you can bring to the team..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        value={applicationForm.motivationMessage}
                        onChange={(e) =>
                          setApplicationForm({
                            ...applicationForm,
                            motivationMessage: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setShowApplicationModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        Submit Application
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobListings;
