import { useState } from "react";
import { 
  MessageSquare, Trash2, EyeOff, AlertTriangle, Search,
  Filter, Eye, User, Clock, Heart, MoreVertical,
  Shield, CheckCircle2, Bot, Trophy, Medal, Star
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

const mockPosts = [
  {
    id: 1,
    type: "achievement",
    author: "AcademiX System",
    avatar: "🏆",
    content: "Congratulations to Emily Chen for securing 2nd place at the National Coding Championship! 🏆",
    achievement: {
      title: "2nd Place",
      competition: "National Coding Championship 2024",
      winner: "Emily Chen",
      rank: "Silver",
    },
    likes: 45,
    comments: [
      { id: 1, author: "James Wilson", content: "Congratulations Emily! Well deserved!", time: "2 hours ago", hidden: false },
      { id: 2, author: "Sofia Rodriguez", content: "Amazing achievement! 🎉", time: "1 hour ago", hidden: false },
    ],
    time: "3 hours ago",
    status: "published",
    reportCount: 0,
  },
  {
    id: 2,
    type: "achievement",
    author: "AcademiX System",
    avatar: "🏆",
    content: "Alex Park has successfully completed the AI Innovation Challenge. Remarkable effort!",
    achievement: {
      title: "Runner-up",
      competition: "AI Innovation Challenge",
      winner: "Alex Park",
      rank: "Bronze",
    },
    likes: 32,
    comments: [
      { id: 1, author: "Anonymous User", content: "This is a comment", time: "30 mins ago", hidden: false },
    ],
    time: "5 hours ago",
    status: "published",
    reportCount: 1,
  },
  {
    id: 3,
    type: "achievement",
    author: "AcademiX System",
    avatar: "🏆",
    content: "Maria Santos participated in the Tech Leadership Seminar. Keep learning!",
    achievement: {
      title: "Participation",
      competition: "Tech Leadership Seminar",
      winner: "Maria Santos",
      rank: "Participant",
    },
    likes: 18,
    comments: [],
    time: "1 day ago",
    status: "published",
    reportCount: 0,
  },
];

export default function AdminSocialModeration() {
  const [posts, setPosts] = useState(mockPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const hiddenCount = posts.filter(p => p.status === "hidden").length;

  const handleHidePost = (id) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, status: "hidden" } : post
    ));
    toast.success("Post hidden from public view");
  };

  const handleRestorePost = (id) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, status: "published", reportCount: 0 } : post
    ));
    toast.success("Post restored");
  };

  const handleDeletePost = (id) => {
    setPosts(prev => prev.filter(post => post.id !== id));
    toast.success("Post permanently deleted");
    setIsDetailOpen(false);
  };

  const handleDeleteComment = (postId, commentId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
        : post
    ));
    toast.success("Comment deleted");
  };

  const handleHideComment = (postId, commentId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: post.comments.map(c => 
              c.id === commentId ? { ...c, hidden: true } : c
            ) 
          }
        : post
    ));
    toast.success("Comment hidden from public view");
  };

  const handleRestoreComment = (postId, commentId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: post.comments.map(c => 
              c.id === commentId ? { ...c, hidden: false } : c
            ) 
          }
        : post
    ));
    toast.success("Comment restored");
  };



  return (
    <AppLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Social Feed Moderation
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and moderate social feed content and comments
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-lg bg-info/5 border border-info/20">
          <p className="text-sm text-info">
            <strong>Note:</strong> Social feed only contains system-generated achievement posts. 
            Students can like and comment, but cannot create posts. You can hide or delete inappropriate posts and comments.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-static p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{posts.length}</div>
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </div>
          <div className="card-static p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{hiddenCount}</div>
            <div className="text-sm text-muted-foreground">Hidden</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className={cn(
                "card-static p-5",
                post.status === "flagged" && "border-warning/30 bg-warning/5",
                post.status === "hidden" && "border-destructive/30 bg-destructive/5 opacity-75"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {post.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold">{post.author}</span>
                    <span className="badge-status bg-primary/10 text-primary text-xs flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      System
                    </span>
                    <span className="text-sm text-muted-foreground">{post.time}</span>
                    {post.status === "hidden" && (
                      <span className="badge-status bg-destructive/10 text-destructive">
                        Hidden
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground mb-3">{post.content}</p>

                  {post.achievement && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-3 inline-flex items-center gap-3">
                       <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        post.achievement.rank === "Gold" && "bg-yellow-100 text-yellow-600",
                        post.achievement.rank === "Silver" && "bg-slate-100 text-slate-600",
                        post.achievement.rank === "Bronze" && "bg-orange-100 text-orange-600",
                        post.achievement.rank === "Participant" && "bg-blue-100 text-blue-600"
                      )}>
                        {post.achievement.rank === "Gold" && <Trophy className="w-5 h-5" />}
                        {post.achievement.rank === "Silver" && <Medal className="w-5 h-5" />}
                        {post.achievement.rank === "Bronze" && <Medal className="w-5 h-5" />}
                        {post.achievement.rank === "Participant" && <Star className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{post.achievement.winner}</p>
                        <p className="text-xs text-muted-foreground">{post.achievement.title} • {post.achievement.competition}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments.length}
                    </div>
                  </div>

                  {/* Comments Preview */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Comments:</p>
                      {post.comments.slice(0, 3).map((comment) => (
                        <div 
                          key={comment.id}
                          className={cn(
                            "flex items-start justify-between p-2 rounded",
                            comment.hidden ? "bg-muted/50 opacity-60" : "bg-muted/30"
                          )}
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium">{comment.author}: </span>
                            <span className="text-sm text-muted-foreground">{comment.content}</span>
                            <div className="flex items-center gap-2 mt-1">
                              {comment.hidden && (
                                <span className="text-xs text-muted-foreground">(Hidden)</span>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {comment.hidden ? (
                                <DropdownMenuItem onClick={() => handleRestoreComment(post.id, comment.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Restore Comment
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleHideComment(post.id, comment.id)}>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Hide Comment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedPost(post);
                      setIsDetailOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {post.status !== "hidden" ? (
                        <DropdownMenuItem onClick={() => handleHidePost(post.id)}>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Post
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRestorePost(post.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Restore Post
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="card-static p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No posts found</p>
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post Details</DialogTitle>
              <DialogDescription>
                Review post content and manage comments
              </DialogDescription>
            </DialogHeader>

            {selectedPost && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {selectedPost.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="font-semibold">{selectedPost.author}</p>
                       <span className="badge-status bg-primary/10 text-primary text-xs flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        System
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPost.time}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <p>{selectedPost.content}</p>
                </div>

                {selectedPost.achievement && (
                  <div className="p-4 rounded-lg bg-achievement/5 border border-achievement/20">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        selectedPost.achievement.rank === "Gold" && "bg-yellow-100 text-yellow-600",
                        selectedPost.achievement.rank === "Silver" && "bg-slate-100 text-slate-600",
                        selectedPost.achievement.rank === "Bronze" && "bg-orange-100 text-orange-600",
                        selectedPost.achievement.rank === "Participant" && "bg-blue-100 text-blue-600"
                      )}>
                        {selectedPost.achievement.rank === "Gold" && <Trophy className="w-6 h-6" />}
                        {selectedPost.achievement.rank === "Silver" && <Medal className="w-6 h-6" />}
                        {selectedPost.achievement.rank === "Bronze" && <Medal className="w-6 h-6" />}
                        {selectedPost.achievement.rank === "Participant" && <Star className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedPost.achievement.winner}</p>
                        <p className="text-sm text-muted-foreground">{selectedPost.achievement.title} • {selectedPost.achievement.competition}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>{selectedPost.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{selectedPost.comments.length} comments</span>
                  </div>
                  </div>

                {selectedPost.comments.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">All Comments:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedPost.comments.map((comment) => (
                        <div 
                          key={comment.id}
                          className={cn(
                            "flex items-start justify-between p-3 rounded-lg",
                            comment.hidden ? "bg-muted/50 opacity-60" : "bg-muted/30"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{comment.time}</span>
                              {comment.hidden && (
                                <span className="badge-status bg-muted text-muted-foreground text-xs">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {comment.hidden ? (
                                <DropdownMenuItem onClick={() => handleRestoreComment(selectedPost.id, comment.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Restore Comment
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleHideComment(selectedPost.id, comment.id)}>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Hide Comment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {selectedPost.status !== "hidden" ? (
                    <Button 
                      variant="outline" 
                      onClick={() => handleHidePost(selectedPost.id)}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Post
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => handleRestorePost(selectedPost.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Restore Post
                    </Button>
                  )}
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeletePost(selectedPost.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
