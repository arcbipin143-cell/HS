/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DispatchOrder, HospitalNode, SurgicalItem, OrderPriority, OrderItem } from '../types';
import { ShieldAlert, FilePlus2, X, Plus, Sparkles, CheckCircle } from 'lucide-react';

interface HospitalOrdersListProps {
  orders: DispatchOrder[];
  hospitals: HospitalNode[];
  items: SurgicalItem[];
  onAddOrder: (newOrder: Omit<DispatchOrder, 'id' | 'createdAt' | 'totalCost'>) => void;
  onDispatchOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onEditOrder?: (updatedOrder: DispatchOrder) => void;
  selectedHospitalForOrder: HospitalNode | null;
  onClearSelectedHospital: () => void;
}

export const HospitalOrdersList: React.FC<HospitalOrdersListProps> = ({
  orders,
  hospitals,
  items,
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
      alert("Please add at least one item to the supply list.");
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
        return 'bg-amber-900/30 text-amber-400 border-amber-800/60';
      case 'delivered':
        return 'bg-slate-900/50 text-slate-500 border-slate-800';
      default:
        return 'bg-slate-800 text-slate-450 border-transparent';
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col h-full">
      {/* Panel Headers */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-405" /> Retailer Purchase Orders Ledger
          </h2>
          <p className="text-xs text-slate-400">Review pending store refill requests, check distributor shipment protocol.</p>
        </div>
        
        {!showOrderForm && (
          <button
            onClick={() => setShowOrderForm(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FilePlus2 className="w-3.5 h-3.5" /> New Refill Request
          </button>
        )}
      </div>

      {/* Dynamic Slide Drawer / Embedded Request Creator Form */}
      {showOrderForm && (
        <form onSubmit={handleFormSubmit} className="bg-slate-950 p-4 border border-slate-800/80 rounded-lg mb-4 text-xs font-sans text-slate-300 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Compile Retail Refill Supply Kit
            </h3>
            <button 
              type="button"
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

          {/* Hospital Picker */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Destination Retailer Outlet</label>
            <select
              required
              value={formHospitalId}
              onChange={(e) => setFormHospitalId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2 rounded-md focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Choose Retail Branch Node --</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
              ))}
            </select>
          </div>

          {/* Priority Picker */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Fulfillment Urgency</label>
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
              Assemble Products & Batches
            </label>
            
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-1.5 rounded focus:outline-none text-[11px]"
                >
                  <option value="">-- Select stock items --</option>
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
                <p className="text-slate-400 font-mono text-[9px] uppercase tracking-tight">Kitted Products:</p>
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
              <p className="text-slate-500 italic mt-2.5 text-center text-[10px] font-mono">No items added to demand list yet.</p>
            )}
          </div>

          {/* Submission Actions */}
          <button
            type="submit"
            className="w-full text-center py-2 bg-sky-600 hover:bg-sky-500 rounded font-semibold text-white tracking-wide cursor-pointer transition-colors"
          >
            Submit Refill Purchase Order
          </button>
        </form>
      )}

      {/* Main Queue Dashboard Display */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-1">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
            <Plus className="w-8 h-8 text-slate-800 mb-1" />
            No active retail purchase orders in this sector.
          </div>
        ) : (
          orders.map((ord) => {
            const isRequested = ord.status === 'requested' || ord.status === 'preparing' || ord.status === 'in-transit';
            const isDelivered = ord.status === 'delivered';
            
            return (
              <div 
                key={ord.id} 
                className={`p-3.5 border rounded-lg bg-slate-950/80 transition-all duration-300 relative overflow-hidden ${
                  ord.priority === 'critical' && !isDelivered
                    ? 'border-red-950 shadow-md shadow-red-950/10'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Visual Accent glow line */}
                {ord.priority === 'critical' && !isDelivered && (
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
                      {isDelivered ? 'delivered' : 'pending'}
                    </span>
                  </div>
                </div>

                {/* Retailer Node Detail */}
                <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5 truncate">
                  <span className="text-sky-400 text-xs">💊</span> {ord.hospitalName}
                </h4>

                {/* Materials Manifest checklist details */}
                <div className="mt-2 text-[11px] bg-slate-900/40 p-2 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-tight">Purchase Refill Contents:</span>
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300 font-sans">
                      <span className="truncate max-w-[180px]">{it.name}</span>
                      <span className="font-mono font-bold text-teal-400 text-right pr-1">x{it.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900/60 mt-1">
                    <span>Invoice Wholesale Value:</span>
                    <span className="text-slate-200 font-semibold">₹{ord.totalCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* LIVE PROCESS ACTION HANDLERS */}
                
                {/* 1. If dispatch is Requested - User approves & ships instantly */}
                {isRequested && (
                  <div className="mt-3.5 border-t border-slate-900 pt-3 flex flex-col gap-2">
                    <button
                      onClick={() => onDispatchOrder(ord.id)}
                      className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold font-sans rounded-md border border-emerald-500/10 transition-all flex justify-center items-center gap-1.5 cursor-pointer text-center"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-100" /> Approve & Deliver Order Instantly
                    </button>
                    
                    <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-slate-900/40">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Urgency:</span>
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
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
                        Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {isDelivered && (
                  <div className="mt-2.5 text-[10px] text-slate-500 font-mono flex justify-between items-center border-t border-slate-900 pt-2.5">
                    <span>Delivered and Replenished</span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">✔️ FULFILLED</span>
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
