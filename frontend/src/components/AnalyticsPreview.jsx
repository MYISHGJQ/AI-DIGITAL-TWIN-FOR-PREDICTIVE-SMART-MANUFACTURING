import React, { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Activity, 
  PieChart, 
  BellRing, 
  Clock
} from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

export default function AnalyticsPreview({ machines = [], onOpenMachine }) {
  // 1. Calculations for Status Distribution Donut Chart
  const distribution = useMemo(() => {
    const healthy = machines.filter(m => m.status === 'Healthy').length;
    const warning = machines.filter(m => m.status === 'Warning').length;
    const critical = machines.filter(m => m.status === 'Critical').length;
    return { healthy, warning, critical };
  }, [machines]);

  // Donut chart data
  const donutData = {
    labels: ['Healthy', 'Warning', 'Critical'],
    datasets: [
      {
        data: [distribution.healthy, distribution.warning, distribution.critical],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 3
      }
    ]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { size: 10, weight: 'bold' },
          color: '#64748B',
          padding: 8
        }
      },
      tooltip: {
        bodyFont: { size: 11 }
      }
    },
    cutout: '72%'
  };

  // 2. Average Fleet Health Trend Line Chart
  const avgHealthNow = useMemo(() => {
    if (machines.length === 0) return 92;
    return Math.round(machines.reduce((acc, m) => acc + (m.health_score || 90), 0) / machines.length);
  }, [machines]);

  // Historical cycle points leading to current avg
  const lineData = {
    labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 'Now'],
    datasets: [
      {
        label: 'Fleet Health %',
        data: [98.5, 96.2, 94.8, 93.1, 91.5, 92.4, avgHealthNow],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.2,
        pointRadius: 2.5,
        pointHoverRadius: 5
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 60,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { font: { size: 9 }, color: '#94A3B8', stepSize: 10 }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 9 }, color: '#94A3B8' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { size: 11 }
      }
    }
  };

  // 3. Dynamic Recent Alerts List
  const recentAlerts = useMemo(() => {
    const list = [];
    
    // Check for Critical machines
    const criticals = machines.filter(m => m.status === 'Critical');
    criticals.forEach((m, i) => {
      list.push({
        time: `10:${42 - i * 2} AM`,
        machineId: m.id,
        machineName: m.name,
        type: 'critical',
        message: `High failure probability detected (${m.failure_probability}%).`
      });
    });

    // Check for Tool Wear threshold
    const wornMachines = machines.filter(m => m.tool_wear >= 120 && m.status !== 'Critical');
    wornMachines.forEach((m, i) => {
      list.push({
        time: `10:${36 - i * 3} AM`,
        machineId: m.id,
        machineName: m.name,
        type: 'warning',
        message: `Tool wear approaching threshold (${m.tool_wear} min).`
      });
    });

    // Check for high temperature
    const hotMachines = machines.filter(m => m.air_temp >= 300 && !criticals.includes(m) && !wornMachines.includes(m));
    hotMachines.forEach((m, i) => {
      list.push({
        time: `10:${30 - i * 2} AM`,
        machineId: m.id,
        machineName: m.name,
        type: 'warning',
        message: `Temperature above normal range (${m.air_temp} K).`
      });
    });

    // Fallbacks if system is perfectly nominal
    if (list.length < 3) {
      list.push({
        time: '10:28 AM',
        machineId: 'D',
        machineName: 'Hydraulic Press D',
        type: 'info',
        message: 'Spindle pressure calibration completed successfully.'
      });
      list.push({
        time: '10:24 AM',
        machineId: 'A',
        machineName: 'CNC Milling Machine A',
        type: 'info',
        message: 'Nominal operational baseline sustained across 50 cycles.'
      });
    }

    return list.slice(0, 3);
  }, [machines]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
      
      {/* Visual A: Factory Health Trend */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-darkborder rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Activity size={15} className="stroke-[2.5]" />
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                Factory Health Trend
              </h4>
            </div>
            <span className="text-[10px] font-bold text-primary font-mono">
              Avg {avgHealthNow}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-3">
            Fleet vitality index over operating timeline
          </p>
        </div>

        <div className="h-[155px] w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Visual B: Machine Status Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-darkborder rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <PieChart size={15} className="stroke-[2.5]" />
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                Machine Status Distribution
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              {machines.length} Total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-2">
            Healthy vs Warning vs Critical fleet ratio
          </p>
        </div>

        <div className="h-[155px] w-full flex items-center justify-center relative">
          <Doughnut data={donutData} options={donutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {distribution.healthy}
            </span>
            <span className="text-[9px] font-bold uppercase text-slate-400">
              Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Visual C: Recent Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-darkborder rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                <BellRing size={15} className="stroke-[2.5]" />
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                Recent Alerts
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
              <Clock size={11} />
              Real-time
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mb-2">
            Chronological sensor & prediction activity log
          </p>
        </div>

        <div className="space-y-2 mt-1">
          {recentAlerts.map((alert, idx) => (
            <div 
              key={`alert-${alert.machineId}-${idx}`}
              onClick={() => onOpenMachine && onOpenMachine(alert.machineId)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-200 transition-colors flex items-start gap-2.5"
            >
              <div className="mt-0.5 shrink-0">
                {alert.type === 'critical' ? (
                  <span className="h-2 w-2 rounded-full bg-danger block animate-pulse" />
                ) : alert.type === 'warning' ? (
                  <span className="h-2 w-2 rounded-full bg-warning block" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 block" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    Machine {alert.machineId}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium font-mono">
                    {alert.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight truncate mt-0.5">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
