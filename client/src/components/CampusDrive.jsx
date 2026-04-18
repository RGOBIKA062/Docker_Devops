/**
 * Campus Drive Component
 * Enterprise-Grade Campus Drive Display and Registration
 * @author Senior Software Developer (25+ Years)
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Share2,
  Download,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const CampusDriveComponent = ({ userType = 'student' }) => {
  const [drives, setDrives] = useState([]);
  const [filteredDrives, setFilteredDrives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    phone: '',
    branch: '',
    year: '',
    cgpa: '',
    backlogs: '0',
    skills: '',
    experience: '',
  });
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [registeredDrives, setRegisteredDrives] = useState(new Set());

  const [filters, setFilters] = useState({
    driveType: '',
    startDate: '',
    endDate: '',
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 12 });
  const [totalPages, setTotalPages] = useState(1);

  // Fetch drives
  useEffect(() => {
    fetchDrives();
  }, [pagination.page, filters]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      params.append('status', 'Scheduled');

      if (filters.driveType) params.append('driveType', filters.driveType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${API_BASE}/drives/all?${params}`);
      const data = await response.json();

      if (data.success) {
        setDrives(data.data.drives);
        setFilteredDrives(data.data.drives);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedDrive) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/drives/${selectedDrive._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationType: userType,
          registrationData: {
            phone: registrationForm.phone,
            branch: registrationForm.branch,
            year: registrationForm.year,
            cgpa: parseFloat(registrationForm.cgpa),
            backlogs: parseInt(registrationForm.backlogs),
            skills: registrationForm.skills.split(',').map((s) => s.trim()),
            experience: registrationForm.experience,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRegistrationStatus('Registration successful!');
        setRegisteredDrives((prev) => new Set([...prev, selectedDrive._id]));
        setTimeout(() => {
          setShowRegistrationModal(false);
          setRegistrationStatus('');
          setRegistrationForm({
            phone: '',
            branch: '',
            year: '',
            cgpa: '',
            backlogs: '0',
            skills: '',
            experience: '',
          });
        }, 2000);
      } else {
        setRegistrationStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      setRegistrationStatus(`Error: ${error.message}`);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination({ ...pagination, page: 1 });
  };

  const getDaysUntilDeadline = (deadlineDate) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scheduled Campus Drives</h1>
          <p className="text-gray-600">Register for exciting recruitment drives at your campus</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={filters.driveType}
              onChange={(e) => handleFilterChange('driveType', e.target.value)}
            >
              <option value="">Drive Type</option>
              <option value="Placement Drive">Placement Drive</option>
              <option value="Internship Drive">Internship Drive</option>
              <option value="Campus Hiring">Campus Hiring</option>
              <option value="Fresher Drive">Fresher Drive</option>
            </select>

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </motion.div>

        {/* Drive Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence>
                {filteredDrives.map((drive, index) => {
                  const daysLeft = getDaysUntilDeadline(drive.schedule.registrationDeadline);
                  const isRegistrationOpen = daysLeft > 0;
                  const isRegistered = registeredDrives.has(drive._id);

                  return (
                    <motion.div
                      key={drive._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                      {/* Badge */}
                      <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-emerald-600 overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-2 right-2 w-24 h-24 bg-white rounded-full" />
                        </div>
                        <div className="relative h-full flex items-end p-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">{drive.title}</h3>
                            <p className="text-emerald-100 text-sm">{drive.driveType}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        {/* Company */}
                        <div>
                          <p className="text-gray-600 text-sm">Company</p>
                          <p className="font-semibold text-gray-900">
                            {drive.company?.name || 'Company Name'}
                          </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-emerald-600 w-5 h-5" />
                            <div>
                              <p className="text-xs text-gray-600">Start Date</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(drive.schedule.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="text-emerald-600 w-5 h-5" />
                            <div>
                              <p className="text-xs text-gray-600">Expected</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {drive.recruitment?.positions || '50'} Positions
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Registration Status */}
                        <div className="space-y-2">
                          {isRegistrationOpen ? (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                              <CheckCircle size={16} />
                              Registration Open - {daysLeft} days left
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600 text-sm font-semibold">
                              <AlertCircle size={16} />
                              Registration Closed
                            </div>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin size={16} />
                          <span>
                            {drive.location?.college?.city || drive.location?.venue?.address || 'TBA'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={() => {
                              setSelectedDrive(drive);
                              setShowDetailsModal(true);
                            }}
                            className="flex-1 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition"
                          >
                            Details
                          </button>
                          {isRegistered ? (
                            <button
                              disabled
                              className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={18} />
                              Registered
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (isRegistrationOpen) {
                                  setSelectedDrive(drive);
                                  setShowRegistrationModal(true);
                                }
                              }}
                              disabled={!isRegistrationOpen}
                              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                                isRegistrationOpen
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              Register
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

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
                          ? 'bg-emerald-600 text-white'
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

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedDrive && (
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
                  <div>
                    <h2 className="text-2xl font-bold">{selectedDrive.title}</h2>
                    <p className="text-emerald-100">{selectedDrive.company?.name}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">About the Drive</h3>
                    <p className="text-gray-700">{selectedDrive.description}</p>
                  </div>

                  {/* Schedule */}
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3">Schedule</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedDrive.schedule.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Registration Deadline</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedDrive.schedule.registrationDeadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Positions */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Job Profiles</h3>
                    <div className="space-y-2">
                      {(selectedDrive.recruitment?.jobProfiles || []).map((profile, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium text-gray-900">{profile.title}</span>
                          <span className="text-emerald-600 font-bold">{profile.count} Positions</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Eligibility Criteria</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Minimum CGPA: {selectedDrive.eligibility?.minCGPA || 'N/A'}</li>
                      <li>• Maximum Backlogs: {selectedDrive.eligibility?.maxBacklogs || '0'}</li>
                      <li>• Years: {(selectedDrive.eligibility?.allowedYears || []).join(', ')}</li>
                    </ul>
                  </div>

                  {/* Contact */}
                  {selectedDrive.contact && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Contact Information</h3>
                      <p className="text-sm text-gray-700">{selectedDrive.contact.email}</p>
                      {selectedDrive.contact.phone && (
                        <p className="text-sm text-gray-700">{selectedDrive.contact.phone}</p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRegistrationModal(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Register for This Drive
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Modal */}
        <AnimatePresence>
          {showRegistrationModal && selectedDrive && (
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
                className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Register for Drive</h2>
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  {registrationStatus && (
                    <div
                      className={`p-4 rounded-lg mb-6 ${
                        registrationStatus.includes('Error')
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {registrationStatus}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRegister();
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      value={registrationForm.phone}
                      onChange={(e) =>
                        setRegistrationForm({ ...registrationForm, phone: e.target.value })
                      }
                      required
                    />

                    {userType === 'student' && (
                      <>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          value={registrationForm.branch}
                          onChange={(e) =>
                            setRegistrationForm({ ...registrationForm, branch: e.target.value })
                          }
                          required
                        >
                          <option value="">Select Branch</option>
                          <option value="CSE">Computer Science</option>
                          <option value="ECE">Electronics</option>
                          <option value="ME">Mechanical</option>
                          <option value="CE">Civil</option>
                        </select>

                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          value={registrationForm.year}
                          onChange={(e) =>
                            setRegistrationForm({ ...registrationForm, year: e.target.value })
                          }
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>

                        <input
                          type="number"
                          step="0.1"
                          placeholder="CGPA"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          value={registrationForm.cgpa}
                          onChange={(e) =>
                            setRegistrationForm({ ...registrationForm, cgpa: e.target.value })
                          }
                          required
                        />

                        <input
                          type="number"
                          placeholder="Number of Backlogs"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          value={registrationForm.backlogs}
                          onChange={(e) =>
                            setRegistrationForm({ ...registrationForm, backlogs: e.target.value })
                          }
                        />
                      </>
                    )}

                    {userType === 'freelancer' && (
                      <>
                        <input
                          type="text"
                          placeholder="Skills (comma separated)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          value={registrationForm.skills}
                          onChange={(e) =>
                            setRegistrationForm({ ...registrationForm, skills: e.target.value })
                          }
                        />

                        <input
                          type="text"
                          placeholder="Years of Experience"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          value={registrationForm.experience}
                          onChange={(e) =>
                            setRegistrationForm({ ...registrationForm, experience: e.target.value })
                          }
                        />
                      </>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowRegistrationModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                      >
                        Confirm Registration
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

export default CampusDriveComponent;
