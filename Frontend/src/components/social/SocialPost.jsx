import { Heart, MessageCircle, Share2, Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SocialPost({ post }) {
  const { author, avatar, content, achievement, likes, comments, time, liked } = post;

  return (
    <div className="card-static p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-semibold">
          {avatar || author.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{author}</span>
            {achievement && (
              <span className="badge-status bg-achievement/10 text-achievement">
                <Trophy className="w-3 h-3 mr-1" />
                {achievement.rank}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>

      <p className="text-sm text-foreground mb-4">{content}</p>

      {achievement && (
        <div className="bg-muted/50 rounded-lg p-4 mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-achievement/10 flex items-center justify-center">
            <Award className="w-6 h-6 text-achievement" />
          </div>
          <div>
            <p className="font-semibold text-sm">{achievement.title}</p>
            <p className="text-xs text-muted-foreground">{achievement.competition}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <Button variant="ghost" size="sm" className={cn("gap-1.5", liked && "text-destructive")}>
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          <span className="text-xs">{likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{comments}</span>
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
