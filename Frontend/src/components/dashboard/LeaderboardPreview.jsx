import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  same: Minus,
};

export function LeaderboardPreview({ leaders }) {
  return (
    <div className="space-y-2">
      {leaders.map((leader, index) => {
        const TrendIcon = trendIcons[leader.trend] || Minus;
        return (
          <div
            key={leader.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors",
              index === 0 ? "bg-achievement/5" : "hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
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
            <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-medium">
              {leader.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {leader.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {leader.points} points
              </p>
            </div>
            <TrendIcon
              className={cn(
                "w-4 h-4",
                leader.trend === "up"
                  ? "text-success"
                  : leader.trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
