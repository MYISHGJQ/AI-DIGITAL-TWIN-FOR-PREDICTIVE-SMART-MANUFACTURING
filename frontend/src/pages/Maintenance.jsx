import React, { useState } from 'react';
import axios from 'axios';
import { 
  Wrench, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Gauge, 
  Layers, 
  Sparkles,
  Check
} from 'lucide-react';
import { API_BASE } from '../App';

export default function Maintenance({ data, onRefresh, onOpenMachine }) {
  const machines = data?.machines || [];
  const [resettingId, setResettingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = (id) => {
    setResettingId(id);
    axios.post(`${API_BASE}/machines/${id}/maintenance`)
      .then(() => {
        setResettingId(null);
        setSuccessMsg(`Machine ${id} calibrated and tool wear reset to 0 min.`);
        if (onRefresh) onRefresh();
        setTimeout(() => setSuccessMsg(''), 4000);
      })
      .catch((err) => {
        console.error("Maintenance failed:", err);
        setResettingId(null);
      });
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Predictive Maintenance & Calibration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reset tool head wear and recalibrate digital twin sensors to baseline
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold animate-pulse">
            <Check size={14} className="stroke-[3]" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* 10 Machines Maintenance Table / Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-darkborder rounded-3xl p-5 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-darkborder text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase">
                <th className="pb-3 font-bold">Machine</th>
                <th className="pb-3 font-bold">Type</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Tool Wear</th>
                <th className="pb-3 font-bold">Failure Risk</th>
                <th className="pb-3 font-bold">Health</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {machines.map((m) => {
                const isWorn = m.tool_wear >= 150;
                const isCritical = m.status === 'Critical';

                return (
                  <tr key={`maint-${m.id}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          M-{m.id}
                        </span>
                        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => onOpenMachine && onOpenMachine(m.id)}>
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono">
                      Type {m.type}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        m.status === 'Critical' 
                          ? 'bg-red-100 text-danger dark:bg-red-950/40' 
                          : m.status === 'Warning' 
                          ? 'bg-amber-100 text-warning dark:bg-amber-950/40' 
                          : 'bg-emerald-100 text-success dark:bg-emerald-950/40'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono">
                      <span className={isWorn ? 'text-danger font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {m.tool_wear} min
                      </span>
                    </td>
                    <td className="py-3.5 font-mono">
                      <span className={isCritical ? 'text-danger font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {m.failure_probability}%
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {m.health_score}%
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleReset(m.id)}
                        disabled={resettingId === m.id}
                        className={`
                          px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5
                          ${isWorn || isCritical 
                            ? 'bg-primary text-white hover:bg-primary-dark shadow-2xs' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}
                        `}
                      >
                        <RotateCcw size={12} className={resettingId === m.id ? 'animate-spin' : ''} />
                        <span>{resettingId === m.id ? 'Calibrating...' : 'Reset Tool'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
