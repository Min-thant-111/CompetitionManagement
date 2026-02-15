import { useState } from "react";
import { 
  Trophy, Medal, Star, TrendingUp, Filter, Search,
  Award, Heart, MessageSquare, Calendar
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const mockMeritLeaderboard = [
  { rank: 1, name: "Emily Chen", avatar: "EC", points: 2450, achievements: 12, trend: "up", change: 2 },
  { rank: 2, name: "James Wilson", avatar: "JW", points: 2180, achievements: 10, trend: "same", change: 0 },
  { rank: 3, name: "Sofia Rodriguez", avatar: "SR", points: 1950, achievements: 9, trend: "up", change: 1 },
  { rank: 4, name: "Alex Park", avatar: "AP", points: 1820, achievements: 8, trend: "down", change: -1 },
  { rank: 5, name: "Maria Santos", avatar: "MS", points: 1650, achievements: 7, trend: "up", change: 3 },
  { rank: 6, name: "David Kim", avatar: "DK", points: 1520, achievements: 6, trend: "same", change: 0 },
  { rank: 7, name: "Lisa Wang", avatar: "LW", points: 1480, achievements: 6, trend: "down", change: -2 },
  { rank: 8, name: "Michael Brown", avatar: "MB", points: 1350, achievements: 5, trend: "up", change: 1 },
  { rank: 9, name: "Sarah Lee", avatar: "SL", points: 1280, achievements: 5, trend: "same", change: 0 },
  { rank: 10, name: "Chris Taylor", avatar: "CT", points: 1150, achievements: 4, trend: "up", change: 2 },
];

const mockSocialLeaderboard = [
  { rank: 1, name: "Alex Park", avatar: "AP", likes: 856, comments: 234, posts: 45 },
  { rank: 2, name: "Emily Chen", avatar: "EC", likes: 742, comments: 189, posts: 38 },
  { rank: 3, name: "James Wilson", avatar: "JW", likes: 623, comments: 156, posts: 32 },
  { rank: 4, name: "Sofia Rodriguez", avatar: "SR", likes: 518, comments: 142, posts: 28 },
  { rank: 5, name: "Maria Santos", avatar: "MS", likes: 467, comments: 128, posts: 25 },
  { rank: 6, name: "David Kim", avatar: "DK", likes: 398, comments: 98, posts: 22 },
  { rank: 7, name: "Lisa Wang", avatar: "LW", likes: 356, comments: 87, posts: 20 },
  { rank: 8, name: "Michael Brown", avatar: "MB", likes: 312, comments: 76, posts: 18 },
  { rank: 9, name: "Sarah Lee", avatar: "SL", likes: 287, comments: 65, posts: 15 },
  { rank: 10, name: "Chris Taylor", avatar: "CT", likes: 245, comments: 54, posts: 12 },
];

const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return "bg-achievement/20 text-achievement border-achievement/30";
    case 2:
      return "bg-secondary/20 text-secondary border-secondary/30";
    case 3:
      return "bg-info/20 text-info border-info/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5" />;
    case 2:
      return <Medal className="w-5 h-5" />;
    case 3:
      return <Award className="w-5 h-5" />;
    default:
      return <span className="font-bold">{rank}</span>;
  }
};

export default function AdminLeaderboard() {
  const [activeTab, setActiveTab] = useState("merit");
  const [searchQuery, setSearchQuery] = useState("");
  const [timePeriod, setTimePeriod] = useState("all");
  const [competitionType, setCompetitionType] = useState("all");

  const currentLeaderboard = activeTab === "merit" ? mockMeritLeaderboard : mockSocialLeaderboard;
  
  const filteredLeaderboard = currentLeaderboard.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Leaderboards
            </h1>
            <p className="text-muted-foreground mt-1">
              View merit-based achievements and social engagement rankings (Read-only)
            </p>
          </div>
        </div>

        {/* Tab Switch */}
        <div className="flex rounded-lg border border-border overflow-hidden w-fit">
          <button
            onClick={() => setActiveTab("merit")}
            className={cn(
              "px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === "merit"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <Trophy className="w-4 h-4" />
            Merit Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={cn(
              "px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === "social"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <Heart className="w-4 h-4" />
            Social Leaderboard
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full sm:w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
            </SelectContent>
          </Select>
          {activeTab === "merit" && (
            <Select value={competitionType} onValueChange={setCompetitionType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Competition Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-lg bg-info/5 border border-info/20">
          <p className="text-sm text-info">
            <strong>Admin View:</strong> This is a read-only view of the leaderboards. 
            {activeTab === "merit" 
              ? " Merit points are calculated based on verified achievements from competitions."
              : " Social scores reflect peer engagement (likes/comments) with no academic impact."
            }
          </p>
        </div>

        {/* Leaderboard */}
        <div className="card-static overflow-hidden">
          {/* Top 3 Showcase */}
          <div className="p-6 bg-gradient-to-b from-muted/50 to-transparent">
            <div className="grid grid-cols-3 gap-4">
              {filteredLeaderboard.slice(0, 3).map((entry, index) => {
                const positions = [1, 0, 2]; // Display order: 2nd, 1st, 3rd
                const actualIndex = positions[index];
                const item = filteredLeaderboard[actualIndex];
                if (!item) return null;
                
                return (
                  <div 
                    key={item.rank}
                    className={cn(
                      "text-center p-4 rounded-lg border transition-all",
                      getRankStyle(item.rank),
                      actualIndex === 0 && "transform scale-105"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3",
                      getRankStyle(item.rank)
                    )}>
                      {getRankIcon(item.rank)}
                    </div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-2xl font-bold mt-1">
                      {activeTab === "merit" ? item.points : item.likes}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeTab === "merit" ? "points" : "total likes"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full List */}
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-16">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  {activeTab === "merit" ? (
                    <>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Points</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Achievements</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Trend</th>
                    </>
                  ) : (
                    <>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Likes</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Comments</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Posts</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((entry) => (
                  <tr key={entry.rank} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                        getRankStyle(entry.rank)
                      )}>
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-semibold">
                          {entry.avatar}
                        </div>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                    </td>
                    {activeTab === "merit" ? (
                      <>
                        <td className="py-3 px-4 text-center font-semibold text-secondary">
                          {entry.points}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="badge-status bg-achievement/10 text-achievement">
                            {entry.achievements}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className={cn(
                            "inline-flex items-center gap-1 text-sm",
                            entry.trend === "up" && "text-success",
                            entry.trend === "down" && "text-destructive",
                            entry.trend === "same" && "text-muted-foreground"
                          )}>
                            {entry.trend === "up" && <TrendingUp className="w-4 h-4" />}
                            {entry.trend === "down" && <TrendingUp className="w-4 h-4 rotate-180" />}
                            {entry.trend === "same" && <span>—</span>}
                            {entry.change !== 0 && (
                              <span>{entry.change > 0 ? `+${entry.change}` : entry.change}</span>
                            )}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 text-sm">
                            <Heart className="w-4 h-4 text-destructive" />
                            {entry.likes}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 text-sm">
                            <MessageSquare className="w-4 h-4 text-secondary" />
                            {entry.comments}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="badge-status bg-info/10 text-info">
                            {entry.posts}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLeaderboard.length === 0 && (
          <div className="card-static p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No students found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
