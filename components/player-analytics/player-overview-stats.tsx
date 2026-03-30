import { StatCard } from "@/components/stats/stat-card";
import type { OverviewStat } from "@/lib/playerAnalytics";

export function PlayerOverviewStats({ stats }: { stats: OverviewStat[] }) {
  return (
    <div className="card-grid">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
        />
      ))}
    </div>
  );
}
