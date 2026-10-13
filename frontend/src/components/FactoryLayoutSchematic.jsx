import React, { useMemo } from 'react';

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

function getStatusDetails(status) {
  switch (status) {
    case 'Healthy':
      return {
        color: '#10B981',
        bgPill: '#ECFDF5',
        darkBgPill: 'rgba(16, 185, 129, 0.15)',
        glow: 'none',
        textColor: '#059669',
        border: '#10B981',
        label: 'HEALTHY'
      };
    case 'Warning':
      return {
        color: '#F59E0B',
        bgPill: '#FFFBEB',
        darkBgPill: 'rgba(245, 158, 11, 0.15)',
        glow: 'none',
        textColor: '#D97706',
        border: '#F59E0B',
        label: 'WARNING'
      };
    case 'Critical':
      return {
        color: '#EF4444',
        bgPill: '#FEF2F2',
        darkBgPill: 'rgba(239, 68, 68, 0.2)',
        glow: 'drop-shadow(0 0 7px rgba(239, 68, 68, 0.45))',
        textColor: '#DC2626',
        border: '#EF4444',
        label: 'CRITICAL'
      };
    default:
      return {
        color: '#64748B',
        bgPill: '#F1F5F9',
        darkBgPill: 'rgba(100, 116, 139, 0.15)',
        glow: 'none',
        textColor: '#475569',
        border: '#64748B',
        label: 'OFFLINE'
      };
  }
}

// Render clean custom industrial SVG icons
function renderIndustrialSvgIcon(id, x, y, color = "#2563EB") {
  switch (id) {
    case 'A': // CNC Milling Spindle
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="-7" y="-8" width="14" height="6" rx="1.5" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
          <path d="M -4,-2 L 4,-2 L 2,4 L -2,4 Z" fill={color} />
          <line x1="0" y1="4" x2="0" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="0" cy="8" r="1.5" fill={color} />
        </g>
      );
    case 'B': // Robotic Arm Welder
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="-7" y="5" width="14" height="3" rx="1" fill={color} fillOpacity="0.3" />
          <path d="M -4,5 L -1,-1 L 4,-4 L 7,-2" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="-1" cy="-1" r="2" fill={color} />
          <line x1="7" y1="-2" x2="9" y2="0" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="9" cy="0" r="1" fill="#F59E0B" />
        </g>
      );
    case 'C': // Laser Cutter Beam
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="-8" y="-8" width="16" height="5" rx="1.5" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="-3" x2="0" y2="5" stroke="#EF4444" strokeWidth="1.8" strokeDasharray="1.5,1.5" />
          <circle cx="0" cy="6" r="2" fill="#EF4444" />
          <line x1="-5" y1="8" x2="5" y2="8" stroke={color} strokeWidth="1.4" />
        </g>
      );
    case 'D': // Hydraulic Press
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="-8" y="-8" width="16" height="3" fill={color} />
          <rect x="-4" y="-5" width="8" height="6" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" />
          <rect x="-7" y="1" width="14" height="3" fill={color} />
          <rect x="-8" y="6" width="16" height="3" fill={color} />
        </g>
      );
    case 'E': // Injection Molding Unit
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="-8" y="-5" width="8" height="10" rx="1" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
          <rect x="0" y="-5" width="8" height="10" rx="1" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
          <line x1="-8" y1="0" x2="-2" y2="0" stroke={color} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="1.5" fill="#10B981" />
        </g>
      );
    case 'F': // Turning Lathe
      return (
        <g transform={`translate(${x}, ${y})`}>
          <circle cx="-5" cy="0" r="6" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
          <circle cx="-5" cy="0" r="2" fill={color} />
          <line x1="-3" y1="0" x2="6" y2="0" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="-5" x2="6" y2="5" stroke={color} strokeWidth="1.5" />
        </g>
      );
    case 'G': // Automated Assembly Cell
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x="-7" y="-7" width="6" height="6" rx="1" fill={color} />
          <rect x="1" y="-7" width="6" height="6" rx="1" fill={color} fillOpacity="0.4" />
          <rect x="-7" y="1" width="6" height="6" rx="1" fill={color} fillOpacity="0.4" />
          <rect x="1" y="1" width="6" height="6" rx="1" fill={color} />
        </g>
      );
    case 'H': // Metal Stamping Press
      return (
        <g transform={`translate(${x}, ${y})`}>
          <path d="M -7,-7 L 7,-7 L 5,-1 L -5,-1 Z" fill={color} />
          <line x1="0" y1="-1" x2="0" y2="4" stroke={color} strokeWidth="1.5" />
          <rect x="-8" y="5" width="16" height="3" rx="1" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" />
        </g>
      );
    case 'I': // Surface Grinder
      return (
        <g transform={`translate(${x}, ${y})`}>
          <ellipse cx="0" cy="-2" rx="7" ry="5" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
          <circle cx="0" cy="-2" r="2" fill={color} />
          <line x1="-8" y1="5" x2="8" y2="5" stroke={color} strokeWidth="1.6" />
        </g>
      );
    case 'J': // Inspection Optical Scanner
      return (
        <g transform={`translate(${x}, ${y})`}>
          <path d="M -7,-5 L -7,-7 L -5,-7" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M 7,-5 L 7,-7 L 5,-7" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M -7,5 L -7,7 L -5,7" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M 7,5 L 7,7 L 5,7" stroke={color} strokeWidth="1.5" fill="none" />
          <line x1="-6" y1="0" x2="6" y2="0" stroke="#10B981" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="1.5" fill="#10B981" />
        </g>
      );
    default:
      return null;
  }
}

export default function FactoryLayoutSchematic({ machines = [], onOpenMachine }) {
  const machineMap = useMemo(() => {
    const map = {};
    machines.forEach(m => {
      map[m.id] = m;
    });
    return map;
  }, [machines]);

  // Production line order:
  // Top row: M-A -> M-B -> M-C -> M-D -> M-E
  const topIds = ['A', 'B', 'C', 'D', 'E'];
  // Bottom row (displayed left to right: M-J, M-I, M-H, M-G, M-F; flow goes right to left M-F -> M-J)
  const bottomIds = ['J', 'I', 'H', 'G', 'F'];

  // ViewBox: 1040 x 360
  // 5 columns with x positions: [40, 245, 450, 655, 860]
  // Node card: 140 width, 120 height, rx: 14
  const colX = [40, 245, 450, 655, 860];
  const cardW = 140;
  const cardH = 120;
  const topY = 40;
  const bottomY = 200;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-darkborder rounded-3xl p-5 sm:p-6 shadow-xs transition-all text-left">
      
      {/* Schematic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-slate-100 dark:border-darkborder">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
              DIGITAL TWIN TOPOLOGY
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Synchronized Flow
            </span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
            FACTORY LAYOUT SCHEMATIC
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time production flow with 10 virtual machines.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Critical
          </span>
        </div>
      </div>

      {/* DESKTOP & TABLET: TOP-DOWN 2D SVG MANUFACTURING FLOOR */}
      <div className="hidden sm:block w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[800px] lg:min-w-full bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-darkborder p-3">
          <svg viewBox="0 0 1040 360" className="w-full h-auto select-none" style={{ minHeight: '300px' }}>
            <defs>
              <filter id="nodeGlowCritical" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EF4444" floodOpacity="0.4" />
              </filter>
              <filter id="subtleShadow" x="-10%" y="-10%" width="125%" height="125%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.06" />
              </filter>
            </defs>

            {/* ================= CONVEYOR / PRODUCTION LINE CONNECTIONS ================= */}
            
            {/* Top Row Conveyor: M-A -> M-B -> M-C -> M-D -> M-E */}
            {/* A -> B */}
            <line x1="180" y1="100" x2="245" y2="100" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="180" y1="100" x2="245" y2="100" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor" />
            <polygon points="216,97 222,100 216,103" fill="#3B82F6" />

            {/* B -> C */}
            <line x1="385" y1="100" x2="450" y2="100" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="385" y1="100" x2="450" y2="100" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor" />
            <polygon points="421,97 427,100 421,103" fill="#3B82F6" />

            {/* C -> D */}
            <line x1="590" y1="100" x2="655" y2="100" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="590" y1="100" x2="655" y2="100" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor" />
            <polygon points="626,97 632,100 626,103" fill="#3B82F6" />

            {/* D -> E */}
            <line x1="795" y1="100" x2="860" y2="100" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="795" y1="100" x2="860" y2="100" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor" />
            <polygon points="831,97 837,100 831,103" fill="#3B82F6" />

            {/* Turn Down: M-E -> M-F (Col 4 down) */}
            <line x1="930" y1="160" x2="930" y2="200" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="930" y1="160" x2="930" y2="200" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor" />
            <polygon points="927,178 930,184 933,178" fill="#3B82F6" />

            {/* Bottom Row Conveyor: M-F -> M-G -> M-H -> M-I -> M-J (Right to Left) */}
            {/* F -> G */}
            <line x1="860" y1="260" x2="795" y2="260" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="860" y1="260" x2="795" y2="260" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor-reverse" />
            <polygon points="824,257 818,260 824,263" fill="#3B82F6" />

            {/* G -> H */}
            <line x1="655" y1="260" x2="590" y2="260" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="655" y1="260" x2="590" y2="260" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor-reverse" />
            <polygon points="619,257 613,260 619,263" fill="#3B82F6" />

            {/* H -> I */}
            <line x1="450" y1="260" x2="385" y2="260" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="450" y1="260" x2="385" y2="260" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor-reverse" />
            <polygon points="414,257 408,260 414,263" fill="#3B82F6" />

            {/* I -> J */}
            <line x1="245" y1="260" x2="180" y2="260" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3,3" />
            <line x1="245" y1="260" x2="180" y2="260" stroke="#3B82F6" strokeWidth="2" className="animate-conveyor-reverse" />
            <polygon points="209,257 203,260 209,263" fill="#3B82F6" />

            {/* Return Loop: M-J -> M-A (Col 0 up) */}
            <line x1="110" y1="200" x2="110" y2="160" stroke="#94A3B8" strokeWidth="1.8" strokeDasharray="4,4" className="opacity-60" />
            <polygon points="107,178 110,172 113,178" fill="#94A3B8" className="opacity-80" />

            {/* ================= TOP ROW MACHINE NODES (M-A to M-E) ================= */}
            {topIds.map((id, index) => {
              const machine = machineMap[id] || { id, name: SHORT_NAMES[id] || id, status: 'Healthy', health_score: 95.0, failure_probability: 2.0 };
              const details = getStatusDetails(machine.status);
              const x = colX[index];
              const y = topY;
              const shortName = SHORT_NAMES[id] || machine.name;
              const isCritical = machine.status === 'Critical';

              return (
                <g
                  key={`top-node-${id}`}
                  className="cursor-pointer group select-none transition-transform duration-150"
                  onClick={() => onOpenMachine(id)}
                >
                  {/* Outer Node Card */}
                  <rect
                    x={x}
                    y={y}
                    width={cardW}
                    height={cardH}
                    rx="14"
                    fill="currentColor"
                    stroke={details.border}
                    strokeWidth={isCritical ? '2.5' : '1.5'}
                    filter={isCritical ? 'url(#nodeGlowCritical)' : 'url(#subtleShadow)'}
                    className="text-white dark:text-slate-900 transition-all duration-200 group-hover:brightness-95 dark:group-hover:brightness-110"
                  />

                  {/* Status Indicator Dot (Centered Top) */}
                  <circle
                    cx={x + cardW / 2}
                    cy={y + 14}
                    r="4.5"
                    fill={details.color}
                  />
                  {isCritical && (
                    <circle
                      cx={x + cardW / 2}
                      cy={y + 14}
                      r="8"
                      fill={details.color}
                      fillOpacity="0.3"
                      className="animate-ping"
                    />
                  )}

                  {/* Industrial Machine Icon */}
                  {renderIndustrialSvgIcon(id, x + cardW / 2, y + 36, details.color)}

                  {/* Machine ID */}
                  <text
                    x={x + cardW / 2}
                    y={y + 60}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="fill-slate-900 dark:fill-white"
                  >
                    M-{id}
                  </text>

                  {/* Short Machine Name */}
                  <text
                    x={x + cardW / 2}
                    y={y + 75}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    className="fill-slate-500 dark:fill-slate-400"
                  >
                    {shortName}
                  </text>

                  {/* Health % */}
                  <text
                    x={x + cardW / 2}
                    y={y + 92}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    className="fill-slate-800 dark:fill-slate-200"
                  >
                    {machine.health_score}%
                  </text>

                  {/* Status Badge Pill */}
                  <rect
                    x={x + 25}
                    y={y + 98}
                    width={cardW - 50}
                    height="16"
                    rx="5"
                    fill={details.color}
                    fillOpacity="0.15"
                  />
                  <text
                    x={x + cardW / 2}
                    y={y + 110}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    letterSpacing="0.04em"
                    fill={details.color}
                  >
                    {details.label}
                  </text>
                </g>
              );
            })}

            {/* ================= BOTTOM ROW MACHINE NODES (M-J to M-F) ================= */}
            {bottomIds.map((id, index) => {
              const machine = machineMap[id] || { id, name: SHORT_NAMES[id] || id, status: 'Healthy', health_score: 95.0, failure_probability: 2.0 };
              const details = getStatusDetails(machine.status);
              const x = colX[index];
              const y = bottomY;
              const shortName = SHORT_NAMES[id] || machine.name;
              const isCritical = machine.status === 'Critical';

              return (
                <g
                  key={`bottom-node-${id}`}
                  className="cursor-pointer group select-none transition-transform duration-150"
                  onClick={() => onOpenMachine(id)}
                >
                  {/* Outer Node Card */}
                  <rect
                    x={x}
                    y={y}
                    width={cardW}
                    height={cardH}
                    rx="14"
                    fill="currentColor"
                    stroke={details.border}
                    strokeWidth={isCritical ? '2.5' : '1.5'}
                    filter={isCritical ? 'url(#nodeGlowCritical)' : 'url(#subtleShadow)'}
                    className="text-white dark:text-slate-900 transition-all duration-200 group-hover:brightness-95 dark:group-hover:brightness-110"
                  />

                  {/* Status Indicator Dot (Centered Top) */}
                  <circle
                    cx={x + cardW / 2}
                    cy={y + 14}
                    r="4.5"
                    fill={details.color}
                  />
                  {isCritical && (
                    <circle
                      cx={x + cardW / 2}
                      cy={y + 14}
                      r="8"
                      fill={details.color}
                      fillOpacity="0.3"
                      className="animate-ping"
                    />
                  )}

                  {/* Industrial Machine Icon */}
                  {renderIndustrialSvgIcon(id, x + cardW / 2, y + 36, details.color)}

                  {/* Machine ID */}
                  <text
                    x={x + cardW / 2}
                    y={y + 60}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="fill-slate-900 dark:fill-white"
                  >
                    M-{id}
                  </text>

                  {/* Short Machine Name */}
                  <text
                    x={x + cardW / 2}
                    y={y + 75}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    className="fill-slate-500 dark:fill-slate-400"
                  >
                    {shortName}
                  </text>

                  {/* Health % */}
                  <text
                    x={x + cardW / 2}
                    y={y + 92}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    className="fill-slate-800 dark:fill-slate-200"
                  >
                    {machine.health_score}%
                  </text>

                  {/* Status Badge Pill */}
                  <rect
                    x={x + 25}
                    y={y + 98}
                    width={cardW - 50}
                    height="16"
                    rx="5"
                    fill={details.color}
                    fillOpacity="0.15"
                  />
                  <text
                    x={x + cardW / 2}
                    y={y + 110}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    letterSpacing="0.04em"
                    fill={details.color}
                  >
                    {details.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* MOBILE: RESPONSIVE 2-ROW / 2-COLUMN MANUFACTURING CONVEYOR (All 10 machines accessible) */}
      <div className="block sm:hidden space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 font-mono">
          <span>Flow: M-A → M-E ↓ M-F ← M-J</span>
          <span>Tap for diagnostics</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {machines.map((machine, idx) => {
            const details = getStatusDetails(machine.status);
            const shortName = SHORT_NAMES[machine.id] || machine.name;
            const isCritical = machine.status === 'Critical';

            return (
              <button
                key={`mobile-schematic-${machine.id}`}
                onClick={() => onOpenMachine(machine.id)}
                className={`
                  text-center p-3 rounded-2xl bg-white dark:bg-slate-900 border transition-all active:scale-[0.98]
                  flex flex-col items-center justify-between shadow-2xs
                  ${isCritical 
                    ? 'border-red-400 dark:border-red-700 shadow-sm shadow-red-500/10 ring-1 ring-red-400/20' 
                    : machine.status === 'Warning'
                    ? 'border-amber-300 dark:border-amber-700'
                    : 'border-slate-200 dark:border-slate-800'
                  }
                `}
              >
                {/* Status Dot */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: details.color }} />
                  <span className="text-[9px] font-mono text-slate-400">#{idx + 1}</span>
                </div>

                {/* Industrial Icon */}
                <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center my-1 text-primary">
                  <svg viewBox="-12 -12 24 24" className="w-5 h-5">
                    {renderIndustrialSvgIcon(machine.id, 0, 0, details.color)}
                  </svg>
                </div>

                {/* ID & Name */}
                <div className="my-0.5">
                  <p className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                    M-{machine.id}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
                    {shortName}
                  </p>
                </div>

                {/* Health & Status */}
                <div className="w-full mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {machine.health_score}%
                  </span>
                  <span 
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${details.color}20`, color: details.color }}
                  >
                    {details.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Production Flow Narrative Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-darkborder text-[11px] text-slate-400 dark:text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Continuous Manufacturing Cycle: DATA ➔ MACHINE ➔ PREDICTION ➔ MONITORING
        </span>
        <span>Top: M-A...M-E  |  Bottom: M-J...M-F</span>
      </div>

    </div>
  );
}
