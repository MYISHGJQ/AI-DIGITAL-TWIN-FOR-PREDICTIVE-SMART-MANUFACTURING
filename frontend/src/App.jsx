import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  AlertTriangle,
  LayoutDashboard,
  Layers,
  BarChart3,
  Wrench,
  FileText,
  Settings as SettingsIcon
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MachineDetailModal from './components/MachineDetailModal';

export const API_BASE = "http://localhost:8000/api";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  const [simulationConfig, setSimulationConfig] = useState({ active: true, interval: 2.0 });
  const [machinesData, setMachinesData] = useState(null);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync theme to document body
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch simulation config on mount
  useEffect(() => {
    axios.get(`${API_BASE}/simulation/config`)
      .then(res => {
        setSimulationConfig(res.data);
      })
      .catch(err => {
        console.error("Failed to load simulation config from backend:", err);
      });
  }, []);

  // Poll machines data
  const fetchMachines = useCallback(() => {
    axios.get(`${API_BASE}/machines`)
      .then(res => {
        setMachinesData(res.data);
        setConnectionError(false);
      })
      .catch(err => {
        console.error("Failed to poll live machine data:", err);
        setConnectionError(true);
      });
  }, []);

  useEffect(() => {
    fetchMachines(); // Immediate initial fetch
    
    // Set polling timer based on simulation configuration interval
    const intervalMs = simulationConfig.active ? (simulationConfig.interval * 1000) : 4000;
    const timer = setInterval(() => {
      fetchMachines();
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [fetchMachines, simulationConfig.active, simulationConfig.interval]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleOpenMachineDetail = (id) => {
    setSelectedMachineId(id);
  };

  // Active warning/critical alerts count
  const alertCount = useMemo(() => {
    if (!machinesData?.machines) return 0;
    return machinesData.machines.filter(m => m.status === 'Critical' || m.status === 'Warning').length;
  }, [machinesData]);

  const renderContent = () => {
    if (connectionError && !machinesData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="p-4 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full mb-4">
            <AlertTriangle size={36} />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">
            Cannot Connect to Digital Twin Server
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6 text-sm">
            Make sure your python backend (FastAPI) is running at <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm text-red-500 font-mono">http://localhost:8000</code>.
          </p>
          <button 
            onClick={fetchMachines}
            className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors duration-200 shadow-sm text-sm"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            data={machinesData} 
            onOpenMachine={handleOpenMachineDetail}
            searchQuery={searchQuery}
          />
        );
      case 'machines':
        return (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  All 10 Virtual Machine Twins
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed inspection and telemetry profiles for all manufacturing assets
                </p>
              </div>
            </div>
            <Dashboard 
              data={machinesData} 
              onOpenMachine={handleOpenMachineDetail}
              searchQuery={searchQuery}
            />
          </div>
        );
      case 'analytics':
        return <Analytics />;
      case 'maintenance':
        return (
          <Maintenance 
            data={machinesData} 
            onRefresh={fetchMachines}
            onOpenMachine={handleOpenMachineDetail}
          />
        );
      case 'reports':
        return <Reports data={machinesData} />;
      case 'settings':
        return (
          <Settings 
            config={simulationConfig} 
            onChangeConfig={setSimulationConfig}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      default:
        return (
          <Dashboard 
            data={machinesData} 
            onOpenMachine={handleOpenMachineDetail} 
            searchQuery={searchQuery} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-darkbg text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 2. SIDEBAR (Fixed Left on Desktop, Drawer on Mobile) */}
      <Sidebar 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        simulationConfig={simulationConfig}
        machineCount={machinesData?.machines?.length || 10}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Layout Area (offset by sidebar width on lg) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* 3. HEADER */}
        <Header 
          onToggleMobile={() => setMobileSidebarOpen(prev => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
          simulationConfig={simulationConfig}
          alertCount={alertCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Wrapper */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-20 lg:pb-8">
          {renderContent()}
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-darkborder px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
              activeTab === 'dashboard' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dash</span>
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
              activeTab === 'machines' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Layers size={18} />
            <span>Twins</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
              activeTab === 'analytics' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
              activeTab === 'maintenance' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <Wrench size={18} />
            <span>Service</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
              activeTab === 'reports' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <FileText size={18} />
            <span>Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
              activeTab === 'settings' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <SettingsIcon size={18} />
            <span>Config</span>
          </button>
        </nav>

      </div>

      {/* 13. MACHINE DETAILS POPUP MODAL */}
      {selectedMachineId && (
        <MachineDetailModal 
          machineId={selectedMachineId} 
          onClose={() => setSelectedMachineId(null)}
          onRefresh={fetchMachines}
        />
      )}

    </div>
  );
}

export default App;
