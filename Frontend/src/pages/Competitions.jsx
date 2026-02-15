import { useState, useEffect } from "react";
import { Search, Filter, Calendar, Users, Clock, ExternalLink, Building, User, UsersRound, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const deriveStatus = (registrationDeadline) => {
  if (!registrationDeadline) return "open";
  const d = new Date(registrationDeadline);
  if (Number.isNaN(d.getTime())) return "open";
  return new Date() > d ? "closed" : "open";
};

const normalizeCompetition = (raw) => {
  const type = (raw?.competitionType || raw?.type || "internal").toLowerCase();
  const participation = (raw?.participationType || raw?.participation || "individual").toLowerCase();
  const deadlineRaw = raw?.submissionDeadline || raw?.registrationDeadline || raw?.deadline;
  return {
    id: raw?.competitionId || raw?.id,
    title: raw?.title || "Untitled Competition",
    description: raw?.description || (raw?.format ? `${raw.format} competition` : ""),
    category: raw?.category || raw?.format || "General",
    deadline: formatDate(deadlineRaw),
    deadlineRaw,
    registrationDeadline: raw?.registrationDeadline,
    submissionDeadline: raw?.submissionDeadline,
    status: raw?.status || deriveStatus(raw?.registrationDeadline),
    type,
    participation,
    participants: raw?.participants,
    organizer: raw?.organizer,
    startDate: raw?.startDate ? formatDate(raw.startDate) : "",
    endDate: raw?.endDate ? formatDate(raw.endDate) : "",
    websiteLink: raw?.websiteLink,
    raw,
  };
};

const statusStyles = {
  open: "bg-success/10 text-success border-success/20",
  upcoming: "bg-info/10 text-info border-info/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const statusLabels = {
  open: "Open for Registration",
  upcoming: "Coming Soon",
  closed: "Registration Closed",
};

const filters = [
  { label: "All", value: "all" },
  { label: "Internal", value: "internal" },
  { label: "External", value: "external" },
];

const statusFilters = [
  { label: "All Status", value: "all" },
  { label: "Open", value: "open" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Closed", value: "closed" },
];

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCompetitions = async () => {
      const token = localStorage.getItem("userToken");
      try {
        const res = await fetch(`${API_BASE_URL}/competitions`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          throw new Error(`Failed to load competitions (${res.status})`);
        }
        const data = await res.json().catch(() => []);
        setCompetitions(Array.isArray(data) ? data : []);
        setLoadError("");
      } catch (err) {
        setLoadError(err.message || "Failed to load competitions");
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const normalizedCompetitions = competitions.map(normalizeCompetition);

  const filteredCompetitions = normalizedCompetitions.filter((comp) => {
    const matchesType = typeFilter === "all" || comp.type === typeFilter;
    const matchesStatus = statusFilter === "all" || comp.status === statusFilter;
    const matchesSearch = (comp.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <AppLayout role="student">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Competitions
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and participate in exciting academic competitions
          </p>
        </div>

        {/* Filters */}
        <div className="card-static p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Type Filter */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTypeFilter(filter.value)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      typeFilter === filter.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Competition List */}
        <div className="grid gap-4">
          {loading && (
            <div className="card-static p-6 text-center text-muted-foreground">
              Loading competitions...
            </div>
          )}
          {!loading && loadError && (
            <div className="card-static p-6 text-center text-destructive">
              {loadError}
            </div>
          )}
          {filteredCompetitions.map((competition) => (
            <div 
              key={competition.id} 
              className="card-elevated p-6 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Only show status badge for internal competitions */}
                    {competition.type === "internal" && competition.status && statusStyles[competition.status] && (
                      <span className={cn("badge-status border", statusStyles[competition.status])}>
                        {statusLabels[competition.status]}
                      </span>
                    )}
                    <span className="badge-status bg-muted text-muted-foreground flex items-center gap-1">
                      {competition.type === "external" ? (
                        <ExternalLink className="w-3 h-3" />
                      ) : (
                        <Building className="w-3 h-3" />
                      )}
                      {competition.type}
                    </span>
                    <span className={cn(
                      "badge-status flex items-center gap-1",
                      competition.participation === "team" 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-secondary/10 text-secondary"
                    )}>
                      {competition.participation === "team" ? (
                        <>
                          <UsersRound className="w-3 h-3" />
                          Team
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          Individual
                        </>
                      )}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-secondary transition-colors">
                    {competition.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    {competition.description}
                  </p>
                  
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {competition.type === "internal" ? (
                        competition.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Deadline: {competition.deadline}
                          </span>
                        )
                      ) : competition.startDate && competition.endDate ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {competition.startDate} - {competition.endDate}
                        </span>
                      ) : competition.deadline ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Deadline: {competition.deadline}
                        </span>
                      ) : null}
                      {competition.type === "internal" && competition.participants != null && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {competition.participants} participants
                        </span>
                      )}
                      {competition.type === "external" && competition.organizer && (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-4 h-4" />
                          {competition.organizer}
                        </span>
                      )}
                      {competition.category && (
                        <span className="badge-status bg-secondary/10 text-secondary">
                          {competition.category}
                        </span>
                      )}
                    </div>
                </div>

                {/* For external competitions - show Visit Website button */}
                {competition.type === "external" ? (
                  <div className="flex flex-col gap-2">
                    <Link 
                      to={`/competitions/${competition.id}`}
                      state={{ competition }}
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </Link>
                    {competition.websiteLink && (
                      <a 
                        href={competition.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Visit Website
                        </Button>
                      </a>
                    )}
                  </div>
                ) : (
                  <Link 
                    to={`/competitions/${competition.id}`}
                    state={{ competition }}
                  >
                    <Button 
                      className={cn(
                        "flex-shrink-0 gap-2",
                        competition.status === "closed" && "opacity-50 pointer-events-none"
                      )}
                      disabled={competition.status === "closed"}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && !loadError && filteredCompetitions.length === 0 && (
          <div className="card-static p-12 text-center">
            <p className="text-muted-foreground">No competitions found matching your criteria.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
