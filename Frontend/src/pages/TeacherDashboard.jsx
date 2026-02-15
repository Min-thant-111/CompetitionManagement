import { useEffect, useState } from "react";
import { 
  Trophy, Users, FileText, PlusCircle, Upload, 
  Calendar, TrendingUp, Eye, Edit, Trash2, ChevronRight,
  Clock, CheckCircle, AlertCircle, BarChart3
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const mockStats = [
  { icon: Trophy, label: "Active Competitions", value: "5", trend: "+2 this month" },
  { icon: Users, label: "Total Participants", value: "1,234", trend: "+156 this week" },
  { icon: FileText, label: "Pending Submissions", value: "47", trend: "12 need review" },
  { icon: Calendar, label: "Upcoming Deadlines", value: "3", trend: "Next: 2 days" },
];

const mockCompetitions = [
  {
    id: 1,
    title: "AI Innovation Challenge",
    format: "project",
    participationType: "team",
    status: "published",
    participants: 234,
    teams: 45,
    deadline: "Mar 15, 2024",
    questions: null,
    totalMarks: 100,
    pendingSubmissions: 12,
  },
  {
    id: 2,
    title: "Web Development Quiz",
    format: "quiz",
    participationType: "individual",
    status: "draft",
    participants: 0,
    teams: null,
    deadline: "Mar 20, 2024",
    questions: 25,
    totalMarks: 50,
    pendingSubmissions: 0,
  },
  {
    id: 3,
    title: "Mobile App Challenge",
    format: "project",
    participationType: "team",
    status: "published",
    participants: 178,
    teams: 38,
    deadline: "Apr 10, 2024",
    questions: null,
    totalMarks: 100,
    pendingSubmissions: 8,
  },
  {
    id: 4,
    title: "Database Design Assignment",
    format: "assignment",
    participationType: "individual",
    status: "published",
    participants: 156,
    teams: null,
    deadline: "Mar 25, 2024",
    questions: null,
    totalMarks: 40,
    pendingSubmissions: 23,
  },
  {
    id: 5,
    title: "Programming Fundamentals Quiz",
    format: "quiz",
    participationType: "individual",
    status: "closed",
    participants: 320,
    teams: null,
    deadline: "Feb 28, 2024",
    questions: 30,
    totalMarks: 60,
    pendingSubmissions: 0,
  },
];

const upcomingDeadlines = [
  { title: "AI Innovation Challenge", deadline: "Mar 15, 2024", daysLeft: 2, type: "submission" },
  { title: "Database Design Assignment", deadline: "Mar 25, 2024", daysLeft: 12, type: "submission" },
  { title: "Web Development Quiz", deadline: "Mar 20, 2024", daysLeft: 7, type: "registration" },
];

const recentActivity = [
  { text: "Team CodeCrafters submitted project", time: "2 min ago", type: "submission" },
  { text: "5 new registrations for AI Challenge", time: "1 hour ago", type: "registration" },
  { text: "Quiz question bank updated", time: "3 hours ago", type: "update" },
  { text: "Mobile App Challenge published", time: "Yesterday", type: "publish" },
  { text: "Database Assignment deadline extended", time: "Yesterday", type: "update" },
];

const statusStyles = {
  published: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  closed: "bg-muted text-muted-foreground",
};

const formatStyles = {
  quiz: "bg-info/10 text-info",
  assignment: "bg-secondary/10 text-secondary",
  project: "bg-achievement/10 text-achievement",
};

export default function TeacherDashboard() {
  const [userName, setUserName] = useState(
    typeof window !== "undefined" ? (localStorage.getItem("userName") || "Teacher") : "Teacher"
  );
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
    if (!token) return;
    fetch("http://localhost:8081/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.fullName) {
          setUserName(data.fullName);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <AppLayout role="teacher">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your competitions and track participant progress
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/teacher/submissions">
                <FileText className="w-4 h-4" />
                Review Submissions
              </Link>
            </Button>
            <Button className="gap-2" asChild>
              <Link to="/teacher/competitions/create">
                <PlusCircle className="w-4 h-4" />
                Create Competition
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <div key={index} className="card-static p-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.trend && (
                  <p className="text-xs text-secondary mt-1">{stat.trend}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Competitions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">My Competitions</h2>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <Link to="/teacher/competitions">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-3">
                {mockCompetitions.slice(0, 4).map((comp) => (
                  <div 
                    key={comp.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{comp.title}</h3>
                        <span className={cn("badge-status text-xs", statusStyles[comp.status])}>
                          {comp.status}
                        </span>
                        <span className={cn("badge-status text-xs", formatStyles[comp.format])}>
                          {comp.format}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {comp.participants} participants
                        </span>
                        {comp.teams && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {comp.teams} teams
                          </span>
                        )}
                        {comp.questions && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {comp.questions} questions
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {comp.deadline}
                        </span>
                        {comp.pendingSubmissions > 0 && (
                          <span className="flex items-center gap-1 text-warning">
                            <AlertCircle className="w-3 h-3" />
                            {comp.pendingSubmissions} pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/teacher/competitions/${comp.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/teacher/competitions/${comp.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      {comp.format === "quiz" && (
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/teacher/competitions/${comp.id}/questions`}>
                            <FileText className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="card-static p-5">
              <h2 className="font-display font-semibold text-lg mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                {upcomingDeadlines.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        item.daysLeft <= 3 ? "bg-destructive/10" : "bg-secondary/10"
                      )}>
                        <Clock className={cn(
                          "w-5 h-5",
                          item.daysLeft <= 3 ? "text-destructive" : "text-secondary"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.type === "submission" ? "Submission" : "Registration"} deadline: {item.deadline}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-medium px-3 py-1 rounded-full",
                      item.daysLeft <= 3 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {item.daysLeft} days left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card-static p-5">
              <h2 className="font-display font-semibold text-lg mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/teacher/competitions/create">
                    <PlusCircle className="w-5 h-5 text-secondary" />
                    Create New Competition
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/teacher/questions">
                    <Upload className="w-5 h-5 text-secondary" />
                    Upload Questions (Excel)
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/teacher/questions/create">
                    <FileText className="w-5 h-5 text-secondary" />
                    Add Question Manually
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/teacher/submissions">
                    <CheckCircle className="w-5 h-5 text-secondary" />
                    Review Submissions
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/teacher/leaderboard">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    View Leaderboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-static p-5">
              <h2 className="font-display font-semibold text-lg mb-4">Recent Activity</h2>
              <div className="space-y-3 text-sm">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      activity.type === "submission" ? "bg-info" :
                      activity.type === "registration" ? "bg-success" :
                      activity.type === "publish" ? "bg-secondary" : "bg-warning"
                    )} />
                    <div>
                      <p className="text-foreground">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Reviews Alert */}
            <div className="card-static p-5 border-l-4 border-l-warning">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Pending Reviews</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have 47 submissions waiting for review across 3 competitions.
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2 text-secondary" asChild>
                    <Link to="/teacher/submissions">
                      Review Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
