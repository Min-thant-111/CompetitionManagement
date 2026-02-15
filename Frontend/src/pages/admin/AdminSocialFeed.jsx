import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Trophy, Medal, Star, Heart, MessageCircle, Sparkles, Bot, Eye, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockPosts = [
  { id: 1, author: "AcademiX System", avatar: "🏆", content: "🏆 Emily Chen won 1st place in AI Innovation Challenge 2024!", achievement: { title: "1st Place", competition: "AI Innovation Challenge 2024", rank: "Gold", winner: "Emily Chen" }, likes: 156, comments: [{ id: 1, author: "James Wilson", text: "Amazing! 🎉", time: "1h ago" }], time: "2 hours ago" },
  { id: 2, author: "AcademiX System", avatar: "👥", content: "👥 Team CodeCrafters secured Runner-up in Web Development Hackathon!", achievement: { title: "2nd Place", competition: "Web Dev Hackathon 2024", rank: "Silver", winner: "Team CodeCrafters" }, likes: 89, comments: [], time: "5 hours ago" },
];

const achievementLeaders = [
  { id: 1, name: "Emily Chen", score: 2450 },
  { id: 2, name: "James Wilson", score: 2320 },
  { id: 3, name: "Sofia Rodriguez", score: 2180 },
];

function SystemPost({ post }) {
  const [showComments, setShowComments] = useState(false);
  const rankColors = { Gold: "bg-achievement text-achievement-foreground", Silver: "bg-slate-300 text-slate-700", Participant: "bg-info/10 text-info" };

  return (
    <div className="card-static p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">{post.avatar}</div>
        <div><div className="flex items-center gap-2"><span className="font-semibold text-sm">{post.author}</span><span className="badge-status bg-primary/10 text-primary text-xs flex items-center gap-1"><Bot className="w-3 h-3" />System</span></div><span className="text-xs text-muted-foreground">{post.time}</span></div>
      </div>
      <p className="text-sm mb-4">{post.content}</p>
      {post.achievement && <div className="bg-muted/50 rounded-lg p-4 mb-4 flex items-center gap-3"><div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", rankColors[post.achievement.rank])}><Trophy className="w-6 h-6" /></div><div><p className="font-semibold text-sm">{post.achievement.winner}</p><p className="text-xs text-muted-foreground">{post.achievement.title}</p></div></div>}
      <div className="flex items-center gap-4 pt-3 border-t border-border"><div className="flex items-center gap-1.5 text-muted-foreground"><Heart className="w-4 h-4" /><span className="text-xs">{post.likes}</span></div><Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}><MessageCircle className="w-4 h-4" /><span className="text-xs ml-1">{post.comments.length}</span></Button></div>
      {showComments && <div className="mt-4 pt-4 border-t space-y-2">{post.comments.map(c => <div key={c.id} className="bg-muted/50 rounded-lg p-3 text-sm"><strong>{c.author}:</strong> {c.text}</div>)}<div className="p-3 bg-muted/30 border rounded text-center text-xs text-muted-foreground"><Eye className="w-3 h-3 inline mr-1" />Read-only view</div></div>}
    </div>
  );
}

export default function AdminSocialFeed() {
  return (
    <AppLayout role="admin">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between"><div><h1 className="text-2xl lg:text-3xl font-display font-bold">Achievement Feed</h1><p className="text-sm text-muted-foreground mt-1">View student achievements (Read-only)</p></div><Link to="/admin/social-moderation"><Button variant="outline" className="gap-2"><Shield className="w-4 h-4" />Moderation</Button></Link></div>
            <div className="bg-info/5 border border-info/20 rounded-lg p-3 flex items-center gap-2 text-sm"><Eye className="w-4 h-4 text-info" /><span className="text-muted-foreground">Posts are system-generated when proofs are approved. Use Moderation for content management.</span></div>
            <div className="space-y-4">{mockPosts.map(post => <SystemPost key={post.id} post={post} />)}</div>
          </div>
          <div className="card-static p-5">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-secondary" />Leaderboard</h2>
            <div className="space-y-2">{achievementLeaders.map((l, i) => <div key={l.id} className={cn("flex items-center gap-3 p-3 rounded-lg", i === 0 ? "bg-achievement/5" : "hover:bg-muted/50")}><div className={cn("w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs", i === 0 ? "bg-achievement text-achievement-foreground" : i === 1 ? "bg-slate-300 text-slate-700" : "bg-muted")}>{i + 1}</div><div className="flex-1"><p className="font-medium text-sm">{l.name}</p><p className="text-xs text-muted-foreground">{l.score} points</p></div></div>)}</div>
            <Link to="/admin/leaderboard"><Button variant="outline" size="sm" className="w-full mt-4">View Full Leaderboard</Button></Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}