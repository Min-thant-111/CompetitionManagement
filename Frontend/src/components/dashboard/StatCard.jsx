import { cn } from "@/lib/utils";

export function StatCard({ icon: Icon, label, value, trend, trendUp, className }) {
  return (
    <div className={cn("card-static p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trendUp
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trendUp ? "+" : ""}{trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
