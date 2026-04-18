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
      const payload = {
        ...formData,
        positions: parseInt(formData.positions),
        skills: formData.skills.split(",").map((s) => s.trim()),
      };

      const response = await fetch(`${API_BASE}/job-openings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to post job");

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
      const response = await fetch(`${API_BASE}/campus-visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          ...formData,
          expectedStudents: parseInt(formData.expectedStudents),
        }),
      });

      if (!response.ok) throw new Error("Failed to schedule visit");

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        // Fetch stats
        const statsRes = await fetch(`${API_BASE}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }

        // Fetch job openings
        const jobsRes = await fetch(`${API_BASE}/job-openings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.data || []);
        }

        // Fetch campus visits
        const visitsRes = await fetch(`${API_BASE}/campus-visits`, {
          headers: { Authorization: `Bearer ${token}` },
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
            <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-4 sm:mb-6">
              Posted Job Openings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 sm:p-6 border-border rounded-xl h-full hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {job.positions} positions
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary whitespace-nowrap">
                        {job.jobType}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {job.salary || "Negotiable"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          job.status === "Open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
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
