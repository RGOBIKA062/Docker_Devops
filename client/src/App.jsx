import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import StudentFeed from "./pages/StudentFeed";
import StudentDashboard from "./pages/StudentDashboard";
import OnlineCompilerPro from "./pages/OnlineCompilerPro";
import FacultyDashboard from "./pages/FacultyDashboard";
import FreelancerPage from "./pages/FreelancerPage";
import AdvancedIndustryPage from "./pages/AdvancedIndustryPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EventDetail from "./pages/EventDetailNew";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import CreateEventPage from "./pages/CreateEventPage";
import MentorDiscovery from "./pages/MentorDiscovery";
import MentorProfileSetup from "./pages/MentorProfileSetup";
import NotFound from "./pages/NotFound";

function App() {
	return (
		<ErrorBoundary>
			<BrowserRouter>
				<AuthProvider>
					<Routes>
					<Route path="/" element={<Landing />} />
					<Route path="/auth" element={<Auth />} />
					<Route path="/student" element={<StudentDashboard />} />
					<Route path="/student-feed" element={<StudentFeed />} />
					<Route path="/create-event" element={<CreateEventPage />} />
					<Route path="/compiler-pro" element={<OnlineCompilerPro />} />
					<Route path="/faculty" element={<FacultyDashboard />} />
					<Route path="/mentor-discovery" element={<MentorDiscovery />} />
					<Route path="/mentor-setup" element={<MentorProfileSetup />} />
					<Route path="/freelancer" element={<FreelancerPage />} />
					<Route path="/industry" element={<AdvancedIndustryPage />} />
					<Route path="/organizer" element={<OrganizerDashboard />} />
					<Route path="/event/:id" element={<EventDetail />} />
					<Route path="/dashboard" element={<UserDashboard />} />
					<Route path="/profile" element={<UserProfile />} />
					<Route path="*" element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</ErrorBoundary>
	);
}

export default App;
