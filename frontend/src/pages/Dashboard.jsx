import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import TopStatistics from '../components/TopStatistics';
import FactoryLayoutSchematic from '../components/FactoryLayoutSchematic';
import AiDiagnosticPanel from '../components/AiDiagnosticPanel';
import AnalyticsPreview from '../components/AnalyticsPreview';

const SHORT_NAMES = {
  A: 'CNC Milling',
  B: 'Robotic Welder',
  C: 'Laser Cutter',
  D: 'Hydraulic Press',
  E: 'Injection Molding',
  F: 'Turning Lathe',
  G: 'Assembly Cell',
  H: 'Stamping Press',
  I: 'Surface Grinder',
  J: 'Inspection Cell'
};

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function getStatusStyle(status) {
  switch (status) {
    case 'Healthy':
      return 'bg-emerald-50 dark:bg-emerald-950/30 text-success border border-emerald-200 dark:border-emerald-800/40';
    case 'Warning':
      return 'bg-amber-50 dark:bg-amber-950/30 text-warning border border-amber-200 dark:border-amber-800/40';
    case 'Critical':
      return 'bg-red-50 dark:bg-red-950/30 text-danger border border-red-200 dark:border-red-800/40 animate-pulse';
    default:
      return 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200';
  }
}

export default function Dashboard({ data, onOpenMachine, searchQuery }) {
  // Single source of truth for all 10 virtual machines
  const machines = useMemo(() => {
    if (data?.machines && data.machines.length > 0) {
      return data.machines;
    }
    return [
      { id: 'A', name: 'CNC Milling Machine A', type: 'L', status: 'Healthy', health_score: 98.5, failure_probability: 1.5, air_temp: 298.2, process_temp: 308.6, rpm: 1450.0, torque: 42.1, tool_wear: 15.0 },
      { id: 'B', name: 'Robotic Arm Welder B', type: 'M', status: 'Healthy', health_score: 95.0, failure_probability: 5.0, air_temp: 298.5, process_temp: 308.9, rpm: 1500.0, torque: 38.5, tool_wear: 32.0 },
      { id: 'C', name: 'Laser Cutting System C', type: 'H', status: 'Healthy', health_score: 96.2, failure_probability: 3.8, air_temp: 298.1, process_temp: 308.4, rpm: 1550.0, torque: 35.2, tool_wear: 24.0 },
      { id: 'D', name: 'Hydraulic Press D', type: 'M', status: 'Healthy', health_score: 94.0, failure_probability: 6.0, air_temp: 298.8, process_temp: 309.1, rpm: 1480.0, torque: 46.5, tool_wear: 45.0 },
      { id: 'E', name: 'Injection Molding Unit E', type: 'L', status: 'Healthy', health_score: 99.0, failure_probability: 1.0, air_temp: 297.9, process_temp: 307.8, rpm: 1420.0, torque: 40.0, tool_wear: 10.0 },
      { id: 'F', name: 'CNC Turning Lathe F', type: 'H', status: 'Healthy', health_score: 93.5, failure_probability: 6.5, air_temp: 298.4, process_temp: 308.8, rpm: 1610.0, torque: 37.8, tool_wear: 55.0 },
      { id: 'G', name: 'Automated Assembly Cell G', type: 'M', status: 'Healthy', health_score: 97.0, failure_probability: 3.0, air_temp: 298.0, process_temp: 308.2, rpm: 1490.0, torque: 39.2, tool_wear: 20.0 },
      { id: 'H', name: 'Metal Stamping Press H', type: 'L', status: 'Healthy', health_score: 92.0, failure_probability: 8.0, air_temp: 299.1, process_temp: 309.5, rpm: 1380.0, torque: 50.4, tool_wear: 68.0 },
      { id: 'I', name: 'Precision Surface Grinder I', type: 'H', status: 'Healthy', health_score: 98.0, failure_probability: 2.0, air_temp: 297.8, process_temp: 307.9, rpm: 1580.0, torque: 33.1, tool_wear: 18.0 },
      { id: 'J', name: 'Automated Inspection Cell J', type: 'M', status: 'Healthy', health_score: 99.5, failure_probability: 0.5, air_temp: 297.5, process_temp: 307.5, rpm: 1500.0, torque: 36.0, tool_wear: 5.0 }
    ];
  }, [data?.machines]);

  // Dynamic summary KPI statistics
  const summary = useMemo(() => {
    const total = machines.length;
    const healthy = machines.filter(m => m.status === 'Healthy').length;
    const warning = machines.filter(m => m.status === 'Warning').length;
    const critical = machines.filter(m => m.status === 'Critical').length;
    return { total, healthy, warning, critical };
  }, [machines]);

  // Fleet average health score
  const averageHealth = useMemo(() => {
    if (machines.length === 0) return 90;
    return Math.round(machines.reduce((acc, m) => acc + (m.health_score || 90), 0) / machines.length);
  }, [machines]);

  // Filtered machines for the card grid
  const filteredMachines = useMemo(() => {
    if (!searchQuery) return machines;
    const q = searchQuery.toLowerCase();
    return machines.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.id.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  }, [machines, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-7">
      
      {/* 4. TOP STATISTICS (5 Compact Cards) */}
      <TopStatistics 
        summary={summary} 
        averageHealth={averageHealth} 
      />

      {/* 5, 6, 7 & 8, 9: FACTORY DIGITAL TWIN (THE HERO) + AI DIAGNOSTIC INSIGHT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-7 items-start">
        
        {/* Main Factory Layout Schematic (Col 1-8 on desktop) */}
        <div className="xl:col-span-8">
          <FactoryLayoutSchematic 
            machines={machines} 
            onOpenMachine={onOpenMachine} 
          />
        </div>

        {/* AI Diagnostic Insight & Top Risk Machines (Col 9-12 on desktop) */}
        <div className="xl:col-span-4">
          <AiDiagnosticPanel 
            machines={machines} 
            onOpenMachine={onOpenMachine} 
          />
        </div>

      </div>

      {/* 10. ANALYTICS SECTION (3 Simple Visualizations: Health Trend, Distribution, Alerts) */}
      <div className="space-y-2">
        <AnalyticsPreview 
          machines={machines} 
          onOpenMachine={onOpenMachine} 
        />
      </div>

      {/* VIRTUAL MACHINE TWINS GRID (10 DETAILED CARDS) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-left">
          <div>
            <h4 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              Virtual Machine Twins ({filteredMachines.length})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live physics-based twin models synchronized with Random Forest ML predictions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredMachines.map((machine) => {
            const isCritical = machine.status === 'Critical';

            return (
              <div
                key={`twin-card-${machine.id}`}
                onClick={() => onOpenMachine(machine.id)}
                className={`
                  bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-200
                  flex flex-col justify-between text-left group
                  ${isCritical 
                    ? 'border-red-400 dark:border-red-800 shadow-sm shadow-red-500/10' 
                    : machine.status === 'Warning'
                    ? 'border-amber-300 dark:border-amber-800'
                    : 'border-slate-200/90 dark:border-darkborder hover:border-slate-300'}
                `}
              >
                <div>
                  {/* Top: ID & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase">
                      ID: M-{machine.id}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusStyle(machine.status)}`}>
                      {machine.status}
                    </span>
                  </div>

                  {/* Machine Name */}
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                    {SHORT_NAMES[machine.id] || machine.name}
                  </h5>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Temp</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{round(machine.air_temp - 273.15, 1)}°C</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Speed</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{machine.rpm} RPM</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Torque</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{machine.torque} Nm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Tool Wear</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{machine.tool_wear} min</span>
                    </div>
                  </div>

                  {/* Health Progress Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-slate-400">Health</span>
                      <span className={machine.health_score > 70 ? 'text-success' : machine.health_score >= 50 ? 'text-warning' : 'text-danger'}>
                        {machine.health_score}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          machine.health_score > 80 ? 'bg-success' : machine.health_score >= 50 ? 'bg-warning' : 'bg-danger'
                        }`}
                        style={{ width: `${machine.health_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-primary">
                  <span>Diagnostics</span>
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
