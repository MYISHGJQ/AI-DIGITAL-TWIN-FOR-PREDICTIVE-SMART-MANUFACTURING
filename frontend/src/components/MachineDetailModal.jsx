import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  Thermometer, 
  RotateCw, 
  Gauge, 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  XOctagon, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { API_BASE } from '../App';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function MachineDetailModal({ machineId, onClose, onRefresh }) {
  const [details, setDetails] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState('temp');
  const [loading, setLoading] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceSuccess, setMaintenanceSuccess] = useState(false);

  // Fetch machine details and history
  const fetchDetails = () => {
    axios.get(`${API_BASE}/machines/${machineId}`)
      .then(res => {
        setDetails(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching machine details:", err);
      });
  };

  useEffect(() => {
    fetchDetails(); // Initial load
    
    // Poll details every 2 seconds to keep gauges and charts moving live!
    const timer = setInterval(() => {
      fetchDetails();
    }, 2000);
    
    return () => clearInterval(timer);
  }, [machineId]);

  const handleMaintenance = () => {
    setMaintenanceLoading(true);
    axios.post(`${API_BASE}/machines/${machineId}/maintenance`)
      .then(res => {
        setMaintenanceLoading(false);
        setMaintenanceSuccess(true);
        fetchDetails(); // Refresh details immediately
        onRefresh();    // Refresh parent dashboard stats
        setTimeout(() => setMaintenanceSuccess(false), 3000);
      })
      .catch(err => {
        console.error("Maintenance trigger failed:", err);
        setMaintenanceLoading(false);
      });
  };

  // Prepare chart data based on active chart tab
  const getChartData = () => {
    if (!details?.history) return { labels: [], datasets: [] };
    
    const history = details.history;
    const labels = history.map((item, idx) => {
      const time = new Date(item.timestamp);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });

    let dataPoints = [];
    let label = '';
    let borderColor = '#2563EB';
    let backgroundColor = 'rgba(37, 99, 235, 0.1)';

    switch (activeChartTab) {
      case 'temp':
        dataPoints = history.map(item => round(item.air_temp - 273.15, 1)); // Convert Kelvin to Celcius
        label = 'Air Temperature (°C)';
        borderColor = '#EF4444';
        backgroundColor = 'rgba(239, 68, 68, 0.05)';
        break;
      case 'rpm':
        dataPoints = history.map(item => item.rpm);
        label = 'Speed (RPM)';
        borderColor = '#3B82F6';
        backgroundColor = 'rgba(59, 130, 246, 0.05)';
        break;
      case 'torque':
        dataPoints = history.map(item => item.torque);
        label = 'Torque (Nm)';
        borderColor = '#F59E0B';
        backgroundColor = 'rgba(245, 158, 11, 0.05)';
        break;
      case 'wear':
        dataPoints = history.map(item => item.tool_wear);
        label = 'Tool Wear (min)';
        borderColor = '#10B981';
        backgroundColor = 'rgba(16, 185, 129, 0.05)';
        break;
      case 'health':
        dataPoints = history.map(item => item.health_score);
        label = 'Spindle Health (%)';
        borderColor = '#8B5CF6';
        backgroundColor = 'rgba(139, 92, 246, 0.05)';
        break;
      default:
        break;
    }

    return {
      labels,
      datasets: [
        {
          label,
          data: dataPoints,
          borderColor,
          backgroundColor,
          fill: true,
          tension: 0.3,
          pointRadius: 1,
          pointHoverRadius: 4,
          borderWidth: 2,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 6,
          font: { size: 9 },
          color: '#64748B'
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          font: { size: 9 },
          color: '#64748B'
        }
      }
    },
    animation: {
      duration: 500
    }
  };

  if (loading || !details) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-100 dark:border-darkborder">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Querying virtual machine twin...</p>
        </div>
      </div>
    );
  }

  const { machine, predictions } = details;

  // SVG Gauge calculations
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  // Circular gauge for Health Score
  const healthDashOffset = circumference - (machine.health_score / 100) * circumference;
  const healthColor = machine.health_score > 80 ? '#22C55E' : (machine.health_score >= 50 ? '#F59E0B' : '#EF4444');

  // Semi-circular gauge for Failure Probability
  // Semi-circle path details
  const rGauge = 45;
  const cGauge = Math.PI * rGauge; // 180 deg circumference
  const riskDashOffset = cGauge - (machine.failure_probability / 100) * cGauge;
  const riskColor = machine.failure_probability < 20 ? '#22C55E' : (machine.failure_probability < 50 ? '#F59E0B' : '#EF4444');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 dark:border-darkborder overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-150 dark:border-darkborder bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                machine.status === 'Healthy' ? 'bg-success animate-pulse' : machine.status === 'Warning' ? 'bg-warning animate-pulse-slow' : 'bg-danger animate-pulse'
              }`}></span>
              <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                Twin Spindle Telemetry - Machine {machine.id}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live physical parameters and Random Forest diagnostics
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-darkborder hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Grid Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Gauges and Telemetry Grid (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Gauges Card */}
            <div className="bg-slate-50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-darkborder/50 rounded-2xl p-5 flex items-center justify-around">
              
              {/* Circular Health Gauge */}
              <div className="text-center space-y-2">
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="transparent" className="dark:stroke-slate-800" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r={radius} 
                      stroke={healthColor} 
                      strokeWidth={strokeWidth} 
                      fill="transparent" 
                      strokeDasharray={circumference}
                      strokeDashoffset={healthDashOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">
                      {machine.health_score}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Health
                    </span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Current Health
                </p>
              </div>

              {/* Semi-circular Failure Risk Gauge */}
              <div className="text-center space-y-2">
                <div className="relative h-24 w-24 overflow-hidden">
                  <svg className="h-full w-full transform -rotate-180" viewBox="0 0 100 100">
                    {/* Background Arc */}
                    <path 
                      d="M 10,80 A 40,40 0 0,1 90,80" 
                      stroke="#E2E8F0" 
                      strokeWidth={strokeWidth} 
                      fill="none" 
                      strokeLinecap="round"
                      className="dark:stroke-slate-800"
                    />
                    {/* Active Arc */}
                    <path 
                      d="M 10,80 A 40,40 0 0,1 90,80" 
                      stroke={riskColor} 
                      strokeWidth={strokeWidth} 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray={cGauge}
                      strokeDashoffset={riskDashOffset}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute bottom-2 inset-x-0 flex flex-col items-center justify-end h-full">
                    <span className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">
                      {machine.failure_probability}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Risk
                    </span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Failure Probability
                </p>
              </div>

            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-100 dark:border-darkborder rounded-2xl p-4 bg-white dark:bg-slate-900 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase">
                  <Thermometer size={12} className="text-red-500" />
                  Air Temperature
                </span>
                <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">
                  {machine.air_temp} K
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {round(machine.air_temp - 273.15, 1)} °C
                </p>
              </div>

              <div className="border border-slate-100 dark:border-darkborder rounded-2xl p-4 bg-white dark:bg-slate-900 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase">
                  <Thermometer size={12} className="text-orange-500" />
                  Process Temp
                </span>
                <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">
                  {machine.process_temp} K
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {round(machine.process_temp - 273.15, 1)} °C
                </p>
              </div>

              <div className="border border-slate-100 dark:border-darkborder rounded-2xl p-4 bg-white dark:bg-slate-900 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase">
                  <RotateCw size={12} className="text-blue-500" />
                  Rotational Speed
                </span>
                <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">
                  {machine.rpm} RPM
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Spindle velocity
                </p>
              </div>

              <div className="border border-slate-100 dark:border-darkborder rounded-2xl p-4 bg-white dark:bg-slate-900 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase">
                  <Gauge size={12} className="text-amber-500" />
                  Load Torque
                </span>
                <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">
                  {machine.torque} Nm
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Spindle motor torque
                </p>
              </div>
            </div>

            {/* Tool Wear Progress */}
            <div className="border border-slate-100 dark:border-darkborder rounded-2xl p-4 bg-white dark:bg-slate-900 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase text-[10px]">
                  <Wrench size={12} className="text-emerald-500" />
                  Tool Wear Accumulation
                </span>
                <span className="font-extrabold text-slate-700 dark:text-slate-200">
                  {machine.tool_wear} / 240 min
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    machine.tool_wear > 200 ? 'bg-danger' : machine.tool_wear > 150 ? 'bg-warning' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(machine.tool_wear / 240) * 100}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Right Column: Historical Charts & Maintenance Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Chart Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-darkborder rounded-2xl p-5 shadow-sm space-y-4">
              
              {/* Chart Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkborder pb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Live Sensor History
                </h4>
                
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveChartTab('temp')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                      activeChartTab === 'temp' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Temp
                  </button>
                  <button 
                    onClick={() => setActiveChartTab('rpm')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                      activeChartTab === 'rpm' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Speed
                  </button>
                  <button 
                    onClick={() => setActiveChartTab('torque')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                      activeChartTab === 'torque' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Torque
                  </button>
                  <button 
                    onClick={() => setActiveChartTab('wear')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                      activeChartTab === 'wear' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Wear
                  </button>
                  <button 
                    onClick={() => setActiveChartTab('health')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                      activeChartTab === 'health' ? 'bg-white dark:bg-slate-700 shadow-sm text-violet-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Health
                  </button>
                </div>
              </div>

              {/* Chart Plot Area */}
              <div className="h-[180px] w-full">
                <Line data={getChartData()} options={chartOptions} />
              </div>
            </div>

            {/* AI Recommendation & Interactive Action */}
            <div className={`p-5 rounded-2xl border text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
              machine.status === 'Critical' 
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' 
                : machine.status === 'Warning'
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
            }`}>
              <div className="space-y-1 max-w-lg">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary-light" />
                  Predictive Recommendation
                </h5>
                <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {machine.recommendation}
                </p>
              </div>

              <button 
                onClick={handleMaintenance}
                disabled={maintenanceLoading || maintenanceSuccess}
                className={`px-4.5 py-2.5 rounded-xl font-bold text-xs select-none shadow-sm flex items-center gap-1.5 border transition-all shrink-0 ${
                  maintenanceSuccess 
                    ? 'bg-green-150 border-green-200 dark:bg-green-950/30 text-green-500 dark:border-green-900/30' 
                    : 'bg-primary text-white border-primary hover:bg-primary-dark hover:shadow'
                }`}
              >
                <Wrench size={13} />
                {maintenanceLoading ? 'Calibrating...' : maintenanceSuccess ? 'Twin Calibrated!' : 'Perform Maintenance'}
              </button>
            </div>

            {/* Timeline of AI Predictions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-darkborder rounded-2xl p-5 text-left space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Machine Diagnostics Timeline
              </h4>

              <div className="space-y-4 max-h-[140px] overflow-y-auto pr-1">
                {predictions && predictions.length > 0 ? (
                  predictions.map((p, idx) => (
                    <div key={p.id || idx} className="flex gap-3 items-start text-xs border-l-2 border-slate-100 dark:border-slate-800 pl-4 relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        p.failure_probability > 50 ? 'bg-danger animate-pulse' : p.failure_probability > 15 ? 'bg-warning' : 'bg-success'
                      }`}></span>
                      
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Failure Probability: {p.failure_probability}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatTime(p.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
                          {p.recommendation}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No events recorded in simulation twin yet.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// Helpers
function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default MachineDetailModal;
