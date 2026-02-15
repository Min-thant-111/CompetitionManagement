import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, CheckCircle2, XCircle, Clock, FileText, 
  Users, BarChart3, MessageSquare, Download, Eye,
  AlertTriangle, TrendingUp, Trophy, Mail, Inbox,
  ExternalLink, Globe
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockStats = [
  { icon: Clock, label: "Pending Approvals", value: "12", trend: "5", trendUp: true },
  { icon: CheckCircle2, label: "Approved Today", value: "24" },
  { icon: Users, label: "Active Users", value: "1,234" },
  { icon: Trophy, label: "Total Achievements", value: "3,567" },
];

const mockApprovals = [
  {
    id: 1,
    type: "external",
    student: "Emily Chen",
    competition: "National Coding Championship",
    achievement: "2nd Place",
    submittedAt: "2 hours ago",
    proof: ["certificate.pdf"],
  },
  {
    id: 2,
    type: "external",
    student: "James Wilson",
    competition: "International Math Olympiad",
    achievement: "Participation",
    submittedAt: "5 hours ago",
    proof: ["participation_cert.pdf"],
  },
  {
    id: 3,
    type: "achievement",
    student: "Sofia Rodriguez",
    competition: "AI Innovation Challenge",
    achievement: "1st Place",
    submittedAt: "1 day ago",
    proof: ["winner_photo.jpg", "certificate.pdf"],
  },
];

const mockSocialPosts = [
  {
    id: 1,
    author: "Alex Park",
    content: "Looking for teammates for the upcoming hackathon!",
    reportCount: 0,
    status: "published",
  },
  {
    id: 2,
    author: "Anonymous",
    content: "Content flagged for review...",
    reportCount: 3,
    status: "flagged",
  },
];

const mockContactMessages = [
  {
    id: 1,
    student: "John Doe",
    email: "john.doe@university.edu",
    subject: "Question about team registration",
    message: "Hi, I'm having trouble registering my team for the AI Innovation Challenge. The submit button seems to be disabled even though I filled all required fields.",
    submittedAt: "1 hour ago",
    status: "unread",
  },
  {
    id: 2,
    student: "Sarah Kim",
    email: "sarah.kim@university.edu",
    subject: "External competition proof rejected",
    message: "My external competition proof was rejected but I don't understand why. Can you please provide more details about what was missing?",
    submittedAt: "3 hours ago",
    status: "unread",
  },
  {
    id: 3,
    student: "Mike Johnson",
    email: "mike.j@university.edu",
    subject: "Request for deadline extension",
    message: "Due to some technical difficulties, I couldn't submit my project on time. Is it possible to get a short extension?",
    submittedAt: "1 day ago",
    status: "read",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("approvals");
  const [contactMessages, setContactMessages] = useState(mockContactMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleMarkAsRead = (id) => {
    setContactMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, status: "read" } : msg
    ));
    toast.success("Message marked as read");
  };

  const unreadCount = contactMessages.filter(m => m.status === "unread").length;

  return (
    <AppLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage approvals, reports, and system settings
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/reports")}>
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button className="gap-2" onClick={() => navigate("/admin/reports")}>
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/external-competitions")}>
              <Globe className="w-4 h-4" />
              External Competitions
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg border border-border overflow-hidden w-fit">
          <button
            onClick={() => setActiveTab("approvals")}
            className={cn(
              "px-6 py-2.5 text-sm font-medium transition-colors",
              activeTab === "approvals"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={cn(
              "px-6 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === "messages"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            Contact Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === "approvals" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pending Approvals */}
            <div className="lg:col-span-2">
              <div className="card-static p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-secondary" />
                    Pending Approvals
                  </h2>
                  <span className="badge-status bg-warning/10 text-warning">
                    12 pending
                  </span>
                </div>

                <div className="space-y-3">
                  {mockApprovals.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{item.student}</span>
                            <span className="badge-status bg-muted text-muted-foreground text-xs">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.competition} • {item.achievement}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {item.submittedAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.proof.map((file, index) => (
                            <Button key={index} variant="ghost" size="icon-sm" title={file}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1 flex-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 flex-1 text-destructive hover:bg-destructive/10">
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/admin/approvals")}>
                  View All Pending ({mockApprovals.length})
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card-static p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-secondary" />
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/admin/external-competitions")}>
                    <Globe className="w-4 h-4" />
                    Manage External Competitions
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/admin/approvals")}>
                    <Shield className="w-4 h-4" />
                    Review Approvals
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/admin/social-moderation")}>
                    <MessageSquare className="w-4 h-4" />
                    Moderate Social Feed
                  </Button>
                </div>
              </div>
              {/* Quick Reports */}
              <div className="card-static p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Quick Reports
                </h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/admin/reports")}>
                    <BarChart3 className="w-4 h-4" />
                    Attendance Recovery Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/admin/reports")}>
                    <TrendingUp className="w-4 h-4" />
                    Achievement Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/admin/reports")}>
                    <Users className="w-4 h-4" />
                    Participation Report
                  </Button>
                </div>
              </div>

              {/* Social Control */}
              <div className="card-static p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                  Social Control
                </h2>
                <div className="space-y-3">
                  {mockSocialPosts.map((post) => (
                    <div 
                      key={post.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        post.status === "flagged" 
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border bg-muted/30"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium">{post.author}</span>
                        {post.status === "flagged" && (
                          <span className="badge-status bg-destructive/10 text-destructive text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {post.reportCount} reports
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      {post.status === "flagged" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            Dismiss
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive">
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="card-static p-5">
                <h2 className="font-display font-semibold text-lg mb-4">System Status</h2>
                <div className="space-y-3">
                  {[
                    { label: "Database", status: "healthy" },
                    { label: "File Storage", status: "healthy" },
                    { label: "Email Service", status: "warning" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        item.status === "healthy" ? "bg-success" : "bg-warning"
                      )} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-2">
              <div className="card-static p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-secondary" />
                    Contact Messages
                  </h2>
                  <span className="badge-status bg-info/10 text-info">
                    {unreadCount} unread
                  </span>
                </div>

                <div className="space-y-3">
                  {contactMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-colors",
                        msg.status === "unread" 
                          ? "border-secondary/30 bg-secondary/5 hover:bg-secondary/10"
                          : "border-border bg-muted/20 hover:bg-muted/40",
                        selectedMessage?.id === msg.id && "ring-2 ring-secondary"
                      )}
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{msg.student}</span>
                          {msg.status === "unread" && (
                            <span className="w-2 h-2 rounded-full bg-secondary" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.submittedAt}</span>
                      </div>
                      <p className="font-medium text-sm text-foreground mb-1">{msg.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {contactMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="card-static p-5">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-secondary" />
                Message Details
              </h2>
              
              {selectedMessage ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="font-medium">{selectedMessage.student}</p>
                    <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="font-medium">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Message</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-border space-y-2">
                    {selectedMessage.status === "unread" && (
                      <Button 
                        className="w-full gap-2"
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Read
                      </Button>
                    )}
                    <Button variant="outline" className="w-full gap-2">
                      <Mail className="w-4 h-4" />
                      Reply via Email
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground text-sm">Select a message to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
