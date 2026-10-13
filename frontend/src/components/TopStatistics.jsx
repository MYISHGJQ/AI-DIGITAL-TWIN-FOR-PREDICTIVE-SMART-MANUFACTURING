import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function TopStatistics({ summary, averageHealth }) {
  const total = summary?.total || 10;
  const healthy = summary?.healthy ?? 0;
  const warning = summary?.warning ?? 0;
  const critical = summary?.critical ?? 0;
  const avgHealth = averageHealth ?? 85;

  const healthyPercent = total > 0 ? Math.round((healthy / total) * 100) : 0;

  const cards = [
    {
      id: 'total',
      title: 'TOTAL MACHINES',
      value: total,
      description: 'All 10 Twins Active',
      trend: '100% nominal',
      trendUp: true,
      icon: Layers,
      colorClass: 'text-primary',
      iconBg: 'bg-primary/10 text-primary',
      borderClass: 'border-slate-200/90 dark:border-darkborder'
    },
    {
      id: 'healthy',
      title: 'HEALTHY',
      value: healthy,
      description: `${healthyPercent}% of factory`,
      trend: `${healthy}/${total} safe`,
      trendUp: true,
      icon: CheckCircle2,
      colorClass: 'text-success',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-success',
      borderClass: 'border-slate-200/90 dark:border-darkborder'
    },
    {
      id: 'warning',
      title: 'WARNING',
      value: warning,
      description: warning > 0 ? 'Advisory inspect' : 'Zero anomalies',
      trend: warning > 0 ? 'Needs check' : 'Nominal',
      trendUp: warning === 0,
      icon: AlertTriangle,
      colorClass: 'text-warning',
      iconBg: 'bg-amber-50 dark:bg-amber-950/30 text-warning',
      borderClass: 'border-slate-200/90 dark:border-darkborder'
    },
    {
      id: 'critical',
      title: 'CRITICAL',
      value: critical,
      description: critical > 0 ? 'Immediate action' : '0 shutdowns',
      trend: critical > 0 ? 'Halt advised' : 'Safe',
      trendUp: critical === 0,
      icon: AlertOctagon,
      colorClass: 'text-danger',
      iconBg: 'bg-red-50 dark:bg-red-950/30 text-danger',
      borderClass: critical > 0 ? 'border-red-300 dark:border-red-900/50' : 'border-slate-200/90 dark:border-darkborder'
    },
    {
      id: 'avg_health',
      title: 'AVERAGE HEALTH',
      value: `${avgHealth}%`,
      description: avgHealth >= 80 ? 'Optimal fleet' : 'Maintenance due',
      trend: avgHealth >= 80 ? 'Strong vitality' : 'Drift detected',
      trendUp: avgHealth >= 80,
      icon: Activity,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
      borderClass: 'border-slate-200/90 dark:border-darkborder'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`
              bg-white dark:bg-slate-900 ${card.borderClass} border rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all duration-200
              flex flex-col justify-between text-left
            `}
          >
            {/* Header: Title & Small Icon */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase font-mono">
                {card.title}
              </span>
              <div className={`h-7 w-7 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={14} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Value Number */}
            <div className="my-1">
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.colorClass}`}>
                {card.value}
              </span>
            </div>

            {/* Subtitle & Trend */}
            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
              <span className="truncate font-medium">{card.description}</span>
              <span className={`text-[10px] font-semibold flex items-center shrink-0 ${card.trendUp ? 'text-success' : 'text-danger'}`}>
                {card.trendUp ? <TrendingUp size={11} className="mr-0.5" /> : <TrendingDown size={11} className="mr-0.5" />}
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
