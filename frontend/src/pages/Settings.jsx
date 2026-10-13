import React, { useState } from 'react';
import axios from 'axios';
import { 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  Sliders, 
  Info,
  SlidersHorizontal,
  Activity,
  Cpu
} from 'lucide-react';
import { API_BASE } from '../App';

function Settings({ config, onChangeConfig, theme, onToggleTheme }) {
  const [loading, setLoading] = useState(false);

  const handleUpdateConfig = (newActive, newInterval) => {
    setLoading(true);
    axios.post(`${API_BASE}/simulation/config`, {
      active: newActive,
      interval: parseFloat(newInterval)
    })
      .then(res => {
        onChangeConfig({
          active: res.data.active,
          interval: res.data.interval
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to update simulation config:", err);
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto text-left">
      
      {/* Header */}
      <div className="pl-1">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          System Control & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure the digital twin simulation rates and visual client theme
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Card: Theme settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-darkborder rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-darkborder pb-3.5">
            <SlidersHorizontal size={18} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Visual Customization
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Interface Color Mode
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Toggle between clear white or modern low-light dark aesthetics.
              </p>
            </div>

            <button 
              onClick={onToggleTheme}
              className="px-4 py-2 border border-slate-200 dark:border-darkborder rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={14} />
                  Switch to Dark Mode
                </>
              ) : (
                <>
                  <Sun size={14} />
                  Switch to Light Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card: Simulation Engine settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-darkborder rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-darkborder pb-3.5">
            <Activity size={18} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Digital Twin Simulation Engine
            </h3>
          </div>

          {/* Toggle Simulator Active/Paused */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Simulation Heartbeat
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Play or pause the background SQLite dataset polling loop.
              </p>
            </div>

            <button 
              onClick={() => handleUpdateConfig(!config.active, config.interval)}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                config.active 
                  ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 text-warning dark:border-amber-900/50 hover:bg-amber-100/50' 
                  : 'bg-green-50/50 border-green-200 dark:bg-green-950/20 text-success dark:border-green-900/50 hover:bg-green-100/50'
              }`}
            >
              {config.active ? (
                <>
                  <Pause size={14} />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play size={14} />
                  Resume Simulation
                </>
              )}
            </button>
          </div>

          {/* Slider for Speed config */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-darkborder/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Telemetry Heartbeat Interval
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Update database records and execute Random Forest classification.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-primary">
                {config.interval} seconds
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <input 
                type="range" 
                min="0.5" 
                max="5.0" 
                step="0.5"
                value={config.interval}
                onChange={(e) => handleUpdateConfig(config.active, e.target.value)}
                disabled={loading}
                className="flex-1 accent-primary h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 font-bold select-none">
                0.5s (Fast) - 5.0s (Slow)
              </span>
            </div>
          </div>
        </div>

        {/* Project documentation insights */}
        <div className="bg-slate-100/40 dark:bg-slate-900/30 border border-slate-200 dark:border-darkborder rounded-3xl p-5 flex gap-3.5">
          <div className="text-primary mt-0.5">
            <Info size={18} />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AIML Final Year Demonstration Guide
            </h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              When demonstrating this project:
            </p>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-1 font-medium">
              <li>Set the interval to <b>1.0s or 2.0s</b> to show live-updating charts and gauges in real time.</li>
              <li>Explain that telemetry coordinates match the distributions of the AI4I Predictive Maintenance dataset.</li>
              <li>Demonstrate how the <b>Random Forest Classifier</b> calculates failure risks dynamically on each sensor change.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Settings;
