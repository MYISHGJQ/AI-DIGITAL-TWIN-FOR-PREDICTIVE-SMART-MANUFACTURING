import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  BarChart3, 
  Wrench, 
  FileText, 
  Settings as SettingsIcon,
  Activity,
  Database,
  Radio,
  Zap,
  Layers,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  simulationConfig = { active: true, interval: 2.0 },
  machineCount = 10,
  mobileOpen = false,
  onCloseMobile
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Machines', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-darkborder 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Branding Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 dark:border-darkborder flex items-center justify-between">
            <div className="flex items-center gap-3 select-none">
              <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                <Cpu size={20} className="stroke-[2.5]" />
              </div>
              <div className="text-left">
                <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  SMARTTWIN <span className="text-primary font-extrabold">AI</span>
                </h1>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mt-0.5">
                  Digital Twin Platform
                </p>
              </div>
            </div>

            {/* Close button on mobile */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-primary/10 text-primary dark:text-primary-light shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-primary stroke-[2.5]' : 'stroke-[2] text-slate-400 group-hover:text-slate-600'} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: SYSTEM STATUS Panel */}
        <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-left">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
              SYSTEM STATUS
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Running
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 dark:text-slate-400 font-medium">Machines:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{machineCount} Active</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 dark:text-slate-400 font-medium">Update Interval:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{simulationConfig.interval || 2} sec</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 dark:text-slate-400 font-medium">ML Model:</span>
              <span className="font-semibold text-primary dark:text-primary-light">Random Forest</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 dark:text-slate-400 font-medium">Database:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">SQLite</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
