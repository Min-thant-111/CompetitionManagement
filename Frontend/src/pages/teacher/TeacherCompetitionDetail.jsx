import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Trophy, Users, Calendar, FileText, Edit, 
  CheckCircle, Clock, Eye, BarChart3, Upload, Send
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockCompetitions = {
  1: {
    id: 1,
    title: "AI Innovation Challenge",
    description: "Build innovative AI solutions for real-world problems. This competition challenges participants to create AI-powered applications that address pressing societal issues.",
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
    rules: [
      "Teams must consist of 2-5 members",
      "All code must be original work",
      "Use of external APIs is allowed",
      "Documentation must be provided",
    ],
  },
  2: {
    id: 2,
    title: "Web Development Quiz",
    description: "Test your web development knowledge with this comprehensive quiz covering HTML, CSS, JavaScript, and modern frameworks.",
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
    rules: [
      "60 minutes time limit",
      "No external resources allowed",
      "Each question carries equal marks",
    ],
  },
  3: {
    id: 3,
    title: "Mobile App Challenge",
    description: "Create mobile apps that solve community problems using React Native or Flutter.",
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
    rules: [
      "Must use React Native or Flutter",
      "App must be functional on both iOS and Android",
      "Include user documentation",
    ],
  },
  4: {
    id: 4,
    title: "Database Design Assignment",
    description: "Design efficient database schemas for given business scenarios.",
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
    rules: [
      "Use MySQL or PostgreSQL",
      "Include ER diagrams",
      "Normalize to 3NF",
    ],
  },
  5: {
    id: 5,
    title: "Programming Fundamentals Quiz",
    description: "Basic programming concepts assessment covering variables, loops, functions, and data structures.",
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
    rules: [
      "45 minutes time limit",
      "Multiple choice and coding questions",
    ],
  },
};

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

export default function TeacherCompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const competition = mockCompetitions[id];

  if (!competition) {
    return (
      <AppLayout role="teacher">
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Competition not found</h3>
          <Button onClick={() => navigate("/teacher/competitions")}>
            Back to Competitions
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handlePublish = () => {
    // Mock publish action
    alert("Competition published successfully!");
  };

  return (
    <AppLayout role="teacher">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/teacher/competitions")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Competitions
        </Button>

        {/* Header */}
        <div className="card-static p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                  {competition.title}
                </h1>
                <span className={cn("badge-status text-xs", statusStyles[competition.status].bg, statusStyles[competition.status].text)}>
                  {statusStyles[competition.status].label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={cn("badge-status text-xs", formatStyles[competition.format].bg, formatStyles[competition.format].text)}>
                  {formatStyles[competition.format].label}
                </span>
                <span className="badge-status text-xs bg-muted text-muted-foreground">
                  {competition.participationType === "team" ? "Team" : "Individual"}
                </span>
              </div>
              <p className="text-muted-foreground">{competition.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {competition.status !== "closed" && (
                <Button variant="outline" className="gap-2" asChild>
                  <Link to={`/teacher/competitions/${id}/edit`}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                </Button>
              )}
              {competition.format === "quiz" && (
                <Button variant="outline" className="gap-2" asChild>
                  <Link to={`/teacher/competitions/${id}/questions`}>
                    <FileText className="w-4 h-4" />
                    Manage Questions
                  </Link>
                </Button>
              )}
              {competition.status === "draft" && (
                <Button className="gap-2" onClick={handlePublish}>
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-static p-4 text-center">
            <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{competition.participants}</p>
            <p className="text-sm text-muted-foreground">Participants</p>
          </div>
          {competition.teams && (
            <div className="card-static p-4 text-center">
              <Users className="w-6 h-6 text-info mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{competition.teams}</p>
              <p className="text-sm text-muted-foreground">Teams</p>
            </div>
          )}
          <div className="card-static p-4 text-center">
            <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{competition.pendingSubmissions}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="card-static p-4 text-center">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{competition.evaluatedSubmissions}</p>
            <p className="text-sm text-muted-foreground">Evaluated</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="card-static p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Timeline</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Registration Opens</p>
                <p className="font-medium text-foreground">{competition.registrationOpen}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Registration Closes</p>
                <p className="font-medium text-foreground">{competition.registrationClose}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Submission Deadline</p>
                <p className="font-medium text-foreground">{competition.submissionDeadline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        {competition.rules && (
          <div className="card-static p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Rules & Guidelines</h3>
            <ul className="space-y-2">
              {competition.rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card-static p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to={`/teacher/submissions?competition=${id}`}>
                <Upload className="w-5 h-5" />
                <span>View Submissions</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/teacher/leaderboard">
                <BarChart3 className="w-5 h-5" />
                <span>View Leaderboard</span>
              </Link>
            </Button>
            {competition.format === "quiz" && (
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to={`/teacher/competitions/${id}/questions`}>
                  <FileText className="w-5 h-5" />
                  <span>Manage Questions</span>
                </Link>
              </Button>
            )}
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to={`/teacher/competitions/${id}/edit`}>
                <Edit className="w-5 h-5" />
                <span>Edit Competition</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}