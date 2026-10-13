import React, { useMemo } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Cpu
} from 'lucide-react';

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

export default function AiDiagnosticPanel({ machines = [], onOpenMachine }) {
  // Sort machines by failure probability to get top risks
  const sortedByRisk = useMemo(() => {
    return [...machines].sort((a, b) => b.failure_probability - a.failure_probability);
  }, [machines]);

  const topRiskMachine = sortedByRisk[0] || {
    id: 'A',
    name: 'CNC Milling Machine A',
    status: 'Healthy',
    failure_probability: 2.0,
    health_score: 98.0
  };

  const top3Risks = sortedByRisk.slice(0, 3);

  // Dynamic AI Insight generation based on actual top risk machine
  const isCritical = topRiskMachine.failure_probability >= 50 || topRiskMachine.status === 'Critical';
  const isWarning = !isCritical && (topRiskMachine.failure_probability >= 20 || topRiskMachine.status === 'Warning');

  return (
    <div className="flex flex-col gap-4 text-left">
      
      {/* 8. AI DIAGNOSTIC INSIGHT PANEL */}
      <div className={`
        rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-2xs
        ${isCritical 
          ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' 
          : isWarning 
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' 
          : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40'
        }
      `}>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                isCritical ? 'bg-red-100 text-danger dark:bg-red-900/50' : 
                isWarning ? 'bg-amber-100 text-warning dark:bg-amber-900/50' : 
                'bg-primary/10 text-primary'
              }`}>
                <Sparkles size={16} className="stroke-[2.5]" />
              </div>
              <h4 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                AI Diagnostic Insight
              </h4>
            </div>

            {/* Status Pill */}
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isCritical ? 'bg-red-100 text-danger dark:bg-red-950/60' :
              isWarning ? 'bg-amber-100 text-warning dark:bg-amber-950/60' :
              'bg-emerald-100 text-success dark:bg-emerald-950/60'
            }`}>
              {isCritical ? <AlertOctagon size={11} className="stroke-[2.5]" /> :
               isWarning ? <AlertTriangle size={11} className="stroke-[2.5]" /> :
               <CheckCircle2 size={11} className="stroke-[2.5]" />}
              {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Nominal'}
            </span>
          </div>

          {/* Diagnosis Headline */}
          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1 leading-snug">
            {isCritical 
              ? 'Emergency Maintenance Required' 
              : isWarning 
              ? 'Predictive Service Advisory' 
              : 'All Systems Operating Optimally'}
          </h5>

          {/* Dynamic AI Description */}
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {isCritical 
              ? `Random Forest predicts elevated failure risk for ${topRiskMachine.name} (M-${topRiskMachine.id}). Tool wear and mechanical stress have exceeded operating thresholds.`
              : isWarning
              ? `Operational drift detected for ${topRiskMachine.name} (M-${topRiskMachine.id}). Tool wear is approaching service tolerances.`
              : 'Random Forest model predicts 0 imminent failures across all 10 virtual twins. Core thermal and mechanical loads remain balanced.'}
          </p>
        </div>

        {/* Risk Probability & CTA Button */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide block">
              Failure Probability
            </span>
            <span className={`text-lg font-black tracking-tight ${
              isCritical ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
            }`}>
              {topRiskMachine.failure_probability}%
            </span>
          </div>

          <button
            onClick={() => onOpenMachine(topRiskMachine.id)}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs
              ${isCritical 
                ? 'bg-danger text-white hover:bg-red-700' 
                : isWarning 
                ? 'bg-warning text-white hover:bg-amber-600' 
                : 'bg-primary text-white hover:bg-primary-dark'}
            `}
          >
            <span>View Machine {topRiskMachine.id}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 9. TOP RISK MACHINES PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-darkborder rounded-3xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 dark:border-darkborder">
          <div className="flex items-center gap-1.5">
            <ShieldAlert size={15} className="text-slate-400 dark:text-slate-500" />
            <h4 className="font-extrabold text-xs tracking-wider text-slate-900 dark:text-white uppercase font-mono">
              TOP RISK MACHINES
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            AI Ranked
          </span>
        </div>

        <div className="space-y-1.5">
          {top3Risks.map((m, idx) => {
            const shortName = SHORT_NAMES[m.id] || m.name;
            const isMHigh = m.failure_probability >= 50;
            const isMMed = m.failure_probability >= 20;

            return (
              <button
                key={`top-risk-${m.id}`}
                onClick={() => onOpenMachine(m.id)}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                    idx === 0 && isMHigh 
                      ? 'bg-red-100 text-danger dark:bg-red-950/60' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                      M-{m.id} — {shortName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-black font-mono ${
                    isMHigh ? 'text-danger' : isMMed ? 'text-warning' : 'text-success'
                  }`}>
                    {m.failure_probability}%
                  </span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    m.status === 'Critical' 
                      ? 'bg-red-100 dark:bg-red-950/40 text-danger' 
                      : m.status === 'Warning' 
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-warning' 
                      : 'bg-emerald-100 dark:bg-emerald-950/40 text-success'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
