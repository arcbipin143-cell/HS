/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DispatchOrder, HospitalNode, SurgicalItem, LogisticsVehicle, OrderPriority, OrderItem } from '../types';
import { Truck, ShieldAlert, AlertTriangle, Play, Calendar, User, FilePlus2, X, Plus, Layers, Sparkles, ShoppingBag } from 'lucide-react';

interface HospitalOrdersListProps {
  orders: DispatchOrder[];
  hospitals: HospitalNode[];
  items: SurgicalItem[];
  vehicles: LogisticsVehicle[];
  onAddOrder: (newOrder: Omit<DispatchOrder, 'id' | 'createdAt' | 'totalCost'>) => void;
  onDispatchOrder: (orderId: string, vehicleId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onEditOrder?: (updatedOrder: DispatchOrder) => void;
  selectedHospitalForOrder: HospitalNode | null;
  onClearSelectedHospital: () => void;
}

export const HospitalOrdersList: React.FC<HospitalOrdersListProps> = ({
  orders,
  hospitals,
  items,
  vehicles,
  onAddOrder,
  onDispatchOrder,
  onCancelOrder,
  onEditOrder,
  selectedHospitalForOrder,
  onClearSelectedHospital,
}) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formHospitalId, setFormHospitalId] = useState('');
  const [formPriority, setFormPriority] = useState<OrderPriority>('routine');
  
  // Multiple item selection state
  const [selectedSku, setSelectedSku] = useState('');
  const [selectedQty, setSelectedQty] = useState(10);
  const [formItemsList, setFormItemsList] = useState<OrderItem[]>([]);

  // Open form automatically when map selects hospital
  React.useEffect(() => {
    if (selectedHospitalForOrder) {
      setFormHospitalId(selectedHospitalForOrder.id);
      setShowOrderForm(true);
    }
  }, [selectedHospitalForOrder]);

  // Handle addition of materials to local builder list
  const addItemsToOrderBuilder = () => {
    if (!selectedSku) return;
    const itemRef = items.find(i => i.sku === selectedSku);
    if (!itemRef) return;

    // Check if SKU is already added
    const existingIndex = formItemsList.findIndex(entry => entry.sku === selectedSku);
    if (existingIndex > -1) {
      const updated = [...formItemsList];
      updated[existingIndex].quantity += Number(selectedQty);
      setFormItemsList(updated);
    } else {
      setFormItemsList([...formItemsList, { sku: selectedSku, name: itemRef.name, quantity: Number(selectedQty) }]);
    }
  };

  const removeBuilderItem = (sku: string) => {
    setFormItemsList(formItemsList.filter(i => i.sku !== sku));
  };

  // Submit compiled order to active queue
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHospitalId) return;
    if (formItemsList.length === 0) {
      alert("Please add at least one surgical item to the dispatch kit.");
      return;
    }

    const targetHosp = hospitals.find(h => h.id === formHospitalId);
    if (!targetHosp) return;

    onAddOrder({
      hospitalId: formHospitalId,
      hospitalName: targetHosp.name,
      items: formItemsList,
      priority: formPriority,
      status: 'requested'
    });

    // Reset Form
    setFormItemsList([]);
    setSelectedSku('');
    setFormHospitalId('');
    setShowOrderForm(false);
    onClearSelectedHospital();
  };

  // Helper to determine priority classes
  const getPriorityClasses = (priority: OrderPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-950/80 text-red-400 border-red-800 animate-pulse';
      case 'urgent':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'routine':
        return 'bg-blue-950/60 text-blue-400 border-blue-900';
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'preparing':
        return 'bg-violet-950/80 text-violet-300 border-violet-900/60';
      case 'in-transit':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-900/60';
      case 'delivered':
        return 'bg-slate-900/50 text-slate-500 border-slate-800';
      default:
        return 'bg-slate-800 text-slate-400 border-transparent';
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col h-full">
      {/* Panel Headers */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Regional Dispatch Queue
          </h2>
          <p className="text-xs text-slate-400">Review pending surgical hospital supplies, check priority routing protocols.</p>
        </div>
        
        {!showOrderForm && (
          <button
            onClick={() => setShowOrderForm(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FilePlus2 className="w-3.5 h-3.5" /> Request Dispatch
          </button>
        )}
      </div>

      {/* Dynamic Slide Drawer / Embedded Request Creator Form */}
      {showOrderForm && (
        <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-lg mb-4 text-xs font-sans text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
            <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Compile Surgical Dispatch Kit
            </h3>
            <button 
              onClick={() => {
                setShowOrderForm(false);
                onClearSelectedHospital();
                setFormItemsList([]);
              }}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {/* Hospital Picker */}
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Destination Center</label>
              <select
                required
                value={formHospitalId}
                onChange={(e) => setFormHospitalId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Choose Hospital Node --</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
                ))}
              </select>
            </div>

            {/* Priority Picker */}
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Medical Triage Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(['routine', 'urgent', 'critical'] as OrderPriority[]).map((pri) => (
                  <button
                    key={pri}
                    type="button"
                    onClick={() => setFormPriority(pri)}
                    className={`py-1 rounded border text-center font-mono capitalize text-[11px] cursor-pointer ${
                      formPriority === pri
                        ? pri === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500' : 
                          pri === 'urgent' ? 'bg-amber-500/20 text-amber-400 border-amber-500' :
                          'bg-sky-500/20 text-sky-400 border-sky-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {pri}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Materials Kit Builder (Additive) */}
            <div className="border border-slate-900 bg-slate-900/10 p-2.5 rounded-md">
              <label className="block text-sky-400 font-semibold mb-1 w-full font-mono text-[10px] uppercase tracking-wider">
                Assemble Instruments & Consumables
              </label>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <select
                    value={selectedSku}
                    onChange={(e) => setSelectedSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-1.5 rounded focus:outline-none text-[11px]"
                  >
                    <option value="">-- Click to select items --</option>
                    {items.map(i => (
                      <option key={i.sku} value={i.sku} disabled={i.stockLevel <= 0}>
                        {i.sku} | {i.name} ({i.stockLevel} left)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-1.5 rounded font-mono text-center text-[11px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={addItemsToOrderBuilder}
                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-slate-100 font-medium text-[11px] flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Current temporary kit items */}
              {formItemsList.length > 0 ? (
                <div className="mt-2.5 space-y-1.5 border-t border-slate-900/60 pt-2 text-[11px]">
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-tight">Kitted Items:</p>
                  {formItemsList.map((kitItem) => (
                    <div key={kitItem.sku} className="flex justify-between items-center bg-slate-900/50 px-2 py-1 rounded text-[11px]">
                      <span className="truncate text-slate-200">
                        <span className="font-mono text-sky-400 pr-1">{kitItem.sku}</span>— {kitItem.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-400">x{kitItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => removeBuilderItem(kitItem.sku)}
                          className="text-rose-400 hover:text-rose-300 p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic mt-2.5 text-center text-[10px] font-mono">No items kitted yet.</p>
              )}
            </div>

            {/* Submission Actions */}
            <button
              type="submit"
              className="w-full text-center py-2 bg-sky-600 hover:bg-sky-500 rounded font-semibold text-white tracking-wide cursor-pointer transition-colors"
            >
              Push Request to Active Fleet Queue
            </button>
          </form>
        </div>
      )}

      {/* Main Queue Dashboard Display */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-1">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
            <Plus className="w-8 h-8 text-slate-800 mb-1" />
            No dispatch protocols active in this sector.
          </div>
        ) : (
          orders.map((ord) => {
            const isRequested = ord.status === 'requested';
            const isDelivered = ord.status === 'delivered';
            
            // Available vehicle listing
            const idleVehicles = vehicles.filter(v => v.status === 'idle');

            return (
              <div 
                key={ord.id} 
                className={`p-3.5 border rounded-lg bg-slate-950/80 transition-all duration-300 relative overflow-hidden ${
                  ord.priority === 'critical' && ord.status !== 'delivered'
                    ? 'border-red-950 shadow-md shadow-red-950/10'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Visual Accent glow line */}
                {ord.priority === 'critical' && ord.status !== 'delivered' && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 to-rose-400 animate-pulse" />
                )}

                {/* Priority / Badge Headers */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap border-b border-slate-900 pb-2 mb-2">
                  <div>
                    <span className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{ord.id}</span>
                    <span className="text-slate-600 mx-1">•</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border text-center uppercase tracking-wide ${getPriorityClasses(ord.priority)}`}>
                      {ord.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono border text-center uppercase tracking-wider ${getStatusClasses(ord.status)}`}>
                      {ord.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Hospital Node Detail */}
                <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5 truncate">
                  <span className="text-sky-400 text-xs">🏥</span> {ord.hospitalName}
                </h4>

                {/* Materials Manifest checklist details */}
                <div className="mt-2 text-[11px] bg-slate-900/40 p-2 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-tight">Supply Bundle Contents:</span>
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300 font-sans">
                      <span className="truncate max-w-[180px]">{it.name}</span>
                      <span className="font-mono font-bold text-teal-400 text-right pr-1">x{it.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900/60 mt-1">
                    <span>Aggregate Kit Cost:</span>
                    <span className="text-slate-200 font-semibold">₹{ord.totalCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* LIVE PROCESS ACTION HANDLERS */}
                
                {/* 1. If dispatch is Requested - User schedules vehicle */}
                {isRequested && (
                  <div className="mt-3.5 border-t border-slate-900 pt-3 text-[11px]">
                    <p className="text-sky-400 font-semibold font-mono text-[10px] uppercase mb-2 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-sky-400" /> Assign Specialized Transport
                    </p>
                    
                    {idleVehicles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {idleVehicles.map((v) => {
                          let typeShort = v.type === 'emergency-courier' ? '⚡ Courier' : v.type === 'refrigerated-truck' ? '❄️ Cold' : '📦 Van';
                          let hoverSpeed = v.type === 'emergency-courier' ? 'Fast' : v.type === 'refrigerated-truck' ? 'Safe' : 'Medium';
                          
                          return (
                            <button
                              key={v.id}
                              onClick={() => onDispatchOrder(ord.id, v.id)}
                              className="px-2 py-2 bg-slate-900 hover:bg-emerald-950/40 hover:border-emerald-800 text-[10px] font-mono rounded text-slate-300 border border-slate-800 transition-all flex flex-col justify-center items-center gap-0.5 cursor-pointer group text-center"
                            >
                              <span className="font-bold text-slate-100 group-hover:text-emerald-400">{v.name.split(' (')[0]}</span>
                              <span className="text-[9px] text-slate-400">{typeShort} ({hoverSpeed})</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2 text-center text-amber-500 font-mono text-[10px] bg-amber-950/20 border border-amber-900/40 rounded">
                        ⚠️ Logistical hold: All fleet vehicles are currently active routing material. Waiting for returning craft.
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900/60">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Triage:</span>
                        {(['routine', 'urgent', 'critical'] as OrderPriority[]).map((pri) => (
                          <button
                            key={pri}
                            type="button"
                            onClick={() => {
                              if (onEditOrder) {
                                onEditOrder({ ...ord, priority: pri });
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-colors ${
                              ord.priority === pri
                                ? pri === 'critical' ? 'bg-red-800 text-white font-bold' : 
                                  pri === 'urgent' ? 'bg-amber-800 text-white font-bold' :
                                  'bg-blue-800 text-white font-bold'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-805 hover:text-slate-200'
                            }`}
                          >
                            {pri}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => onCancelOrder(ord.id)}
                        className="text-[10px] font-mono text-rose-500 hover:text-rose-400 cursor-pointer block text-right font-medium"
                      >
                        Delete request
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Process monitoring (preparing/in-transit/delivered) */}
                {ord.status === 'preparing' && (
                  <div className="mt-3 text-slate-400 text-[11px] font-sans flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-violet-500 rounded-full animate-ping pr-1" />
                    Hub Team assembling surgical instruments for tracking validation. Auto-dispatch protocol starting shortly.
                  </div>
                )}

                {ord.status === 'in-transit' && (
                  <div className="mt-3 text-emerald-400 text-[11px] font-mono p-1 px-2 border border-emerald-900/30 bg-emerald-950/20 rounded flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 animate-bounce" /> Transiting via Courier {ord.vehicleId}
                    </span>
                    <span>ETA: in progress</span>
                  </div>
                )}

                {isDelivered && (
                  <div className="mt-2.5 text-[10px] text-slate-500 font-mono flex justify-between items-center border-t border-slate-900 pt-2.5">
                    <span>Delivered and Verified</span>
                    <span>✔️ Complete</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
