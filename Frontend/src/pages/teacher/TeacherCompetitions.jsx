import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Trophy, Users, FileText, PlusCircle, Calendar, 
  Eye, Edit, Trash2, Search, Filter, ChevronDown,
  CheckCircle, Clock, AlertCircle, MoreVertical
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockCompetitions = [
  {
    id: 1,
    title: "AI Innovation Challenge",
    description: "Build innovative AI solutions for real-world problems",
    format: "project",
    participationType: "team",
    status: "published",
    participants: 234,
    teams: 45,
    registrationOpen: "Feb 1, 2024",
    registrationClose: "Feb 28, 2024",
    submissionDeadline: "Mar 15, 2024",
    totalMarks: 100,
    pendingSubmissions: 12,
    evaluatedSubmissions: 33,
  },
  {
    id: 2,
    title: "Web Development Quiz",
    description: "Test your web development knowledge",
    format: "quiz",
    participationType: "individual",
    status: "draft",
    participants: 0,
    teams: null,
    registrationOpen: "Mar 1, 2024",
    registrationClose: "Mar 15, 2024",
    submissionDeadline: "Mar 20, 2024",
    questions: 25,
    totalMarks: 50,
    pendingSubmissions: 0,
    evaluatedSubmissions: 0,
  },
  {
    id: 3,
    title: "Mobile App Challenge",
    description: "Create mobile apps that solve community problems",
    format: "project",
    participationType: "team",
    status: "published",
    participants: 178,
    teams: 38,
    registrationOpen: "Feb 15, 2024",
    registrationClose: "Mar 10, 2024",
    submissionDeadline: "Apr 10, 2024",
    totalMarks: 100,
    pendingSubmissions: 8,
    evaluatedSubmissions: 30,
  },
  {
    id: 4,
    title: "Database Design Assignment",
    description: "Design efficient database schemas",
    format: "assignment",
    participationType: "individual",
    status: "published",
    participants: 156,
    teams: null,
    registrationOpen: "Mar 1, 2024",
    registrationClose: "Mar 10, 2024",
    submissionDeadline: "Mar 25, 2024",
    totalMarks: 40,
    pendingSubmissions: 23,
    evaluatedSubmissions: 89,
  },
  {
    id: 5,
    title: "Programming Fundamentals Quiz",
    description: "Basic programming concepts assessment",
    format: "quiz",
    participationType: "individual",
    status: "closed",
    participants: 320,
    teams: null,
    registrationOpen: "Feb 1, 2024",
    registrationClose: "Feb 20, 2024",
    submissionDeadline: "Feb 28, 2024",
    questions: 30,
    totalMarks: 60,
    pendingSubmissions: 0,
    evaluatedSubmissions: 320,
  },
];

const statusStyles = {
  published: { bg: "bg-success/10", text: "text-success", label: "Published" },
  draft: { bg: "bg-warning/10", text: "text-warning", label: "Draft" },
  closed: { bg: "bg-muted", text: "text-muted-foreground", label: "Closed" },
};

const formatStyles = {
  quiz: { bg: "bg-info/10", text: "text-info", label: "Quiz" },
  assignment: { bg: "bg-secondary/10", text: "text-secondary", label: "Assignment" },
  project: { bg: "bg-achievement/10", text: "text-achievement", label: "Project" },
};

export default function TeacherCompetitions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");

  const filteredCompetitions = mockCompetitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || comp.status === statusFilter;
    const matchesFormat = formatFilter === "all" || comp.format === formatFilter;
    return matchesSearch && matchesStatus && matchesFormat;
  });

  return (
    <AppLayout role="teacher">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              My Competitions
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and track all your academic competitions
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link to="/teacher/competitions/create">
              <PlusCircle className="w-4 h-4" />
              Create Competition
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="card-static p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Formats</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
              </select>
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        <div className="grid gap-4">
          {filteredCompetitions.map((comp) => (
            <div key={comp.id} className="card-static p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{comp.title}</h3>
                    <span className={cn("badge-status text-xs", statusStyles[comp.status].bg, statusStyles[comp.status].text)}>
                      {statusStyles[comp.status].label}
                    </span>
                    <span className={cn("badge-status text-xs", formatStyles[comp.format].bg, formatStyles[comp.format].text)}>
                      {formatStyles[comp.format].label}
                    </span>
                    <span className="badge-status text-xs bg-muted text-muted-foreground">
                      {comp.participationType === "team" ? "Team" : "Individual"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{comp.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Participants</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {comp.participants}
                        {comp.teams && <span className="text-muted-foreground">({comp.teams} teams)</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Marks</p>
                      <p className="font-semibold text-foreground">{comp.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {comp.submissionDeadline}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submissions</p>
                      <div className="flex items-center gap-2">
                        {comp.pendingSubmissions > 0 && (
                          <span className="text-warning font-semibold flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {comp.pendingSubmissions} pending
                          </span>
                        )}
                        <span className="text-success font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {comp.evaluatedSubmissions} done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link to={`/teacher/competitions/${comp.id}`}>
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </Button>
                  {comp.status !== "closed" && (
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link to={`/teacher/competitions/${comp.id}/edit`}>
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </Button>
                  )}
                  {comp.format === "quiz" && (
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link to={`/teacher/competitions/${comp.id}/questions`}>
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Questions</span>
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link to={`/teacher/submissions?competition=${comp.id}`}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Submissions</span>
                    </Link>
                  </Button>
                  {comp.status === "draft" && (
                    <Button size="sm" className="gap-2">
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompetitions.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No competitions found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or create a new competition</p>
            <Button asChild>
              <Link to="/teacher/competitions/create">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Competition
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
