import { useState, useEffect, useCallback } from "react";
import { 
  Plus, FileText, Calendar, MapPin, Globe, Award, 
  Clock, CheckCircle2, XCircle, AlertCircle, Eye, Edit3, 
  Upload, X, ExternalLink, Building, Users
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL, resolveFileUrl } from "@/lib/api";

const categoryOptions = [
  "Hackathon",
  "Design",
  "Programming Competition",
  "Workshop",
  "Seminar",
  "Webinar",
  "Bootcamp",
  "Conference",
  "Student Exchange",
  "Other"
];

const modeOptions = ["Online", "Physical", "Hybrid"];
const scaleOptions = ["Local", "National", "International"];

const participationResultOptions = [
  "Winner",
  "1st Runner Up",
  "2nd Runner Up",
  "3rd Place",
  "Top 5",
  "Top 10",
  "Finalist",
  "Participant"
];
const eligibilityOptionsList = [
  "Open to all students",
  "Undergraduate only",
  "Postgraduate only",
  "Specific majors",
  "CS/IT only",
  "Engineering only"
];
const sourceConfirmOptions = [
  "Official website",
  "University announcement",
  "Email from organizer",
  "Social media post"
];

const mockMyExternalCompetitions = [
  {
    id: 1,
    title: "Google Developer Student Clubs Hackathon",
    category: "Hackathon",
    organizer: "Google DSC",
    mode: "Hybrid",
    location: "University Campus & Online",
    scale: "National",
    description: "Built an AI-powered accessibility tool for visually impaired users.",
    eligibility: "University students only",
    startDate: "2024-02-15",
    endDate: "2024-02-17",
    websiteLink: "https://gdsc.community.dev",
    participationResult: "1st Runner Up",
    proofFiles: ["certificate.pdf", "photo.jpg"],
    status: "approved", // pending, approved, rejected
    submittedAt: "2024-02-20",
    adminNote: "Verified with official GDSC records.",
  },
  {
    id: 2,
    title: "AWS Cloud Computing Workshop",
    category: "Workshop",
    organizer: "Amazon Web Services",
    mode: "Online",
    location: "Virtual",
    scale: "International",
    description: "Completed 40-hour intensive cloud architecture workshop.",
    eligibility: "Open to all",
    startDate: "2024-01-10",
    endDate: "2024-01-15",
    websiteLink: "https://aws.amazon.com",
    participationResult: "Participant",
    proofFiles: ["aws-certificate.pdf"],
    status: "pending",
    submittedAt: "2024-01-20",
  },
  {
    id: 3,
    title: "Regional Math Olympiad",
    category: "Olympiad",
    organizer: "Math Association",
    mode: "Physical",
    location: "City Convention Center",
    scale: "Local",
    description: "Competed in advanced mathematics problem solving.",
    eligibility: "High school and university students",
    startDate: "2024-03-01",
    endDate: "2024-03-01",
    websiteLink: "",
    participationResult: "Top 10",
    proofFiles: ["result-card.pdf"],
    status: "rejected",
    submittedAt: "2024-03-05",
    adminNote: "Please provide official certificate from organizer.",
  },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

export default function MyExternalCompetitions() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [proofUploadFiles, setProofUploadFiles] = useState([]);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const loadCompetitions = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/external/participations`, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null);
    if (res && res.ok) {
      const data = await res.json().catch(() => []);
      setCompetitions(Array.isArray(data) ? data : []);
    }
  }, []);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    let es;
    try {
      es = new EventSource(`${API_BASE_URL}/api/notifications/stream?token=${token}`);
      es.addEventListener("notification", (e) => {
        try {
          const n = JSON.parse(e.data);
          const typesToRefresh = new Set(["GENERAL", "REJECTION", "ROLLBACK", "EXTERNAL_PARTICIPATION_SUBMITTED"]);
          if (n && typesToRefresh.has(n.type)) {
            loadCompetitions();
          }
        } catch {}
      });
    } catch {}
    return () => {
      if (es) es.close();
    };
  }, [loadCompetitions]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    customCategory: "",
    organizer: "",
    mode: "",
    location: "",
    scale: "",
    description: "",
    eligibility: "",
    participationType: "",
    teamSizeMin: "",
    teamSizeMax: "",
    startDate: "",
    endDate: "",
    websiteLink: "",
    registrationFeeType: "Free",
    registrationFeeAmount: "",
    registrationFeeCurrency: "",
    prizes: "",
    submissionNotes: "",
    sourceConfirmation: "",
    participationResult: "",
    proofFiles: [],
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setProofUploadFiles(prev => [...prev, ...files]);
    setErrors(prev => ({ ...prev, proofFiles: undefined }));
  };

  const validateForm = () => {
    const v = {};
    if (!formData.title) v.title = "Required";
    if (!formData.category) v.category = "Required";
    if (formData.category === "Other" && !formData.customCategory) v.customCategory = "Required";
    if (!formData.organizer) v.organizer = "Required";
    if (!formData.mode) v.mode = "Required";
    if (!formData.location) v.location = "Required";
    if (!formData.scale) v.scale = "Required";
    if (!formData.description) v.description = "Required";
    if (!formData.startDate) v.startDate = "Required";
    if (!formData.endDate) v.endDate = "Required";
    if (formData.startDate && formData.startDate > todayStr) v.startDate = "Must be today or earlier";
    if (formData.endDate && formData.endDate > todayStr) v.endDate = "Must be today or earlier";
    if (!formData.eligibility) v.eligibility = "Required";
    if (!formData.websiteLink) v.websiteLink = "Required";
    if (!formData.participationType) v.participationType = "Required";
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) v.endDate = "End date must be after start date";
    
    if (formData.participationType === "Team") {
      const min = formData.teamSizeMin !== "" ? Number(formData.teamSizeMin) : null;
      const max = formData.teamSizeMax !== "" ? Number(formData.teamSizeMax) : null;
      
      if (min === null) {
        v.teamSizeMin = "Required";
      } else if (!Number.isInteger(min) || min < 1) {
        v.teamSizeMin = "Must be at least 1";
      }
      
      if (max === null) {
        v.teamSizeMax = "Required";
      } else if (!Number.isInteger(max) || max < 1) {
        v.teamSizeMax = "Must be at least 1";
      } else if (min !== null && max !== null && min > max) {
        v.teamSizeMax = "Max must be ≥ Min";
      }
    }
    
    if (!formData.registrationFeeType) v.registrationFeeType = "Required";
    if (formData.registrationFeeType === "Paid") {
      const amt = parseFloat(formData.registrationFeeAmount);
      if (!formData.registrationFeeAmount) {
        v.registrationFeeAmount = "Required";
      } else if (!Number.isFinite(amt) || amt <= 0) {
        v.registrationFeeAmount = "Enter a valid positive number";
      }
      if (!formData.registrationFeeCurrency) v.registrationFeeCurrency = "Required";
    }
    
    if (!formData.prizes) v.prizes = "Required";
    if (!formData.submissionNotes) v.submissionNotes = "Required";
    if (!formData.sourceConfirmation) v.sourceConfirmation = "Required";
    if (!formData.participationResult) v.participationResult = "Required";
    if (!declarationChecked) v.declaration = "Please confirm declaration";
    if (proofUploadFiles.length === 0 && (formData.proofFiles || []).length === 0) v.proofFiles = "Required";
    
    return v;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setActionError("Please sign in again");
      return;
    }
    const v = validateForm();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    const payload = {
      title: formData.title,
      category: formData.category === "Other" ? formData.customCategory : formData.category,
      organizer: formData.organizer,
      mode: formData.mode,
      location: formData.location,
      scale: formData.scale,
      description: formData.description,
      eligibility: formData.eligibility,
      participationType: formData.participationType,
      teamSizeMin: formData.participationType === "Team" ? Number(formData.teamSizeMin || 0) : null,
      teamSizeMax: formData.participationType === "Team" ? Number(formData.teamSizeMax || 0) : null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      websiteLink: formData.websiteLink || "",
      prizes: formData.prizes || "",
      registrationFeeType: formData.registrationFeeType,
      registrationFeeAmount: formData.registrationFeeType === "Paid" ? Number(formData.registrationFeeAmount || 0) : null,
      registrationFeeCurrency: formData.registrationFeeType === "Paid" ? formData.registrationFeeCurrency : null,
      submissionNotes: formData.submissionNotes || "",
      sourceConfirmation: formData.sourceConfirmation || "",
      declarationConfirmed: true,
      participationResult: formData.participationResult || "",
      proofFiles: []
    };
    try {
      setIsSubmitting(true);
      setActionError("");
      const res = await fetch("http://localhost:8081/api/external/participations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = "Submit failed";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            msg = data.message || msg;
          } else {
            msg = await res.text() || msg;
          }
        } catch {}
        setActionError(msg);
        return;
      }
      const created = await res.json();
      for (const file of proofUploadFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch(`http://localhost:8081/api/external/participations/${created.id}/proof`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        }).catch(() => null);
        if (upRes && !upRes.ok) {
          setActionError("Some files failed to upload");
        }
      }
      await loadCompetitions();
    } catch {}
    finally {
      setIsSubmitting(false);
    }
    setShowCreateForm(false);
    setSelectedCompetition(null);
    setProofUploadFiles([]);
    resetForm();
  };

  const handleResubmit = async () => {
    const token = localStorage.getItem("userToken");
    if (!token || !selectedCompetition) {
      setActionError("Please sign in again");
      return;
    }
    const v = {};
    if (!formData.title) v.title = "Required";
    if (!formData.category) v.category = "Required";
    if (!formData.organizer) v.organizer = "Required";
    if (!formData.mode) v.mode = "Required";
    if (!formData.location) v.location = "Required";
    if (!formData.scale) v.scale = "Required";
    if (!formData.description) v.description = "Required";
    if (!formData.startDate) v.startDate = "Required";
    if (!formData.endDate) v.endDate = "Required";
    if (formData.startDate && formData.startDate > todayStr) v.startDate = "Must be today or earlier";
    if (formData.endDate && formData.endDate > todayStr) v.endDate = "Must be today or earlier";
    if (!formData.participationResult) v.participationResult = "Required";
    if (!formData.eligibility) v.eligibility = "Required";
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) v.endDate = "End date must be after start date";
    if (formData.participationType === "Team") {
      const min = Number(formData.teamSizeMin || 0);
      const max = Number(formData.teamSizeMax || 0);
      if (!min) v.teamSizeMin = "Required";
      if (!max) v.teamSizeMax = "Required";
      if (min && max && min > max) v.teamSizeMax = "Max must be ≥ Min";
    }
    if (!formData.websiteLink) v.websiteLink = "Required";
    if (!formData.participationType) v.participationType = "Required";
    if (!formData.registrationFeeType) v.registrationFeeType = "Required";
    if (formData.registrationFeeType === "Paid") {
      const amt = parseFloat(formData.registrationFeeAmount);
      if (!Number.isFinite(amt) || amt <= 0) v.registrationFeeAmount = "Enter a valid amount";
      if (!formData.registrationFeeCurrency) v.registrationFeeCurrency = "Required";
    }
    if (!formData.prizes) v.prizes = "Required";
    if (!formData.submissionNotes) v.submissionNotes = "Required";
    if (!formData.sourceConfirmation) v.sourceConfirmation = "Required";
    if (proofUploadFiles.length === 0) v.proofFiles = "Required";
    if (!declarationChecked) v.declaration = "Please confirm declaration";
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    const payload = {
      title: formData.title,
      category: formData.category === "Other" ? formData.customCategory : formData.category,
      organizer: formData.organizer,
      mode: formData.mode,
      location: formData.location,
      scale: formData.scale,
      description: formData.description,
      eligibility: formData.eligibility,
      participationType: formData.participationType,
      teamSizeMin: formData.participationType === "Team" ? Number(formData.teamSizeMin || 0) : null,
      teamSizeMax: formData.participationType === "Team" ? Number(formData.teamSizeMax || 0) : null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      websiteLink: formData.websiteLink || "",
      prizes: formData.prizes || "",
      registrationFeeType: formData.registrationFeeType,
      registrationFeeAmount: formData.registrationFeeType === "Paid" ? Number(formData.registrationFeeAmount || 0) : null,
      registrationFeeCurrency: formData.registrationFeeType === "Paid" ? formData.registrationFeeCurrency : null,
      submissionNotes: formData.submissionNotes || "",
      sourceConfirmation: formData.sourceConfirmation || "",
      declarationConfirmed: true,
      participationResult: formData.participationResult || "",
      proofFiles: []
    };
    try {
      setIsSubmitting(true);
      setActionError("");
      const res = await fetch(`http://localhost:8081/api/external/participations/${selectedCompetition.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = "Resubmit failed";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            msg = data.message || msg;
          } else {
            msg = await res.text() || msg;
          }
        } catch {}
        setActionError(msg);
        return;
      }
      for (const file of proofUploadFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch(`http://localhost:8081/api/external/participations/${selectedCompetition.id}/proof`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        }).catch(() => null);
        if (upRes && !upRes.ok) {
          setActionError("Some files failed to upload");
        }
      }
      await loadCompetitions();
    } catch {}
    finally {
      setIsSubmitting(false);
    }
    setShowEditForm(false);
    setSelectedCompetition(null);
    setProofUploadFiles([]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      customCategory: "",
      organizer: "",
      mode: "",
      location: "",
      scale: "",
      description: "",
      eligibility: "",
      participationType: "",
      teamSizeMin: "",
      teamSizeMax: "",
      startDate: "",
      endDate: "",
      websiteLink: "",
      registrationFeeType: "Free",
      registrationFeeAmount: "",
      registrationFeeCurrency: "",
      prizes: "",
      submissionNotes: "",
      sourceConfirmation: "",
      participationResult: "",
      proofFiles: [],
    });
    setDeclarationChecked(false);
    setProofUploadFiles([]);
    setErrors({});
    setActionError("");
  };

  const openEditForm = (competition) => {
    setSelectedCompetition(competition);
    setFormData({
      title: competition.title,
      category: competition.category,
      customCategory: "",
      organizer: competition.organizer,
      mode: competition.mode,
      location: competition.location,
      scale: competition.scale,
      description: competition.description,
      eligibility: competition.eligibility,
      participationType: competition.participationType || "",
      teamSizeMin: competition.teamSizeMin || "",
      teamSizeMax: competition.teamSizeMax || "",
      startDate: competition.startDate,
      endDate: competition.endDate,
      websiteLink: competition.websiteLink || "",
      registrationFeeType: competition.registrationFeeType || "Free",
      registrationFeeAmount: competition.registrationFeeAmount || "",
      registrationFeeCurrency: competition.registrationFeeCurrency || "",
      prizes: competition.prizes || "",
      submissionNotes: competition.submissionNotes || "",
      sourceConfirmation: competition.sourceConfirmation || "",
      participationResult: competition.participationResult,
      proofFiles: competition.proofFiles || [],
    });
    setShowEditForm(true);
  };

  return (
    <AppLayout role="student">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              My External Competitions
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit your own external competition participations for verification
            </p>
          </div>
          <Button className="gap-2" onClick={() => { resetForm(); setShowCreateForm(true); }}>
            <Plus className="w-4 h-4" />
            Add External Competition
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">How it works</p>
            <p className="text-sm text-muted-foreground">
              Submit competitions you've participated in outside of the university system. 
              Admin will verify your proof and approve it. Once approved, it will appear 
              on the Social Feed as an achievement.
            </p>
          </div>
        </div>

        {/* Competition List */}
        <div className="grid gap-4">
          {competitions.map((competition) => {
            const StatusIcon = statusIcons[competition.status];
            const canEdit = competition.status === "rejected";
            
            return (
              <div key={competition.id} className="card-elevated p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cn("badge-status border flex items-center gap-1", statusStyles[competition.status])}>
                        <StatusIcon className="w-3 h-3" />
                        {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                      </span>
                      <span className="badge-status bg-muted text-muted-foreground">
                        {competition.category}
                      </span>
                      <span className="badge-status bg-secondary/10 text-secondary flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {competition.scale}
                      </span>
                    </div>
                    
                    <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                      {competition.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {competition.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-4 h-4" />
                        {competition.organizer}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {competition.startDate} - {competition.endDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {competition.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-achievement" />
                        {competition.participationResult}
                      </span>
                    </div>

                    {competition.adminNote && (
                      <div className={cn(
                        "mt-3 p-3 rounded-lg text-sm",
                        competition.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      )}>
                        <strong>Admin Note:</strong> {competition.adminNote}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>{competition.proofFiles?.length || 0} file(s) attached</span>
                      <span>•</span>
                      <span>Submitted: {competition.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => setSelectedCompetition(competition)}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    {canEdit && (
                      <Button 
                        size="sm" 
                        className="gap-1"
                        onClick={() => openEditForm(competition)}
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit & Resubmit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {competitions.length === 0 && (
            <div className="card-static p-12 text-center">
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No external competitions submitted yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add External Competition" to submit your first participation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm overflow-y-auto py-8">
          <div className="card-static w-full max-w-2xl p-6 m-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">
                {showEditForm ? "Edit & Resubmit Competition" : "Add External Competition"}
              </h2>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setSelectedCompetition(null);
                  resetForm();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              {actionError && (
                <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive">
                  {actionError}
                </div>
              )}
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Competition Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Google Developer Student Clubs Hackathon"
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.title && <div className="mt-1 text-xs text-destructive">{errors.title}</div>}
              </div>

              {/* Category & Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <div className="mt-1 text-xs text-destructive">{errors.category}</div>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Mode *
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => handleInputChange("mode", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select mode</option>
                    {modeOptions.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                  {errors.mode && <div className="mt-1 text-xs text-destructive">{errors.mode}</div>}
                </div>
              </div>

              {/* Organizer & Scale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Organizer *
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => handleInputChange("organizer", e.target.value)}
                    placeholder="e.g., Google, AWS, IEEE"
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                {errors.organizer && <div className="mt-1 text-xs text-destructive">{errors.organizer}</div>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Scale *
                  </label>
                  <select
                    value={formData.scale}
                    onChange={(e) => handleInputChange("scale", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select scale</option>
                    {scaleOptions.map(scale => (
                      <option key={scale} value={scale}>{scale}</option>
                    ))}
                  </select>
                  {errors.scale && <div className="mt-1 text-xs text-destructive">{errors.scale}</div>}
                </div>
              </div>
              
              

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., City Convention Center, Virtual"
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.location && <div className="mt-1 text-xs text-destructive">{errors.location}</div>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    max={todayStr}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors.startDate && <div className="mt-1 text-xs text-destructive">{errors.startDate}</div>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    max={todayStr}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors.endDate && <div className="mt-1 text-xs text-destructive">{errors.endDate}</div>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your participation and what you achieved..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {errors.description && <div className="mt-1 text-xs text-destructive">{errors.description}</div>}
              </div>

              {/* Eligibility */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Eligibility Criteria *
                </label>
                <select
                  value={formData.eligibility}
                  onChange={(e) => handleInputChange("eligibility", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select</option>
                  {eligibilityOptionsList.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.eligibility && <div className="mt-1 text-xs text-destructive">{errors.eligibility}</div>}
              </div>

              {/* Website Link */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Website Link *
                </label>
                <input
                  type="url"
                  value={formData.websiteLink}
                  onChange={(e) => handleInputChange("websiteLink", e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.websiteLink && <div className="mt-1 text-xs text-destructive">{errors.websiteLink}</div>}
              </div>
              
              {/* Individual or Team */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Individual or Team-based? *
                </label>
                <select
                  value={formData.participationType}
                  onChange={(e) => handleInputChange("participationType", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select</option>
                  <option value="Individual">Individual</option>
                  <option value="Team">Team</option>
                </select>
                {errors.participationType && <div className="mt-1 text-xs text-destructive">{errors.participationType}</div>}
              </div>
              {formData.participationType === "Team" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Team Size (Min) *
                    </label>
                    <input
                      type="number"
                      value={formData.teamSizeMin}
                      onChange={(e) => handleInputChange("teamSizeMin", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.teamSizeMin && <div className="mt-1 text-xs text-destructive">{errors.teamSizeMin}</div>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Team Size (Max) *
                    </label>
                    <input
                      type="number"
                      value={formData.teamSizeMax}
                      onChange={(e) => handleInputChange("teamSizeMax", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.teamSizeMax && <div className="mt-1 text-xs text-destructive">{errors.teamSizeMax}</div>}
                  </div>
                </div>
              )}
              
              {/* Registration Fee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Registration Fee *
                  </label>
                  <select
                    value={formData.registrationFeeType}
                    onChange={(e) => handleInputChange("registrationFeeType", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                  </select>
                  {errors.registrationFeeType && <div className="mt-1 text-xs text-destructive">{errors.registrationFeeType}</div>}
                </div>
                {formData.registrationFeeType === "Paid" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Amount *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.registrationFeeAmount}
                        onChange={(e) => handleInputChange("registrationFeeAmount", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.registrationFeeAmount && <div className="mt-1 text-xs text-destructive">{errors.registrationFeeAmount}</div>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Currency *
                      </label>
                      <select
                        value={formData.registrationFeeCurrency}
                        onChange={(e) => handleInputChange("registrationFeeCurrency", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select currency</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="MMK">MMK</option>
                        <option value="GBP">GBP</option>
                        <option value="SGD">SGD</option>
                        <option value="JPY">JPY</option>
                      </select>
                      {errors.registrationFeeCurrency && <div className="mt-1 text-xs text-destructive">{errors.registrationFeeCurrency}</div>}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Prizes */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Prizes/Rewards *
                </label>
                <input
                  type="text"
                  value={formData.prizes}
                  onChange={(e) => handleInputChange("prizes", e.target.value)}
                  placeholder="e.g., Cash prizes, certificates, sponsorship"
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.prizes && <div className="mt-1 text-xs text-destructive">{errors.prizes}</div>}
              </div>
              
              {/* Submission Notes */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Submission Notes *
                </label>
                <textarea
                  value={formData.submissionNotes}
                  onChange={(e) => handleInputChange("submissionNotes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {errors.submissionNotes && <div className="mt-1 text-xs text-destructive">{errors.submissionNotes}</div>}
              </div>
              
              {/* Source Confirmation */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Source Confirmation *
                </label>
                <select
                  value={formData.sourceConfirmation}
                  onChange={(e) => handleInputChange("sourceConfirmation", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select</option>
                  {sourceConfirmOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.sourceConfirmation && <div className="mt-1 text-xs text-destructive">{errors.sourceConfirmation}</div>}
              </div>
              
              {/* Participation Result */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Participation Result *
                </label>
                <select
                  value={formData.participationResult}
                  onChange={(e) => handleInputChange("participationResult", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select result</option>
                  {participationResultOptions.map(result => (
                    <option key={result} value={result}>{result}</option>
                  ))}
                </select>
                {errors.participationResult && <div className="mt-1 text-xs text-destructive">{errors.participationResult}</div>}
              </div>

              {/* Proof Files */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Proof Files (Certificate, Photos, etc.) *
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, PNG, JPG, DOC (max 10MB each)
                    </p>
                  </label>
                </div>
                {proofUploadFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {proofUploadFiles.map((file, index) => (
                      <span 
                        key={index} 
                        className="badge-status bg-muted text-muted-foreground flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        {file.name || "file"}
                        <button 
                          onClick={() => setProofUploadFiles(prev => prev.filter((_, i) => i !== index))}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.proofFiles && <div className="mt-1 text-xs text-destructive">{errors.proofFiles}</div>}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              {/* Declaration */}
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={declarationChecked}
                  onChange={(e) => { setDeclarationChecked(e.target.checked); setErrors(prev => ({ ...prev, declaration: undefined })); }}
                />
                <span>I confirm that the information provided is accurate and sourced from an official competition. *</span>
              </label>
              {errors.declaration && <div className="mt-1 text-xs text-destructive">{errors.declaration}</div>}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setSelectedCompetition(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={showEditForm ? handleResubmit : handleSubmit}
                disabled={isSubmitting}
              >
                {showEditForm ? "Resubmit for Approval" : "Submit for Approval"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedCompetition && !showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="card-static w-full max-w-lg p-6 m-4 animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Competition Details</h2>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={() => setSelectedCompetition(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedCompetition.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={cn("badge-status border", statusStyles[selectedCompetition.status])}>
                    {selectedCompetition.status}
                  </span>
                  <span className="badge-status bg-muted text-muted-foreground">
                    {selectedCompetition.category}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organizer</span>
                  <span className="font-medium">{selectedCompetition.organizer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium">{selectedCompetition.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{selectedCompetition.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scale</span>
                  <span className="font-medium">{selectedCompetition.scale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">{selectedCompetition.startDate} - {selectedCompetition.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Result</span>
                  <span className="font-medium text-achievement">{selectedCompetition.participationResult}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eligibility</span>
                  <span className="font-medium">{selectedCompetition.eligibility || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participation Type</span>
                  <span className="font-medium">{selectedCompetition.participationType || "-"}</span>
                </div>
                {selectedCompetition.participationType === "Team" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Size Min</span>
                      <span className="font-medium">{selectedCompetition.teamSizeMin ?? "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Size Max</span>
                      <span className="font-medium">{selectedCompetition.teamSizeMax ?? "-"}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration Fee</span>
                  <span className="font-medium">{selectedCompetition.registrationFeeType || "-"}</span>
                </div>
                {selectedCompetition.registrationFeeType === "Paid" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{selectedCompetition.registrationFeeAmount ?? "-"}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prizes/Rewards</span>
                  <span className="font-medium">{selectedCompetition.prizes || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source Confirmation</span>
                  <span className="font-medium">{selectedCompetition.sourceConfirmation || "-"}</span>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="mt-1 text-sm">{selectedCompetition.description}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Submission Notes</span>
                <p className="mt-1 text-sm">{selectedCompetition.submissionNotes || "-"}</p>
              </div>

              {selectedCompetition.websiteLink && (
                <a 
                  href={selectedCompetition.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              )}

              <div>
                <span className="text-sm text-muted-foreground">Proof Files</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCompetition.proofFiles?.map((file, index) => {
                    const full = resolveFileUrl(file || "");
                    const ext = full.split(".").pop()?.toLowerCase();
                    const isImage = ["png","jpg","jpeg","gif","webp"].includes(ext || "");
                    return (
                      <a
                        key={index}
                        href={full}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        {isImage ? (
                          <img src={full} alt="proof" className="w-16 h-16 object-cover rounded border" />
                        ) : (
                          <span className="badge-status bg-muted text-muted-foreground flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {full.split("/").pop()}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>

              {selectedCompetition.adminNote && (
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  selectedCompetition.status === "approved" ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <strong>Admin Note:</strong> {selectedCompetition.adminNote}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setSelectedCompetition(null)}>
                Close
              </Button>
              {selectedCompetition.status === "rejected" && (
                <Button onClick={() => openEditForm(selectedCompetition)}>
                  Edit & Resubmit
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
