/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SurgicalItem } from '../types';
import { Search, AlertTriangle, CheckCircle2, Package, RefreshCw, Layers, Plus, X, Edit, Trash2, Check } from 'lucide-react';

interface InventoryTableProps {
  items: SurgicalItem[];
  onReplenish: (sku: string, amount: number) => void;
  suppliers: string[];
  onAddItem?: (item: SurgicalItem) => void;
  onEditItem?: (item: SurgicalItem) => void;
  onRemoveItem?: (sku: string) => void;
}

type TabType = 'All' | 'Instruments' | 'Consumables' | 'Specialized' | 'PPE';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onReplenish,
  suppliers,
  onAddItem,
  onEditItem,
  onRemoveItem,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TabType>('Instruments');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [stockLevel, setStockLevel] = useState(500);
  const [minRequired, setMinRequired] = useState(200);
  const [capacity, setCapacity] = useState(1000);
  const [unit, setUnit] = useState('unit');
  const [unitPrice, setUnitPrice] = useState(150);
  const [wholesalePrice, setWholesalePrice] = useState(100);
  const [formError, setFormError] = useState('');

  // Editing state
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [deletingSku, setDeletingSku] = useState<string | null>(null);

  // Filter items based on search queries, tab types, and stock alerts
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Tab selection filter
      if (activeTab !== 'All' && item.category !== activeTab) return false;
      
      // Critical stock status filter
      if (showLowStockOnly && item.stockLevel > item.minRequired) return false;

      // Text search matching SKU, Name, and Supplier
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [items, activeTab, searchQuery, showLowStockOnly]);

  const startEditItem = (item: SurgicalItem) => {
    setEditingSku(item.sku);
    setSku(item.sku);
    setName(item.name);
    setCategory(item.category);
    setSelectedSupplier(item.supplier);
    setStockLevel(item.stockLevel);
    setMinRequired(item.minRequired);
    setCapacity(item.capacity);
    setUnit(item.unit);
    setUnitPrice(item.unitPrice);
    setWholesalePrice(item.wholesalePrice || Math.round(item.unitPrice * 0.75));
    setFormError('');
    setShowAddForm(true);

    // Scroll to form header
    const element = document.getElementById('inventory-form-heading');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    setSku('');
    setName('');
    setCategory('Instruments');
    setSelectedSupplier('');
    setStockLevel(500);
    setMinRequired(200);
    setCapacity(1000);
    setUnit('unit');
    setUnitPrice(150);
    setWholesalePrice(100);
    setFormError('');
    setEditingSku(null);
    setShowAddForm(false);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedSku = sku.trim().toUpperCase();
    const trimmedName = name.trim();
    const finalSupplier = selectedSupplier || suppliers[0] || 'Central Reserves';

    if (!trimmedSku || !trimmedName) {
      setFormError('SKU and Name are required fields.');
      return;
    }

    if (!editingSku && items.some(item => item.sku.toUpperCase() === trimmedSku)) {
      setFormError(`An item with SKU "${trimmedSku}" is already in the inventory database.`);
      return;
    }

    const compiledItem: SurgicalItem = {
      sku: trimmedSku,
      name: trimmedName,
      category: category === 'All' ? 'Instruments' : category,
      supplier: finalSupplier,
      stockLevel: Number(stockLevel) || 0,
      minRequired: Number(minRequired) || 0,
      capacity: Number(capacity) || 1000,
      unit,
      unitPrice: Number(unitPrice) || 0,
      wholesalePrice: Number(wholesalePrice) || Math.round(Number(unitPrice) * 0.75),
      lastUpdated: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    if (editingSku) {
      if (onEditItem) onEditItem(compiledItem);
    } else {
      if (onAddItem) onAddItem(compiledItem);
    }

    handleCancel();
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col h-full">
      {/* Action Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-sky-400" /> Surgical Materiels Depot
          </h2>
          <p className="text-xs text-slate-400">Real-time inventory levels, reorder buffers, and supplier dispatch commands.</p>
        </div>

        {/* Search, Filter Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onAddItem && (
            <button
              onClick={() => {
                if (showAddForm) {
                  handleCancel();
                } else {
                  setShowAddForm(true);
                  if (suppliers.length > 0 && !selectedSupplier) {
                    setSelectedSupplier(suppliers[0]);
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showAddForm
                  ? 'bg-slate-800 text-slate-350 border border-slate-700'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/20 border border-sky-500/20'
              }`}
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddForm ? (editingSku ? 'Cancel Editing' : 'Close Form') : 'Register Item'}
            </button>
          )}

          {/* Quick Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search SKU, name, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-100 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 block w-full pl-9 pr-3 py-1.5 font-sans"
            />
          </div>

          {/* Quick Critical Alerts Filter */}
          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors select-none">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={() => setShowLowStockOnly(!showLowStockOnly)}
              className="accent-rose-500 h-3.5 w-3.5 rounded border-slate-800 bg-slate-950 focus:ring-red-500"
            />
            <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Reserve Warning Only
            </span>
          </label>
        </div>
      </div>

      {/* Embedded Collapsible Add / Edit Surgical Item Form */}
      {showAddForm && (
        <form onSubmit={handleAddItemSubmit} className="mb-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2" id="inventory-form-heading">
            <h3 className="text-xs font-semibold font-mono text-slate-200 tracking-wider uppercase">
              {editingSku ? `EDIT SURGICAL MATERIEL: ${editingSku}` : 'REGISTER NEW SURGICAL MATERIEL'}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Assigned to Local Supply Nodes</span>
          </div>

          {formError && (
            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/55 text-rose-450 text-[11px] flex gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-450" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">SKU CODE / IDENTIFIER *</label>
              <input
                type="text"
                placeholder="e.g. S-INST-778"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                disabled={!!editingSku}
                className={`w-full bg-slate-900 border rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none ${
                  editingSku ? 'border-slate-800 text-slate-500 cursor-not-allowed bg-slate-950/20' : 'border-slate-800 focus:border-cyan-500'
                }`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-slate-400 mb-1">ITEM NOMENCLATURE / DESC *</label>
              <input
                type="text"
                placeholder="e.g. Titanium Osteosynthesis Microscrews"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-slate-750"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">MATERIEL CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TabType)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="Instruments">Instruments</option>
                <option value="Consumables">Consumables</option>
                <option value="Specialized">Specialized</option>
                <option value="PPE">PPE</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">ASSIGNED SUPPLIER CONTRACT</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
              >
                {suppliers.map((sup) => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
                {suppliers.length === 0 && <option value="Central Reserves">Central Reserves</option>}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">PACKING UNIT</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="unit">Individual Unit (pcs)</option>
                <option value="box">Surgical Kit (kits)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">STOCK LEVEL</label>
              <input
                type="number"
                min="0"
                value={stockLevel}
                onChange={(e) => setStockLevel(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">BUFFER THRESHOLD</label>
              <input
                type="number"
                min="0"
                value={minRequired}
                onChange={(e) => setMinRequired(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">DEPOT CAPACITY</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1000))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>WHOLESALE COST</span>
                <span className="text-sky-400 text-[9px]">Buy Rate</span>
              </label>
              <input
                type="number"
                min="0"
                value={wholesalePrice}
                onChange={(e) => {
                  const ws = Math.max(0, parseFloat(e.target.value) || 0);
                  setWholesalePrice(ws);
                  if (unitPrice === 0 || unitPrice < ws) {
                    setUnitPrice(Math.round(ws * 1.2));
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>RETAIL SELL PRICE</span>
                <span className="text-amber-400 text-[9px]">Sell Rate</span>
              </label>
              <input
                type="number"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-md shadow-sky-950/20"
            >
              {editingSku ? 'Confirm Changes' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      )}

      {/* Category Selection Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4 border-b border-slate-800/40 pb-2">
        {(['All', 'Instruments', 'Consumables', 'Specialized', 'PPE'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-sky-500/15 text-sky-450 border border-sky-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Item Count readout */}
      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
        <span>Showing {filteredItems.length} of {items.length} materials</span>
        {items.some(i => i.stockLevel <= i.minRequired) && (
          <span className="text-amber-400 flex items-center gap-1">
            ⚠️ {items.filter(i => i.stockLevel <= i.minRequired).length} triggers flagged for reorder
          </span>
        )}
      </div>

      {/* Inventory Scroll Container */}
      <div className="flex-1 overflow-x-auto rounded-lg border border-slate-950 bg-slate-950/40 min-h-[250px]">
        <table className="w-full text-left text-xs font-sans divide-y divide-slate-900 border-collapse">
          <thead className="bg-[#0f172a]/80 text-slate-400 font-mono text-[10px] uppercase tracking-wider sticky top-0 z-10 backdrop-blur">
            <tr>
              <th className="py-2.5 px-3">SKU & Item Name</th>
              <th className="py-2.5 px-2">Category</th>
              <th className="py-2.5 px-2">Supplier Partner</th>
              <th className="py-2.5 px-2 text-center w-36">Stock Safety Buffer</th>
              <th className="py-2.5 px-2 text-right">Units Count</th>
              <th className="py-2.5 px-3 text-center">Refill</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-slate-300 font-sans">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500 font-mono text-xs">
                  <Layers className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                  No matching surgical items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isUnderMin = item.stockLevel <= item.minRequired;
                const isVeryLow = item.stockLevel <= item.minRequired * 0.4;
                
                // Color codes
                let statusBadge = (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-900/50 flex items-center gap-1 max-w-fit">
                    <CheckCircle2 className="w-2.5 h-2.5" /> STABLE
                  </span>
                );

                if (isVeryLow) {
                  statusBadge = (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-rose-950/80 text-rose-450 border border-rose-900/50 flex items-center gap-1 max-w-fit animate-pulse">
                      🚨 DEFICIT
                    </span>
                  );
                } else if (isUnderMin) {
                  statusBadge = (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-amber-950/80 text-amber-400 border border-amber-900/50 flex items-center gap-1 max-w-fit">
                      ⚠️ REORDER
                    </span>
                  );
                }

                // Buffer bar percentage calculations
                const stockPercentage = Math.min(100, Math.max(0, (item.stockLevel / item.capacity) * 100));
                const safetyPercentage = (item.minRequired / item.capacity) * 100;

                return (
                  <tr 
                    key={item.sku} 
                    className={`hover:bg-slate-900/40 transition-colors ${
                      isUnderMin ? 'bg-rose-950/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-mono text-[10px] text-sky-400 leading-none">{item.sku}</div>
                      <div className="font-medium text-slate-100 text-xs mt-1 leading-snug">{item.name}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-xs text-slate-300 font-sans leading-tight font-medium">{item.supplier}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                        <span className="text-slate-550">
                          Buy: <span className="text-sky-400 font-semibold">₹{(item.wholesalePrice || Math.round(item.unitPrice * 0.75)).toLocaleString()}</span>
                        </span>
                        <span className="text-slate-700 font-light">•</span>
                        <span className="text-slate-550">
                          Sell: <span className="text-amber-400 font-semibold">₹{item.unitPrice.toLocaleString()}</span>
                        </span>
                        <span className="text-slate-700 font-light">•</span>
                        <span className="text-slate-550">
                          Margin: <span className="text-emerald-400 font-semibold">+{Math.max(0, Math.round(((item.unitPrice - (item.wholesalePrice || Math.round(item.unitPrice * 0.75))) / (item.wholesalePrice || Math.round(item.unitPrice * 0.75))) * 100))}%</span>
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                        Logistics Trace: {item.lastUpdated}
                      </div>
                    </td>
                    
                    {/* Reorder and Maximum Buffer Graphical Visualizer */}
                    <td className="py-3 px-2 text-center select-none">
                      <div className="relative w-full h-4 bg-slate-900 rounded-md border border-slate-800 overflow-hidden mt-1 group cursor-help">
                        {/* Buffer bar filling */}
                        <div 
                          className={`h-full rounded-l transition-all duration-300 ${
                            isVeryLow ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                            isUnderMin ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                            'bg-gradient-to-r from-teal-600 to-emerald-500'
                          }`}
                          style={{ width: `${stockPercentage}%` }}
                        />
                        {/* Minimum trigger target marker */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-rose-450/80 z-20"
                          title={`Safety Reserve Point: ${item.minRequired}`}
                          style={{ left: `${safetyPercentage}%` }}
                        />
                        
                        {/* Hover Overlay Percentage readout */}
                        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center text-[9px] font-mono font-semibold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85">
                          Capacity Used: {Math.round(stockPercentage)}%
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-0.5">
                        <span>Safe: {item.minRequired}</span>
                        <span>Max: {item.capacity}</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-right font-sans">
                      <div className="font-mono text-xs font-bold text-slate-100">
                        {item.stockLevel.toLocaleString()} <span className="font-sans text-[10px] text-slate-500 font-normal">{item.unit === "unit" ? "pcs" : "kits"}</span>
                      </div>
                      <div className="mt-0.5">{statusBadge}</div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onReplenish(item.sku, 100)} // Refill with standard lot of 100
                        className="p-1 px-2 bg-slate-805 hover:bg-sky-955 hover:text-sky-300 hover:border-sky-800 text-slate-300 border border-slate-705 rounded font-mono text-[10px] transition-all flex items-center gap-1 mx-auto cursor-pointer bg-slate-900"
                        title={`Refill stock (+100 ${item.unit})`}
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> +100
                      </button>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {deletingSku === item.sku ? (
                        <div className="flex items-center gap-1 bg-slate-950 border border-red-500/30 p-1 rounded justify-center animate-fade-in min-w-[70px]">
                          <button
                            onClick={() => {
                              if (onRemoveItem) onRemoveItem(item.sku);
                              setDeletingSku(null);
                            }}
                            className="p-1 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer"
                            title="Confirm Retire"
                          >
                            <Check className="w-3 h-3 text-white pointer-events-none" />
                          </button>
                          <button
                            onClick={() => setDeletingSku(null)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3 text-slate-400 pointer-events-none" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                          {onEditItem && (
                            <button
                              onClick={() => startEditItem(item)}
                              className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                              title="Edit item specs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onRemoveItem && (
                            <button
                              onClick={() => setDeletingSku(item.sku)}
                              className="p-1 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/40 text-slate-450 hover:text-red-400 rounded transition-colors cursor-pointer"
                              title="Retire item from depot"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
