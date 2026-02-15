import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import Competitions from "./pages/Competitions";
import CompetitionDetail from "./pages/CompetitionDetail";
import Teams from "./pages/Teams";
import Submissions from "./pages/Submissions";
import SocialFeed from "./pages/SocialFeed";
import Leaderboard from "./pages/Leaderboard";
import MyExternalCompetitions from "./pages/MyExternalCompetitions";
import ContactUs from "./pages/ContactUs";
import Notifications from "./pages/Notifications";
import StudentProfile from "./pages/StudentProfile";
import TeacherProfile from "./pages/TeacherProfile";
import AdminProfile from "./pages/AdminProfile";

// Teacher Pages
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCompetitions from "./pages/teacher/TeacherCompetitions";
import CreateCompetition from "./pages/teacher/CreateCompetition";
import QuestionManagement from "./pages/teacher/QuestionManagement";
import TeacherSubmissions from "./pages/teacher/TeacherSubmissions";
import TeacherLeaderboard from "./pages/teacher/TeacherLeaderboard";
import TeacherSocialFeed from "./pages/teacher/TeacherSocialFeed";
import TeacherCompetitionDetail from "./pages/teacher/TeacherCompetitionDetail";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminExternalCompetitions from "./pages/admin/AdminExternalCompetitions";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminSocialModeration from "./pages/admin/AdminSocialModeration";
import AdminSocialFeed from "./pages/admin/AdminSocialFeed";
import AdminLeaderboard from "./pages/admin/AdminLeaderboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const HomeRedirect = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  const role = (localStorage.getItem("userRole") || "student").toLowerCase();
  if (role === "teacher") return <Navigate to="/teacher" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/student" replace />;
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StudentRoute = ({ children }) => {
  const role = (localStorage.getItem("userRole") || "student").toLowerCase();
  if (role !== "student") {
    if (role === "teacher") return <Navigate to="/teacher" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/competitions" element={<ProtectedRoute><Competitions /></ProtectedRoute>} />
          <Route path="/competitions/:id" element={<StudentRoute><CompetitionDetail /></StudentRoute>} />
          <Route path="/teams" element={<StudentRoute><Teams /></StudentRoute>} />
          <Route path="/submissions" element={<StudentRoute><Submissions /></StudentRoute>} />
          <Route path="/social" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/my-external-competitions" element={<ProtectedRoute><MyExternalCompetitions /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/profile" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
          <Route path="/teacher/competitions" element={<ProtectedRoute><TeacherCompetitions /></ProtectedRoute>} />
          <Route path="/teacher/competitions/create" element={<ProtectedRoute><CreateCompetition /></ProtectedRoute>} />
          <Route path="/teacher/competitions/:id" element={<ProtectedRoute><TeacherCompetitionDetail /></ProtectedRoute>} />
          <Route path="/teacher/competitions/:id/edit" element={<ProtectedRoute><CreateCompetition /></ProtectedRoute>} />
          <Route path="/teacher/competitions/:id/questions" element={<ProtectedRoute><QuestionManagement /></ProtectedRoute>} />
          <Route path="/teacher/questions" element={<ProtectedRoute><QuestionManagement /></ProtectedRoute>} />
          <Route path="/teacher/submissions" element={<ProtectedRoute><TeacherSubmissions /></ProtectedRoute>} />
          <Route path="/teacher/leaderboard" element={<ProtectedRoute><TeacherLeaderboard /></ProtectedRoute>} />
          <Route path="/teacher/social" element={<ProtectedRoute><TeacherSocialFeed /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/external-competitions" element={<ProtectedRoute><AdminExternalCompetitions /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
          <Route path="/admin/social-moderation" element={<ProtectedRoute><AdminSocialModeration /></ProtectedRoute>} />
          <Route path="/admin/social" element={<ProtectedRoute><AdminSocialFeed /></ProtectedRoute>} />
          <Route path="/admin/leaderboard" element={<ProtectedRoute><AdminLeaderboard /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

