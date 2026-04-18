/**
 * Talent Pool Component
 * Enterprise-Grade Talent Pool Management for Industry Professionals
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  Mail,
  Phone,
  ExternalLink,
  Download,
  CheckCircle,
  Clock,
  X,
  BarChart3,
  Users,
  TrendingUp,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const TalentPool = () => {
  const [talents, setTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    driveDate: '',
    driveTime: '',
    location: '',
    venue: '',
    rounds: '',
    totalPositions: '',
    description: '',
    requirements: '',
  });

  const [filters, setFilters] = useState({
    status: '',
    applicantType: '',
    keyword: '',
  });

  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      accepted: 0,
      hired: 0,
    },
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 15 });
  const [totalPages, setTotalPages] = useState(1);

  // Fetch talent pool
  useEffect(() => {
    fetchTalentPool();
  }, [pagination.page, filters]);

  const fetchTalentPool = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      if (filters.status) params.append('status', filters.status);
      if (filters.applicantType) params.append('applicantType', filters.applicantType);

      const response = await fetch(`${API_BASE}/industry/talent-pool?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTalents(data.data.talentPool || data.data.applications || []);
        setStatistics(data.data.statistics || {});
        setTotalPages(data.data.pagination?.pages || 1);
      } else {
        console.error('API Error:', data.message);
        setTalents([]);
      }
    } catch (error) {
      console.error('Error fetching talent pool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination({ ...pagination, page: 1 });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      Reviewed: 'bg-orange-50 text-orange-700 border-orange-200',
      Shortlisted: 'bg-purple-50 text-purple-700 border-purple-200',
      Accepted: 'bg-green-50 text-green-700 border-green-200',
      Hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <Clock className="w-4 h-4" />,
      Reviewed: <Search className="w-4 h-4" />,
      Shortlisted: <Star className="w-4 h-4" />,
      Accepted: <CheckCircle className="w-4 h-4" />,
      Hired: <TrendingUp className="w-4 h-4" />,
    };
    return icons[status];
  };

  // Schedule Interview Handler
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedTalent) return;

    setScheduling(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/jobs/applications/${selectedTalent._id}/schedule-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...scheduleForm,
          applicantId: selectedTalent.applicantId,
          applicantEmail: selectedTalent.email,
          applicantName: selectedTalent.applicantName,
          jobTitle: selectedTalent.jobTitle,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Interview scheduled successfully! The applicant will receive notification.');
        setShowScheduleModal(false);
        setScheduleForm({
          driveDate: '',
          driveTime: '',
          location: '',
          venue: '',
          rounds: '',
          totalPositions: '',
          description: '',
          requirements: '',
        });
        fetchTalentPool();
      } else {
        alert('❌ Failed to schedule interview: ' + data.message);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('❌ Error scheduling interview');
    } finally {
      setScheduling(false);
    }
  };

  // Update Application Status Handler
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Application ${newStatus.toLowerCase()} successfully!`);
        setShowDetailsModal(false);
        fetchTalentPool();
      } else {
        alert('❌ Failed to update status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error updating application status');
    }
  };

  // Mark Hired / Unhire Handler
  const canBeHired = (status) => {
    return ['Accepted', 'Shortlisted', 'Reviewed'].includes(status);
  };

  const handleMarkHired = async (applicationId, hired) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/hire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hired, notes: hired ? 'Marked hired by industry' : 'Marked not hired by industry' }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Hire status updated');
        // refresh list and modal
        fetchTalentPool();
        setSelectedTalent((prev) => ({ ...(prev || {}), hired }));
      } else {
        alert('❌ Failed to update hire status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating hire status:', error);
      alert('❌ Error updating hire status');
    }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Talent Pool</h1>
          <p className="text-gray-600">Manage and review all job applications</p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Total Applications</p>
              <Users className="text-orange-600 w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <Clock className="text-yellow-600 w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {statistics.byStatus.pending}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Shortlisted</p>
              <Star className="text-purple-600 w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {statistics.byStatus.shortlisted}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Accepted</p>
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {statistics.byStatus.accepted}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Hired</p>
              <TrendingUp className="text-emerald-600 w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {statistics.byStatus.hired}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Accepted">Accepted</option>
              <option value="Hired">Hired</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              value={filters.applicantType}
              onChange={(e) => handleFilterChange('applicantType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="student">Students</option>
              <option value="freelancer">Freelancers</option>
            </select>
          </div>
        </motion.div>

        {/* Talent Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin">
              <Users className="text-orange-600" size={48} />
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Applicant</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Job Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Applied</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {talents.map((talent, index) => (
                        <motion.tr
                          key={talent._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                {talent.applicantName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {talent.applicantName}
                                </p>
                                <p className="text-xs text-gray-600">{talent.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 font-medium">{talent.jobTitle}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium capitalize">
                              {talent.applicantType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                                talent.status
                              )}`}
                            >
                              {getStatusIcon(talent.status)}
                              <span className="text-xs font-medium">{talent.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              {talent.rating > 0 ? (
                                <>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={
                                        i < talent.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }
                                    />
                                  ))}
                                </>
                              ) : (
                                <span className="text-gray-500 text-xs">Not rated</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(talent.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedTalent(talent);
                                setShowDetailsModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-2"
                            >
                              View
                              <ExternalLink size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-4 mt-8"
              >
                <button
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() =>
                          setPagination((p) => ({ ...p, page }))
                        }
                        className={`px-3 py-2 rounded-lg transition ${
                          pagination.page === page
                            ? 'bg-orange-600 text-white'
                            : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  disabled={pagination.page === totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedTalent && (
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
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTalent.applicantName}</h2>
                    <p className="text-orange-100">{selectedTalent.jobTitle}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-orange-600" />
                        <a
                          href={`mailto:${selectedTalent.email}`}
                          className="text-orange-600 hover:underline"
                        >
                          {selectedTalent.email}
                        </a>
                      </div>
                      {selectedTalent.phone && (
                        <div className="flex items-center gap-3">
                          <Phone size={18} className="text-orange-600" />
                          <a
                            href={`tel:${selectedTalent.phone}`}
                            className="text-orange-600 hover:underline"
                          >
                            {selectedTalent.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Professional Information</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Experience:</span>{' '}
                        {selectedTalent.experience || 'N/A'}
                      </p>
                      <p>
                        <span className="font-semibold">Education:</span>{' '}
                        {selectedTalent.education || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedTalent.skills && selectedTalent.skills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTalent.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume & Portfolio */}
                  <div className="flex gap-3">
                    {selectedTalent.resume && (
                      <a
                        href={selectedTalent.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200 transition"
                      >
                        <Download size={18} />
                        Resume
                      </a>
                    )}
                    {selectedTalent.portfolio && (
                      <a
                        href={selectedTalent.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200 transition"
                      >
                        <ExternalLink size={18} />
                        Portfolio
                      </a>
                    )}
                  </div>

                  {/* Application Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Application Status</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Applied on:{' '}
                      {new Date(selectedTalent.appliedAt).toLocaleDateString()}
                    </p>
                    <div
                      className={`px-4 py-2 rounded-lg text-center font-semibold ${getStatusColor(
                        selectedTalent.status
                      )}`}
                    >
                      {selectedTalent.status}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                      onClick={() => handleUpdateStatus(selectedTalent._id, 'Accepted')}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                      onClick={() => handleUpdateStatus(selectedTalent._id, 'Rejected')}
                    >
                      Reject
                    </button>
                    {/* Hire / Unhire buttons - separate from Accept/Reject */}
                    {selectedTalent?.hired ? (
                      <button
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition"
                        onClick={() => handleMarkHired(selectedTalent._id, false)}
                      >
                        Unhire
                      </button>
                    ) : (
                      <button
                        className={`flex-1 px-4 py-2 ${canBeHired(selectedTalent?.status) ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-200 cursor-not-allowed'} text-white rounded-lg font-semibold transition`}
                        onClick={() => canBeHired(selectedTalent?.status) && handleMarkHired(selectedTalent._id, true)}
                        title={canBeHired(selectedTalent?.status) ? 'Mark as hired' : 'Applicant must be Accepted/Shortlisted before hiring'}
                      >
                        Mark Hired
                      </button>
                    )}
                  </div>

                  {/* Interview Status Display */}
                  {selectedTalent.interviews && selectedTalent.interviews.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold text-gray-900 mb-2">Interview Schedule</h3>
                      {selectedTalent.interviews.map((interview, idx) => (
                        <div key={idx} className="bg-orange-50 rounded-lg p-4 mb-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{interview.type} Interview</span>
                            <span className="text-xs text-orange-700">{interview.status}</span>
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            Date: {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString() : 'N/A'}<br />
                            Time: {interview.scheduledTime || 'N/A'}<br />
                            Venue: {interview.venue || 'N/A'}<br />
                            Notes: {interview.notes || ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TalentPool;
