import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Edit2, Eye, Trash2, Globe, MapPin, Calendar,
  Upload, ExternalLink, Search, Filter, MoreVertical, Clock, AlertTriangle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockExternalCompetitions = [
  {
    id: 1,
    title: "National Coding Championship 2024",
    category: "hackathon",
    organizer: "TechCorp Foundation",
    mode: "hybrid",
    location: "Kuala Lumpur Convention Center",
    scale: "national",
    description: "Annual national-level coding competition for university students.",
    eligibility: "All undergraduate students",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    website: "https://ncc2024.tech",
    proofDeadline: "2024-03-25",
    status: "completed",
    submissions: 45,
  },
  {
    id: 2,
    title: "International AI Workshop",
    category: "workshop",
    organizer: "AI Research Institute",
    mode: "online",
    location: "Virtual",
    scale: "international",
    description: "Hands-on workshop on latest AI technologies.",
    eligibility: "CS and Engineering students",
    startDate: "2024-04-01",
    endDate: "2024-04-02",
    website: "https://aiworkshop.org",
    proofDeadline: null,
    status: "upcoming",
    submissions: 0,
  },
  {
    id: 3,
    title: "Tech Leadership Seminar",
    category: "seminar",
    organizer: "Industry Leaders Forum",
    mode: "physical",
    location: "University Main Hall",
    scale: "local",
    description: "Seminar on tech industry leadership.",
    eligibility: "Final year students",
    startDate: "2024-01-20",
    endDate: "2024-01-20",
    website: "https://techleaders.com/seminar",
    proofDeadline: "2024-02-28",
    status: "completed",
    submissions: 120,
  },
  {
    id: 4,
    title: "Regional Robotics Challenge",
    category: "Robotics",
    organizer: "Engineering Society",
    mode: "physical",
    location: "Tech Arena",
    scale: "local",
    description: "Robotics competition for engineering students.",
    eligibility: "Engineering students",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    website: "https://roboticschallenge.com",
    proofDeadline: null,
    status: "completed",
    submissions: 0,
  },
];

const categoryColors = {
  hackathon: "bg-secondary/10 text-secondary",
  workshop: "bg-info/10 text-info",
  seminar: "bg-achievement/10 text-achievement",
  other: "bg-muted text-muted-foreground",
};

const modeIcons = {
  online: Globe,
  physical: MapPin,
  hybrid: Globe,
};

export default function AdminExternalCompetitions() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState(mockExternalCompetitions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDeadline, setFilterDeadline] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "hackathon",
    customCategory: "",
    organizer: "",
    mode: "online",
    location: "",
    scale: "local",
    description: "",
    eligibility: "",
    startDate: "",
    endDate: "",
    website: "",
    proofDeadline: "",
  });

  // Check if competition has ended
  const isCompetitionEnded = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    return end < today;
  };

  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || comp.category === filterCategory;
    const matchesDeadline = filterDeadline === "all" || 
      (filterDeadline === "set" && comp.proofDeadline) ||
      (filterDeadline === "not_set" && !comp.proofDeadline);
    return matchesSearch && matchesCategory && matchesDeadline;
  });

  const handleOpenForm = (competition = null) => {
    if (competition) {
      setEditingCompetition(competition);
      const isStandardCategory = ["hackathon", "workshop", "seminar"].includes(competition.category);
      const isEnded = isCompetitionEnded(competition.endDate);
      
      setFormData({
        title: competition.title,
        category: isStandardCategory ? competition.category : "other",
        customCategory: isStandardCategory ? "" : competition.category,
        organizer: competition.organizer,
        mode: competition.mode,
        location: competition.location,
        scale: competition.scale,
        description: competition.description,
        eligibility: competition.eligibility,
        startDate: competition.startDate,
        endDate: competition.endDate,
        website: competition.website,
        proofDeadline: isEnded && !competition.proofDeadline ? "" : (competition.proofDeadline || ""),
      });
    } else {
      setEditingCompetition(null);
      setFormData({
        title: "",
        category: "hackathon",
        customCategory: "",
        organizer: "",
        mode: "online",
        location: "",
        scale: "local",
        description: "",
        eligibility: "",
        startDate: "",
        endDate: "",
        website: "",
        proofDeadline: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate custom category
    if (formData.category === "other" && !formData.customCategory.trim()) {
      toast.error("Please specify both category and custom category name");
      return;
    }

    const competitionData = {
      ...formData,
      category: formData.category === "other" ? formData.customCategory : formData.category,
      proofDeadline: editingCompetition && isCompetitionEnded(formData.endDate) && formData.proofDeadline 
        ? formData.proofDeadline 
        : (editingCompetition?.proofDeadline || null),
    };
    
    // Remove temporary customCategory field from final object
    delete competitionData.customCategory;

    if (editingCompetition) {
      setCompetitions(prev => prev.map(comp => 
        comp.id === editingCompetition.id 
          ? { ...comp, ...competitionData }
          : comp
      ));
      toast.success("Competition updated successfully");
    } else {
      const newCompetition = {
        ...competitionData,
        id: Date.now(),
        status: "upcoming",
        submissions: 0,
        proofDeadline: null, // No deadline set during creation
      };
      setCompetitions(prev => [...prev, newCompetition]);
      toast.success("Competition created successfully. Set proof deadline after competition ends.");
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    setCompetitions(prev => prev.filter(comp => comp.id !== id));
    toast.success("Competition deleted");
  };

  const openDeadlineDialog = (id) => {
    const comp = competitions.find(c => c.id === id);
    if (!comp) return;
    
    // Check if competition has ended
    if (!isCompetitionEnded(comp.endDate)) {
      toast.error("Cannot set proof deadline until competition end date has passed.");
      return;
    }
    
    setSelectedCompetitionId(id);
    setNewDeadline(comp?.proofDeadline || "");
    setIsDeadlineDialogOpen(true);
  };

  const handleSetProofDeadline = () => {
    if (!newDeadline) {
      toast.error("Please select a deadline date");
      return;
    }
    setCompetitions(prev => prev.map(comp => 
      comp.id === selectedCompetitionId ? { ...comp, proofDeadline: newDeadline } : comp
    ));
    toast.success("Proof deadline set successfully");
    setIsDeadlineDialogOpen(false);
    setNewDeadline("");
    setSelectedCompetitionId(null);
  };

  const handleRemoveDeadline = (id) => {
    setCompetitions(prev => prev.map(comp => 
      comp.id === id ? { ...comp, proofDeadline: null } : comp
    ));
    toast.success("Proof deadline removed");
  };

  const getCategoryDisplay = (comp) => {
    return comp.category;
  };

  return (
    <AppLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              External Competitions
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage external competition listings
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Competition
          </Button>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-lg bg-info/5 border border-info/20">
          <p className="text-sm text-info">
            <strong>Note:</strong> Proof submission deadlines can only be set after the competition end date has passed. 
            This allows flexibility for competitions with unpredictable result timelines.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search competitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
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
          <Select value={filterDeadline} onValueChange={setFilterDeadline}>
            <SelectTrigger className="w-full sm:w-48">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Deadline Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deadlines</SelectItem>
              <SelectItem value="set">Deadline Set</SelectItem>
              <SelectItem value="not_set">No Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Competitions List */}
        <div className="grid gap-4">
          {filteredCompetitions.map((competition) => {
            const ModeIcon = modeIcons[competition.mode];
            const hasEnded = isCompetitionEnded(competition.endDate);
            const needsDeadline = hasEnded && !competition.proofDeadline;
            
            return (
              <div key={competition.id} className="card-static p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{competition.title}</h3>
                      <span className={cn("badge-status", categoryColors[competition.category] || categoryColors.other)}>
                        {getCategoryDisplay(competition)}
                      </span>
                      <span className={cn(
                        "badge-status",
                        competition.status === "active" && "bg-success/10 text-success",
                        competition.status === "upcoming" && "bg-info/10 text-info",
                        competition.status === "completed" && "bg-muted text-muted-foreground"
                      )}>
                        {competition.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {competition.description}
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Organizer:</span>
                        {competition.organizer}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ModeIcon className="w-4 h-4" />
                        {competition.mode} • {competition.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {competition.startDate} - {competition.endDate}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Scale:</span>
                        {competition.scale}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      {competition.proofDeadline ? (
                        <div className="p-2 rounded bg-secondary/5 border border-secondary/20 inline-flex items-center gap-2 text-sm">
                          <Upload className="w-4 h-4 text-secondary" />
                          <span>Proof Deadline: <strong>{competition.proofDeadline}</strong></span>
                        </div>
                      ) : needsDeadline ? (
                        <div className="p-2 rounded bg-warning/10 border border-warning/30 inline-flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <span className="text-warning font-medium">No proof deadline set - Competition has ended</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-muted/50 border border-border inline-flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Deadline can be set after competition ends</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <a href={competition.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => handleOpenForm(competition)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => openDeadlineDialog(competition.id)}
                          disabled={!hasEnded}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {competition.proofDeadline ? "Update Proof Deadline" : "Set Proof Deadline"}
                        </DropdownMenuItem>
                        {competition.proofDeadline && (
                          <DropdownMenuItem onClick={() => handleRemoveDeadline(competition.id)}>
                            <Clock className="w-4 h-4 mr-2" />
                            Remove Deadline
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(competition.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {competition.submissions > 0 && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {competition.submissions} proof submissions received
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/approvals?search=${encodeURIComponent(competition.title)}`)}
                    >
                      View Submissions
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredCompetitions.length === 0 && (
          <div className="card-static p-12 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No competitions found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Set Proof Deadline Dialog */}
        <Dialog open={isDeadlineDialogOpen} onOpenChange={setIsDeadlineDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Proof Submission Deadline</DialogTitle>
              <DialogDescription>
                Set the deadline for students to submit their participation proof. 
                This can be updated later as competition results may be unpredictable.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="deadline">Proof Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="mt-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Students will only be able to submit proofs after you set this deadline.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeadlineDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetProofDeadline} className="gap-1">
                <Upload className="w-4 h-4" />
                Set Deadline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Competition Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompetition ? "Edit Competition" : "Create External Competition"}
              </DialogTitle>
              <DialogDescription>
                {editingCompetition 
                  ? "Update the competition details below."
                  : "Fill in the details to create a new external competition listing. Proof deadline can be set after competition ends."
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">Competition Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, customCategory: value === "other" ? prev.customCategory : "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="other">Other (specify)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.category === "other" && (
                  <div>
                    <Label htmlFor="customCategory">Custom Category</Label>
                    <Input
                      id="customCategory"
                      value={formData.customCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                      placeholder="e.g., Robotics, Debate, Case Study"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mode">Mode</Label>
                  <Select 
                    value={formData.mode} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Venue or 'Virtual'"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="scale">Scale</Label>
                  <Select 
                    value={formData.scale} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, scale: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>

                {/* Show proof deadline field only when editing and competition has ended */}
                {editingCompetition && isCompetitionEnded(formData.endDate) && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="proofDeadline">Proof Submission Deadline</Label>
                    <Input
                      id="proofDeadline"
                      type="date"
                      value={formData.proofDeadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, proofDeadline: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Competition has ended. You can now set the proof submission deadline.
                    </p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="eligibility">Eligibility</Label>
                  <Input
                    id="eligibility"
                    value={formData.eligibility}
                    onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                    placeholder="Who can participate?"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
              </div>

              {!editingCompetition && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    <strong>Note:</strong> Proof submission deadline can only be set after the competition end date has passed. 
                    This allows flexibility for competitions with unpredictable result timelines.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompetition ? "Update Competition" : "Create Competition"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
