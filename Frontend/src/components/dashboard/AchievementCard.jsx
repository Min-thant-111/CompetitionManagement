import { Trophy, Medal, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const rankIcons = {
  gold: Trophy,
  silver: Medal,
  bronze: Award,
  participation: Star,
};

const rankStyles = {
  gold: "bg-achievement/10 text-achievement",
  silver: "bg-slate-300/20 text-slate-500",
  bronze: "bg-amber-700/10 text-amber-700",
  participation: "bg-info/10 text-info",
};

export function AchievementCard({ achievement }) {
  const { title, competition, date, rank } = achievement;
  const Icon = rankIcons[rank] || Star;

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", rankStyles[rank])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{competition}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
    </div>
  );
}
