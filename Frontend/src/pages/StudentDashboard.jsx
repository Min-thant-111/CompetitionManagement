import { Trophy, Users, Medal, Clock, Bell, ChevronRight, TrendingUp, MessageSquare, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { CompetitionCard } from "@/components/dashboard/CompetitionCard";
import { TeamCard } from "@/components/dashboard/TeamCard";
import { AchievementCard } from "@/components/dashboard/AchievementCard";
import { NotificationItem } from "@/components/dashboard/NotificationItem";
import { LeaderboardPreview } from "@/components/dashboard/LeaderboardPreview";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const mockStats = [
  { icon: Trophy, label: "Active Competitions", value: "4", trend: "2", trendUp: true },
  { icon: Users, label: "Teams Joined", value: "3" },
  { icon: Medal, label: "Achievements", value: "12", trend: "3", trendUp: true },
  { icon: Clock, label: "Upcoming Deadlines", value: "2" },
];

const mockCompetitions = [
  {
    id: 1,
    title: "AI Innovation Challenge",
    category: "Machine Learning",
    deadline: "Mar 15, 2024",
    participants: 234,
    status: "open",
    type: "internal",
  },
  {
    id: 2,
    title: "Algorithm Sprint",
    category: "Competitive Programming",
    deadline: "Mar 25, 2024",
    participants: 156,
    status: "open",
    type: "internal",
  },
  {
    id: 7,
    title: "Software Engineering Challenge",
    category: "Software Development",
    deadline: "Apr 20, 2024",
    participants: 89,
    status: "open",
    type: "internal",
  },
];

const mockTeams = [
  {
    id: 1,
    name: "CodeCrafters",
    competition: "AI Innovation Challenge",
    members: ["John", "Sarah", "Mike", "Emma"],
    status: "active",
    isLeader: true,
  },
  {
    id: 2,
    name: "WebWizards",
    competition: "Web Development Hackathon",
    members: ["Lisa", "John", "Tom"],
    status: "active",
    isLeader: false,
  },
  {
    id: 3,
    name: "TechTitans",
    competition: "Software Engineering Challenge",
    members: ["John", "Emily"],
    status: "active",
    isLeader: true,
  },
];

const mockAchievements = [
  { id: 1, title: "1st Place Winner", competition: "Algorithm Contest 2024", date: "Feb 28", rank: "gold" },
  { id: 2, title: "Runner Up", competition: "Database Design Challenge", date: "Feb 15", rank: "silver" },
  { id: 3, title: "Bronze Medal", competition: "UI/UX Competition", date: "Feb 1", rank: "bronze" },
  { id: 4, title: "Finalist", competition: "AWS Cloud Challenge", date: "Jan 20", rank: "achievement" },
];

const mockNotifications = [
  { id: 1, type: "deadline", message: "AI Innovation Challenge deadline in 3 days", time: "2 hours ago", unread: true },
  { id: 2, type: "team", message: "Emily Chen joined TechTitans", time: "3 hours ago", unread: true },
  { id: 3, type: "team", message: "Sarah Chen accepted your team invitation", time: "5 hours ago", unread: true },
  { id: 4, type: "competition", message: "New competition: Mobile App Challenge", time: "1 day ago", unread: false },
  { id: 5, type: "alert", message: "Your submission was received successfully", time: "2 days ago", unread: false },
  { id: 6, type: "external", message: "AWS Cloud Challenge proof approved!", time: "3 days ago", unread: false },
];

const mockLeaders = [
  { id: 1, name: "Emily Chen", points: 2450, trend: "up" },
  { id: 2, name: "James Wilson", points: 2320, trend: "up" },
  { id: 3, name: "Sofia Rodriguez", points: 2180, trend: "down" },
  { id: 4, name: "John Doe", points: 1950, trend: "same" },
  { id: 5, name: "Maria Garcia", points: 1820, trend: "up" },
];

// Mock admin messages/replies
const mockAdminMessages = [
  {
    id: 1,
    subject: "Re: Question about External Competition",
    message: "Hi John, your external competition proof has been approved. The attendance recovery report has been generated and sent to your university email.",
    time: "2 hours ago",
    read: false,
    from: "Admin Team",
  },
  {
    id: 2,
    subject: "Re: Team Formation Query",
    message: "Teams can have a maximum of 5 members. You can invite more members through the Teams page.",
    time: "1 day ago",
    read: true,
    from: "Admin Team",
  },
  {
    id: 3,
    subject: "New External Competition Posted",
    message: "A new external competition 'International AI Symposium 2024' has been posted. Check it out in the Competitions tab!",
    time: "2 days ago",
    read: true,
    from: "AcademiX System",
  },
];

export default function StudentDashboard() {
  const unreadMessages = mockAdminMessages.filter(m => !m.read).length;
  const [userName, setUserName] = useState(
    typeof window !== "undefined" ? (localStorage.getItem("userName") || "Student") : "Student"
  );
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
    if (!token) return;
    fetch("http://localhost:8081/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.fullName) {
          setUserName(data.fullName);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AppLayout role="student">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              You have 2 upcoming deadlines this week. Keep up the great work!
            </p>
          </div>
          <Link to="/competitions">
            <Button className="gap-2">
              <Trophy className="w-4 h-4" />
              Browse Competitions
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Competitions & Teams */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Competitions */}
            <section className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Active Competitions</h2>
                <Link to="/competitions" className="text-sm text-secondary hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockCompetitions.slice(0, 2).map((comp) => (
                  <CompetitionCard key={comp.id} competition={comp} />
                ))}
              </div>
            </section>

            {/* Upcoming Deadlines */}
            <section className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Upcoming Deadlines</h2>
              </div>
              <div className="space-y-1">
                {mockCompetitions.map((comp) => (
                  <CompetitionCard key={comp.id} competition={comp} compact />
                ))}
              </div>
            </section>

            {/* My Teams */}
            <section className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">My Teams</h2>
                <Link to="/teams" className="text-sm text-secondary hover:underline flex items-center gap-1">
                  Manage teams <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockTeams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Admin Messages */}
            <section className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-info" />
                  Admin Messages
                </h2>
                {unreadMessages > 0 && (
                  <span className="badge-status bg-info/10 text-info">{unreadMessages} new</span>
                )}
              </div>
              <div className="space-y-2">
                {mockAdminMessages.slice(0, 3).map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "p-3 rounded-lg transition-colors cursor-pointer",
                      !msg.read ? "bg-info/5 border border-info/20" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        !msg.read ? "bg-info/10" : "bg-muted"
                      )}>
                        <MessageSquare className={cn(
                          "w-4 h-4",
                          !msg.read ? "text-info" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm truncate",
                            !msg.read ? "font-medium text-foreground" : "text-muted-foreground"
                          )}>
                            {msg.subject}
                          </p>
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-info flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {msg.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{msg.from}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/contact">
                <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                  <Mail className="w-4 h-4" />
                  View All Messages
                </Button>
              </Link>
            </section>

            {/* Notifications */}
            <section className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-secondary" />
                  Notifications
                </h2>
                <span className="badge-status bg-secondary/10 text-secondary">2 new</span>
              </div>
              <div className="space-y-1">
                {mockNotifications.map((notif) => (
                  <NotificationItem key={notif.id} notification={notif} />
                ))}
              </div>
            </section>

            {/* Recent Achievements */}
            <section className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Medal className="w-5 h-5 text-achievement" />
                  Recent Achievements
                </h2>
              </div>
              <div className="space-y-1">
                {mockAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </section>

            {/* Leaderboard Preview */}
            <section className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Leaderboard
                </h2>
                <Link to="/leaderboard" className="text-sm text-secondary hover:underline">
                  Full board
                </Link>
              </div>
              <LeaderboardPreview leaders={mockLeaders} />
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
