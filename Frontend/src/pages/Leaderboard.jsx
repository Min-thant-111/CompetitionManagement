import { useState } from "react";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Heart, MessageSquare, Star, Target, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Merit Leaderboard - Based on verified academic achievements
const mockMeritLeaderboard = [
  { id: 1, rank: 1, name: "Emily Chen", department: "Computer Science", points: 2450, competitions: 8, wins: 5, trend: "up", change: 2 },
  { id: 2, rank: 2, name: "James Wilson", department: "Engineering", points: 2320, competitions: 7, wins: 4, trend: "up", change: 1 },
  { id: 3, rank: 3, name: "Sofia Rodriguez", department: "Data Science", points: 2180, competitions: 9, wins: 3, trend: "down", change: 1 },
  { id: 4, rank: 4, name: "John Doe", department: "Computer Science", points: 1950, competitions: 6, wins: 2, trend: "same", change: 0 },
  { id: 5, rank: 5, name: "Maria Garcia", department: "Mathematics", points: 1820, competitions: 5, wins: 2, trend: "up", change: 3 },
  { id: 6, rank: 6, name: "Alex Park", department: "Engineering", points: 1750, competitions: 6, wins: 1, trend: "down", change: 2 },
  { id: 7, rank: 7, name: "Lisa Kim", department: "Computer Science", points: 1680, competitions: 5, wins: 1, trend: "up", change: 1 },
  { id: 8, rank: 8, name: "Tom Brown", department: "Physics", points: 1620, competitions: 4, wins: 1, trend: "same", change: 0 },
];

// Social Leaderboard - Based on peer engagement (likes/comments from social feed)
const mockSocialLeaderboard = [
  { id: 1, rank: 1, name: "Alex Park", department: "Engineering", engagement: 3420, likes: 2100, comments: 1320, trend: "up", change: 3 },
  { id: 2, rank: 2, name: "Emily Chen", department: "Computer Science", engagement: 3180, likes: 2000, comments: 1180, trend: "same", change: 0 },
  { id: 3, rank: 3, name: "John Doe", department: "Computer Science", engagement: 2890, likes: 1800, comments: 1090, trend: "up", change: 2 },
  { id: 4, rank: 4, name: "Maria Garcia", department: "Mathematics", engagement: 2650, likes: 1700, comments: 950, trend: "up", change: 1 },
  { id: 5, rank: 5, name: "Sofia Rodriguez", department: "Data Science", engagement: 2480, likes: 1500, comments: 980, trend: "down", change: 2 },
  { id: 6, rank: 6, name: "Lisa Kim", department: "Computer Science", engagement: 2210, likes: 1400, comments: 810, trend: "up", change: 1 },
  { id: 7, rank: 7, name: "James Wilson", department: "Engineering", engagement: 1980, likes: 1200, comments: 780, trend: "down", change: 1 },
  { id: 8, rank: 8, name: "Tom Brown", department: "Physics", engagement: 1750, likes: 1100, comments: 650, trend: "same", change: 0 },
];

// Milestones - Threshold-based achievements, permanent badges, long-term progress
const mockMilestones = [
  { 
    id: 1, 
    title: "100 Points Club", 
    description: "Earned 100+ points from competitions",
    icon: Star,
    color: "bg-achievement text-achievement-foreground",
    unlocked: true,
    progress: 100,
    requirement: 100,
    earnedDate: "Jan 15, 2024"
  },
  { 
    id: 2, 
    title: "5 Competitions Completed", 
    description: "Successfully participated in 5 competitions",
    icon: Target,
    color: "bg-secondary text-secondary-foreground",
    unlocked: true,
    progress: 6,
    requirement: 5,
    earnedDate: "Feb 20, 2024"
  },
  { 
    id: 3, 
    title: "First Win", 
    description: "Won your first competition",
    icon: Trophy,
    color: "bg-success text-success-foreground",
    unlocked: true,
    progress: 2,
    requirement: 1,
    earnedDate: "Feb 28, 2024"
  },
  { 
    id: 4, 
    title: "Top Performer of Semester", 
    description: "Ranked in top 10 for an entire semester",
    icon: Medal,
    color: "bg-info text-info-foreground",
    unlocked: false,
    progress: 2,
    requirement: 4, // 4 months
    earnedDate: null
  },
  { 
    id: 5, 
    title: "500 Points Club", 
    description: "Earned 500+ points from competitions",
    icon: Star,
    color: "bg-achievement text-achievement-foreground",
    unlocked: true,
    progress: 1950,
    requirement: 500,
    earnedDate: "Mar 5, 2024"
  },
  { 
    id: 6, 
    title: "10 Competitions Completed", 
    description: "Successfully participated in 10 competitions",
    icon: Target,
    color: "bg-secondary text-secondary-foreground",
    unlocked: false,
    progress: 6,
    requirement: 10,
    earnedDate: null
  },
  { 
    id: 7, 
    title: "Team Champion", 
    description: "Won 3 team competitions",
    icon: Award,
    color: "bg-warning text-warning-foreground",
    unlocked: false,
    progress: 1,
    requirement: 3,
    earnedDate: null
  },
  { 
    id: 8, 
    title: "1000 Points Club", 
    description: "Earned 1000+ points from competitions",
    icon: Star,
    color: "bg-achievement text-achievement-foreground",
    unlocked: true,
    progress: 1950,
    requirement: 1000,
    earnedDate: "Mar 10, 2024"
  },
];

const timeFilters = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Semester", value: "semester" },
  { label: "All Time", value: "all" },
];

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  same: Minus,
};

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState("month");
  const [activeTab, setActiveTab] = useState("merit"); // merit, social, milestones
  
  const meritCurrentUser = mockMeritLeaderboard.find(u => u.name === "John Doe");
  const socialCurrentUser = mockSocialLeaderboard.find(u => u.name === "John Doe");

  return (
    <AppLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Leaderboards & Milestones
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your academic achievements and peer engagement
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("merit")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === "merit"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Trophy className="w-4 h-4" />
            Merit Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === "social"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className="w-4 h-4" />
            Social Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("milestones")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === "milestones"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Star className="w-4 h-4" />
            Milestones
          </button>
        </div>

        {activeTab === "merit" && (
          <>
            {/* Time Filters */}
            <div className="card-static p-4">
              <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTimeFilter(filter.value)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors",
                      timeFilter === filter.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Your Merit Rank Highlight */}
            {meritCurrentUser && (
              <div className="card-static p-5 bg-secondary/5 border-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center text-xl font-bold text-secondary">
                    #{meritCurrentUser.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">Your Merit Rank</p>
                    <p className="text-sm text-muted-foreground">
                      {meritCurrentUser.points} points • {meritCurrentUser.competitions} competitions • {meritCurrentUser.wins} wins
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-sm font-medium",
                      meritCurrentUser.trend === "up" ? "text-success" : 
                      meritCurrentUser.trend === "down" ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {meritCurrentUser.trend === "up" && <TrendingUp className="w-4 h-4" />}
                      {meritCurrentUser.trend === "down" && <TrendingDown className="w-4 h-4" />}
                      {meritCurrentUser.trend === "same" && <Minus className="w-4 h-4" />}
                      {meritCurrentUser.change > 0 ? `+${meritCurrentUser.change}` : meritCurrentUser.change === 0 ? "No change" : meritCurrentUser.change}
                    </span>
                    <p className="text-xs text-muted-foreground">vs last period</p>
                  </div>
                </div>
              </div>
            )}

            {/* Merit Info Banner */}
            <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex items-start gap-3">
              <Trophy className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Merit Leaderboard</p>
                <p className="text-sm text-muted-foreground">
                  Ranked by verified academic achievements from competitions. Points are awarded based on participation and placement in internal and external competitions.
                </p>
              </div>
            </div>

            {/* Merit Leaderboard Table */}
            <div className="card-static overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Department</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Competitions</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Wins</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockMeritLeaderboard.map((user, index) => {
                      const TrendIcon = trendIcons[user.trend];
                      const isCurrentUser = user.name === "John Doe";
                      
                      return (
                        <tr 
                          key={user.id}
                          className={cn(
                            "transition-colors hover:bg-muted/30",
                            isCurrentUser && "bg-secondary/5"
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                              index === 0 ? "bg-achievement text-achievement-foreground" :
                              index === 1 ? "bg-slate-300 text-slate-700" :
                              index === 2 ? "bg-amber-700 text-white" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {user.rank}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className={cn("font-medium", isCurrentUser && "text-secondary")}>
                                  {user.name}
                                  {isCurrentUser && <span className="ml-2 text-xs text-secondary">(You)</span>}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">{user.department}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold">{user.points.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-4 text-right hidden md:table-cell">
                            <span className="text-muted-foreground">{user.competitions}</span>
                          </td>
                          <td className="px-4 py-4 text-right hidden md:table-cell">
                            <span className="text-muted-foreground">{user.wins}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TrendIcon className={cn(
                                "w-4 h-4",
                                user.trend === "up" ? "text-success" :
                                user.trend === "down" ? "text-destructive" :
                                "text-muted-foreground"
                              )} />
                              {user.change !== 0 && (
                                <span className={cn(
                                  "text-xs font-medium",
                                  user.trend === "up" ? "text-success" :
                                  user.trend === "down" ? "text-destructive" :
                                  "text-muted-foreground"
                                )}>
                                  {user.trend === "up" ? "+" : ""}{user.change}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "social" && (
          <>
            {/* Time Filters */}
            <div className="card-static p-4">
              <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTimeFilter(filter.value)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors",
                      timeFilter === filter.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Your Social Rank Highlight */}
            {socialCurrentUser && (
              <div className="card-static p-5 bg-secondary/5 border-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center text-xl font-bold text-secondary">
                    #{socialCurrentUser.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">Your Social Rank</p>
                    <p className="text-sm text-muted-foreground">
                      {socialCurrentUser.engagement} engagement • {socialCurrentUser.likes} likes • {socialCurrentUser.comments} comments
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-sm font-medium",
                      socialCurrentUser.trend === "up" ? "text-success" : 
                      socialCurrentUser.trend === "down" ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {socialCurrentUser.trend === "up" && <TrendingUp className="w-4 h-4" />}
                      {socialCurrentUser.trend === "down" && <TrendingDown className="w-4 h-4" />}
                      {socialCurrentUser.trend === "same" && <Minus className="w-4 h-4" />}
                      {socialCurrentUser.change > 0 ? `+${socialCurrentUser.change}` : socialCurrentUser.change === 0 ? "No change" : socialCurrentUser.change}
                    </span>
                    <p className="text-xs text-muted-foreground">vs last period</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Info Banner */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 flex items-start gap-3">
              <Heart className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Social Leaderboard</p>
                <p className="text-sm text-muted-foreground">
                  Ranked by peer engagement from the social feed. Engagement score is calculated from total likes and comments received on achievement posts.
                </p>
              </div>
            </div>

            {/* Social Leaderboard Table */}
            <div className="card-static overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Department</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Engagement</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Likes</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Comments</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockSocialLeaderboard.map((user, index) => {
                      const TrendIcon = trendIcons[user.trend];
                      const isCurrentUser = user.name === "John Doe";
                      
                      return (
                        <tr 
                          key={user.id}
                          className={cn(
                            "transition-colors hover:bg-muted/30",
                            isCurrentUser && "bg-secondary/5"
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                              index === 0 ? "bg-secondary text-secondary-foreground" :
                              index === 1 ? "bg-secondary/70 text-secondary-foreground" :
                              index === 2 ? "bg-secondary/50 text-secondary-foreground" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {user.rank}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className={cn("font-medium", isCurrentUser && "text-secondary")}>
                                  {user.name}
                                  {isCurrentUser && <span className="ml-2 text-xs text-secondary">(You)</span>}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">{user.department}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold">{user.engagement.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-4 text-right hidden md:table-cell">
                            <span className="text-muted-foreground flex items-center justify-end gap-1">
                              <Heart className="w-3 h-3" />
                              {user.likes.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right hidden md:table-cell">
                            <span className="text-muted-foreground flex items-center justify-end gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {user.comments.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TrendIcon className={cn(
                                "w-4 h-4",
                                user.trend === "up" ? "text-success" :
                                user.trend === "down" ? "text-destructive" :
                                "text-muted-foreground"
                              )} />
                              {user.change !== 0 && (
                                <span className={cn(
                                  "text-xs font-medium",
                                  user.trend === "up" ? "text-success" :
                                  user.trend === "down" ? "text-destructive" :
                                  "text-muted-foreground"
                                )}>
                                  {user.trend === "up" ? "+" : ""}{user.change}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "milestones" && (
          <>
            {/* Milestones Info Banner */}
            <div className="bg-achievement/10 border border-achievement/20 rounded-lg p-4 flex items-start gap-3">
              <Star className="w-5 h-5 text-achievement flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Your Milestones</p>
                <p className="text-sm text-muted-foreground">
                  Milestones are threshold-based achievements for long-term recognition. Unlike leaderboards, these are permanent badges that track your overall progress.
                </p>
              </div>
            </div>

            {/* Milestone Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card-static p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{mockMilestones.filter(m => m.unlocked).length}</p>
                <p className="text-sm text-muted-foreground">Unlocked</p>
              </div>
              <div className="card-static p-4 text-center">
                <p className="text-2xl font-bold text-muted-foreground">{mockMilestones.filter(m => !m.unlocked).length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="card-static p-4 text-center">
                <p className="text-2xl font-bold text-secondary">1,950</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
              <div className="card-static p-4 text-center">
                <p className="text-2xl font-bold text-achievement">6</p>
                <p className="text-sm text-muted-foreground">Competitions</p>
              </div>
            </div>

            {/* Unlocked Milestones */}
            <section>
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Unlocked Milestones
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockMilestones.filter(m => m.unlocked).map((milestone) => {
                  const Icon = milestone.icon;
                  return (
                    <div 
                      key={milestone.id} 
                      className="card-static p-4 flex items-start gap-4 border-l-4 border-success"
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", milestone.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        <p className="text-xs text-success mt-2">
                          ✓ Earned on {milestone.earnedDate}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* In Progress Milestones */}
            <section>
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-warning" />
                In Progress
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockMilestones.filter(m => !m.unlocked).map((milestone) => {
                  const Icon = milestone.icon;
                  const progressPercent = Math.min((milestone.progress / milestone.requirement) * 100, 100);
                  return (
                    <div 
                      key={milestone.id} 
                      className="card-static p-4 flex items-start gap-4 border-l-4 border-warning/50"
                    >
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{milestone.progress} / {milestone.requirement}</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-warning rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Top 3 Cards for Mobile */}
        {activeTab !== "milestones" && (
          <div className="grid grid-cols-3 gap-3 lg:hidden">
            {(activeTab === "merit" ? mockMeritLeaderboard : mockSocialLeaderboard).slice(0, 3).map((user, index) => (
              <div 
                key={user.id}
                className={cn(
                  "card-static p-4 text-center",
                  index === 0 && (activeTab === "merit" ? "ring-2 ring-achievement" : "ring-2 ring-secondary")
                )}
              >
                <div className={cn(
                  "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2",
                  activeTab === "merit" 
                    ? (index === 0 ? "bg-achievement text-achievement-foreground" :
                       index === 1 ? "bg-slate-300 text-slate-700" :
                       "bg-amber-700 text-white")
                    : (index === 0 ? "bg-secondary text-secondary-foreground" :
                       index === 1 ? "bg-secondary/70 text-secondary-foreground" :
                       "bg-secondary/50 text-secondary-foreground")
                )}>
                  {index === 0 ? <Trophy className="w-6 h-6" /> :
                   index === 1 ? <Medal className="w-6 h-6" /> :
                   <Award className="w-6 h-6" />}
                </div>
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {activeTab === "merit" ? `${user.points} pts` : `${user.engagement} eng`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}