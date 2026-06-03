/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HospitalNode, DispatchOrder } from '../types';
import { WAREHOUSE_COORDINATES } from '../initialData';
import { Home, Navigation, FileText, Phone } from 'lucide-react';

interface InteractiveLogisticsMapProps {
  hospitals: HospitalNode[];
  orders: DispatchOrder[];
  onSelectHospital: (hospital: HospitalNode) => void;
  selectedHospital: HospitalNode | null;
  onQuickOrder: (hospital: HospitalNode) => void;
}

export const InteractiveLogisticsMap: React.FC<InteractiveLogisticsMapProps> = ({
  hospitals,
  orders,
  onSelectHospital,
  selectedHospital,
  onQuickOrder,
}) => {
  const [hoveredNode, setHoveredNode] = useState<HospitalNode | null>(null);

  // Helper to find pending urgent/critical orders for a node
  const getNodeStatus = (hospitalId: string) => {
    const list = orders.filter(o => o.hospitalId === hospitalId && o.status !== 'delivered');
    if (list.some(o => o.priority === 'critical')) return 'critical';
    if (list.some(o => o.priority === 'urgent')) return 'urgent';
    if (list.length > 0) return 'active';
    return 'idle';
  };

  return (
    <div className="relative w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 overflow-hidden shadow-2xl backdrop-blur-md flex flex-col h-full min-h-[450px]">
      {/* Header and Legend */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400 rotate-45" /> Store Refill Distribution Network
          </h2>
          <p className="text-xs text-slate-400">Interactive retail map. Hover nodes for contact data, click to initiate direct stock shipment requests.</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
            <span className="text-slate-300">Wholesale Depot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-slate-300">Critical Alert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-slate-300">Low Stock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Stocked</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative flex-1 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-900 min-h-[340px]" id="logistics-map-grid">
        {/* Aesthetic Tactical Mesh Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #38bdf8 0.5px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} 
        />
        
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full select-none"
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Subdivisions */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.1" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.1" />
          
          {/* Dispatch Track Routes (Warehouse Hub -> Retailers) */}
          {hospitals.map((h) => {
            const status = getNodeStatus(h.id);
            let strokeColor = '#334155'; // default slate-700
            let strokeWidth = '0.3';
            if (status === 'critical') {
              strokeColor = '#f43f5e'; // rose-500
              strokeWidth = '0.6';
            } else if (status === 'urgent') {
              strokeColor = '#f59e0b'; // amber-500
              strokeWidth = '0.5';
            } else if (status === 'active') {
              strokeColor = '#10b981'; // emerald-500
              strokeWidth = '0.4';
            }

            return (
              <g key={`route-${h.id}`}>
                {/* Underlay glow path */}
                {status !== 'idle' && (
                  <line
                    x1={WAREHOUSE_COORDINATES.x}
                    y1={WAREHOUSE_COORDINATES.y}
                    x2={h.coordinates.x}
                    y2={h.coordinates.y}
                    stroke={strokeColor}
                    strokeWidth={Number(strokeWidth) * 3}
                    strokeOpacity="0.25"
                    className="animate-pulse"
                  />
                )}
                {/* Core track route line */}
                <line
                  x1={WAREHOUSE_COORDINATES.x}
                  y1={WAREHOUSE_COORDINATES.y}
                  x2={h.coordinates.x}
                  y2={h.coordinates.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={status === 'idle' ? '0.4' : '0.8'}
                  className={status !== 'idle' ? 'animate-dash' : ''}
                />
              </g>
            );
          })}

          {/* Central Wholesale depot node */}
          <g transform={`translate(${WAREHOUSE_COORDINATES.x}, ${WAREHOUSE_COORDINATES.y})`}>
            {/* Pulsing glow rings around hub */}
            <circle r="4.5" fill="#38bdf8" fillOpacity="0.1" className="animate-pulse-ring" />
            <circle r="2.8" fill="#0284c7" fillOpacity="0.4" />
            <circle r="1.5" fill="#38bdf8" />
          </g>

          {/* Retailer Nodes */}
          {hospitals.map((h) => {
            const status = getNodeStatus(h.id);
            const isSelected = selectedHospital?.id === h.id;
            
            let color = '#10b981'; // healthy emerald
            let ringColor = 'rgba(16, 185, 129, 0.2)';
            let pulsePulse = false;

            if (status === 'critical') {
              color = '#f43f5e'; // critical rose-500
              ringColor = 'rgba(244, 63, 94, 0.3)';
              pulsePulse = true;
            } else if (status === 'urgent') {
              color = '#f59e0b'; // urgent amber-500
              ringColor = 'rgba(245, 158, 11, 0.3)';
              pulsePulse = true;
            } else if (status === 'active') {
              color = '#06b6d4'; // teal active
              ringColor = 'rgba(6, 182, 212, 0.2)';
            }

            return (
              <g 
                key={h.id} 
                transform={`translate(${h.coordinates.x}, ${h.coordinates.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectHospital(h)}
                onMouseEnter={() => setHoveredNode(h)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Base background highlight ring */}
                <circle 
                  r={isSelected ? '5.5' : '4'} 
                  fill={ringColor} 
                  className={pulsePulse ? 'animate-pulse-ring' : 'transition-all duration-300 group-hover:scale-125'} 
                />
                
                {/* Secondary larger outer hitzone invisible to user */}
                <circle r="8" fill="transparent" />

                {/* Node center point */}
                <circle 
                  r={isSelected ? '2.5' : '1.8'} 
                  fill={color} 
                  stroke={isSelected ? '#ffffff' : 'transparent'}
                  strokeWidth="0.4"
                  className="transition-all duration-200"
                />

                {/* Custom glowing border */}
                {isSelected && (
                  <circle r="3.5" fill="none" stroke="#60a5fa" strokeWidth="0.3" strokeDasharray="1,1" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Warehousing label */}
        <div 
          className="absolute border border-sky-500/30 bg-slate-900/90 text-[10px] py-0.5 px-2 rounded-md font-mono text-sky-450 font-semibold flex items-center gap-1 pr-1.5 shadow-md shadow-sky-950/50"
          style={{ top: '53%', left: '50.5%', transform: 'translate(-50%, -50%)' }}
        >
          🏪 WHOLESALE DEPOT
        </div>

        {/* Labels for hospitals/retailers directly on map */}
        {hospitals.map(h => (
          <div
            key={`label-${h.id}`}
            onClick={() => onSelectHospital(h)}
            className={`absolute px-1.5 py-0.5 rounded text-[9px] font-medium font-mono cursor-pointer transition-all duration-200 select-none border shadow-md transform -translate-x-1/2 -translate-y-1/2 ${
              selectedHospital?.id === h.id 
                ? 'bg-slate-100 text-slate-900 border-slate-100 font-semibold scale-105 z-20' 
                : 'bg-slate-900/80 text-slate-300 border-slate-800/80 hover:bg-slate-800 z-10'
            }`}
            style={{ 
              top: `${h.coordinates.y - 6}%`, 
              left: `${h.coordinates.x}%` 
            }}
          >
            {h.type === 'Retail Pharmacy Center' ? '💊 ' : '📦 '}
            {h.name}
          </div>
        ))}

        {/* Interactive Hover Telemetry Information Popover */}
        {hoveredNode && (
          <div 
            className="absolute z-30 pointer-events-none bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-lg text-xs font-mono w-48 shadow-xl text-slate-200"
            style={{
              top: `${hoveredNode.coordinates.y - 12 > 10 ? hoveredNode.coordinates.y - 20 : hoveredNode.coordinates.y + 12}%`,
              left: `${hoveredNode.coordinates.x - 22 < 5 ? 5 : hoveredNode.coordinates.x - 22 > 50 ? 50 : hoveredNode.coordinates.x - 22}%`,
            }}
          >
            <div className="font-semibold text-sky-400 truncate border-b border-slate-800 pb-1 mb-1">{hoveredNode.name}</div>
            <div className="text-[10px] space-y-0.5 text-slate-300">
              <div className="flex justify-between"><span>Type:</span> <span className="font-sans font-medium">{hoveredNode.type}</span></div>
              <div className="flex justify-between"><span>Urgency:</span> <span className={`font-sans font-bold uppercase rounded px-1 text-[9px] ${
                hoveredNode.urgency === 'high' ? 'bg-red-950/80 text-red-400 border border-red-900/50 animate-pulse' : 
                hoveredNode.urgency === 'medium' ? 'bg-amber-950/80 text-amber-400 border border-amber-900/50' : 
                'bg-slate-800 text-slate-300 pointer-events-none'
              }`}>{hoveredNode.urgency}</span></div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800 mt-1">
                <span>Contact:</span> 
                <span className="text-slate-400">{hoveredNode.contactNumber}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Hospital Detailed Sidebar/Footer */}
      {selectedHospital ? (
        <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-200">
          <div className="space-y-0.5">
            <div className="text-xs text-sky-400 font-mono flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <span>Selected Outlet:</span>
              <span className="text-slate-300 italic font-normal normal-case">{selectedHospital.type}</span>
            </div>
            <div className="text-sm font-semibold text-slate-100">{selectedHospital.name}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1">🏪 {selectedHospital.address}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedHospital.contactNumber}</span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => onQuickOrder(selectedHospital)}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Book Refill Order
            </button>
            <button
              onClick={() => onSelectHospital(selectedHospital)}
              className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-medium rounded-md flex items-center justify-center cursor-pointer"
              title="Clear selection"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 p-3.5 bg-slate-950/35 border border-dashed border-slate-800/80 rounded-lg text-center text-xs text-slate-400">
          💡 Click a retail outlet node on the grid to establish connections or prepare a direct stock supply demand bundle.
        </div>
      )}
    </div>
  );
};
