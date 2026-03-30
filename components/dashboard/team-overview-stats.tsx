import { StatCard } from "@/components/stats/stat-card";
import type { TeamOverviewStat } from "@/lib/teamDashboardMetrics";

export function TeamOverviewStats({ stats }: { stats: TeamOverviewStat[] }) {
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
