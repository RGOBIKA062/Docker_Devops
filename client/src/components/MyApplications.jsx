/**
 * My Applications Component
 * Shows user's job applications and their status
 * Enterprise-Grade Implementation
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Calendar,
  MapPin,
  Loader,
  X,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const MyApplications = ({ userType = 'student' }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    accepted: 0,
    hired: 0,
  });

  // Fetch user's applications
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('No authentication token found');
        setApplications([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/jobs/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        setApplications([]);
        return;
      }

      const data = await response.json();

      if (data.success) {
        const apps = Array.isArray(data.data) ? data.data : data.data?.applications || [];
        setApplications(apps);
        calculateStatistics(apps);
      } else {
        console.error('API returned success: false', data.message);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (apps) => {
    const stats = {
      total: apps.length,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      accepted: 0,
      hired: 0,
    };

    apps.forEach((app) => {
      const status = app.status?.toLowerCase();
      if (status === 'pending') stats.pending++;
      else if (status === 'reviewed') stats.reviewed++;
      else if (status === 'shortlisted') stats.shortlisted++;
      else if (status === 'accepted') stats.accepted++;
      else if (status === 'hired') stats.hired++;
    });

    setStatistics(stats);
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      Reviewed: 'bg-orange-50 border-orange-200 text-orange-700',
      Shortlisted: 'bg-purple-50 border-purple-200 text-purple-700',
      Accepted: 'bg-green-50 border-green-200 text-green-700',
      Hired: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      Rejected: 'bg-red-50 border-red-200 text-red-700',
    };

    return colors[status] || colors.Pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <Clock className="w-4 h-4" />,
      Reviewed: <AlertCircle className="w-4 h-4" />,
      Shortlisted: <CheckCircle className="w-4 h-4" />,
      Accepted: <CheckCircle className="w-4 h-4" />,
      Hired: <CheckCircle className="w-4 h-4" />,
    };

    return icons[status] || <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-orange-500" />
        <span className="ml-3 text-slate-600">Loading your applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-600 font-medium">Total Applications</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{statistics.total}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{statistics.pending}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Shortlisted</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{statistics.shortlisted}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Accepted</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{statistics.accepted}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">Hired</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{statistics.hired}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">Reviewed</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{statistics.reviewed}</p>
        </motion.div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 rounded-lg p-12 text-center border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-slate-700 font-semibold text-lg mb-2">No Applications Yet</h3>
          <p className="text-slate-600 text-sm mb-6">You haven't applied for any jobs. Browse the job openings above to get started!</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {applications.map((app, idx) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-6 cursor-pointer"
                onClick={() => {
                  setSelectedApp(app);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {app.jobOpeningId?.title || 'Job Opening'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{app.jobOpeningId?.jobType || 'Job Type'}</span>
                  </div>
                  {app.jobOpeningId?.location?.city && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{app.jobOpeningId.location.city}</span>
                    </div>
                  )}
                </div>

                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status History</p>
                    <div className="space-y-1">
                      {app.statusHistory.slice(-2).map((history, hidx) => (
                        <p key={hidx} className="text-xs text-slate-600">
                          • {history.status} - {new Date(history.timestamp).toLocaleDateString()}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedApp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedApp.jobOpeningId?.title}</h2>
                <p className="text-sm text-slate-600 mt-1">Application Details</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">Current Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedApp.status)}`}>
                  {getStatusIcon(selectedApp.status)}
                  {selectedApp.status}
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Job Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Job Type</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedApp.jobOpeningId?.jobType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Location</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedApp.jobOpeningId?.location?.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Positions</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedApp.jobOpeningId?.positions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Deadline</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(selectedApp.jobOpeningId?.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Info */}
              {selectedApp.applicantInfo && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Your Information</h3>
                  <div className="space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
                    {selectedApp.applicantInfo.skills && (
                      <div>
                        <p className="text-xs text-slate-600 font-semibold mb-1">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(selectedApp.applicantInfo.skills) 
                            ? selectedApp.applicantInfo.skills 
                            : selectedApp.applicantInfo.skills.split(',')).map((skill, idx) => (
                            <span key={idx} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedApp.applicantInfo.experience && (
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">Experience</p>
                        <p className="text-sm text-slate-900">{selectedApp.applicantInfo.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status History */}
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Status History</h3>
                  <div className="space-y-3">
                    {(() => {
                      // Filter out invalid dates
                      const validHistory = selectedApp.statusHistory.filter(h => {
                        const dateVal = h.changedAt || h.timestamp;
                        return dateVal && !isNaN(new Date(dateVal));
                      });
                      // Only show the latest valid status
                      const latest = validHistory.length > 0 ? [validHistory[validHistory.length - 1]] : [];
                      return latest.map((history, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{history.status}</p>
                            <p className="text-xs text-slate-600">
                              {(() => {
                                const dateVal = history.changedAt || history.timestamp;
                                const dateObj = dateVal ? new Date(dateVal) : null;
                                return dateObj && !isNaN(dateObj)
                                  ? `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`
                                  : '';
                              })()}
                            </p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MyApplications;
