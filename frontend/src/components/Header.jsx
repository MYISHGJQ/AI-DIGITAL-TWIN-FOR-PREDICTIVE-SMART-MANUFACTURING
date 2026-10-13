import React from 'react';
import { 
  Menu, 
  Moon, 
  Sun, 
  Bell, 
  Radio, 
  User, 
  Activity, 
  Search,
  CheckCircle2
} from 'lucide-react';

export default function Header({ 
  onToggleMobile, 
  theme, 
  onToggleTheme, 
  simulationConfig = { active: true, interval: 2.0 },
  alertCount = 0,
  searchQuery = '',
  onSearchChange
}) {
  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-darkborder transition-colors">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="text-left">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Smart Factory Overview
            </h2>
            <p className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-400 font-medium">
              Real-time digital twin of your manufacturing environment
            </p>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Live Simulation Status Pill */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Simulation</span>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">
              ({simulationConfig.interval || 2}s interval)
            </span>
          </div>

          {/* Search bar on desktop */}
          {onSearchChange && (
            <div className="relative hidden xl:block w-44">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search twin..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-7 pr-2.5 h-8 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
              />
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="h-9 w-9 rounded-xl border border-slate-200 dark:border-darkborder flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="System Alerts"
            >
              <Bell size={16} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-darkborder flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Supervisor Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-darkborder select-none">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
              ST
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Supervisor
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                Plant Twin Lead
              </span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
