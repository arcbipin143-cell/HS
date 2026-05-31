/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SurgicalItem, HospitalNode, DispatchOrder, LogisticsVehicle } from '../types';
import { TrendingUp, BarChart4, PieChart, Activity, Shield, Coins, HelpCircle } from 'lucide-react';

interface LogisticsAnalyticsProps {
  items: SurgicalItem[];
  hospitals: HospitalNode[];
  orders: DispatchOrder[];
  vehicles: LogisticsVehicle[];
}

export const LogisticsAnalytics: React.FC<LogisticsAnalyticsProps> = ({
  items,
  hospitals,
  orders,
  vehicles,
}) => {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // 1. Calculate General Aggregates
  const totalSkuCount = items.length;
  const criticalItemsCount = items.filter(i => i.stockLevel <= i.minRequired).length;
  const activeDeliveriesCount = orders.filter(o => o.status === 'in-transit').length;
  const totalSupplyAssetsValue = items.reduce((sum, item) => sum + (item.stockLevel * item.unitPrice), 0);
  const totalRechargeSpend = orders.reduce((sum, ord) => sum + ord.totalCost, 0);

  // 2. Data calculation for: Surgical Stock Buffer Levels (Top 5 items)
  const topSurgicalItems = items.slice(0, 5);

  // 3. Data calculation for: Hospital Dispatch Distribution Share
  const hospitalShares = hospitals.map(hosp => {
    const totalQty = orders
      .filter(o => o.hospitalId === hosp.id && o.status === 'delivered')
      .reduce((sum, o) => {
        const itemSum = o.items.reduce((p, i) => p + i.quantity, 0);
        return sum + itemSum;
      }, 0);
    return {
      name: hosp.name,
      shortName: hosp.name.split(' ').slice(0, 2).join(' '),
      quantity: totalQty || 2, // fallback for simulation aesthetic
    };
  });

  const totalVolume = hospitalShares.reduce((s, h) => s + h.quantity, 0) || 1;

  // Pie chart variables
  let accumulatedAngle = 0;
  const radius = 28;
  const cx = 50;
  const cy = 50;

  // Colors for hospital slices
  const sliceColors = ['#1a8cff', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Analytics Main Header */}
      <div className="mb-5 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" /> Logistics Intelligence Hub
          </h2>
          <p className="text-xs text-slate-400">Tactical diagnostic analytics. Compiles real-time stocking indexes and cost indexes.</p>
        </div>
      </div>

      {/* Grid of Key Numerical Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Metric 1 */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" /> Stock Status Index
          </span>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-base font-semibold text-slate-100 font-mono">
              {totalSkuCount} <span className="text-[11px] text-slate-400 font-normal">SKUs</span>
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              criticalItemsCount > 0 ? 'bg-rose-950/80 text-rose-400' : 'bg-emerald-950/80 text-emerald-400'
            }`}>
              {criticalItemsCount} low
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> Active Transits
          </span>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-base font-semibold text-slate-100 font-mono">
              {activeDeliveriesCount} <span className="text-[11px] text-slate-400 font-normal">Vehicles</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-300 font-semibold">
              {vehicles.filter(v => v.status === 'idle').length} idle
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" /> Capital Asset Value
          </span>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-base font-semibold text-slate-100 font-mono">
              ${totalSupplyAssetsValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[9px] font-mono text-emerald-400">Live reserves</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" /> Sector Demands Sum
          </span>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-base font-semibold text-slate-100 font-mono">
              ₹{totalRechargeSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[9px] font-mono text-teal-400">{orders.length} dispatches</span>
          </div>
        </div>
      </div>

      {/* Sub-Bento Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart A: Stock Reserve Capacity (Custom pure-SVG Bar Chart) */}
        <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800/60 flex flex-col justify-between min-h-[220px]">
          <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center bg-slate-950">
            <span className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1.5">
              <BarChart4 className="w-3.5 h-3.5 text-sky-400" /> Stock Level Reserves
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Cap vs actual</span>
          </div>

          <div className="flex-1 flex flex-col justify-around gap-2 pb-1">
            {topSurgicalItems.map((item, idx) => {
              const capPercentage = Math.min(100, (item.stockLevel / item.capacity) * 100);
              const isUnderMin = item.stockLevel <= item.minRequired;
              
              return (
                <div 
                  key={idx} 
                  className="space-y-1 group"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                    <span className="truncate max-w-[170px] text-slate-250 font-sans group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-slate-400 flex gap-2">
                      <span className="text-[9px] font-sans text-slate-500">({item.stockLevel}/{item.capacity})</span>
                      <strong className={isUnderMin ? 'text-rose-400' : 'text-emerald-400'}>
                        {Math.round(capPercentage)}%
                      </strong>
                    </span>
                  </div>
                  {/* Custom Progress Bar with Reorder line helper */}
                  <div className="relative w-full h-2.5 bg-slate-900 rounded border border-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-r transition-all duration-300 ${
                        isUnderMin ? 'bg-amber-500/80' : 'bg-emerald-500/80 animate-pulse-sluggish'
                      }`}
                      style={{ width: `${capPercentage}%` }}
                    />
                    {/* Minimum target dash overlay */}
                    <div 
                      className="absolute top-0 bottom-0 w-[1.5px] bg-amber-400 z-10 opacity-70"
                      style={{ left: `${(item.minRequired / item.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart B: Hospital Demand Share (Custom pure-SVG Pie/Donut Chart) */}
        <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800/60 flex flex-col justify-between min-h-[220px]">
          <div className="border-b border-slate-900 pb-2 mb-3 flex justify-between items-center bg-slate-950">
            <span className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-pink-400" /> Regional Delivery Volume Shares
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Unit ratios</span>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4">
            {/* Donuts SVG rendering */}
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Master background outline circle */}
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#101726" strokeWidth="8" />
                
                {hospitalShares.map((share, idx) => {
                  const fraction = share.quantity / totalVolume;
                  const strokeWidth = 8;
                  const circumference = 2 * Math.PI * radius;
                  const strokeLength = fraction * circumference;
                  const strokeOffset = circumference - accumulatedAngle;
                  accumulatedAngle += strokeLength;

                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="none"
                      stroke={sliceColors[idx % sliceColors.length]}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Central Text Panel for summary */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center select-none bg-slate-950 rounded-full m-[10px]">
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {totalVolume > 8 ? totalVolume - 8 : totalVolume}
                </span>
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">Deliveries</span>
              </div>
            </div>

            {/* Custom List Legend info */}
            <div className="flex-1 space-y-1 w-full sm:w-auto">
              {hospitalShares.map((share, idx) => {
                const fraction = share.quantity / totalVolume;
                const percentage = Math.round(fraction * 100);
                const color = sliceColors[idx % sliceColors.length];

                return (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-sans text-slate-350">
                    <span className="flex items-center gap-1.5 truncate max-w-[130px]">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate text-slate-300 font-mono font-medium text-[10px]">{share.shortName}</span>
                    </span>
                    <span className="font-mono text-slate-400 ml-1.5 flex gap-1 font-semibold">
                      <span>({share.quantity})</span>
                      <strong className="text-slate-200">{percentage}%</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
