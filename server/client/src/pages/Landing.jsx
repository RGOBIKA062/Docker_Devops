import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// Use a runtime path for the hero image so the dev server doesn't fail before you add the file.
const heroStudent = "/src/assets/hero-student.png";

const Landing = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  // Use runtime asset paths for role images so the page loads before you add files.
  const heroImage = "/src/assets/role-hero.png";
  const studentIcon = "/src/assets/student.png";
  const facultyIcon = "/src/assets/faculty.png";
  const industryIcon = "/src/assets/industry.png";
  const freelancerIcon = "/src/assets/freelancer.png";

  const roles = [
    { id: "student", label: "Student", icon: studentIcon, path: "/student" },
    { id: "faculty", label: "Faculty", icon: facultyIcon, path: "/faculty" },
    { id: "industry", label: "Industry Professional", icon: industryIcon, path: "/industry" },
    { id: "freelancer", label: "Freelancer", icon: freelancerIcon, path: "/freelancer" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left hero visual (large blob image) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative order-1 lg:order-1 flex items-start justify-center"
          >
            <div className="relative w-full max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-110 -z-10" />
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                className="relative overflow-visible"
              >
                <img src={heroImage} alt="Hero" className="w-full h-auto object-contain" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right: heading at top, then 2x2 grid */}
          <div className="order-2 lg:order-2">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-orange-500 mb-6 leading-tight">Tell Us Who You Are</h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-8">To personalize your experience!</p>
            </motion.div>

            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <motion.button
                    key={role.id}
                    onClick={() => {
                      setSelected(role.id);
                      navigate(role.path);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 flex flex-col items-center justify-center py-8 px-6 transition-all ${
                      selected === role.id ? "ring-2 ring-orange-200" : ""
                    }`}
                  >
                    <img src={role.icon} alt={role.label} className="w-12 h-12 mb-4" />
                    <span className="text-lg font-semibold text-gray-900">{role.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
