import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Plus,
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";

const FreelancerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Stats
  const [projects, setProjects] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);

  // Profile + certificates
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [samples, setSamples] = useState([]);
  const [sampleInput, setSampleInput] = useState("");

  const [certs, setCerts] = useState([]);
  const [certInput, setCertInput] = useState("");

  const [certImages, setCertImages] = useState([]);

  // Marketplace
  const [opportunities, setOpportunities] = useState([]);
  const [newOpp, setNewOpp] = useState({
    title: "",
    pay: "",
    date: "",
    location: "",
  });

  // AI suggestions (mocked locally)
  const [suggestions, setSuggestions] = useState([]);

  // Skill Boost (mocked frontend-only)
  const [skillBoost, setSkillBoost] = useState({
    newSkills: [],
    courses: [],
    workshops: [],
  });

  // Auto-generate AI suggestions and Skill Boost locally
  useEffect(() => {
    if (skills.length === 0) {
      setSuggestions([]);
      setSkillBoost({ newSkills: [], courses: [], workshops: [] });
      return;
    }

    const generatedSuggestions = skills.map((skill, index) => ({
      id: `${Date.now()}-${index}`,
      text: `You have skill in ${skill}. Here are events requiring ${skill}.`,
    }));
    setSuggestions(generatedSuggestions);

    setSkillBoost({
      newSkills: skills.map((s) => `${s} Advanced`),
      courses: skills.map((s) => `Course to master ${s}`),
      workshops: skills.map((s) => `${s} Workshop near you`),
    });
  }, [skills]);

  // Helper functions
  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills((prev) => [...prev, newSkill.trim()]);
    setNewSkill("");
  };

  const addSample = () => {
    if (!sampleInput.trim()) return;
    setSamples((prev) => [...prev, sampleInput.trim()]);
    setSampleInput("");
  };

  const addCertificateName = () => {
    if (!certInput.trim()) return;
    setCerts((prev) => [...prev, certInput.trim()]);
    setCertInput("");
  };

  const addOpportunity = () => {
    if (!newOpp.title.trim()) return;
    setOpportunities((prev) => [...prev, newOpp]);
    setProjects((prev) => [...prev, newOpp]); // Add to active projects
    setNewOpp({ title: "", pay: "", date: "", location: "" });
  };

  const deleteOpportunity = (index) => {
    setOpportunities((prev) => prev.filter((_, i) => i !== index));
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCertificateUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setCertImages((prev) => [...prev, ...urls]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold">Freelancer Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your projects, skills & opportunities.
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Browse Events
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold mt-2">{projects.length}</p>
            </div>
            <Briefcase className="w-8 h-8 opacity-20 text-primary" />
          </Card>

          <Card className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Earnings</p>
              <p className="text-2xl font-bold mt-2">₹{earnings}</p>
            </div>
            <DollarSign className="w-8 h-8 opacity-20 text-primary" />
          </Card>

          <Card className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold mt-2">{completedProjects}</p>
            </div>
            <CheckCircle className="w-8 h-8 opacity-20 text-primary" />
          </Card>

          <Card className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold mt-2">-</p>
            </div>
            <Clock className="w-8 h-8 opacity-20 text-primary" />
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Smart Profile</TabsTrigger>
            <TabsTrigger value="market">Marketplace</TabsTrigger>
            <TabsTrigger value="ai">AI Finder</TabsTrigger>
            <TabsTrigger value="skillboost">Skill Boost</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6">
            <Card className="p-8 text-center">
              Welcome to your enhanced freelancer dashboard!
            </Card>
          </TabsContent>

          {/* Smart Profile */}
          <TabsContent value="profile" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Profile Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
                <Input
                  placeholder="Phone Number"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Short Bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </div>

              {/* Profile Preview */}
              <Card className="p-4 mt-6 bg-primary/5">
                <h3 className="text-lg font-bold mb-3">Profile Preview</h3>
                <p>
                  <strong>Name:</strong> {profile.name || "Not entered"}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email || "Not entered"}
                </p>
                <p>
                  <strong>Phone:</strong> {profile.phone || "Not entered"}
                </p>
                <p>
                  <strong>Bio:</strong> {profile.bio || "No bio added"}
                </p>
              </Card>

              <hr className="my-6" />

              {/* Skills */}
              <h2 className="text-xl font-bold mb-4">Your Skills</h2>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add skill (ex: photography)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <hr className="my-6" />

              {/* Sample Works */}
              <h2 className="text-xl font-bold mb-4">Sample Works</h2>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Project link or title"
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                />
                <Button onClick={addSample}>Add</Button>
              </div>
              <ul className="list-disc pl-5">
                {samples.map((sample, i) => (
                  <li key={i}>{sample}</li>
                ))}
              </ul>

              <hr className="my-6" />

              {/* Certificates */}
              <h2 className="text-xl font-bold mb-4">Certificates (Names Only)</h2>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Certificate name"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                />
                <Button onClick={addCertificateName}>Add</Button>
              </div>
              <ul className="list-disc pl-5">
                {certs.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>

              <hr className="my-6" />

              {/* Certificate Images */}
              <h2 className="text-xl font-bold mb-4">Upload Certificate Images</h2>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleCertificateUpload}
                className="mb-4"
              />
              {certImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {certImages.map((img, i) => (
                    <div key={i} className="rounded overflow-hidden shadow">
                      <img
                        src={img}
                        alt={`Certificate ${i + 1}`}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Marketplace */}
          <TabsContent value="market" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Post Opportunity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Event Title"
                  value={newOpp.title}
                  onChange={(e) =>
                    setNewOpp({ ...newOpp, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Pay"
                  value={newOpp.pay}
                  onChange={(e) =>
                    setNewOpp({ ...newOpp, pay: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={newOpp.date}
                  onChange={(e) =>
                    setNewOpp({ ...newOpp, date: e.target.value })
                  }
                />
                <Input
                  placeholder="Location"
                  value={newOpp.location}
                  onChange={(e) =>
                    setNewOpp({ ...newOpp, location: e.target.value })
                  }
                />
              </div>
              <Button className="mt-4" onClick={addOpportunity}>
                Add Opportunity
              </Button>

              <hr className="my-6" />

              <h3 className="text-lg font-bold mb-4">Available Gigs</h3>
              {opportunities.length === 0 ? (
                <p>No opportunities yet.</p>
              ) : (
                opportunities.map((opp, i) => (
                  <Card
                    key={i}
                    className="p-4 mb-3 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold">{opp.title}</h4>
                      <p>Pay: ₹{opp.pay}</p>
                      <p>Date: {opp.date}</p>
                      <p>Location: {opp.location}</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => deleteOpportunity(i)}
                    >
                      Delete
                    </Button>
                  </Card>
                ))
              )}
            </Card>
          </TabsContent>

          {/* AI Finder */}
          <TabsContent value="ai" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> AI Recommendations
              </h2>
              {suggestions.length === 0 ? (
                <p>Add skills in your profile to get AI job suggestions.</p>
              ) : (
                suggestions.map((s) => (
                  <Card key={s.id} className="p-4 mb-3">
                    {s.text}
                  </Card>
                ))
              )}
            </Card>
          </TabsContent>

          {/* Skill Boost */}
          <TabsContent value="skillboost" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Skill Improvement Suggestions</h2>
              {!skillBoost.newSkills.length ? (
                <p className="text-muted-foreground">
                  Add skills in your profile to get skill improvement suggestions.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">New Skills to Learn</h3>
                    <ul className="list-disc pl-4">
                      {skillBoost.newSkills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Recommended Courses</h3>
                    <ul className="list-disc pl-4">
                      {skillBoost.courses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Workshops Near You</h3>
                    <ul className="list-disc pl-4">
                      {skillBoost.workshops.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Community */}
          <TabsContent value="community" className="mt-6">
            <CommunityHub />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerDashboard;

// CommunityHub component
const CommunityHub = () => {
  const [posts, setPosts] = useState([]);
  const [postInput, setPostInput] = useState("");

  const addPost = () => {
    if (!postInput.trim()) return;
    setPosts((prev) => [...prev, postInput.trim()]);
    setPostInput("");
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Users className="w-5 h-5" /> Community Hub
      </h2>

      <div className="flex gap-2 mt-4">
        <Textarea
          placeholder="Share something..."
          value={postInput}
          onChange={(e) => setPostInput(e.target.value)}
        />
        <Button onClick={addPost}>Post</Button>
      </div>

      <div className="mt-6">
        {posts.map((p, i) => (
          <Card key={i} className="p-4 mb-3">
            {p}
          </Card>
        ))}
      </div>
    </Card>
  );
};