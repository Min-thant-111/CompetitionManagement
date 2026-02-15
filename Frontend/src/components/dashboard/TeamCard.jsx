import { Users, Crown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusStyles = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  complete: "bg-muted text-muted-foreground",
};

export function TeamCard({ team }) {
  const { id, name, competition, members, status, isLeader } = team;

  return (
    <Link 
      to="/teams"
      state={{ selectedTeamId: id }}
      className="block"
    >
      <div className="card-elevated p-4 hover:shadow-card-hover transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            {isLeader && (
              <Crown className="w-4 h-4 text-achievement" />
            )}
          </div>
          <span className={cn("badge-status text-xs", statusStyles[status])}>
            {status}
          </span>
        </div>
        
        <h4 className="font-semibold text-foreground mb-1">{name}</h4>
        <p className="text-sm text-muted-foreground mb-3">{competition}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member, index) => (
              <div
                key={index}
                className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium"
                title={member}
              >
                {member.charAt(0)}
              </div>
            ))}
            {members.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-accent border-2 border-card flex items-center justify-center text-xs font-medium text-accent-foreground">
                +{members.length - 4}
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
