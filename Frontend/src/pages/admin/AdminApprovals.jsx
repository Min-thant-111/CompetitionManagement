import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  CheckCircle2, XCircle, Eye, FileText, User, Calendar,
  Trophy, Award, MessageSquare, RotateCcw, Filter, Search,
  Download, Clock, AlertTriangle, FileCheck, ExternalLink,
  MapPin, Globe, Users, CreditCard, Info, Building2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

const mockApprovals = [
  {
    id: 1,
    type: "external_proof",
    source: "admin_created",
    student: {
      name: "Emily Chen",
      email: "emily.chen@university.edu",
      studentId: "2021001234",
    },
    competition: "National Coding Championship 2024",
    category: "hackathon",
    result: "2nd Place",
    proofFiles: ["certificate.pdf", "photo_award.jpg"],
    submittedAt: "2024-01-15 14:30",
    proofDeadline: "2024-01-25",
    status: "pending",
    notes: "",
  },
  {
    id: 2,
    type: "external_proof",
    source: "admin_created",
    student: {
      name: "James Wilson",
      email: "james.w@university.edu",
      studentId: "2021005678",
    },
    competition: "International Math Olympiad",
    category: "other",
    result: "Participation",
    proofFiles: ["participation_cert.pdf"],
    submittedAt: "2024-01-14 09:15",
    proofDeadline: "2024-01-28",
    status: "pending",
    notes: "",
  },
  {
    id: 3,
    type: "student_created",
    source: "student_created",
    student: {
      name: "Sofia Rodriguez",
      email: "sofia.r@university.edu",
      studentId: "2020003456",
    },
    competition: "Regional Debate Championship",
    category: "other",
    result: "1st Place",
    proofFiles: ["winner_cert.pdf", "team_photo.jpg"],
    submittedAt: "2024-01-13 16:45",
    proofDeadline: null,
    status: "pending",
    notes: "Student-initiated external competition record",
  },
  {
    id: 4,
    type: "external_proof",
    source: "admin_created",
    student: {
      name: "Alex Park",
      email: "alex.p@university.edu",
      studentId: "2022007890",
    },
    competition: "AI Innovation Challenge",
    category: "hackathon",
    result: "Runner-up",
    proofFiles: ["certificate.pdf"],
    submittedAt: "2024-01-12 11:20",
    proofDeadline: "2024-01-20",
    status: "approved",
    notes: "Achievement created, social post published, attendance report generated",
    approvedAt: "2024-01-13 10:00",
  },
  {
    id: 5,
    type: "external_proof",
    source: "student_created",
    student: {
      name: "Maria Santos",
      email: "maria.s@university.edu",
      studentId: "2021002345",
    },
    competition: "Tech Leadership Seminar",
    category: "seminar",
    result: "Participation",
    proofFiles: ["attendance_cert.pdf"],
    submittedAt: "2024-01-10 08:00",
    proofDeadline: null,
    status: "rejected",
    notes: "Certificate does not match student name. You can resubmit with correct proof before the deadline.",
    rejectedAt: "2024-01-11 14:30",
  },
  {
    id: 6,
    type: "external_proof",
    source: "admin_created",
    student: {
      name: "David Kim",
      email: "david.k@university.edu",
      studentId: "2021003456",
    },
    competition: "Cloud Computing Workshop",
    category: "workshop",
    result: "Completion",
    proofFiles: ["completion_cert.pdf"],
    submittedAt: "2024-01-16 10:30",
    proofDeadline: "2024-01-30",
    status: "pending",
    notes: "",
  },
];

const resultColors = {
  "1st Place": "bg-achievement/10 text-achievement",
  "2nd Place": "bg-secondary/10 text-secondary",
  "3rd Place": "bg-info/10 text-info",
  "Runner-up": "bg-secondary/10 text-secondary",
  "Winner": "bg-achievement/10 text-achievement",
  "Participation": "bg-muted text-muted-foreground",
  "Completion": "bg-success/10 text-success",
};

export default function AdminApprovals() {
  const [searchParams] = useSearchParams();
  const [approvals, setApprovals] = useState([]);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterSource, setFilterSource] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isAttendanceConfirmOpen, setIsAttendanceConfirmOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  const loadApprovals = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    const url = `${API_BASE_URL}/api/external/participations/admin?status=all`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
    if (res && res.ok) {
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) setApprovals(data);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    let es;
    try {
      es = new EventSource(`${API_BASE_URL}/api/notifications/stream?token=${token}`);
      es.addEventListener("notification", (e) => {
        try {
          const n = JSON.parse(e.data);
          const typesToRefresh = new Set([
            "EXTERNAL_PARTICIPATION_SUBMITTED",
            "GENERAL",
            "REJECTION",
            "ROLLBACK"
          ]);
          if (n && typesToRefresh.has(n.type)) {
            loadApprovals();
          }
        } catch {}
      });
    } catch {}
    return () => {
      if (es) es.close();
    };
  }, [loadApprovals]);

  const filteredApprovals = approvals.filter((item) => {
    const matchesSearch = 
      (item.student?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.competition || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.student?.studentId || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status and Source are already filtered by backend, but we keep them here for safety
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesSource = filterSource === "all" || item.source === filterSource;
    
    const matchesCategory = filterCategory === "all" || 
      (filterCategory === "other" 
        ? !["hackathon", "workshop", "seminar"].includes(item.category?.toLowerCase())
        : item.category?.toLowerCase() === filterCategory.toLowerCase());
        
    return matchesSearch && matchesStatus && matchesSource && matchesCategory;
  });

  const pendingCount = approvals.filter(a => a.status === "pending").length;
  const approvedCount = approvals.filter(a => a.status === "approved").length;
  const rejectedCount = approvals.filter(a => a.status === "rejected").length;
  const adminCreatedCount = approvals.filter(a => a.source === "admin_created").length;
  const studentCreatedCount = approvals.filter(a => a.source === "student_created").length;

  const toggleSelected = (id, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredApprovals.filter(a => a.status === "pending").map(a => a.id)));
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0 || isActionInProgress) return;
    setIsActionInProgress(true);
    const token = localStorage.getItem("userToken");
    const res = await fetch("http://localhost:8081/api/external/participations/bulk/approve", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: Array.from(selectedIds), notes: "Achievement created, social post published" })
    }).catch(() => null);
    if (res && res.ok) {
      setApprovals(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, status: "approved" } : a));
      toast.success(`Approved ${selectedIds.size} submission(s)`);
      clearSelection();
    } else {
      toast.error("Bulk approve failed");
    }
    setIsActionInProgress(false);
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0 || isActionInProgress) return;
    setIsActionInProgress(true);
    const token = localStorage.getItem("userToken");
    const res = await fetch("http://localhost:8081/api/external/participations/bulk/reject", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: Array.from(selectedIds), reason: bulkRejectReason || "Rejected by admin" })
    }).catch(() => null);
    if (res && res.ok) {
      setApprovals(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, status: "rejected", notes: bulkRejectReason || "Rejected by admin" } : a));
      toast.success(`Rejected ${selectedIds.size} submission(s)`);
      setIsBulkRejectOpen(false);
      setBulkRejectReason("");
      clearSelection();
    } else {
      toast.error("Bulk reject failed");
    }
    setIsActionInProgress(false);
  };

  const handleDownload = async (fileUrl) => {
    try {
      const token = localStorage.getItem("userToken");
      const url = fileUrl.startsWith("http") ? fileUrl : `http://localhost:8081${fileUrl}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      // Extract filename from URL or header
      const filename = fileUrl.split('/').pop() || 'download';
      link.setAttribute("download", filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleApprove = async (id) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    const token = localStorage.getItem("userToken");
    const res = await fetch(`http://localhost:8081/api/external/participations/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notes: "Achievement created, social post published" })
    }).catch(() => null);
    if (res && res.ok) {
      setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: "approved" } : item));
      toast.success("Proof approved! Achievement created and social post published.");
      setPendingApprovalId(id);
      setIsDetailOpen(false);
      setIsAttendanceConfirmOpen(true);
      // Remove from selected if present
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.error("Approve failed");
    }
    setIsActionInProgress(false);
  };

  const handleConfirmAttendanceReport = (generate) => {
    if (generate && pendingApprovalId) {
      setApprovals(prev => prev.map(item => 
        item.id === pendingApprovalId 
          ? { 
              ...item, 
              notes: item.notes + ", attendance report generated and sent to student"
            }
          : item
      ));
      toast.success("Attendance recovery report generated and sent to student.");
    } else {
      toast.info("Attendance recovery report skipped.");
    }
    setIsAttendanceConfirmOpen(false);
    setPendingApprovalId(null);
  };

  const handleReject = async (id) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    const item = approvals.find(a => a.id === id);
    const deadlineNote = item?.proofDeadline 
      ? ` You can resubmit before ${item.proofDeadline}.`
      : " You can resubmit with correct proof.";
    const token = localStorage.getItem("userToken");
    const res = await fetch(`http://localhost:8081/api/external/participations/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: (rejectReason || "Rejected by admin") + deadlineNote })
    }).catch(() => null);
    if (res && res.ok) {
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "rejected", notes: (rejectReason || "Rejected by admin") + deadlineNote } : a));
      toast.success("Proof rejected. Student can resubmit until the deadline.");
      setIsRejectDialogOpen(false);
      setIsDetailOpen(false);
      setRejectReason("");
      // Remove from selected if present
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.error("Reject failed");
    }
    setIsActionInProgress(false);
  };

  const handleRollback = async (id) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    const token = localStorage.getItem("userToken");
    const res = await fetch(`http://localhost:8081/api/external/participations/${id}/rollback`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null);
    if (res && res.ok) {
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "pending" } : a));
      toast.success("Rollback complete. Achievement, post, and report removed.");
    } else {
      toast.error("Rollback failed");
    }
    setIsActionInProgress(false);
  };

  const openDetail = (approval) => {
    setSelectedApproval(approval);
    setIsDetailOpen(true);
  };

  const handleExport = () => {
    // Create CSV data
    const headers = ["Student Name", "Student ID", "Email", "Competition", "Category", "Result", "Status", "Submitted At", "Source"];
    const rows = filteredApprovals.map(item => [
      item.student.name,
      item.student.studentId,
      item.student.email,
      item.competition,
      item.category,
      item.result,
      item.status,
      item.submittedAt,
      item.source === "admin_created" ? "Admin Created" : "Student Created"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `approvals_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredApprovals.length} records to CSV`);
  };

  return (
    <AppLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Proof Approvals
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve external competition proofs
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => { setFilterStatus("pending"); setFilterSource("all"); }}
            className={cn(
              "card-static p-4 text-center transition-all hover:ring-2 hover:ring-warning/50",
              filterStatus === "pending" && filterSource === "all" && "ring-2 ring-warning bg-warning/5"
            )}
          >
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </button>
          <button 
            onClick={() => { setFilterStatus("approved"); setFilterSource("all"); }}
            className={cn(
              "card-static p-4 text-center transition-all hover:ring-2 hover:ring-success/50",
              filterStatus === "approved" && filterSource === "all" && "ring-2 ring-success bg-success/5"
            )}
          >
            <div className="text-2xl font-bold text-success">{approvedCount}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </button>
          <button 
            onClick={() => { setFilterStatus("rejected"); setFilterSource("all"); }}
            className={cn(
              "card-static p-4 text-center transition-all hover:ring-2 hover:ring-destructive/50",
              filterStatus === "rejected" && filterSource === "all" && "ring-2 ring-destructive bg-destructive/5"
            )}
          >
            <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </button>
          <button 
            onClick={() => { setFilterStatus("all"); setFilterSource("admin_created"); }}
            className={cn(
              "card-static p-4 text-center transition-all hover:ring-2 hover:ring-secondary/50",
              filterSource === "admin_created" && "ring-2 ring-secondary bg-secondary/5"
            )}
          >
            <div className="text-2xl font-bold text-secondary">{adminCreatedCount}</div>
            <div className="text-sm text-muted-foreground">Admin Created</div>
          </button>
          <button 
            onClick={() => { setFilterStatus("all"); setFilterSource("student_created"); }}
            className={cn(
              "card-static p-4 text-center transition-all hover:ring-2 hover:ring-info/50",
              filterSource === "student_created" && "ring-2 ring-info bg-info/5"
            )}
          >
            <div className="text-2xl font-bold text-info">{studentCreatedCount}</div>
            <div className="text-sm text-muted-foreground">Student Created</div>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or competition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="admin_created">Admin Created</SelectItem>
              <SelectItem value="student_created">Student Created</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="seminar">Seminar</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={selectAllFiltered}>
              Select All Pending (Filtered)
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
            <Button size="sm" className="gap-2" onClick={handleBulkApprove} disabled={selectedIds.size === 0 || isActionInProgress}>
              <CheckCircle2 className="w-4 h-4" />
              Approve Selected
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive/10" onClick={() => setIsBulkRejectOpen(true)} disabled={selectedIds.size === 0 || isActionInProgress}>
              <XCircle className="w-4 h-4" />
              Reject Selected
            </Button>
            <span className="text-sm text-muted-foreground">Selected: {selectedIds.size}</span>
          </div>
          {filteredApprovals.map((item) => (
            <div key={item.id} className="card-static p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedIds.has(item.id)}
                      onChange={(e) => toggleSelected(item.id, e.target.checked)}
                    />
                    <span className="font-semibold">{item.student.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({item.student.studentId})
                    </span>
                    <span className={cn(
                      "badge-status",
                      item.status === "pending" && "bg-warning/10 text-warning",
                      item.status === "approved" && "bg-success/10 text-success",
                      item.status === "rejected" && "bg-destructive/10 text-destructive"
                    )}>
                      {item.status}
                    </span>
                    <span className={cn(
                      "badge-status",
                      item.source === "admin_created" 
                        ? "bg-secondary/10 text-secondary" 
                        : "bg-info/10 text-info"
                    )}>
                      {item.source === "admin_created" ? "Admin Created" : "Student Created"}
                    </span>
                    <span className="badge-status bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="font-medium">{item.competition}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn(
                        "badge-status text-xs",
                        resultColors[item.result] || "bg-muted text-muted-foreground"
                      )}>
                        <Trophy className="w-3 h-3 mr-1" />
                        {item.result}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Submitted: {item.submittedAt}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {item.proofFiles.length} file(s)
                    </div>
                    {item.proofDeadline && (
                      <div className="flex items-center gap-1 text-secondary">
                        <Calendar className="w-4 h-4" />
                        Deadline: {item.proofDeadline}
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div className={cn(
                      "mt-3 p-2 rounded text-sm",
                      item.status === "rejected" ? "bg-destructive/5 text-destructive" : "bg-muted/50"
                    )}>
                      <strong>Note:</strong> {item.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => openDetail(item)}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  
                  {item.status === "pending" && (
                    <>
                      <Button 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleApprove(item.id)}
                        disabled={isActionInProgress}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedApproval(item);
                          setIsRejectDialogOpen(true);
                        }}
                        disabled={isActionInProgress}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {item.status === "approved" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-warning hover:bg-warning/10"
                      onClick={() => handleRollback(item.id)}
                      disabled={isActionInProgress}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredApprovals.length === 0 && (
            <div className="card-static p-8 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No approvals found</p>
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <div className="flex items-center justify-between pr-8">
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    Submission Review
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    ID: #{selectedApproval?.id} • Submitted on {selectedApproval?.submittedAt}
                  </DialogDescription>
                </div>
                {selectedApproval && (
                  <Badge variant="outline" className={cn(
                    "capitalize px-3 py-1 text-sm",
                    selectedApproval.status === "pending" && "bg-warning/10 text-warning border-warning/20",
                    selectedApproval.status === "approved" && "bg-success/10 text-success border-success/20",
                    selectedApproval.status === "rejected" && "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    {selectedApproval.status}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {selectedApproval && (
              <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b">
                  <TabsList className="w-full justify-start h-12 bg-transparent gap-6 p-0">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-secondary rounded-none h-full bg-transparent px-0 text-sm font-medium"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-secondary rounded-none h-full bg-transparent px-0 text-sm font-medium"
                    >
                      Competition Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="files" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-secondary rounded-none h-full bg-transparent px-0 text-sm font-medium"
                    >
                      Proof & Results
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <User className="w-4 h-4" />
                            Student Information
                          </h4>
                          <div className="card-static p-4 space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Full Name</p>
                              <p className="font-medium text-base">{selectedApproval.student.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Student ID</p>
                              <p className="font-medium">{selectedApproval.student.studentId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Email Address</p>
                              <p className="font-medium">{selectedApproval.student.email}</p>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <Trophy className="w-4 h-4" />
                            Core Achievement
                          </h4>
                          <div className="card-static p-4 space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">Competition</p>
                              <p className="font-semibold text-secondary">{selectedApproval.competition}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Result</p>
                                <Badge className={cn("mt-1", resultColors[selectedApproval.result] || "bg-muted text-muted-foreground")}>
                                  {selectedApproval.result}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase">Category</p>
                                <Badge variant="outline" className="mt-1 capitalize">{selectedApproval.category}</Badge>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>

                      <section className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                          <Info className="w-4 h-4" />
                          Submission Context
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-muted/30 rounded-lg border">
                            <p className="text-xs text-muted-foreground uppercase">Source</p>
                            <p className="font-medium mt-1 flex items-center gap-1.5">
                              {selectedApproval.source === "admin_created" ? (
                                <><Building2 className="w-3.5 h-3.5" /> Admin Created</>
                              ) : (
                                <><User className="w-3.5 h-3.5" /> Student Created</>
                              )}
                            </p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg border">
                            <p className="text-xs text-muted-foreground uppercase">Type</p>
                            <p className="font-medium mt-1">{selectedApproval.participationType || "Individual"}</p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg border">
                            <p className="text-xs text-muted-foreground uppercase">Registration</p>
                            <p className="font-medium mt-1">{selectedApproval.registrationFeeType || "Free"}</p>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          Verifications
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-dashed">
                            <span className="text-sm text-muted-foreground">Source Confirmation</span>
                            <Badge variant={selectedApproval.sourceConfirmation ? "success" : "secondary"} className="text-[10px]">
                              {selectedApproval.sourceConfirmation || "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-dashed">
                            <span className="text-sm text-muted-foreground">Declaration Signed</span>
                            <Badge variant={selectedApproval.declarationConfirmed ? "success" : "secondary"} className="text-[10px]">
                              {selectedApproval.declarationConfirmed ? "Confirmed" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </section>
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <Building2 className="w-4 h-4" />
                            Organizer & Scale
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Organizer</p>
                              <p className="font-medium">{selectedApproval.organizer || "Not specified"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Scale</p>
                                <p className="font-medium">{selectedApproval.scale || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Mode</p>
                                <p className="font-medium">{selectedApproval.mode || "-"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Location</p>
                              <p className="font-medium flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                {selectedApproval.location || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <Calendar className="w-4 h-4" />
                            Schedule & Links
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Event Dates</p>
                              <p className="font-medium flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                {selectedApproval.startDate || "-"} to {selectedApproval.endDate || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Website</p>
                              {selectedApproval.websiteLink ? (
                                <a 
                                  href={selectedApproval.websiteLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-secondary hover:underline flex items-center gap-1.5 font-medium"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  Visit Site <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <p className="font-medium text-muted-foreground italic">No link provided</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase mb-1">Eligibility</p>
                              <p className="font-medium">{selectedApproval.eligibility || "-"}</p>
                            </div>
                          </div>
                        </section>
                      </div>

                      <Separator />

                      <section className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                          <Users className="w-4 h-4" />
                          Participation Specifics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {selectedApproval.participationType === "Team" && (
                            <div className="p-4 bg-muted/30 rounded-lg border flex items-center gap-6">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Min Team</p>
                                <p className="text-lg font-bold">{selectedApproval.teamSizeMin ?? "-"}</p>
                              </div>
                              <Separator orientation="vertical" className="h-8" />
                              <div>
                                <p className="text-xs text-muted-foreground uppercase">Max Team</p>
                                <p className="text-lg font-bold">{selectedApproval.teamSizeMax ?? "-"}</p>
                              </div>
                            </div>
                          )}
                          <div className="p-4 bg-muted/30 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground uppercase tracking-tight">Financials</p>
                            </div>
                            <p className="font-medium">
                              {selectedApproval.registrationFeeType === "Paid" ? (
                                <span className="text-secondary font-bold">
                                  {selectedApproval.registrationFeeAmount} {selectedApproval.registrationFeeCurrency}
                                </span>
                              ) : "Free Registration"}
                            </p>
                          </div>
                        </div>
                      </section>
                    </TabsContent>

                    <TabsContent value="files" className="mt-0 space-y-6">
                      <section className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                          <FileText className="w-4 h-4" />
                          Supporting Evidence
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedApproval.proofFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border hover:bg-muted/80 transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-md border shadow-sm">
                                  <FileText className="w-4 h-4 text-secondary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[400px]">
                                    {typeof file === 'string' ? file.split('/').pop() : `Proof File ${index + 1}`}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground uppercase">Verification Document</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" asChild>
                                  <a
                                    href={(file || "").startsWith("http") ? file : `http://localhost:8081${file || ""}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View
                                  </a>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex items-center gap-1.5 text-secondary hover:text-secondary hover:bg-secondary/10"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <Separator />

                      <div className="space-y-6">
                        <section>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                          <div className="p-4 bg-muted/20 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedApproval.description || "No description provided."}
                          </div>
                        </section>

                        <section>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Student Submission Notes</h4>
                          <div className="p-4 bg-muted/20 rounded-lg border text-sm leading-relaxed">
                            {selectedApproval.submissionNotes || "No notes from student."}
                          </div>
                        </section>

                        {selectedApproval.notes && (
                          <section className={cn(
                            "p-4 rounded-lg border flex gap-3",
                            selectedApproval.status === "rejected" ? "bg-destructive/5 border-destructive/20" : "bg-info/5 border-info/20"
                          )}>
                            <MessageSquare className={cn("w-5 h-5 mt-0.5 shrink-0", selectedApproval.status === "rejected" ? "text-destructive" : "text-info")} />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Admin Review Notes</h4>
                              <p className="text-sm leading-relaxed">{selectedApproval.notes}</p>
                            </div>
                          </section>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            )}

            <DialogFooter className="p-6 pt-4 border-t bg-muted/10">
              <div className="flex w-full items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="px-6">
                  Close
                </Button>
                {selectedApproval?.status === "pending" && (
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      className="text-destructive border-destructive/20 hover:bg-destructive/5 px-6"
                      onClick={() => {
                        setIsDetailOpen(false);
                        setIsRejectDialogOpen(true);
                      }}
                      disabled={isActionInProgress}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleApprove(selectedApproval.id)} 
                      disabled={isActionInProgress}
                      className="px-8 shadow-lg shadow-secondary/20"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Proof
                    </Button>
                  </div>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Reject Dialog */}
        <Dialog open={isBulkRejectOpen} onOpenChange={setIsBulkRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Selected Submissions</DialogTitle>
              <DialogDescription>
                Provide a reason applied to all selected submissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Rejection Reason</p>
                <Textarea
                  placeholder="e.g., Proof not valid or mismatched details..."
                  value={bulkRejectReason}
                  onChange={(e) => setBulkRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkRejectOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBulkReject} disabled={selectedIds.size === 0 || isActionInProgress}>
                Reject Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Proof Submission</DialogTitle>
              <DialogDescription>
                Provide a reason for rejection. The student can resubmit until the proof deadline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Rejection Reason</p>
                <Textarea
                  placeholder="e.g., Certificate does not match student name, unclear proof image..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="p-3 rounded bg-info/5 border border-info/20 text-sm">
                <p className="text-info">
                  <strong>Note:</strong> The student will be notified of the rejection and can resubmit 
                  their proof until the deadline passes.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleReject(selectedApproval?.id)}
                disabled={isActionInProgress}
              >
                Reject Submission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Attendance Report Confirmation Dialog */}
        <Dialog open={isAttendanceConfirmOpen} onOpenChange={setIsAttendanceConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Attendance Recovery Report?</DialogTitle>
              <DialogDescription>
                The proof has been approved and a social post has been published. 
                Would you like to generate an attendance recovery report for this student?
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded bg-success/5 border border-success/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-success" />
                <div>
                  <p className="font-medium">Proof Approved Successfully</p>
                  <p className="text-sm text-muted-foreground">
                    Achievement created and social post published automatically.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleConfirmAttendanceReport(false)} disabled={isActionInProgress}>
                Skip Report
              </Button>
              <Button onClick={() => handleConfirmAttendanceReport(true)} className="gap-2" disabled={isActionInProgress}>
                <FileCheck className="w-4 h-4" />
                Generate & Send Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
