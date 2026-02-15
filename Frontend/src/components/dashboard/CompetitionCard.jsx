import { Calendar, Users, Clock, ChevronRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusStyles = {
  open: "bg-success/10 text-success",
  upcoming: "bg-info/10 text-info",
  closed: "bg-muted text-muted-foreground",
};

const statusLabels = {
  open: "Open",
  upcoming: "Upcoming",
  closed: "Closed",
};

export function CompetitionCard({ competition, compact = false }) {
  const { id, title, category, deadline, participants, status, type } = competition;

  if (compact) {
    return (
      <Link 
        to={`/competitions/${id}`}
        state={{ competition }}
        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-secondary">
              {title.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("badge-status", statusStyles[status])}>
            {statusLabels[status]}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  return (
    <div className="card-elevated p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <span className={cn("badge-status", statusStyles[status])}>
          {statusLabels[status]}
        </span>
        <span className="text-xs text-muted-foreground capitalize">{type}</span>
      </div>
      
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{category}</p>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{deadline}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{participants}</span>
        </div>
      </div>
      
      <Link to={`/competitions/${id}`} state={{ competition }}>
        <Button className="mt-4 w-full gap-2" size="sm">
          <Eye className="w-4 h-4" />
          View Details
        </Button>
      </Link>
    </div>
  );
}
