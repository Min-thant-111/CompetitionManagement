import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, Filter, Trophy, Medal, Star, Award,
  Heart, MessageCircle, Share2, Sparkles, Bot, Eye
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// System-generated posts only - same as student view
const mockPosts = [
  {
    id: 1,
    isSystem: true,
    author: "AcademiX System",
    avatar: "🏆",
    content: "🏆 Emily Chen won 1st place in AI Innovation Challenge 2024! Congratulations on this outstanding achievement!",
    achievement: {
      title: "1st Place - AI Innovation Challenge",
      competition: "AI Innovation Challenge 2024",
      rank: "Gold",
      winner: "Emily Chen",
    },
    likes: 156,
    comments: [
      { id: 1, author: "James Wilson", text: "Amazing work Emily! 🎉", time: "1 hour ago" },
      { id: 2, author: "Sofia Rodriguez", text: "Well deserved! Your AI model was incredible.", time: "1 hour ago" },
      { id: 3, author: "Alex Park", text: "Congratulations! 👏", time: "2 hours ago" },
    ],
    time: "2 hours ago",
    userLiked: false,
  },
  {
    id: 2,
    isSystem: true,
    author: "AcademiX System",
    avatar: "👥",
    content: "👥 Team CodeCrafters secured Runner-up position in Web Development Hackathon! Amazing teamwork by James, Sofia, and Alex.",
    achievement: {
      title: "2nd Place - Web Development Hackathon",
      competition: "Web Dev Hackathon 2024",
      rank: "Silver",
      winner: "Team CodeCrafters",
    },
    likes: 89,
    comments: [
      { id: 1, author: "Emily Chen", text: "Great job team! 🚀", time: "4 hours ago" },
      { id: 2, author: "Bob Johnson", text: "Your project was really impressive!", time: "5 hours ago" },
    ],
    time: "5 hours ago",
    userLiked: false,
  },
  {
    id: 3,
    isSystem: true,
    author: "AcademiX System",
    avatar: "🎖️",
    content: "🎖️ Bob participated in International Math Olympiad representing our university. Great effort and valuable experience!",
    achievement: {
      title: "Participation",
      competition: "International Math Olympiad 2024",
      rank: "Participant",
      winner: "Bob Johnson",
    },
    likes: 67,
    comments: [
      { id: 1, author: "Maria Garcia", text: "Proud of you Bob! Representing us well!", time: "12 hours ago" },
    ],
    time: "1 day ago",
    userLiked: false,
  },
  {
    id: 4,
    isSystem: true,
    author: "AcademiX System",
    avatar: "🏆",
    content: "🏆 Sofia Rodriguez won 2nd place in National Coding Championship among 500+ participants! Incredible achievement!",
    achievement: {
      title: "2nd Place - National Coding Championship",
      competition: "NCC 2024",
      rank: "Silver",
      winner: "Sofia Rodriguez",
    },
    likes: 234,
    comments: [
      { id: 1, author: "James Wilson", text: "Sofia you're a coding legend! 💪", time: "20 hours ago" },
      { id: 2, author: "Emily Chen", text: "500+ participants and you came 2nd! Incredible!", time: "22 hours ago" },
      { id: 3, author: "Tom Brown", text: "Congrats Sofia! 🎊", time: "1 day ago" },
    ],
    time: "1 day ago",
    userLiked: false,
  },
];

// Achievement leaders
const achievementLeaders = [
  { id: 1, name: "Emily Chen", score: 2450, badges: 12, rank: 1 },
  { id: 2, name: "James Wilson", score: 2320, badges: 10, rank: 2 },
  { id: 3, name: "Sofia Rodriguez", score: 2180, badges: 11, rank: 3 },
  { id: 4, name: "John Doe", score: 1950, badges: 8, rank: 4 },
  { id: 5, name: "Maria Garcia", score: 1820, badges: 7, rank: 5 },
];

// Engagement leaders
const engagementLeaders = [
  { id: 1, name: "Alex Park", likes: 2100, comments: 1320, rank: 1 },
  { id: 2, name: "Emily Chen", likes: 2000, comments: 1180, rank: 2 },
  { id: 3, name: "John Doe", likes: 1800, comments: 1090, rank: 3 },
  { id: 4, name: "Maria Garcia", likes: 1700, comments: 950, rank: 4 },
  { id: 5, name: "Sofia Rodriguez", likes: 1500, comments: 980, rank: 5 },
];

const filters = [
  { label: "All", value: "all" },
  { label: "Winners", value: "winners" },
  { label: "Participants", value: "participants" },
];

const timeFilters = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

function SystemPost({ post }) {
  const [showComments, setShowComments] = useState(false);

  const rankColors = {
    Gold: "bg-achievement text-achievement-foreground",
    Silver: "bg-slate-300 text-slate-700",
    Bronze: "bg-amber-600 text-white",
    Participant: "bg-info/10 text-info",
  };

  const commentsCount = Array.isArray(post.comments) ? post.comments.length : post.comments;

  return (
    <div className="card-static p-5">
      {/* System Post Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
          {post.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{post.author}</span>
            <span className="badge-status bg-primary/10 text-primary text-xs flex items-center gap-1">
              <Bot className="w-3 h-3" />
              System
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{post.time}</span>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-sm text-foreground mb-4">{post.content}</p>

      {/* Achievement Card */}
      {post.achievement && (
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              rankColors[post.achievement.rank] || "bg-muted"
            )}>
              {post.achievement.rank === "Gold" && <Trophy className="w-6 h-6" />}
              {post.achievement.rank === "Silver" && <Medal className="w-6 h-6" />}
              {post.achievement.rank === "Bronze" && <Medal className="w-6 h-6" />}
              {post.achievement.rank === "Participant" && <Star className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-semibold text-sm">{post.achievement.winner}</p>
              <p className="text-xs text-muted-foreground">{post.achievement.title}</p>
              <p className="text-xs text-muted-foreground">{post.achievement.competition}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Teachers can only view, not interact */}
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span className="text-xs">{post.likes}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{commentsCount}</span>
        </Button>
      </div>

      {/* Comments Section - Read Only */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {/* Existing Comments */}
          {Array.isArray(post.comments) && post.comments.length > 0 && (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Read-only notice */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" />
              Teachers can view comments but cannot post replies
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherSocialFeed() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeLeaderboard, setActiveLeaderboard] = useState("achievements");
  const [timeFilter, setTimeFilter] = useState("month");
  const [posts] = useState(mockPosts);

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "winners") return post.achievement?.rank !== "Participant";
    if (activeFilter === "participants") return post.achievement?.rank === "Participant";
    return true;
  });

  return (
    <AppLayout role="teacher">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                  Achievement Feed
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  View student achievements and celebrations (Read-only)
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-info/5 border border-info/20 rounded-lg p-3 flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-info" />
              <span className="text-muted-foreground">
                This is a read-only view. Posts are automatically generated when students win competitions or participate in external events.
              </span>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <SystemPost key={post.id} post={post} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="card-static p-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No achievements to display yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar - Leaderboards */}
          <div className="space-y-6">
            {/* Leaderboard Card */}
            <div className="card-static p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Leaderboard
                </h2>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="text-xs px-2 py-1 rounded-md border border-border bg-card focus:outline-none"
                >
                  {timeFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leaderboard Tabs */}
              <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setActiveLeaderboard("achievements")}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeLeaderboard === "achievements"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Trophy className="w-3 h-3 inline mr-1" />
                  Achievements
                </button>
                <button
                  onClick={() => setActiveLeaderboard("engagement")}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeLeaderboard === "engagement"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Engagement
                </button>
              </div>

              {/* Leaderboard List */}
              <div className="space-y-2">
                {(activeLeaderboard === "achievements" ? achievementLeaders : engagementLeaders).map((leader, index) => (
                  <div
                    key={leader.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      index === 0 ? "bg-achievement/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs",
                        index === 0
                          ? "bg-achievement text-achievement-foreground"
                          : index === 1
                          ? "bg-slate-300 text-slate-700"
                          : index === 2
                          ? "bg-amber-700 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-medium">
                      {leader.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {leader.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeLeaderboard === "achievements"
                          ? `${leader.score} points`
                          : `${leader.likes} likes`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/teacher/leaderboard">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Full Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
