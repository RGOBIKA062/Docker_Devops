import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  Target,
  Calendar,
  Building2,
  Handshake,
  Plus,
  X,
  Send,
  AlertCircle,
  Loader,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import "./IndustryDashboard.css";

const API_BASE = "http://localhost:5000/api/industry";
const SERVER_API = "http://localhost:5000/api"; // general server API for jobs/applications

// Get authentication token from localStorage or create test token for development
const getAuthToken = async () => {
  let token = localStorage.getItem("token");
  
  // Try alternative token keys
  if (!token) {
    token = localStorage.getItem("authToken");
  }
  if (!token) {
    token = localStorage.getItem("jwt");
  }
  
  // Development fallback: Create test user with token
  if (!token) {
    console.warn("⚠️ No token found. Creating test user for development...");
    try {
      // Register/login test user
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Industry Test User",
          email: "industry_test_" + Date.now() + "@test.com",
          password: "TestPassword123!",
          userType: "industry"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        token = data.data?.token || data.token;
        if (token) {
          localStorage.setItem("authToken", token);
          console.log("✅ Test user created and token saved");
        }
      }
    } catch (err) {
      console.error("Failed to create test user:", err);
    }
  }
  
  return token;
};

// Modal Component
const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-background border-b border-border flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// Job Opening Form
const JobOpeningForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    positions: "",
    salary: "",
    jobType: "Full-time",
    skills: "",
    experience: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await getAuthToken();
      
      if (!token) {
        setError("Authentication failed. Please log in.");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        positions: parseInt(formData.positions),
        skills: formData.skills.split(",").map((s) => s.trim()).filter(s => s),
      };

      const response = await fetch(`${API_BASE}/job-openings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post job");
      }

      const result = await response.json();
      onSubmit(result.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-600 text-sm">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Job Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Senior Software Engineer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe the job role and responsibilities"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Positions *
          </label>
          <input
            type="number"
            name="positions"
            value={formData.positions}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job Type
          </label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
            <option>Freelance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Salary
          </label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., 5-8 LPA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Application Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Required Skills (comma-separated)
        </label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., JavaScript, React, Node.js"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Experience Required
        </label>
        <input
          type="text"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., 2-3 years"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Post Job
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          className="flex-1 bg-muted hover:bg-muted/80"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Campus Visit Form
const CampusVisitForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    college: "",
    date: "",
    time: "",
    location: "",
    purpose: "Recruitment",
    expectedStudents: "",
    interviewProcess: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await getAuthToken();
      
      if (!token) {
        setError("Authentication failed. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/campus-visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          expectedStudents: parseInt(formData.expectedStudents) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule visit");
      }

      const result = await response.json();
      onSubmit(result.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-600 text-sm">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          College Name *
        </label>
        <input
          type="text"
          name="college"
          value={formData.college}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., IIT Delhi"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Visit Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Location *
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Main Campus, Auditorium A"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Purpose
          </label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Recruitment</option>
            <option>Internship Drive</option>
            <option>Placement Drive</option>
            <option>Campus Hiring</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Expected Students
          </label>
          <input
            type="number"
            name="expectedStudents"
            value={formData.expectedStudents}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., 150"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Interview Process Description
        </label>
        <textarea
          name="interviewProcess"
          value={formData.interviewProcess}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe the interview process and rounds"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Scheduling...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Visit
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          className="flex-1 bg-muted hover:bg-muted/80"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const IndustryDashboard = () => {
  const [stats, setStats] = useState({
    activeCollaborations: 0,
    campusVisits: 0,
    totalHired: 0,
    eventsHosted: 0,
    overallRating: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [campusVisits, setCampusVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modals, setModals] = useState({
    jobOpening: false,
    campusVisit: false,
  });

  // Applications modal state
  const [selectedJobForApps, setSelectedJobForApps] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [jobApplications, setJobApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const openApplicationsModal = async (job) => {
    setSelectedJobForApps(job);
    setShowApplicationsModal(true);
    await fetchApplications(job._id);
  };

  const fetchApplications = async (jobId) => {
    setAppsLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${SERVER_API}/jobs/${jobId}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setJobApplications(data.data.applications || []);
      } else {
        setJobApplications([]);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
      setJobApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${SERVER_API}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchApplications(selectedJobForApps._id);
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const handleMarkHired = async (applicationId, hired) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${SERVER_API}/jobs/applications/${applicationId}/hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hired, notes: hired ? 'Marked hired' : 'Marked not hired' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchApplications(selectedJobForApps._id);
      } else {
        alert('Failed to update hire status: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating hire status');
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getAuthToken();
        
        if (!token) {
          setError("Unable to authenticate. Please log in.");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch stats
        const statsRes = await fetch(`${API_BASE}/stats`, {
          headers,
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }

        // Fetch job openings
        const jobsRes = await fetch(`${API_BASE}/job-openings`, {
          headers,
        });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.data || []);
        }

        // Fetch campus visits
        const visitsRes = await fetch(`${API_BASE}/campus-visits`, {
          headers,
        });
        if (visitsRes.ok) {
          const visitsData = await visitsRes.json();
          setCampusVisits(visitsData.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const staticStats = [
    {
      label: "Active Collaborations",
      value: stats.activeCollaborations || "0",
      icon: Handshake,
      color: "text-blue-500",
    },
    {
      label: "Campus Visits",
      value: stats.campusVisits || "0",
      icon: Building2,
      color: "text-green-500",
    },
    {
      label: "Students Hired",
      value: stats.totalHired || "0",
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Events Hosted",
      value: stats.eventsHosted || "0",
      icon: Calendar,
      color: "text-primary",
    },
  ];

  const staticTalentCategories = [
    { skill: "Full Stack Development", count: "842", demand: "High" },
    { skill: "Data Science & AI", count: "567", demand: "Very High" },
    { skill: "Cloud & DevOps", count: "423", demand: "High" },
    { skill: "Cybersecurity", count: "298", demand: "Medium" },
  ];

  const staticCampusDrives = [
    {
      company: "Your Company",
      date: "March 25",
      roles: "SDE, Data Analyst",
    },
    {
      company: "TechStart Inc",
      date: "March 30",
      roles: "Product Manager",
    },
    {
      company: "InnovateCorp",
      date: "April 5",
      roles: "ML Engineer",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-3 hover-glow-heading">
            Industry Professional{" "}
            <span className="text-primary">Hub</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect with top talent and build academic partnerships
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-600">{error}</span>
          </div>
        )}

        {/* Stats Section - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {staticStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 sm:p-6 border-border rounded-2xl hover:shadow-lg transition-shadow h-full">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-light flex items-center justify-center ${stat.color} mb-3 sm:mb-4`}
                >
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-4 sm:p-6 border-border rounded-3xl bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="font-display font-bold text-lg sm:text-xl text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button
                onClick={() => setModals({ ...modals, jobOpening: true })}
                className="h-auto py-3 sm:py-4 flex-col gap-2 bg-background text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl border border-border text-sm sm:text-base"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold">Post Job Opening</span>
              </Button>

              <Button
                onClick={() => setModals({ ...modals, campusVisit: true })}
                className="h-auto py-3 sm:py-4 flex-col gap-2 bg-background text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl border border-border text-sm sm:text-base"
              >
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold">Schedule Visit</span>
              </Button>

              <Button className="h-auto py-3 sm:py-4 flex-col gap-2 bg-background text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl border border-border text-sm sm:text-base">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold">View Talent Pool</span>
              </Button>

              <Button className="h-auto py-3 sm:py-4 flex-col gap-2 bg-background text-foreground hover:bg-primary hover:text-primary-foreground rounded-xl border border-border text-sm sm:text-base">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold">Start Campaign</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Grid - Fully Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Top Talent Categories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-4 sm:p-6 border-border rounded-3xl h-full">
              <h2 className="font-display font-bold text-lg sm:text-xl text-foreground mb-4 sm:mb-6">
                Top Talent Categories
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {staticTalentCategories.map((item, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-orange-light rounded-xl">
                    <div className="flex justify-between items-center mb-2 gap-2">
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        {item.skill}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          item.demand === "Very High"
                            ? "bg-primary text-primary-foreground"
                            : item.demand === "High"
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {item.demand}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.count} qualified students
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Campus Drives */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-4 sm:p-6 border-border rounded-3xl h-full">
              <h2 className="font-display font-bold text-lg sm:text-xl text-foreground mb-4 sm:mb-6">
                Upcoming Campus Drives
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {campusVisits.length > 0 ? (
                  campusVisits.map((drive, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 bg-orange-light rounded-xl border border-primary/20"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                            {drive.college}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {drive.purpose}
                          </p>
                        </div>
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      </div>
                      <p className="text-xs text-primary font-medium">
                        {new Date(drive.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  staticCampusDrives.map((drive, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 bg-orange-light rounded-xl border border-primary/20"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                            {drive.company}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {drive.roles}
                          </p>
                        </div>
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      </div>
                      <p className="text-xs text-primary font-medium">
                        {drive.date}, 2025
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Job Openings Section */}
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-2 hover-glow-heading">
                Posted Job Openings
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage and showcase your company's current job opportunities
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, shadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                >
                  <Card className="p-6 sm:p-8 border-border rounded-3xl h-full hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 border-2 border-primary/20">
                    {/* Header with Status */}
                    <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-primary/10">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-foreground mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-blue-100 text-blue-700">
                            {job.jobType || "Full-time"}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap ${
                              job.status === "Open"
                                ? "bg-green-100 text-green-700"
                                : job.status === "Closed"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {job.status || "Open"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Positions & Salary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Positions</p>
                        <p className="text-xl sm:text-2xl font-bold text-primary">
                          {job.positions || "N/A"}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Salary</p>
                        <p className="text-lg sm:text-xl font-bold text-green-700">
                          {job.salary || "Negotiable"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                        Description
                      </p>
                      <p className="text-sm sm:text-base text-foreground line-clamp-3 leading-relaxed">
                        {job.description || "No description provided"}
                      </p>
                    </div>

                    {/* Experience Level */}
                    {job.experience && (
                      <div className="mb-6">
                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                          Required Experience
                        </p>
                        <p className="text-sm sm:text-base text-foreground bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                          {job.experience}
                        </p>
                      </div>
                    )}

                    {/* Skills Section */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, skillIndex) => (
                            <motion.span
                              key={skillIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: skillIndex * 0.05 }}
                              className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 hover:border-primary/50 transition-all cursor-default"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deadline if present */}
                    {job.deadline && (
                      <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200">
                        <p className="text-xs text-muted-foreground mb-1">Application Deadline</p>
                        <p className="text-sm font-semibold text-red-700">
                          {new Date(job.deadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    {/* Footer - Applications Count */}
                    <div className="pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {job.applications?.length || 0} applications
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openApplicationsModal(job)}
                              className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
                            >
                              View applications
                            </button>
                          </div>
                        </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Campus Drives Section */}
        {campusVisits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-2 hover-glow-heading">
                Scheduled Campus Drives
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                All your upcoming campus recruitment drives and events
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {campusVisits.map((drive, index) => (
                <motion.div
                  key={drive._id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, shadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                >
                  <Card className="p-6 sm:p-8 border-border rounded-3xl h-full hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200">
                    {/* Header with Purpose */}
                    <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-blue-200">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-foreground mb-2">
                          {drive.college}
                        </h3>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-purple-100 text-purple-700">
                            {drive.purpose || "Recruitment"}
                          </span>
                          <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-blue-100 text-blue-700">
                            {drive.status || "Scheduled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Date</p>
                        <p className="text-sm sm:text-base font-bold text-orange-700">
                          {new Date(drive.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Time</p>
                        <p className="text-sm sm:text-base font-bold text-cyan-700">
                          {drive.time || "TBD"}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                      <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                        Location
                      </p>
                      <p className="text-sm sm:text-base text-foreground bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                        📍 {drive.location || "To be announced"}
                      </p>
                    </div>

                    {/* Expected Students */}
                    {drive.expectedStudents && (
                      <div className="mb-6">
                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                          Expected Participants
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200 text-center">
                          👥 {drive.expectedStudents} Students
                        </p>
                      </div>
                    )}

                    {/* Interview Process */}
                    {drive.interviewProcess && (
                      <div className="mb-6">
                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                          Interview Process
                        </p>
                        <p className="text-sm sm:text-base text-foreground bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-200 line-clamp-4 leading-relaxed">
                          {drive.interviewProcess}
                        </p>
                      </div>
                    )}

                    {/* Recruitment Team */}
                    {drive.recruitmentTeam && (
                      <div className="mb-6">
                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                          Recruitment Team
                        </p>
                        <p className="text-sm sm:text-base text-foreground bg-rose-50 px-4 py-3 rounded-xl border border-rose-200">
                          {drive.recruitmentTeam}
                        </p>
                      </div>
                    )}

                    {/* Footer - Registered Count */}
                    <div className="pt-4 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {drive.registeredStudents?.length || 0} registered
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <span className="text-xs font-medium text-blue-700">Upcoming</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Applications Modal (Industry) */}
        <Modal
          isOpen={showApplicationsModal}
          title={selectedJobForApps ? `Applications for "${selectedJobForApps.title}"` : 'Applications'}
          onClose={() => setShowApplicationsModal(false)}
        >
          <div>
            {appsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : jobApplications.length === 0 ? (
              <p className="text-sm text-gray-600">No applications found.</p>
            ) : (
              <div className="space-y-4">
                {jobApplications.map((app) => (
                  <div key={app._id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{app.applicantInfo?.name || app.applicantName || 'Applicant'}</p>
                      <p className="text-xs text-gray-500">{app.applicantInfo?.email || app.email}</p>
                      <p className="text-xs text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{app.status}</span>
                        {app.hired && <span className="ml-2 px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700">Hired</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateApplicationStatus(app._id, 'Accepted')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">Accept</button>
                      <button onClick={() => handleUpdateApplicationStatus(app._id, 'Rejected')} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">Reject</button>
                      {app.hired ? (
                        <button onClick={() => handleMarkHired(app._id, false)} className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm">Unhire</button>
                      ) : (
                        <button onClick={() => handleMarkHired(app._id, true)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Mark Hired</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      </main>

      {/* Modals */}
      <Modal
        isOpen={modals.jobOpening}
        title="Post a New Job Opening"
        onClose={() => setModals({ ...modals, jobOpening: false })}
      >
        <JobOpeningForm
          onSubmit={(newJob) => {
            setJobs([...jobs, newJob]);
          }}
          onClose={() => setModals({ ...modals, jobOpening: false })}
        />
      </Modal>

      <Modal
        isOpen={modals.campusVisit}
        title="Schedule Campus Visit"
        onClose={() => setModals({ ...modals, campusVisit: false })}
      >
        <CampusVisitForm
          onSubmit={(newVisit) => {
            setCampusVisits([...campusVisits, newVisit]);
          }}
          onClose={() => setModals({ ...modals, campusVisit: false })}
        />
      </Modal>
    </div>
  );
};

export default IndustryDashboard;
