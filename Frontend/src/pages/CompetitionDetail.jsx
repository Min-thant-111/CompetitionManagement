import { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Users, Clock, ExternalLink, Building, 
  FileText, Download, UserPlus, UsersRound, AlertCircle, CheckCircle2, User, X, Send,
  Search, MapPin, Globe, Award
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

// Extended competitions database with all competitions
const competitionsData = {
  1: {
    id: 1,
    title: "AI Innovation Challenge",
    description: "Build innovative AI solutions to solve real-world problems. This competition is designed to push the boundaries of artificial intelligence and machine learning applications. Teams will work on developing practical solutions that can make a real impact in healthcare, education, environment, or social welfare.",
    category: "Machine Learning",
    deadline: "Mar 15, 2024",
    registrationDeadline: "Mar 10, 2024",
    participants: 234,
    status: "open",
    type: "internal",
    participation: "team",
    teamSize: "3-5 members",
    rules: [
      "Teams must consist of 3-5 members",
      "All team members must be currently enrolled students",
      "Use of pre-trained models is allowed with proper attribution",
      "Final submission must include source code and documentation",
      "Presentations will be limited to 10 minutes",
    ],
    materials: [
      { name: "Competition Guidelines.pdf", size: "2.4 MB" },
      { name: "Dataset Description.pdf", size: "1.1 MB" },
      { name: "Evaluation Criteria.pdf", size: "856 KB" },
    ],
    timeline: [
      { date: "Mar 1, 2024", event: "Registration Opens", completed: true },
      { date: "Mar 10, 2024", event: "Registration Closes", completed: false },
      { date: "Mar 11, 2024", event: "Competition Begins", completed: false },
      { date: "Mar 15, 2024", event: "Submission Deadline", completed: false },
      { date: "Mar 20, 2024", event: "Results Announcement", completed: false },
    ],
    prizes: [
      { place: "1st Place", reward: "$5,000 + Internship Opportunity" },
      { place: "2nd Place", reward: "$3,000 + Mentorship Program" },
      { place: "3rd Place", reward: "$1,500 + Conference Pass" },
    ],
  },
  2: {
    id: 2,
    title: "Algorithm Sprint",
    description: "Test your problem-solving skills in this individual coding competition. Solve challenging algorithmic problems within time constraints and compete for top rankings.",
    category: "Competitive Programming",
    deadline: "Mar 25, 2024",
    registrationDeadline: "Mar 22, 2024",
    participants: 156,
    status: "open",
    type: "internal",
    participation: "individual",
    teamSize: null,
    rules: [
      "Individual participation only",
      "Use of external resources during the contest is prohibited",
      "Solutions must be original work",
      "Time limit per problem: 2 hours",
      "Programming languages allowed: C++, Java, Python",
    ],
    materials: [
      { name: "Problem Set Guide.pdf", size: "1.2 MB" },
      { name: "Scoring Criteria.pdf", size: "540 KB" },
    ],
    timeline: [
      { date: "Mar 15, 2024", event: "Registration Opens", completed: true },
      { date: "Mar 22, 2024", event: "Registration Closes", completed: false },
      { date: "Mar 25, 2024", event: "Competition Day", completed: false },
      { date: "Mar 26, 2024", event: "Results Announcement", completed: false },
    ],
    prizes: [
      { place: "1st Place", reward: "$2,000 + Tech Gadgets" },
      { place: "2nd Place", reward: "$1,000 + Online Course Subscription" },
      { place: "3rd Place", reward: "$500 + Books" },
    ],
  },
  3: {
    id: 3,
    title: "National Coding Championship",
    description: "Prestigious national-level competitive programming contest. Compete against the best programmers from universities across the country.",
    category: "Competitive Programming",
    deadline: "Apr 1, 2024",
    registrationDeadline: "Mar 25, 2024",
    participants: 892,
    status: "upcoming",
    type: "external",
    participation: "individual",
    organizer: "National Computer Society",
    mode: "Physical",
    location: "National Convention Center",
    scale: "National",
    eligibility: "University students with valid ID",
    websiteLink: "https://ncc.example.com",
    teamSize: null,
    rules: [
      "Individual participation only",
      "External competition - upload proof of participation after event",
      "Certificate or official results required for verification",
      "Must represent our university",
    ],
    materials: [
      { name: "Registration Guide.pdf", size: "1.5 MB" },
      { name: "Past Problems Archive.pdf", size: "3.2 MB" },
    ],
    timeline: [
      { date: "Mar 15, 2024", event: "Registration Opens", completed: true },
      { date: "Mar 25, 2024", event: "Registration Closes", completed: false },
      { date: "Apr 1, 2024", event: "Competition Day", completed: false },
      { date: "Apr 5, 2024", event: "Results Announcement", completed: false },
    ],
    prizes: [
      { place: "1st Place", reward: "National Recognition + $10,000" },
      { place: "2nd Place", reward: "$5,000 + Scholarship" },
      { place: "3rd Place", reward: "$2,500" },
    ],
  },
  4: {
    id: 4,
    title: "Data Science Bowl",
    description: "Analyze complex datasets and present meaningful insights. Work with real-world data to solve challenging problems.",
    category: "Data Science",
    deadline: "Feb 28, 2024",
    registrationDeadline: "Feb 20, 2024",
    participants: 445,
    status: "closed",
    type: "internal",
    participation: "team",
    teamSize: "2-4 members",
    rules: [
      "Teams must consist of 2-4 members",
      "All team members must be enrolled students",
      "Use of any data science tools allowed",
      "Final report must include methodology and visualizations",
    ],
    materials: [
      { name: "Dataset.zip", size: "15.4 MB" },
      { name: "Guidelines.pdf", size: "1.1 MB" },
    ],
    timeline: [
      { date: "Feb 1, 2024", event: "Registration Opens", completed: true },
      { date: "Feb 20, 2024", event: "Registration Closes", completed: true },
      { date: "Feb 28, 2024", event: "Submission Deadline", completed: true },
      { date: "Mar 5, 2024", event: "Results Announcement", completed: true },
    ],
    prizes: [
      { place: "1st Place", reward: "$4,000 + Data Tools License" },
      { place: "2nd Place", reward: "$2,000" },
      { place: "3rd Place", reward: "$1,000" },
    ],
  },
  5: {
    id: 5,
    title: "Mobile App Challenge",
    description: "Design and develop a mobile application that makes a difference. Create innovative solutions for everyday problems.",
    category: "Mobile Development",
    deadline: "Apr 10, 2024",
    registrationDeadline: "Apr 1, 2024",
    participants: 178,
    status: "upcoming",
    type: "internal",
    participation: "team",
    teamSize: "2-5 members",
    rules: [
      "Teams must consist of 2-5 members",
      "App must be built during the competition period",
      "Both iOS and Android submissions accepted",
      "Must include working prototype demo",
    ],
    materials: [
      { name: "App Requirements.pdf", size: "2.1 MB" },
      { name: "Design Guidelines.pdf", size: "1.8 MB" },
    ],
    timeline: [
      { date: "Mar 25, 2024", event: "Registration Opens", completed: false },
      { date: "Apr 1, 2024", event: "Registration Closes", completed: false },
      { date: "Apr 2, 2024", event: "Development Begins", completed: false },
      { date: "Apr 10, 2024", event: "Submission Deadline", completed: false },
    ],
    prizes: [
      { place: "1st Place", reward: "$6,000 + App Store Feature" },
      { place: "2nd Place", reward: "$3,000" },
      { place: "3rd Place", reward: "$1,500" },
    ],
  },
  6: {
    id: 6,
    title: "International Math Olympiad",
    description: "Represent your university in the world's most prestigious math competition. Test your mathematical prowess against global talent.",
    category: "Mathematics",
    deadline: "May 1, 2024",
    registrationDeadline: "Apr 15, 2024",
    participants: 120,
    status: "open",
    type: "external",
    participation: "individual",
    organizer: "International Mathematical Union",
    mode: "Hybrid",
    location: "Various Locations Worldwide",
    scale: "International",
    eligibility: "University students under 25",
    websiteLink: "https://imo.example.com",
    teamSize: null,
    rules: [
      "Individual participation only",
      "External competition - upload proof of participation after event",
      "Must pass internal selection round",
      "Certificate required for verification",
    ],
    materials: [
      { name: "Preparation Guide.pdf", size: "2.5 MB" },
      { name: "Past Papers Collection.pdf", size: "8.2 MB" },
    ],
    timeline: [
      { date: "Mar 20, 2024", event: "Internal Selection", completed: true },
      { date: "Apr 15, 2024", event: "Registration Closes", completed: false },
      { date: "May 1, 2024", event: "Competition Day", completed: false },
      { date: "May 10, 2024", event: "Results Announcement", completed: false },
    ],
    prizes: [
      { place: "Gold Medal", reward: "International Recognition + $15,000" },
      { place: "Silver Medal", reward: "$8,000 + Scholarship" },
      { place: "Bronze Medal", reward: "$4,000" },
    ],
  },
  13: {
    id: 13,
    title: "Cloud Architecture Challenge",
    description: "Design scalable cloud solutions for enterprise applications. Work with your team to architect and implement cloud-native solutions using modern technologies.",
    category: "Cloud Computing",
    deadline: "Mar 30, 2027",
    registrationDeadline: "Mar 20, 2027",
    participants: 45,
    status: "open",
    type: "internal",
    participation: "team",
    teamSize: "2-4 members",
    rules: [
      "Teams must consist of 2-4 members",
      "All team members must be enrolled students",
      "Solutions must use at least one major cloud provider (AWS, Azure, GCP)",
      "Documentation must include architecture diagrams",
      "Live demo required during presentation",
    ],
    materials: [
      { name: "Cloud Requirements.pdf", size: "1.8 MB" },
      { name: "Sample Architectures.pdf", size: "3.2 MB" },
    ],
    timeline: [
      { date: "Mar 1, 2027", event: "Registration Opens", completed: true },
      { date: "Mar 20, 2027", event: "Registration Closes", completed: false },
      { date: "Mar 21, 2027", event: "Competition Begins", completed: false },
      { date: "Mar 30, 2027", event: "Submission Deadline", completed: false },
    ],
    prizes: [
      { place: "1st Place", reward: "$5,000 + Cloud Certification Vouchers" },
      { place: "2nd Place", reward: "$2,500 + Learning Platform Access" },
      { place: "3rd Place", reward: "$1,000" },
    ],
  },
  14: {
    id: 14,
    title: "Data Analytics Challenge",
    description: "Analyze real-world datasets and present actionable insights. Use data visualization and statistical methods to uncover patterns.",
    category: "Data Analytics",
    deadline: "Feb 15, 2027",
    registrationDeadline: "Feb 10, 2027",
    participants: 78,
    status: "open",
    type: "internal",
    participation: "individual",
    teamSize: null,
    rules: [
      "Individual participation only",
      "Submissions must include both analysis report and visualizations",
      "Only PDF and ZIP file formats accepted",
      "Maximum file size: 100MB",
      "All work must be original",
    ],
    materials: [
      { name: "Dataset.csv", size: "5.2 MB" },
      { name: "Analysis Guidelines.pdf", size: "1.1 MB" },
    ],
    timeline: [
      { date: "Jan 15, 2027", event: "Registration Opens", completed: true },
      { date: "Feb 10, 2027", event: "Registration Closes", completed: false },
      { date: "Feb 15, 2027", event: "Submission Deadline", completed: false },
      { date: "Feb 20, 2027", event: "Results Announcement", completed: false },
    ],
    prizes: [
      { place: "1st Place", reward: "$3,000 + Analytics Tool License" },
      { place: "2nd Place", reward: "$1,500" },
      { place: "3rd Place", reward: "$750" },
    ],
  },
};


// Mock all users for invite search
const mockAllUsers = [
  { id: "user2", name: "Emily Chen", email: "emily@university.edu", avatar: "E" },
  { id: "user3", name: "James Wilson", email: "james@university.edu", avatar: "J" },
  { id: "user4", name: "Sofia Rodriguez", email: "sofia@university.edu", avatar: "S" },
  { id: "user5", name: "Alex Park", email: "alex@university.edu", avatar: "A" },
  { id: "user6", name: "Lisa Kim", email: "lisa@university.edu", avatar: "L" },
  { id: "user9", name: "Tom Brown", email: "tom@university.edu", avatar: "T" },
  { id: "user10", name: "Maria Garcia", email: "maria@university.edu", avatar: "M" },
  { id: "user11", name: "David Lee", email: "david@university.edu", avatar: "D" },
  { id: "user12", name: "Anna Smith", email: "anna@university.edu", avatar: "A" },
];


const statusStyles = {
  open: "bg-success/10 text-success border-success/20",
  upcoming: "bg-info/10 text-info border-info/20",
  closed: "bg-muted text-muted-foreground border-border",
};

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

const buildTimeline = (registrationDeadline, submissionDeadline) => {
  const now = new Date();
  const items = [];
  if (registrationDeadline) {
    const d = new Date(registrationDeadline);
    items.push({
      date: formatDate(registrationDeadline),
      event: "Registration Closes",
      completed: !Number.isNaN(d.getTime()) && now > d,
    });
  }
  if (submissionDeadline) {
    const d = new Date(submissionDeadline);
    items.push({
      date: formatDate(submissionDeadline),
      event: "Submission Deadline",
      completed: !Number.isNaN(d.getTime()) && now > d,
    });
  }
  return items;
};

const normalizeCompetition = (raw) => {
  const type = (raw?.competitionType || raw?.type || "internal").toLowerCase();
  const participation = (raw?.participationType || raw?.participation || "individual").toLowerCase();
  const registrationDeadline = raw?.registrationDeadline || raw?.registration_deadline;
  const submissionDeadline = raw?.submissionDeadline || raw?.submission_deadline;
  const rules = Array.isArray(raw?.rules) ? raw.rules : [];
  const materials = Array.isArray(raw?.materials)
    ? raw.materials
    : raw?.materials
      ? [{ name: raw.materials, size: "" }]
      : [];
  const prizes = Array.isArray(raw?.prizes) ? raw.prizes : [];
  const timeline = Array.isArray(raw?.timeline)
    ? raw.timeline
    : buildTimeline(registrationDeadline, submissionDeadline);
  const teamSize = raw?.teamSize
    || (raw?.minTeamSize && raw?.maxTeamSize
      ? `${raw.minTeamSize}-${raw.maxTeamSize} members`
      : raw?.minTeamSize ? `${raw.minTeamSize}+ members` : null);
  const minTeamSize = raw?.minTeamSize ?? raw?.min_team_size;
  const maxTeamSize = raw?.maxTeamSize ?? raw?.max_team_size;

  return {
    id: raw?.competitionId || raw?.id,
    title: raw?.title || "Untitled Competition",
    description: raw?.description || (raw?.format ? `${raw.format} competition` : ""),
    category: raw?.category || raw?.format || "General",
    deadline: raw?.deadline || formatDate(submissionDeadline || registrationDeadline),
    registrationDeadline: formatDate(registrationDeadline),
    submissionDeadline: formatDate(submissionDeadline),
    status: raw?.status || deriveStatus(registrationDeadline),
    type,
    participation,
    teamSize,
    minTeamSize,
    maxTeamSize,
    rules,
    materials,
    timeline,
    prizes,
    organizer: raw?.organizer,
    mode: raw?.mode,
    location: raw?.location,
    scale: raw?.scale,
    eligibility: raw?.eligibility,
    websiteLink: raw?.websiteLink,
    format: raw?.format,
    totalMarks: raw?.totalMarks,
    quizDurationMinutes: raw?.quizDurationMinutes,
    raw,
  };
};

export default function CompetitionDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [joinRequestSent, setJoinRequestSent] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [competitionData, setCompetitionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem("userId") || "");
  
  // Team creation form state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [inviteSearch, setInviteSearch] = useState("");
  const [selectedInvites, setSelectedInvites] = useState([]);
  
  useEffect(() => {
    const fetchCompetition = async () => {
      const token = localStorage.getItem("userToken");
      try {
        const res = await fetch(`${API_BASE_URL}/competitions/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          setCompetitionData(data);
          setLoadError("");
        } else {
          setLoadError(`Failed to load competition (${res.status})`);
        }
      } catch (err) {
        setLoadError(err.message || "Failed to load competition");
      } finally {
        setLoading(false);
      }
    };
    fetchCompetition();
  }, [id]);

  useEffect(() => {
    const resolveCurrentUser = async () => {
      if (currentUserId) return;
      const token = localStorage.getItem("userToken");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data?.id) {
          setCurrentUserId(data.id);
          localStorage.setItem("userId", data.id);
        }
      } catch {
        // ignore
      }
    };
    resolveCurrentUser();
  }, [currentUserId]);

  // Get competition data from location state (passed from list) or fallback to mock database
  const passedCompetition = location.state?.competition;
  const fallbackCompetition = passedCompetition || competitionsData[id];

  const competition = competitionData
    ? normalizeCompetition(competitionData)
    : fallbackCompetition
      ? normalizeCompetition(fallbackCompetition)
      : null;

  useEffect(() => {
    const fetchTeams = async () => {
      if (!competition || competition.participation !== "team" || competition.type !== "internal") {
        setTeams([]);
        setTeamsError("");
        setTeamsLoading(false);
        return;
      }
      const token = localStorage.getItem("userToken");
      if (!token) return;
      setTeams([]);
      setTeamsLoading(true);
      setTeamsError("");
      try {
        const res = await fetch(`${API_BASE_URL}/teams?competitionId=${competition.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to load teams (${res.status})`);
        const data = await res.json().catch(() => []);
        setTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        setTeamsError(err.message || "Failed to load teams");
      } finally {
        setTeamsLoading(false);
      }
    };
    fetchTeams();
  }, [competition?.id, competition?.participation, competition?.type]);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      if (!competition?.id || competition?.type !== "internal") {
        setIsRegistered(false);
        return;
      }
      const token = localStorage.getItem("userToken");
      if (!token) {
        setIsRegistered(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/competitions/registrations/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setIsRegistered(false);
          return;
        }
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data) ? data : [];
        const registered = list.some((r) => String(r.competitionId) === String(competition.id));
        setIsRegistered(registered);
      } catch {
        setIsRegistered(false);
      }
    };

    fetchRegistrationStatus();
  }, [competition?.id, competition?.type]);
    
  const isTeamCompetition = competition?.participation === "team" && competition?.type === "internal";
  const isExternalCompetition = competition?.type === "external";
  const isRegistrationClosed = competition?.status === "closed";
  const isUpcoming = competition?.status === "upcoming";
  const canRegister = competition?.status === "open";

  // Check if user already has a team for this competition
  const userTeam = teams.find(t =>
    t.leaderId === currentUserId || (t.acceptedMemberIds || []).includes(currentUserId)
  );
  const hasExistingTeam = !!userTeam;
  const canRegisterTeam = !!(userTeam && userTeam.leaderId === currentUserId && userTeam.status === "ACTIVE" && !isRegistered && canRegister);

  const mapTeamToUi = (team) => {
    const memberIds = [team.leaderId, ...(team.acceptedMemberIds || [])]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i);
    const members = memberIds.map((id) => ({
      id,
      name: id,
      avatar: (id || "U").charAt(0).toUpperCase()
    }));
    const maxSize = typeof competition?.maxTeamSize === "number" ? competition.maxTeamSize : null;
    const openSpots = maxSize == null ? null : Math.max(maxSize - memberIds.length, 0);
    return {
      id: team.teamId,
      name: team.teamName,
      leader: {
        id: team.leaderId,
        name: team.leaderId,
        avatar: (team.leaderId || "U").charAt(0).toUpperCase()
      },
      members,
      maxSize,
      openSpots,
      description: team.status === "ACTIVE" ? "Team is active" : "Team is pending"
    };
  };

  const existingTeams = teams.map(mapTeamToUi);

  // Filter users for invite search
  const filteredUsers = mockAllUsers.filter(user => 
    (user.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(inviteSearch.toLowerCase())) &&
    !selectedInvites.find(inv => inv.id === user.id)
  );

  const registerCompetition = async (teamId) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Not authenticated");
      return false;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/competitions/${competition.id}/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ competitionId: competition.id, teamId: teamId || null })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setIsRegistered(true);
      toast.success("Successfully registered for the competition!");
      return true;
    } catch (err) {
      toast.error(err.message || "Registration failed");
      return false;
    }
  };

  const handleJoinRequest = async (teamId) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Join failed");
      setJoinRequestSent(prev => ({ ...prev, [teamId]: true }));
      setTeams(prev => {
        const next = prev.slice();
        const idx = next.findIndex(t => t.teamId === teamId);
        if (idx >= 0) next[idx] = data;
        return next;
      });
      toast.success("Joined the team successfully!");
    } catch (err) {
      toast.error(err.message || "Join failed");
    }
  };

  const handleRegisterIndividual = async () => {
    await registerCompetition(null);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          competitionId: competition.id,
          teamName: teamName.trim(),
          invitedMemberIds: selectedInvites.map(u => u.id)
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Team creation failed");
      setTeams(prev => [data, ...prev]);
      toast.success(`Team "${teamName}" created successfully!`);
      if (data.status === "ACTIVE") {
        await registerCompetition(data.teamId);
      } else {
        toast.info("Team is pending until minimum size is reached.");
      }
      setShowCreateTeamModal(false);
      setTeamName("");
      setTeamDescription("");
      setSelectedInvites([]);
    } catch (err) {
      toast.error(err.message || "Team creation failed");
    }
  };

  const addToInvite = (user) => {
    setSelectedInvites(prev => [...prev, user]);
    setInviteSearch("");
  };

  const removeFromInvite = (userId) => {
    setSelectedInvites(prev => prev.filter(u => u.id !== userId));
  };

  const handleDownload = (fileName) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading: ${fileName}`);
  };

  if (!competition) {
    return (
      <AppLayout role="student">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-2xl font-display font-bold">Competition Details</h1>
          <div className="card-static p-6 text-center">
            {loading ? (
              <p className="text-muted-foreground">Loading competition...</p>
            ) : (
              <>
                <p className="text-destructive">Competition not found.</p>
                {loadError && <p className="text-sm text-muted-foreground mt-2">{loadError}</p>}
                <div className="mt-4">
                  <Button onClick={() => navigate("/competitions")}>Back to Competitions</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Link 
          to="/competitions" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Competitions
        </Link>

        {/* Header */}
        <div className="card-static p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Only show status badge for internal competitions */}
            {!isExternalCompetition && competition.status && (
              <span className={cn("badge-status border", statusStyles[competition.status] || "border-border bg-muted text-muted-foreground")}>
                {competition.status === "open" ? "Open for Registration" 
                  : competition.status === "upcoming" ? "Coming Soon" 
                  : "Registration Closed"}
              </span>
            )}
            <span className="badge-status bg-muted text-muted-foreground flex items-center gap-1">
              {isExternalCompetition ? (
                <ExternalLink className="w-3 h-3" />
              ) : (
                <Building className="w-3 h-3" />
              )}
              {competition.type}
            </span>
            <span className={cn(
              "badge-status flex items-center gap-1",
              isTeamCompetition ? "bg-accent text-accent-foreground" : "bg-secondary/10 text-secondary"
            )}>
              {isTeamCompetition ? (
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

          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-3">
            {competition.title}
          </h1>
          <p className="text-muted-foreground mb-6">
            {competition.description}
          </p>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
            {isExternalCompetition ? (
              // External: show start and end date only
              <>
                {competition.startDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>Start: <strong className="text-foreground">{competition.startDate}</strong></span>
                  </span>
                )}
                {competition.endDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>End: <strong className="text-foreground">{competition.endDate}</strong></span>
                  </span>
                )}
                {!competition.startDate && !competition.endDate && competition.deadline && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>Deadline: <strong className="text-foreground">{competition.deadline}</strong></span>
                  </span>
                )}
              </>
            ) : (
              // Internal: show deadline
              competition.deadline && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>Deadline: <strong className="text-foreground">{competition.deadline}</strong></span>
                </span>
              )
            )}
            {competition.participants != null && (
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <span>{competition.participants} participants</span>
              </span>
            )}
            {isTeamCompetition && (
              <span className="flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-secondary" />
                <span>Team size: {competition.teamSize || "Not specified"}</span>
              </span>
            )}
          </div>

          {/* External Competition Extra Info */}
          {isExternalCompetition && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              {competition.organizer && (
                <div>
                  <p className="text-xs text-muted-foreground">Organizer</p>
                  <p className="text-sm font-medium">{competition.organizer}</p>
                </div>
              )}
              {competition.mode && (
                <div>
                  <p className="text-xs text-muted-foreground">Mode</p>
                  <p className="text-sm font-medium">{competition.mode}</p>
                </div>
              )}
              {competition.location && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="text-sm font-medium">{competition.location}</p>
                </div>
              )}
              {competition.scale && (
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Scale
                  </p>
                  <p className="text-sm font-medium">{competition.scale}</p>
                </div>
              )}
            </div>
          )}

          {/* Status Warnings - Only for internal competitions */}
          {!isExternalCompetition && (
            <>
              {isRegistrationClosed ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Registration is closed</p>
                    <p className="text-sm text-muted-foreground">
                      The registration deadline for this competition has passed.
                    </p>
                  </div>
                </div>
              ) : isUpcoming ? (
                <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex items-start gap-3 mb-6">
                  <Clock className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Coming Soon</p>
                    <p className="text-sm text-muted-foreground">
                      Registration has not opened yet. Please check back later.
                    </p>
                  </div>
                </div>
              ) : hasExistingTeam && isTeamCompetition ? (
                <div className={cn(
                  "border rounded-lg p-4 flex items-start gap-3 mb-6",
                  isRegistered ? "bg-success/10 border-success/20" : "bg-info/10 border-info/20"
                )}>
                  {isRegistered ? (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {isRegistered ? "Team registered" : "Team created"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRegistered
                        ? "Your team is registered for this competition."
                        : userTeam?.status === "ACTIVE"
                          ? "Your team is active. Register the team to finalize."
                          : "Your team is pending until the minimum size is reached."}
                    </p>
                  </div>
                </div>
              ) : isRegistered ? (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Successfully registered!</p>
                    <p className="text-sm text-muted-foreground">
                      You have registered for this competition. Good luck!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {competition.registrationDeadline
                        ? `Registration closes on ${competition.registrationDeadline}`
                        : "Registration deadline not set"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isTeamCompetition 
                        ? "Make sure to register your team before the deadline."
                        : "Make sure to register before the deadline."
                      }
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* External Competition Notice - Always show for external */}
          {isExternalCompetition && (
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 flex items-start gap-3 mb-6">
              <ExternalLink className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">External Competition</p>
                <p className="text-sm text-muted-foreground">
                  This is an external competition. Registration happens on the organizer's website. 
                  After participating, submit your proof in the Submissions tab when admin allows uploads.
                </p>
                {competition.websiteLink && (
                  <a 
                    href={competition.websiteLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-secondary hover:underline mt-2"
                  >
                    Visit Official Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - Different based on competition type */}
          <div className="flex flex-wrap gap-3">
            {isExternalCompetition ? (
              // External competitions - view only, no registration button
              competition.websiteLink && (
                <a href={competition.websiteLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Visit Competition Website
                  </Button>
                </a>
              )
            ) : isTeamCompetition ? (
              // Internal team competition - create or join team
              <>
                {!hasExistingTeam && (
                  <>
                    <Button 
                      size="lg" 
                      className="gap-2"
                      disabled={!canRegister}
                      onClick={() => setShowCreateTeamModal(true)}
                    >
                      <UsersRound className="w-4 h-4" />
                      Create Team
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="gap-2"
                      disabled={!canRegister}
                      onClick={() => setShowJoinTeamModal(true)}
                    >
                      <UserPlus className="w-4 h-4" />
                      Join Existing Team
                    </Button>
                  </>
                )}
                {hasExistingTeam && (
                  <Button
                    size="lg"
                    className="gap-2"
                    disabled={!canRegisterTeam}
                    onClick={() => registerCompetition(userTeam?.teamId)}
                  >
                    <User className="w-4 h-4" />
                    {canRegisterTeam ? "Register Team" : "Team Registered / Pending"}
                  </Button>
                )}
              </>
            ) : (
              // Internal individual competition - simple register
              <Button 
                size="lg" 
                className="gap-2"
                disabled={!canRegister || isRegistered}
                onClick={handleRegisterIndividual}
              >
                <User className="w-4 h-4" />
                {isRegistered ? "Registered" : "Register Now"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rules */}
            <section className="card-static p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Rules & Guidelines</h2>
              {competition.rules.length > 0 ? (
                <ul className="space-y-3">
                  {competition.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{rule}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No rules provided yet.</p>
              )}
            </section>

            {/* Materials */}
            <section className="card-static p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Materials & Resources</h2>
              {competition.materials.length > 0 ? (
                <div className="space-y-3">
                  {competition.materials.map((material, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="font-medium text-sm">{material.name}</p>
                          {material.size && <p className="text-xs text-muted-foreground">{material.size}</p>}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDownload(material.name)}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No materials available.</p>
              )}
            </section>

            {/* Prizes */}
            <section className="card-static p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Prizes</h2>
              {competition.prizes.length > 0 ? (
                <div className="grid gap-3">
                  {competition.prizes.map((prize, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-lg border",
                        index === 0 
                          ? "bg-achievement/5 border-achievement/20" 
                          : index === 1 
                          ? "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700" 
                          : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                      )}
                    >
                      <p className="font-semibold text-foreground">{prize.place}</p>
                      <p className="text-sm text-muted-foreground">{prize.reward}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No prizes listed.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <section className="card-static p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Timeline</h2>
              {competition.timeline.length > 0 ? (
                <div className="space-y-4">
                  {competition.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                        item.completed 
                          ? "bg-success text-success-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          item.completed ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {item.event}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No timeline available.</p>
              )}
            </section>

            {/* Category */}
            <section className="card-static p-6">
              <h2 className="font-display font-semibold text-lg mb-3">Category</h2>
              <span className="badge-status bg-secondary/10 text-secondary text-sm px-3 py-1">
                {competition.category}
              </span>
            </section>

            {/* Participation Type Info */}
            <section className="card-static p-6">
              <h2 className="font-display font-semibold text-lg mb-3">Participation</h2>
              <div className={cn(
                "p-3 rounded-lg",
                isTeamCompetition ? "bg-accent/10" : "bg-secondary/10"
              )}>
                {isTeamCompetition ? (
                  <div className="flex items-center gap-2">
                    <UsersRound className="w-5 h-5 text-accent-foreground" />
                    <div>
                      <p className="font-medium text-sm">Team Competition</p>
                      <p className="text-xs text-muted-foreground">{competition.teamSize}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="font-medium text-sm">Individual Competition</p>
                      <p className="text-xs text-muted-foreground">Compete on your own</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Create Team Modal with Invite */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm overflow-y-auto py-8">
          <div className="card-static w-full max-w-lg p-6 m-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Create Team</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowCreateTeamModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new team for <strong>{competition.title}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Team Name *</label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description (Optional)</label>
                <textarea
                  placeholder="Brief description of your team"
                  rows={2}
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              
              {/* Invite Members Section */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Invite Members (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Search by name or email to invite members now, or invite them later from the Teams page.
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={inviteSearch}
                    onChange={(e) => setInviteSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                {/* Search Results */}
                {inviteSearch && filteredUsers.length > 0 && (
                  <div className="mt-2 border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                    {filteredUsers.slice(0, 5).map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => addToInvite(user)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-medium">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <UserPlus className="w-3 h-3" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Invites */}
                {selectedInvites.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Will be invited:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInvites.map(user => (
                        <span 
                          key={user.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                        >
                          {user.name}
                          <button 
                            onClick={() => removeFromInvite(user.id)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateTeamModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>
                Create Team
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Join Existing Team Modal */}
      {showJoinTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="card-static w-full max-w-lg p-6 m-4 animate-fade-in max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Join Existing Team</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowJoinTeamModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Select a team to join for <strong>{competition.title}</strong>
            </p>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {teamsLoading ? (
                <div className="p-6 text-center text-muted-foreground">Loading teams...</div>
              ) : teamsError ? (
                <div className="p-6 text-center text-destructive">{teamsError}</div>
              ) : existingTeams.length > 0 ? (
                existingTeams.map((team) => {
                  const isOwnTeam = team.leader.id === currentUserId;
                  const requestSent = joinRequestSent[team.id];
                  
                  return (
                    <div 
                      key={team.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        isOwnTeam ? "bg-secondary/5 border-secondary/20" : "border-border hover:border-secondary/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{team.name}</h3>
                            {isOwnTeam && (
                              <span className="badge-status bg-secondary/10 text-secondary text-xs">Your Team</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{team.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {team.maxSize == null
                                ? `${team.members.length} members`
                                : `${team.members.length}/${team.maxSize} members`}
                            </span>
                            {team.openSpots != null && (
                              <span className="text-success">{team.openSpots} spots open</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Leader:</span>
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center text-xs">
                                {team.leader.avatar}
                              </div>
                              <span className="text-xs">{team.leader.name}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {isOwnTeam ? (
                            <span className="text-xs text-muted-foreground">Already joined</span>
                          ) : requestSent ? (
                            <Button size="sm" variant="outline" disabled className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Joined
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="gap-1"
                              disabled={team.openSpots === 0}
                              onClick={() => handleJoinRequest(team.id)}
                            >
                              <Send className="w-3 h-3" />
                              Join Team
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No teams available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to create a team!</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowJoinTeamModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
