import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Trophy, Upload, Calendar, Users,
  FileText, Save, Eye, AlertCircle, CheckCircle,
  Info, X
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formatOptions = [
  { value: "quiz", label: "Quiz", description: "Multiple choice, true/false, fill-in-the-blank questions", icon: FileText },
  { value: "assignment", label: "Assignment", description: "Document upload (PDF, Word, Excel)", icon: Upload },
  { value: "project", label: "Project", description: "Repository link or file submission", icon: Trophy },
];

const participationOptions = [
  { value: "individual", label: "Individual", description: "Each student participates alone" },
  { value: "team", label: "Team", description: "Students form teams to participate" },
];

export default function CreateCompetition() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    format: "quiz",
    participationType: "individual",
    registrationOpen: "",
    registrationClose: "",
    submissionDeadline: "",
    totalMarks: "",
    maxTeamSize: "5",
    minTeamSize: "2",
    rules: "",
    materials: null,
    allowedFileTypes: ".pdf,.docx,.zip",
    quizTimeAllowed: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, materials: file }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.registrationOpen) newErrors.registrationOpen = "Registration open date is required";
    if (!formData.registrationClose) newErrors.registrationClose = "Registration close date is required";
    if (!formData.submissionDeadline) newErrors.submissionDeadline = "Submission deadline is required";
    if (!formData.totalMarks || parseInt(formData.totalMarks) <= 0) newErrors.totalMarks = "Total marks must be greater than 0";

    // Date validations
    if (formData.registrationOpen && formData.registrationClose) {
      if (new Date(formData.registrationClose) <= new Date(formData.registrationOpen)) {
        newErrors.registrationClose = "Must be after registration open date";
      }
    }
    if (formData.registrationClose && formData.submissionDeadline) {
      if (new Date(formData.submissionDeadline) <= new Date(formData.registrationClose)) {
        newErrors.submissionDeadline = "Must be after registration close date";
      }
    }

    if (formData.format === "quiz") {
      if (!formData.quizTimeAllowed || parseInt(formData.quizTimeAllowed) <= 0) {
        newErrors.quizTimeAllowed = "Time allowed must be greater than 0 minutes";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Competition saved as draft");
    setSaving(false);
    navigate("/teacher/competitions");
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before publishing");
      return;
    }
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Competition published successfully!");
    setSaving(false);
    navigate("/teacher/competitions");
  };

  return (
    <AppLayout role="teacher">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Create Competition
            </h1>
            <p className="text-muted-foreground mt-1">
              Set up a new internal competition for students
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card-static p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Competition Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., AI Innovation Challenge 2024"
                  className={cn(
                    "w-full h-11 px-4 rounded-lg bg-muted/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    errors.title ? "border-destructive" : "border-border"
                  )}
                />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the competition objectives, requirements, and expectations..."
                  rows={4}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-muted/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none",
                    errors.description ? "border-destructive" : "border-border"
                  )}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Format & Participation */}
          <div className="card-static p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Format & Participation</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Competition Format <span className="text-destructive">*</span>
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {formatOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          format: option.value,
                          participationType: option.value === "quiz" ? "individual" : prev.participationType
                        }));
                      }}

                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all text-center",
                        formData.format === option.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <option.icon className="w-6 h-6" />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs opacity-80">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Participation Type <span className="text-destructive">*</span>
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {participationOptions.map((option) => {
                    // Hide "Team" for Quiz
                    if (formData.format === "quiz" && option.value === "team") return null;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, participationType: option.value }))}
                        className={cn(
                          "flex flex-col items-start gap-1 p-4 rounded-lg border transition-all",
                          formData.participationType === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs opacity-80">{option.description}</span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {formData.participationType === "team" && (
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Minimum Team Size
                    </label>
                    <input
                      type="number"
                      name="minTeamSize"
                      value={formData.minTeamSize}
                      onChange={handleChange}
                      min="2"
                      className="w-full h-10 px-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Maximum Team Size
                    </label>
                    <input
                      type="number"
                      name="maxTeamSize"
                      value={formData.maxTeamSize}
                      onChange={handleChange}
                      min="2"
                      className="w-full h-10 px-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deadlines */}
          <div className="card-static p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Deadlines & Marks</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Registration Opens <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="registrationOpen"
                  value={formData.registrationOpen}
                  onChange={handleChange}
                  className={cn(
                    "w-full h-11 px-4 rounded-lg bg-muted/50 border text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    errors.registrationOpen ? "border-destructive" : "border-border"
                  )}
                />
                {errors.registrationOpen && <p className="text-sm text-destructive mt-1">{errors.registrationOpen}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Registration Closes <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="registrationClose"
                  value={formData.registrationClose}
                  onChange={handleChange}
                  className={cn(
                    "w-full h-11 px-4 rounded-lg bg-muted/50 border text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    errors.registrationClose ? "border-destructive" : "border-border"
                  )}
                />
                {errors.registrationClose && <p className="text-sm text-destructive mt-1">{errors.registrationClose}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Submission Deadline <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="submissionDeadline"
                  value={formData.submissionDeadline}
                  onChange={handleChange}
                  className={cn(
                    "w-full h-11 px-4 rounded-lg bg-muted/50 border text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    errors.submissionDeadline ? "border-destructive" : "border-border"
                  )}
                />
                {errors.submissionDeadline && <p className="text-sm text-destructive mt-1">{errors.submissionDeadline}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Total Marks <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                  className={cn(
                    "w-full h-11 px-4 rounded-lg bg-muted/50 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    errors.totalMarks ? "border-destructive" : "border-border"
                  )}
                />
                {errors.totalMarks && <p className="text-sm text-destructive mt-1">{errors.totalMarks}</p>}
              </div>
            </div>
          </div>

          {/* Rules & Materials */}
          <div className="card-static p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Rules & Materials</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Competition Rules
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder="Enter competition rules, guidelines, and important information..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Upload Materials (Optional)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="materials"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="materials" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      {formData.materials ? formData.materials.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, or ZIP (Max 10MB)
                    </p>
                  </label>
                </div>
              </div>

              {formData.format !== "quiz" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Allowed Submission File Types
                  </label>
                  <input
                    type="text"
                    name="allowedFileTypes"
                    value={formData.allowedFileTypes}
                    onChange={handleChange}
                    placeholder=".pdf,.docx,.zip"
                    className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated file extensions</p>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Info */}
          {formData.format === "quiz" && (
            <div className="card-static p-6 border-l-4 border-l-info space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Quiz Questions</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    After creating the competition, you can add questions via Excel upload or manual creation
                    from the competition details page.
                  </p>
                </div>
              </div>

              {/* Timer Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Time Allowed (minutes) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quizTimeAllowed}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, quizTimeAllowed: e.target.value }))
                  }
                  placeholder="Enter total time allowed for the quiz"
                  className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.quizTimeAllowed && <p className="text-sm text-destructive mt-1">{errors.quizTimeAllowed}</p>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              Save as Draft
            </Button>
            <Button onClick={handlePublish} disabled={saving} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              {saving ? "Publishing..." : "Publish Competition"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
