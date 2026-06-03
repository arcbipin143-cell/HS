/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HospitalNode, SurgicalItem } from '../types';
import { 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Boxes, 
  HelpCircle,
  TrendingDown,
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface RedistributionHubProps {
  items: SurgicalItem[];
  hospitals: HospitalNode[];
  nodeInventories: Record<string, Record<string, number>>; // nodeId -> (sku -> qty)
  onTransfer: (sku: string, sourceId: string, destId: string, quantity: number) => { success: boolean; message: string };
}

export const RedistributionHub: React.FC<RedistributionHubProps> = ({
  items,
  hospitals,
  nodeInventories,
  onTransfer
}) => {
  const [selectedSku, setSelectedSku] = useState<string>(items[0]?.sku || '');
  const [sourceId, setSourceId] = useState<string>('CENTRAL_DEPOT');
  const [destId, setDestId] = useState<string>('');
  const [qty, setQty] = useState<number>(20);
  const [infoMessage, setInfoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize Destination Node if empty
  React.useEffect(() => {
    if (hospitals.length > 0 && !destId) {
      const activeDests = hospitals.filter(h => h.id !== sourceId);
      if (activeDests.length > 0) {
        setDestId(activeDests[0].id);
      }
    }
  }, [hospitals, sourceId, destId]);

  const activeItem = items.find(i => i.sku === selectedSku);

  // Source Available Stock Calculator
  const getSourceStock = () => {
    if (!selectedSku) return 0;
    if (sourceId === 'CENTRAL_DEPOT') {
      return activeItem ? activeItem.stockLevel : 0;
    }
    return nodeInventories[sourceId]?.[selectedSku] || 0;
  };

  const handleSourceChange = (newSrc: string) => {
    setSourceId(newSrc);
    // Ensure destination isn't same as new source
    if (newSrc === destId) {
      const other = newSrc === 'CENTRAL_DEPOT' ? hospitals[0]?.id : (newSrc === hospitals[0]?.id ? 'CENTRAL_DEPOT' : hospitals[0]?.id);
      if (other) setDestId(other);
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || !sourceId || !destId) {
      setInfoMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (sourceId === destId) {
      setInfoMessage({ type: 'error', text: 'Source and Destination cannot be the same.' });
      return;
    }

    if (qty <= 0) {
      setInfoMessage({ type: 'error', text: 'Transfer quantity must be greater than zero.' });
      return;
    }

    const maxAvail = getSourceStock();
    if (qty > maxAvail) {
      setInfoMessage({ type: 'error', text: `Insufficient stock. Only ${maxAvail} units available at source.` });
      return;
    }

    const outcome = onTransfer(selectedSku, sourceId, destId, qty);
    if (outcome.success) {
      setInfoMessage({ type: 'success', text: outcome.message });
      // Reset msg after 4s
      setTimeout(() => setInfoMessage(null), 5000);
    } else {
      setInfoMessage({ type: 'error', text: outcome.message });
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col h-full" id="redistribution-hub-root">
      {/* Header Deck */}
      <div className="mb-4 border-b border-slate-800/80 pb-3" id="redistribution-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" /> Inter-Outlet Redistribution Control
            </h2>
            <p className="text-xs text-slate-400">Balance stock between regional pharmacies, franchise clinics, and central depots to prevent stockouts.</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 font-bold uppercase">
            Optimization Engine Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* Redistribution Form Configurator */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-xl p-4 border border-emerald-950/50 flex flex-col justify-between">
          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-1.5 text-emerald-400">
              <Sparkles className="w-4 h-4" /> Transit Route Parameters
            </div>

            {/* Error / Success Alerts */}
            {infoMessage && (
              <div className={`p-2.5 rounded text-[11px] font-mono ${
                infoMessage.type === 'success' 
                  ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-400' 
                  : 'bg-rose-950/40 border border-rose-900/50 text-rose-450'
              }`}>
                {infoMessage.text}
              </div>
            )}

            {/* SKU Selector */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">Select Commodity SKU</label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 font-mono cursor-pointer"
              >
                {items.map(i => (
                  <option key={i.sku} value={i.sku}>{i.sku} - {i.name}</option>
                ))}
              </select>
            </div>

            {/* Source Facility */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-between">
                <span>Source Node Location</span>
                <span className="text-[10px] text-slate-500 font-normal normal-case">Has: <strong className="text-sky-400">{getSourceStock()}</strong> Unit(s)</span>
              </label>
              <select
                value={sourceId}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 font-mono cursor-pointer"
              >
                <option value="CENTRAL_DEPOT">🏭 Pradhan Mantri Jan Aushadhi Central Depot</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.type === 'Retail Pharmacy Center' ? '💊' : h.type === 'Franchise Distribution Hub' ? '📦' : '🏥'} {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transit Arrow Icon */}
            <div className="flex justify-center -my-1">
              <div className="bg-emerald-950/60 border border-emerald-800/20 p-1.5 rounded-full text-emerald-400 w-fit">
                <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
              </div>
            </div>

            {/* Destination Facility */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">Destination Node Location</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 font-mono cursor-pointer"
              >
                {hospitals.filter(h => h.id !== sourceId).map(h => (
                  <option key={h.id} value={h.id}>
                    {h.type === 'Retail Pharmacy Center' ? '💊' : h.type === 'Franchise Distribution Hub' ? '📦' : '🏥'} {h.name}
                  </option>
                ))}
                {sourceId !== 'CENTRAL_DEPOT' && (
                  <option value="CENTRAL_DEPOT">🏭 Pradhan Mantri Jan Aushadhi Central Depot</option>
                )}
              </select>
            </div>

            {/* Transfer Qty */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">Transfer Quantum Quantity</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={getSourceStock()}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 text-center font-mono w-24"
                />
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, getSourceStock())}
                  value={qty}
                  disabled={getSourceStock() === 0}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="flex-1 accent-emerald-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={getSourceStock() <= 0}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:from-slate-800 disabled:to-slate-900 text-white disabled:text-slate-500 text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-md shadow-emerald-950/25 border border-emerald-500/20 uppercase tracking-widest mt-2"
            >
              Dispatch Redistribution Transit
            </button>
          </form>

          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-3 mt-4 flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>Balancing materials reduces supplier freight costs by 35% compared to dispatching single shipments from the primary depot.</span>
          </div>
        </div>

        {/* Localized Retailer Stock Balances Table */}
        <div className="lg:col-span-7 bg-slate-950/30 rounded-xl p-4 border border-slate-850/60 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> Outlet-Level Live Inventory Ledgers
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Unit: Pieces/Kits</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {hospitals.map(hosp => {
                const hospInvList = Object.entries(nodeInventories[hosp.id] || {}).filter(([_, qty]) => (qty as number) > 0);
                
                return (
                  <div key={hosp.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-900 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="text-xs">
                          {hosp.type === 'Retail Pharmacy Center' ? '💊' : hosp.type === 'Franchise Distribution Hub' ? '📦' : '🏥'}
                        </span>
                        <h4 className="font-semibold text-slate-250 text-xs truncate max-w-[200px] sm:max-w-xs">{hosp.name}</h4>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 uppercase tracking-wide">
                        {hosp.type.replace(" Center", "").replace(" Hub", "")}
                      </span>
                    </div>

                    {hospInvList.length === 0 ? (
                      <div className="text-[10px] font-mono text-slate-600 italic py-1">
                        No product allocations currently at this node.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-900/60">
                        {hospInvList.map(([sku, stockQty]) => {
                          const matchedItem = items.find(i => i.sku === sku);
                          const isDeficit = matchedItem ? (stockQty as number) <= matchedItem.minRequired * 0.15 : false;
                          
                          return (
                            <div key={sku} className="bg-slate-900/50 p-1.5 rounded border border-slate-800/40 flex flex-col justify-between">
                              <span className="text-[9px] font-mono text-cyan-400 truncate font-semibold" title={matchedItem?.name}>{sku}</span>
                              <div className="flex items-baseline justify-between mt-0.5">
                                <span className={`text-[11px] font-mono font-extrabold ${isDeficit ? 'text-red-400' : 'text-slate-200'}`}>
                                  {stockQty}
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono capitalize">
                                  {matchedItem?.unit === 'unit' ? 'pcs' : 'kits'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-900/80 pt-3 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded border border-slate-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Distributor Trace Loop Ready
            </span>
            <span className="text-slate-500 text-[10px]">Autobalancing Enabled</span>
          </div>
        </div>

      </div>
    </div>
  );
};
