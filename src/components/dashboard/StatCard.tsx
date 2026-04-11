import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

const StatCard = ({ title, value, change, changeType, icon: Icon }: StatCardProps) => {
  return (
    <div className="stat-card group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p
            className={cn(
              "text-sm font-medium mt-2",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </p>
        </div>
        <div className="w-12 h-12 bg-accent flex items-center justify-center group-hover:shadow-sharp transition-shadow">
          <Icon className="w-6 h-6 text-accent-foreground" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
