import { useEffect, useRef, useState } from "react";
import { 
  Upload, FileText, Link as LinkIcon, Clock, CheckCircle2, 
  XCircle, AlertCircle, Eye, Download, ExternalLink, Shield, X,
  HelpCircle, CheckSquare, Edit3, Play, Award, Globe
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { QuizAttempt } from "@/components/quiz/QuizAttempt";
import { toast } from "sonner";

// Generate more quiz questions for pagination demo (30 questions)
const generateQuizQuestions = () => {
  const questions = [];
  for (let i = 1; i <= 30; i++) {
    if (i % 3 === 1) {
      questions.push({
        id: i,
        type: "mcq",
        question: `Question ${i}: Which of the following is correct about data structures?`,
        options: ["A. Arrays have O(1) access time", "B. Linked lists have O(1) access time", "C. Both have same access time", "D. Neither has O(1) access time"],
        answer: null,
      });
    } else if (i % 3 === 2) {
      questions.push({
        id: i,
        type: "truefalse",
        question: `Question ${i}: JavaScript is a statically typed language.`,
        options: ["True", "False"],
        answer: null,
      });
    } else {
      questions.push({
        id: i,
        type: "fillblank",
        question: `Question ${i}: In Python, the _____ keyword is used to define a function.`,
        options: null,
        answer: null,
      });
    }
  }
  return questions;
};

const participationResultOptions = [
  "Winner", "1st Runner Up", "2nd Runner Up", "3rd Place", 
  "Top 5", "Top 10", "Finalist", "Participant"
];

// External submissions - only appear when admin enables them with deadline
const mockExternalSubmissions = [
  {
    id: 101,
    competition: "National Coding Championship",
    organizer: "National Computer Society",
    scale: "National",
    deadline: "Apr 10, 2024, 11:59 PM",
    submittedAt: "Mar 28, 2024, 2:30 PM",
    status: "pending_approval",
    files: ["ncc_certificate.pdf", "participation_photo.png"],
    participationResult: "Top 10",
    description: "Participated in the national-level programming contest and solved 8 out of 10 problems.",
    adminEnabled: true,
    isExternal: true,
  },
  {
    id: 102,
    competition: "International Math Olympiad",
    organizer: "International Mathematical Union",
    scale: "International",
    deadline: "May 15, 2024, 11:59 PM",
    submittedAt: null,
    status: "pending",
    files: [],
    participationResult: null,
    description: "",
    adminEnabled: true,
    isExternal: true,
  },
  {
    id: 103,
    competition: "AWS Cloud Skills Challenge",
    organizer: "Amazon Web Services",
    scale: "International",
    deadline: "Apr 20, 2024, 11:59 PM",
    submittedAt: "Apr 15, 2024, 3:00 PM",
    status: "approved",
    files: ["aws_certificate.pdf"],
    participationResult: "Finalist",
    description: "Completed all challenges and earned AWS certification badge.",
    adminEnabled: true,
    isExternal: true,
    adminNote: "Verified with AWS certification database.",
  },
  {
    id: 104,
    competition: "Google Code Jam Regional",
    organizer: "Google",
    scale: "National",
    deadline: "Dec 30, 2026, 11:59 PM", // Future deadline - student can resubmit
    submittedAt: "Dec 15, 2026, 10:00 AM",
    status: "rejected",
    files: ["gcj_screenshot.png"],
    participationResult: "Participant",
    description: "Participated in the regional round.",
    adminEnabled: true,
    isExternal: true,
    adminNote: "Please provide official certificate or results page showing your name.",
  },
  {
    id: 105,
    competition: "Microsoft Imagine Cup",
    organizer: "Microsoft",
    scale: "International",
    deadline: "Feb 28, 2027, 11:59 PM",
    submittedAt: null,
    status: "pending",
    files: [],
    participationResult: null,
    description: "",
    adminEnabled: true,
    isExternal: true,
  },
];

const statusConfig = {
  submitted: { icon: CheckCircle2, class: "bg-success/10 text-success", label: "Submitted" },
  pending: { icon: Clock, class: "bg-warning/10 text-warning", label: "Pending" },
  overdue: { icon: AlertCircle, class: "bg-destructive/10 text-destructive", label: "Overdue" },
  pending_approval: { icon: Clock, class: "bg-info/10 text-info", label: "Pending Approval" },
  approved: { icon: CheckCircle2, class: "bg-success/10 text-success", label: "Approved" },
  rejected: { icon: XCircle, class: "bg-destructive/10 text-destructive", label: "Rejected" },
};

const submissionTypeLabels = {
  file: { label: "File Upload", icon: Upload, description: "Upload PDF, Word, or Excel files" },
  repo: { label: "Repository Link", icon: LinkIcon, description: "Submit GitHub, GitLab, or Bitbucket link" },
  quiz: { label: "Quiz Submission", icon: HelpCircle, description: "Answer multiple choice, true/false, and fill-in-blank questions" },
  external_proof: { label: "External Proof", icon: Award, description: "Upload certificate/proof for external competition" },
};

const formatDateTime = (value) => {
  if (!value) return "No deadline";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No deadline" : date.toLocaleString();
};

const toSubmissionType = (format) => {
  switch ((format || "").toUpperCase()) {
    case "PROJECT":
      return "repo";
    case "QUIZ":
      return "quiz";
    case "ASSIGNMENT":
    default:
      return "file";
  }
};

const toQuizAnswerMap = (answers) => {
  if (!Array.isArray(answers)) return null;
  return answers.reduce((acc, ans, idx) => {
    acc[idx + 1] = ans ?? "";
    return acc;
  }, {});
};

const toQuizAnswerList = (answers, totalQuestions) => {
  if (!answers) return [];
  const out = Array.from({ length: totalQuestions || 0 }, () => "");
  Object.entries(answers).forEach(([key, value]) => {
    const idx = Number(key);
    if (!Number.isNaN(idx) && idx > 0 && idx <= out.length) {
      out[idx - 1] = value ?? "";
    }
  });
  return out;
};

const readErrorMessage = async (res) => {
  try {
    const data = await res.json();
    return data?.message || data?.error || "Request failed";
  } catch {
    return "Request failed";
  }
};

export default function Submissions() {
  const userRole = (localStorage.getItem("userRole") || "student").toLowerCase();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [internalSubmissions, setInternalSubmissions] = useState([]);
  const [externalSubmissions, setExternalSubmissions] = useState(mockExternalSubmissions);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [repoLink, setRepoLink] = useState("");
  const [showQuizAttempt, setShowQuizAttempt] = useState(false);
  const [viewingQuizAnswers, setViewingQuizAnswers] = useState(null);
  const [activeTab, setActiveTab] = useState("internal");
  const [participationResult, setParticipationResult] = useState("");
  const [externalDescription, setExternalDescription] = useState("");
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem("userId") || "");
  const fileInputRef = useRef(null);

  const loadData = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setInternalSubmissions([]);
      setLoadError("Please log in to view submissions.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      const [competitionsRes, registrationsRes, submissionsRes, teamsRes, profileRes] = await Promise.all([
        fetch(`${API_BASE_URL}/competitions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/competitions/registrations/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/teams/my`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      if (!competitionsRes.ok) {
        throw new Error(await readErrorMessage(competitionsRes));
      }

      if (!registrationsRes.ok) {
        throw new Error(await readErrorMessage(registrationsRes));
      }
      if (!submissionsRes.ok) {
        throw new Error(await readErrorMessage(submissionsRes));
      }
      if (!teamsRes.ok) {
        throw new Error(await readErrorMessage(teamsRes));
      }

      const competitions = await competitionsRes.json();
      const registrations = await registrationsRes.json();
      const submissions = await submissionsRes.json();
      const teams = await teamsRes.json();
      if (profileRes.ok) {
        const profile = await profileRes.json().catch(() => null);
        if (profile?.id) {
          localStorage.setItem("userId", profile.id);
          setCurrentUserId(profile.id);
        }
      } else {
        setCurrentUserId(localStorage.getItem("userId") || "");
      }

      const competitionMap = new Map(
        (Array.isArray(competitions) ? competitions : []).map((c) => [c.competitionId || c.id, c])
      );

      const teamMap = new Map(
        (Array.isArray(teams) ? teams : []).map((t) => [t.teamId, t])
      );

      const submissionIndex = new Map();
      (Array.isArray(submissions) ? submissions : []).forEach((s) => {
        const key = s.teamId
          ? `${s.competitionId}:${s.teamId}`
          : `${s.competitionId}:IND:${s.submittedBy}`;
        submissionIndex.set(key, s);
      });

      const internal = (Array.isArray(registrations) ? registrations : [])
        .map((reg) => {
          const competition = competitionMap.get(reg.competitionId);
          if (!competition) return null;

          const isTeam = !!reg.teamId;
          const team = isTeam ? teamMap.get(reg.teamId) : null;
          const submissionType = toSubmissionType(competition.format);
          const submissionKey = isTeam
            ? `${reg.competitionId}:${reg.teamId}`
            : `${reg.competitionId}:IND:${reg.studentId}`;
          const submission = submissionIndex.get(submissionKey);
          const deadline = competition.submissionDeadline;
          const status = submission
            ? "submitted"
            : isDeadlinePassed(deadline)
              ? "overdue"
              : "pending";

          const quiz = submissionType === "quiz"
            ? {
                title: competition.title,
                timeLimit: competition.quizDurationMinutes
                  ? `${competition.quizDurationMinutes} minutes`
                  : "60 minutes",
                questions: generateQuizQuestions(),
              }
            : null;

          return {
            id: reg.id || `${reg.competitionId}-${reg.teamId || reg.studentId}`,
            competitionId: reg.competitionId,
            competition: competition.title,
            team: team ? team.teamName : (isTeam ? "Team" : null),
            teamLeaderId: team ? team.leaderId : null,
            isTeam,
            submissionType,
            submittedAt: submission?.submittedAt ? formatDateTime(submission.submittedAt) : null,
            deadline,
            status,
            files: submission?.file ? [submission.file] : [],
            repoLink: submission?.repoLink || null,
            quizAnswers: submission?.quizAnswers ? toQuizAnswerMap(submission.quizAnswers) : null,
            canResubmit: submissionType !== "quiz",
            isExternal: false,
            quiz,
          };
        })
        .filter(Boolean);

      setInternalSubmissions(internal);
    } catch (error) {
      const message = error?.message || "Failed to load submissions.";
      setLoadError(message);
      setInternalSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole !== "student") {
      setLoading(false);
      setLoadError("Submissions are available for student role only.");
      return;
    }
    loadData();
  }, [userRole]);

  const canSubmit = (submission) => {
    if (!submission.isTeam) return true;
    return submission.teamLeaderId === currentUserId;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return false;
    return date < new Date();
  };

  const openSubmitModal = (submission) => {
    if (submission.submissionType === "quiz" && submission.status === "submitted") {
      setSelectedSubmission(submission);
      setViewingQuizAnswers(submission.quizAnswers);
      setShowQuizAttempt(true);
      return;
    }
    
    if (submission.submissionType === "quiz" && submission.status === "pending") {
      setSelectedSubmission(submission);
      setShowQuizAttempt(true);
      return;
    }
    
    setSelectedSubmission(submission);
    setShowSubmitModal(true);
    setUploadedFile(null);
    setRepoLink(submission.repoLink || "");
    setParticipationResult(submission.participationResult || "");
    setExternalDescription(submission.description || "");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (selectedSubmission?.isExternal && !['png', 'pdf'].includes(ext)) {
        toast.error("Only PNG and PDF files are allowed for external submissions");
        return;
      }
      // Check custom allowed file types for internal submissions
      if (!selectedSubmission?.isExternal && selectedSubmission?.allowedFileTypes) {
        const allowedExts = selectedSubmission.allowedFileTypes.split(',').map(t => t.replace('.', '').trim());
        if (!allowedExts.includes(ext)) {
          toast.error(`Only ${selectedSubmission.fileTypeDescription || selectedSubmission.allowedFileTypes} files are allowed`);
          return;
        }
      }
      setUploadedFile(file);
    }
  };

  const handleFileDownload = (fileName) => {
    const link = document.createElement("a");
    link.href = "#";
    link.download = fileName;
    alert(`Downloading: ${fileName}`);
  };

  const handleQuizSubmit = async (answers) => {
    if (!selectedSubmission) return;
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Please log in to submit.");
      return;
    }

    try {
      const totalQuestions = selectedSubmission.quiz?.questions?.length || 0;
      const payload = {
        quizAnswers: toQuizAnswerList(answers, totalQuestions),
      };

      const res = await fetch(
        `${API_BASE_URL}/competitions/${selectedSubmission.competitionId}/submissions/quiz`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      toast.success("Quiz submitted!");
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to submit quiz.");
    } finally {
      setShowQuizAttempt(false);
      setSelectedSubmission(null);
      setViewingQuizAnswers(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubmission) return;

    if (selectedSubmission.isExternal) {
      if (!uploadedFile && selectedSubmission.files.length === 0) {
        toast.error("Please upload proof files (PNG or PDF)");
        return;
      }
      if (!participationResult) {
        toast.error("Please select your participation result");
        return;
      }
      if (!externalDescription.trim()) {
        toast.error("Please provide a description of your participation");
        return;
      }

      setExternalSubmissions(prev => prev.map(sub => {
        if (sub.id === selectedSubmission.id) {
          return {
            ...sub,
            status: "pending_approval",
            submittedAt: new Date().toLocaleString(),
            files: uploadedFile ? [uploadedFile.name] : sub.files,
            participationResult: participationResult,
            description: externalDescription,
          };
        }
        return sub;
      }));
      toast.success("External participation proof submitted for admin approval!");
      setShowSubmitModal(false);
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Please log in to submit.");
      return;
    }

    const competitionId = selectedSubmission.competitionId;
    const isUpdate = selectedSubmission.status === "submitted";

    try {
      let endpoint = "";
      let payload = {};

      if (selectedSubmission.submissionType === "file") {
        const fileName = uploadedFile?.name || selectedSubmission.files?.[0];
        if (!fileName) {
          toast.error("Please upload a file before submitting.");
          return;
        }
        endpoint = `/competitions/${competitionId}/submissions/assignment`;
        payload = { file: fileName, description: "" };
      } else if (selectedSubmission.submissionType === "repo") {
        const link = repoLink || selectedSubmission.repoLink;
        if (!link) {
          toast.error("Please provide a repository link.");
          return;
        }
        endpoint = `/competitions/${competitionId}/submissions/project`;
        payload = { repoLink: link, description: "" };
      } else {
        toast.error("Unsupported submission type.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      toast.success("Submission successful!");
      await loadData();
      setShowSubmitModal(false);
    } catch (error) {
      toast.error(error?.message || "Failed to submit.");
    }
  };

  if (userRole !== "student") {
    return (
      <AppLayout role={userRole}>
        <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
          <h1 className="text-2xl font-display font-bold text-foreground">My Submissions</h1>
          <div className="card-static p-6 text-center text-muted-foreground">
            Submissions are available for student role only.
          </div>
        </div>
      </AppLayout>
    );
  }

  // Quiz full-screen mode
  if (showQuizAttempt && selectedSubmission?.quiz) {
    return (
      <QuizAttempt
        quiz={selectedSubmission.quiz}
        onSubmit={handleQuizSubmit}
        onCancel={() => {
          setShowQuizAttempt(false);
          setSelectedSubmission(null);
          setViewingQuizAnswers(null);
        }}
        submittedAnswers={viewingQuizAnswers}
        isViewMode={viewingQuizAnswers !== null}
      />
    );
  }

  const renderInternalSubmission = (submission) => {
    const StatusIcon = statusConfig[submission.status].icon;
    const isLeader = canSubmit(submission);
    const TypeInfo = submissionTypeLabels[submission.submissionType];
    const isQuiz = submission.submissionType === "quiz";
    
    return (
      <div key={submission.id} className="card-static p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-lg">{submission.competition}</h3>
              <span className={cn("badge-status", statusConfig[submission.status].class)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[submission.status].label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {submission.isTeam ? (
                <>
                  <span>Team: {submission.team}</span>
                  <span className="badge-status bg-muted text-muted-foreground text-xs">
                    {isLeader ? "You are Leader" : "Team Member"}
                  </span>
                </>
              ) : (
                <span className="badge-status bg-accent text-accent-foreground text-xs">
                  Individual
                </span>
              )}
              <span className="badge-status bg-secondary/10 text-secondary text-xs flex items-center gap-1">
                <TypeInfo.icon className="w-3 h-3" />
                {TypeInfo.label}
              </span>
              {!isQuiz && (
                <span className="badge-status bg-info/10 text-info text-xs">
                  Resubmission allowed
                </span>
              )}
              {isQuiz && (
                <span className="badge-status bg-warning/10 text-warning text-xs">
                  No resubmission
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-warning" />
              <span>Deadline: <strong className="text-foreground">{formatDateTime(submission.deadline)}</strong></span>
            </div>
          </div>
        </div>

        {submission.status === "submitted" ? (
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Submitted on {submission.submittedAt}
            </p>
            <div className="flex flex-wrap gap-2">
              {submission.files.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-sm"
                >
                  <FileText className="w-4 h-4 text-secondary" />
                  {file}
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => handleFileDownload(file)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {submission.repoLink && (
                <a 
                  href={submission.repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-sm hover:bg-muted transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-secondary" />
                  Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {isQuiz && submission.quizAnswers && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
                  <CheckSquare className="w-4 h-4" />
                  Quiz Completed ({Object.values(submission.quizAnswers).filter(a => a !== "").length}/{submission.quiz.questions.length} answered)
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => openSubmitModal(submission)}
              >
                <Eye className="w-4 h-4" />
                {isQuiz ? "View Answers" : "View Submission"}
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "rounded-lg p-4",
            isLeader ? "bg-warning/5 border border-warning/20" : "bg-muted/30 border border-border"
          )}>
            {isLeader ? (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Submission Required</p>
                    <p className="text-sm text-muted-foreground">
                      {TypeInfo.description}
                    </p>
                  </div>
                </div>
                
                {submission.submissionType === "file" && (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-secondary transition-colors cursor-pointer"
                    onClick={() => openSubmitModal(submission)}
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Upload Files</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.fileTypeDescription || ".pdf, .doc, .docx, .xlsx up to 50MB"}
                    </p>
                  </div>
                )}
                
                {submission.submissionType === "repo" && (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-secondary transition-colors cursor-pointer"
                    onClick={() => openSubmitModal(submission)}
                  >
                    <LinkIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Add Repository Link</p>
                    <p className="text-xs text-muted-foreground">GitHub, GitLab, Bitbucket</p>
                  </div>
                )}
                
                {submission.submissionType === "quiz" && (
                  <div 
                    className="border-2 border-dashed border-secondary/50 rounded-lg p-6 text-center bg-secondary/5 cursor-pointer hover:bg-secondary/10 transition-colors"
                    onClick={() => openSubmitModal(submission)}
                  >
                    <Play className="w-10 h-10 mx-auto text-secondary mb-3" />
                    <p className="text-lg font-semibold text-foreground">Start Quiz</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {submission.quiz?.questions.length} questions • {submission.quiz?.timeLimit}
                    </p>
                    <p className="text-xs text-warning mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Full-screen mode • No resubmission allowed
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => openSubmitModal(submission)}
                >
                  {submission.submissionType === "quiz" ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </>
                  ) : (
                    "Submit Entry"
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Waiting for Team Leader</p>
                  <p className="text-sm text-muted-foreground">
                    Only the team leader can submit for this competition. Contact your team leader to submit the project.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderExternalSubmission = (submission) => {
    const StatusIcon = statusConfig[submission.status].icon;
    const deadlinePassed = isDeadlinePassed(submission.deadline);
    
    // Don't show if deadline passed and not submitted
    if (deadlinePassed && submission.status === "pending") {
      return null;
    }

    // Check if student can resubmit (only when rejected and within deadline)
    const canResubmit = submission.status === "rejected" && !deadlinePassed;
    
    // Check if submission is view-only (pending_approval or approved)
    const isViewOnly = submission.status === "pending_approval" || submission.status === "approved";
    
    return (
      <div key={submission.id} className="card-static p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-lg">{submission.competition}</h3>
              <span className={cn("badge-status", statusConfig[submission.status].class)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[submission.status].label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {submission.organizer}
              </span>
              <span className="badge-status bg-accent text-accent-foreground text-xs">
                {submission.scale}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-warning" />
              <span>Deadline: <strong className="text-foreground">{submission.deadline}</strong></span>
            </div>
          </div>
        </div>

        {/* Info text - only show for pending (not yet submitted) */}
        {submission.status === "pending" && (
          <div className="bg-info/5 border border-info/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-info flex items-center gap-2">
              <Award className="w-4 h-4" />
              External participation can be uploaded (one-time submission)
            </p>
          </div>
        )}

        {/* View-only notice for pending_approval and approved */}
        {isViewOnly && (
          <div className={cn(
            "rounded-lg p-3 mb-4 flex items-center gap-3",
            submission.status === "approved" 
              ? "bg-success/10 border border-success/20" 
              : "bg-info/10 border border-info/20"
          )}>
            {submission.status === "approved" ? (
              <>
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-success text-sm">Approved</p>
                  <p className="text-xs text-muted-foreground">Your participation has been verified</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="font-medium text-info text-sm">Pending Review</p>
                  <p className="text-xs text-muted-foreground">Your submission is being reviewed by admin</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Rejected notice */}
        {submission.status === "rejected" && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {canResubmit 
                ? "Your submission was rejected. You may resubmit within the deadline."
                : "Your submission was rejected. The deadline has passed."}
            </p>
          </div>
        )}

        {/* Submitted state - show submission details */}
        {submission.status !== "pending" ? (
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Submitted on {submission.submittedAt}
            </p>
            {submission.description && (
              <p className="text-sm text-foreground">{submission.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {submission.files.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-sm"
                >
                  <FileText className="w-4 h-4 text-secondary" />
                  {file}
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => handleFileDownload(file)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {submission.participationResult && (
                <span className="badge-status bg-secondary/10 text-secondary">
                  Result: {submission.participationResult}
                </span>
              )}
            </div>
            
            {/* Only show resubmit button when rejected and within deadline */}
            {canResubmit && (
              <Button 
                className="mt-2" 
                size="sm"
                onClick={() => openSubmitModal(submission)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Resubmit
              </Button>
            )}

            {/* View button for approved/pending_approval */}
            {isViewOnly && (
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setShowSubmitModal(true);
                    setParticipationResult(submission.participationResult || "");
                    setExternalDescription(submission.description || "");
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Submission
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg p-4 bg-muted/30 border border-border">
            <div 
              className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-secondary transition-colors cursor-pointer"
              onClick={() => openSubmitModal(submission)}
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Upload Proof Files</p>
              <p className="text-xs text-muted-foreground">PNG or PDF files only</p>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={() => openSubmitModal(submission)}
            >
              Submit Participation Proof
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Submissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your competition submissions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg border border-border overflow-hidden w-fit">
          <button
            onClick={() => setActiveTab("internal")}
            className={cn(
              "px-6 py-2.5 text-sm font-medium transition-colors",
              activeTab === "internal"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            Internal ({internalSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab("external")}
            className={cn(
              "px-6 py-2.5 text-sm font-medium transition-colors",
              activeTab === "external"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            External ({externalSubmissions.filter(s => s.adminEnabled).length})
          </button>
        </div>

        {/* Info Banner */}
        {activeTab === "internal" && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Submission Guidelines</p>
              <p className="text-sm text-muted-foreground">
                For team competitions, only the team leader can submit. Each competition allows only one type of submission. 
                <strong> File and repository submissions can be resubmitted within the deadline. Quiz submissions cannot be changed once submitted.</strong>
              </p>
            </div>
          </div>
        )}

        {activeTab === "external" && (
          <div className="bg-accent/50 border border-accent rounded-lg p-4 flex items-start gap-3">
            <Award className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">External Participation</p>
              <p className="text-sm text-muted-foreground">
                Upload proof of your participation in external competitions. Submit a description, your result, and proof files (PNG or PDF). 
                <strong> You can only submit once. Resubmission is only allowed if admin rejects your proof.</strong>
              </p>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          {activeTab === "internal" && loading && (
            <div className="card-static p-6 text-center text-muted-foreground">
              Loading submissions...
            </div>
          )}
          {activeTab === "internal" && !loading && loadError && (
            <div className="card-static p-6 text-center text-destructive">
              {loadError}
            </div>
          )}
          {activeTab === "internal" && !loading && !loadError && internalSubmissions.map(renderInternalSubmission)}
          {activeTab === "external" && externalSubmissions.filter(s => s.adminEnabled).map(renderExternalSubmission)}
        </div>

        {activeTab === "internal" && !loading && !loadError && internalSubmissions.length === 0 && (
          <div className="card-static p-12 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No internal submissions yet. Register for a competition to get started!</p>
          </div>
        )}

        {activeTab === "external" && externalSubmissions.filter(s => s.adminEnabled).length === 0 && (
          <div className="card-static p-12 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No external competitions available for submission yet. Check back later!</p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={selectedSubmission?.isExternal 
            ? ".png,.pdf" 
            : (selectedSubmission?.allowedFileTypes || ".pdf,.doc,.docx,.xlsx,.xls,.zip")}
          onChange={handleFileUpload}
        />

        {/* Submit Modal */}
        {showSubmitModal && selectedSubmission && (() => {
          const isExternalViewOnly = selectedSubmission.isExternal && 
            (selectedSubmission.status === "pending_approval" || selectedSubmission.status === "approved");
          const isExternalResubmit = selectedSubmission.isExternal && 
            selectedSubmission.status === "rejected" && !isDeadlinePassed(selectedSubmission.deadline);
          
          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="card-static w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-xl">
                  {selectedSubmission.isExternal 
                    ? (isExternalViewOnly ? "View Submission" : 
                       isExternalResubmit ? "Resubmit Proof" : "Submit External Participation Proof")
                    : (selectedSubmission.status === "submitted" ? "View Submission" : "Submit Entry")} - {selectedSubmission.competition}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSubmitModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* External Proof Submission */}
                {selectedSubmission.isExternal && (
                  <>
                    {/* View-only banner */}
                    {isExternalViewOnly && (
                      <div className={cn(
                        "rounded-lg p-3 mb-2",
                        selectedSubmission.status === "approved" 
                          ? "bg-success/10 border border-success/20" 
                          : "bg-warning/10 border border-warning/20"
                      )}>
                        <p className={cn(
                          "text-sm flex items-center gap-2",
                          selectedSubmission.status === "approved" ? "text-success" : "text-warning"
                        )}>
                          {selectedSubmission.status === "approved" ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              This submission has been approved. View-only mode.
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" />
                              This submission is pending review. View-only mode.
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Description {!isExternalViewOnly && <span className="text-destructive">*</span>}
                      </label>
                      {isExternalViewOnly ? (
                        <div className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
                          {selectedSubmission.description || "No description provided"}
                        </div>
                      ) : (
                        <textarea
                          placeholder="Describe your participation in this competition..."
                          rows={3}
                          value={externalDescription}
                          onChange={(e) => setExternalDescription(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Participation Result {!isExternalViewOnly && <span className="text-destructive">*</span>}
                      </label>
                      {isExternalViewOnly ? (
                        <div className="w-full h-10 px-3 flex items-center rounded-lg bg-muted/30 border border-border text-sm">
                          {selectedSubmission.participationResult || "Not specified"}
                        </div>
                      ) : (
                        <select
                          value={participationResult}
                          onChange={(e) => setParticipationResult(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select your result</option>
                          {participationResultOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Proof Files {!isExternalViewOnly && <span className="text-destructive">*</span>}
                      </label>
                      {isExternalViewOnly ? (
                        <div className="rounded-lg p-4 bg-muted/30 border border-border">
                          {selectedSubmission.files.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedSubmission.files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-sm">
                                  <FileText className="w-4 h-4 text-secondary" />
                                  <span className="font-medium">{file}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon-sm"
                                    onClick={() => handleFileDownload(file)}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No files uploaded</p>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-secondary transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadedFile ? (
                            <div className="flex items-center justify-center gap-2">
                              <FileText className="w-8 h-8 text-secondary" />
                              <div className="text-left">
                                <p className="font-medium">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : selectedSubmission.files.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground mb-2">Current submission:</p>
                              {selectedSubmission.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-center gap-2">
                                  <FileText className="w-6 h-6 text-secondary" />
                                  <span className="font-medium">{file}</span>
                                </div>
                              ))}
                              <p className="text-xs text-muted-foreground mt-2">Click to upload a new file</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm font-medium">Click to upload proof files</p>
                              <p className="text-xs text-muted-foreground">PNG or PDF files only</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Internal File Upload Submission */}
                {!selectedSubmission.isExternal && selectedSubmission.submissionType === "file" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Upload File</label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-secondary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-secondary" />
                          <div className="text-left">
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2"
                            onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : selectedSubmission.files.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-2">Current submission:</p>
                          {selectedSubmission.files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-center gap-2">
                              <FileText className="w-6 h-6 text-secondary" />
                              <span className="font-medium">{file}</span>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={(e) => { e.stopPropagation(); handleFileDownload(file); }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground mt-2">Click to upload a new file</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedSubmission.fileTypeDescription || ".pdf, .doc, .docx, .xlsx up to 50MB"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Internal Repository Link Submission */}
                {!selectedSubmission.isExternal && selectedSubmission.submissionType === "repo" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Repository Link</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={repoLink}
                      onChange={(e) => setRepoLink(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your GitHub, GitLab, or Bitbucket repository URL
                    </p>
                    {selectedSubmission.repoLink && selectedSubmission.status === "submitted" && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Current submission:</p>
                        <a 
                          href={selectedSubmission.repoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-secondary hover:underline"
                        >
                          <LinkIcon className="w-4 h-4" />
                          {selectedSubmission.repoLink}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Notes (Internal only) */}
                {!selectedSubmission.isExternal && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (Optional)</label>
                    <textarea
                      placeholder="Any additional information about your submission..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
                  {isExternalViewOnly ? "Close" : "Cancel"}
                </Button>
                {!isExternalViewOnly && (
                  <Button onClick={handleSubmit}>
                    {selectedSubmission.isExternal 
                      ? (isExternalResubmit ? "Resubmit for Approval" : "Submit for Approval")
                      : (selectedSubmission.status === "submitted" ? "Update Submission" : "Submit")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
        })()}
      </div>
    </AppLayout>
  );
}
