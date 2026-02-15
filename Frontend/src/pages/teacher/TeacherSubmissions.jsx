import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Filter, Eye, CheckCircle, Clock, FileText,
  Download, ExternalLink, Users, Calendar, ChevronDown,
  MessageSquare, Star, AlertCircle, ChevronRight
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockSubmissions = [
  {
    id: 1,
    competitionId: 1,
    competitionTitle: "AI Innovation Challenge",
    participantName: "Team CodeCrafters",
    participantType: "team",
    teamMembers: ["John Doe", "Jane Smith", "Mike Johnson"],
    submissionType: "repository",
    submissionUrl: "https://github.com/codecrafters/ai-project",
    submittedAt: "Mar 10, 2024, 2:30 PM",
    status: "pending",
    score: null,
    feedback: null,
    totalMarks: 100,
    studentNote: "We focused on model optimization and prompt engineering."
  },
  {
    id: 2,
    competitionId: 1,
    competitionTitle: "AI Innovation Challenge",
    participantName: "Team InnovateTech",
    participantType: "team",
    teamMembers: ["Alice Brown", "Bob Wilson"],
    submissionType: "repository",
    submissionUrl: "https://github.com/innovatetech/ai-solution",
    submittedAt: "Mar 11, 2024, 10:15 AM",
    status: "evaluated",
    score: 85,
    feedback: "Excellent implementation with good documentation. Minor improvements needed in error handling.",
    totalMarks: 100,
    studentNote: "We focused on model optimization and prompt engineering."
  },
  {
    id: 3,
    competitionId: 4,
    competitionTitle: "Database Design Assignment",
    participantName: "Sarah Connor",
    participantType: "individual",
    teamMembers: null,
    submissionType: "file",
    fileName: "database_design_sarah.pdf",
    submittedAt: "Mar 12, 2024, 4:45 PM",
    status: "pending",
    score: null,
    feedback: null,
    totalMarks: 40,
    studentNote: "I followed 3NF strictly. Please check ER assumptions."
  },
  {
    id: 4,
    competitionId: 5,
    competitionTitle: "Programming Fundamentals Quiz",
    participantName: "David Lee",
    participantType: "individual",
    teamMembers: null,
    submissionType: "quiz",
    quizScore: 28,
    totalQuestions: 30,
    submittedAt: "Feb 28, 2024, 3:00 PM",
    status: "evaluated",
    score: 56,
    feedback: "Auto-graded quiz. Good performance.",
    totalMarks: 60,
    studentNote: "I followed 3NF strictly. Please check ER assumptions."
  },
  {
    id: 5,
    competitionId: 3,
    competitionTitle: "Mobile App Challenge",
    participantName: "Team AppBuilders",
    participantType: "team",
    teamMembers: ["Tom Harris", "Emma Davis", "Chris Martin", "Lisa Anderson"],
    submissionType: "repository",
    submissionUrl: "https://github.com/appbuilders/mobile-app",
    submittedAt: "Mar 8, 2024, 11:30 AM",
    status: "evaluated",
    score: 92,
    feedback: "Outstanding work! Excellent UI/UX and robust functionality.",
    totalMarks: 100,
    studentNote: "We focused on model optimization and prompt engineering."
  },
];

const competitions = [
  { id: "all", title: "All Competitions" },
  { id: 1, title: "AI Innovation Challenge" },
  { id: 3, title: "Mobile App Challenge" },
  { id: 4, title: "Database Design Assignment" },
  { id: 5, title: "Programming Fundamentals Quiz" },
];

const statusStyles = {
  pending: { bg: "bg-warning/10", text: "text-warning", label: "Pending Review" },
  evaluated: { bg: "bg-success/10", text: "text-success", label: "Evaluated" },
};

export default function TeacherSubmissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [submissions, setSubmissions] = useState(mockSubmissions);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.competitionTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCompetition =
      competitionFilter === "all" ||
      sub.competitionId === parseInt(competitionFilter);

    const matchesStatus =
      statusFilter === "all" || sub.status === statusFilter;

    const matchesParticipant =
      participantFilter === "all" ||
      sub.participantType === participantFilter;

    return (
      matchesSearch &&
      matchesCompetition &&
      matchesStatus &&
      matchesParticipant
    );
  });


  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const evaluatedCount = submissions.filter(s => s.status === "evaluated").length;

  const handleEvaluate = () => {
    const score = parseInt(scoreInput);

    if (isNaN(score) || score < 0 || score > selectedSubmission.totalMarks) {
      toast.error(`Score must be between 0 and ${selectedSubmission.totalMarks}`);
      return;
    }

    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === selectedSubmission.id
          ? {
            ...sub,
            status: "evaluated",
            score,
            feedback: feedbackInput,
          }
          : sub
      )
    );

    toast.success("Submission evaluated successfully");
    setSelectedSubmission(null);
    setScoreInput("");
    setFeedbackInput("");
  };
  const isEvaluated = selectedSubmission?.status === "evaluated";

  return (
    <AppLayout role="teacher">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Submissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and evaluate student submissions across all competitions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-static p-4">
            <p className="text-sm text-muted-foreground">Total Submissions</p>
            <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
          </div>
          <div className="card-static p-4 border-l-4 border-l-warning">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </div>
          <div className="card-static p-4 border-l-4 border-l-success">
            <p className="text-sm text-muted-foreground">Evaluated</p>
            <p className="text-2xl font-bold text-success">{evaluatedCount}</p>
          </div>
          <div className="card-static p-4">
            <p className="text-sm text-muted-foreground">Avg. Score</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(submissions.filter(s => s.score).reduce((acc, s) => acc + (s.score / s.totalMarks * 100), 0) / evaluatedCount)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-static p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by participant or competition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value)}
                className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Participation Type</option>
                <option value="team">Team</option>
                <option value="individual">Individual</option>
              </select>

              <select
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
                className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {competitions.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.title}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="evaluated">Evaluated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="card-static p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{submission.participantName}</h3>
                    <span className={cn("badge-status text-xs", statusStyles[submission.status].bg, statusStyles[submission.status].text)}>
                      {statusStyles[submission.status].label}
                    </span>
                    {submission.participantType === "team" && (
                      <span className="badge-status text-xs bg-info/10 text-info">
                        <Users className="w-3 h-3 mr-1" />
                        Team
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{submission.competitionTitle}</p>

                  {submission.teamMembers && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Team Members:</p>
                      <div className="flex flex-wrap gap-2">
                        {submission.teamMembers.map((member, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-muted rounded-md text-foreground">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {submission.studentNote && (
                    <div className="mt-3 mb-3 p-3 rounded-lg bg-info/5 border border-info/20">
                      <p className="text-xs font-medium text-info mb-1">
                        Student Note
                      </p>
                      <p className="text-sm text-foreground">
                        {submission.studentNote}
                      </p>
                    </div>
                  )}


                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {submission.submittedAt}
                    </span>
                    {submission.submissionType === "file" && (
                      <span className="flex items-center gap-1 text-info">
                        <FileText className="w-4 h-4" />
                        {submission.fileName}
                      </span>
                    )}
                    {submission.submissionType === "repository" && (
                      <a
                        href={submission.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-info hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Repository
                      </a>
                    )}
                    {submission.submissionType === "quiz" && (
                      <span className="flex items-center gap-1 text-secondary">
                        <CheckCircle className="w-4 h-4" />
                        {submission.quizScore}/{submission.totalQuestions} correct
                      </span>
                    )}
                    {submission.score !== null && (
                      <span className="flex items-center gap-1 font-semibold text-success">
                        <Star className="w-4 h-4" />
                        {submission.score}/{submission.totalMarks}
                      </span>
                    )}
                  </div>

                  {submission.feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Feedback:</p>
                      <p className="text-sm text-foreground">{submission.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {submission.submissionType === "file" && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                  {submission.submissionType === "quiz" && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View Attempt
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gap-2"
                    variant={submission.status === "evaluated" ? "outline" : "default"}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setScoreInput(submission.score?.toString() || "");
                      setFeedbackInput(submission.feedback || "");
                    }}
                  >
                    {submission.status === "evaluated" ? (
                      <>
                        <Eye className="w-4 h-4" />
                        View
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Evaluate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No submissions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Evaluation Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Evaluate Submission
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="font-medium text-foreground">{selectedSubmission.participantName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.competitionTitle}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Score (out of {selectedSubmission.totalMarks})
                  </label>
                  <input
                    type="number"
                    disabled={isEvaluated}
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    min="0"
                    max={selectedSubmission.totalMarks}
                    className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Feedback
                  </label>
                  <textarea
                    value={feedbackInput}
                    disabled={isEvaluated}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Provide feedback for the student..."
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => {
                    setSelectedSubmission(null);
                    setScoreInput("");
                    setFeedbackInput("");
                  }}>
                    Cancel
                  </Button>
                  {!isEvaluated ? (
                    <Button onClick={handleEvaluate}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Evaluation
                    </Button>
                  ) : (
                    <Button onClick={() => setSelectedSubmission(null)}>
                      Close
                    </Button>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
