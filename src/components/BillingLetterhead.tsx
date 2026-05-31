/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HospitalNode, DispatchOrder, SurgicalItem } from '../types';
import { 
  FileText, 
  Building2, 
  Truck, 
  Printer, 
  Settings, 
  DollarSign, 
  FileCheck, 
  Hash, 
  TrendingUp, 
  UserCheck, 
  Briefcase, 
  Percent, 
  Calendar, 
  Clipboard,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  Download,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface BillingLetterheadProps {
  hospitals: HospitalNode[];
  orders: DispatchOrder[];
  suppliers: string[];
  items: SurgicalItem[];
  onReplenish?: (sku: string, amount: number) => void;
}

export const BillingLetterhead: React.FC<BillingLetterheadProps> = ({
  hospitals,
  orders,
  suppliers,
  items,
  onReplenish
}) => {
  // Mode Selection: 'retailer' (Hospitals buying from Depot/Hub) vs 'supplier' (Depot/Hub buying from Manufacturer)
  const [billingMode, setBillingMode] = useState<'retailer' | 'supplier'>('retailer');

  // Common Configurations
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(1005 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState('2026-05-31');
  const [dueDate, setDueDate] = useState('2026-06-30');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [taxRate, setTaxRate] = useState<number>(12); // percentage
  const [logoStyle, setLogoStyle] = useState<'corporate' | 'emergency' | 'tech'>('emergency');
  const [authorizedSignee, setAuthorizedSignee] = useState('Dr. Priya Sharma (Logistics Chair)');
  const [documentStamp, setDocumentStamp] = useState<'NONE' | 'APPROVED' | 'PAID' | 'PENDING' | 'URGENT'>('APPROVED');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Retailer (Hospital) flow states
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all-summary'); // can be custom aggregated or specific order
  const [retailerCustomItems, setRetailerCustomItems] = useState<{ sku: string; name: string; qty: number; rate: number }[]>([]);

  // Inline row-editing states
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editItemName, setEditItemName] = useState<string>('');
  const [editItemQty, setEditItemQty] = useState<number>(0);
  const [editItemRate, setEditItemRate] = useState<number>(0);
  
  // Supplier flow states
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>('');
  const [supplierCustomItems, setSupplierCustomItems] = useState<{ sku: string; name: string; quantity: number; unitPrice: number }[]>([
    { sku: 'SURG-KIT-77', name: 'Premium Surgical Blade Packs', quantity: 15, unitPrice: 120 },
    { sku: 'SURG-STP-12', name: 'Titanium Orthopedic Bone Staplers', quantity: 8, unitPrice: 420 },
  ]);
  const [newSupplierItemName, setNewSupplierItemName] = useState('');
  const [newSupplierItemPrice, setNewSupplierItemPrice] = useState(150);
  const [newSupplierItemQty, setNewSupplierItemQty] = useState(10);

  // Auto select initial values
  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId]);

  useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplierName) {
      setSelectedSupplierName(suppliers[0]);
    }
  }, [suppliers, selectedSupplierName]);

  // Handle Toast Trigger
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Helper: Find current active hospital
  const currentHospital = hospitals.find(h => h.id === selectedHospitalId);

  // Helper: Filter orders belonging to selected hospital
  const hospitalOrders = orders.filter(o => o.hospitalId === selectedHospitalId);

  // Helper: Calculate raw retailer details based on single order or overall summary (for initial load)
  const getRetailerItemsAndPricingRaw = () => {
    if (selectedOrderId === 'all-summary') {
      // Create a unified list of delivered & pending supply items requested by this hospital
      const aggregated: { [sku: string]: { name: string; qty: number; rate: number } } = {};
      hospitalOrders.forEach(o => {
        o.items.forEach(it => {
          const itemRef = items.find(i => i.sku === it.sku);
          const rate = itemRef ? itemRef.unitPrice : 75; // fallback
          if (aggregated[it.sku]) {
            aggregated[it.sku].qty += it.quantity;
          } else {
            aggregated[it.sku] = { name: it.name, qty: it.quantity, rate };
          }
        });
      });

      const lineItems = Object.entries(aggregated).map(([sku, d]) => ({
        sku,
        name: d.name,
        qty: d.qty,
        rate: d.rate
      }));

      // If no orders yet, give placeholder active diagnostic kit
      if (lineItems.length === 0) {
        lineItems.push({
          sku: 'DEMO-KIT-01',
          name: 'Disaster Emergency Cardiac Tray (Emergency Preset)',
          qty: 5,
          rate: 185.00
        });
      }

      return lineItems;
    } else {
      // Find single ordered item details
      const ord = orders.find(o => o.id === selectedOrderId);
      if (!ord) {
        return [];
      }

      return ord.items.map(it => {
        const itemRef = items.find(i => i.sku === it.sku);
        const rate = itemRef ? itemRef.unitPrice : 85;
        return {
          sku: it.sku,
          name: it.name,
          qty: it.quantity,
          rate
        };
      });
    }
  };

  // Auto synchronize state whenever selected hospital, order or orders/items change
  useEffect(() => {
    const rawItems = getRetailerItemsAndPricingRaw();
    setRetailerCustomItems(rawItems);
    setEditingRowIndex(null);
  }, [selectedHospitalId, selectedOrderId, orders, items]);

  // Read pricing details dynamically from state
  const getRetailerSummary = () => {
    const lineItems = retailerCustomItems.map(item => ({
      ...item,
      total: item.qty * item.rate
    }));
    const subtotal = lineItems.reduce((acc, current) => acc + current.total, 0);
    const taxAndFees = subtotal * (taxRate / 100);
    const grantTotal = subtotal + taxAndFees;

    return { lineItems, subtotal, taxAndFees, grantTotal };
  };

  const retailerSummary = getRetailerSummary();

  // Helper: Supplier dynamic invoice summaries
  const getSupplierPricing = () => {
    const subtotal = supplierCustomItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAndFees = subtotal * (taxRate / 100);
    const grantTotal = subtotal + taxAndFees;
    return { subtotal, taxAndFees, grantTotal };
  };

  const supplierSummary = getSupplierPricing();

  // Inline row-editing action helpers
  const handleStartEditRow = (index: number, name: string, qty: number, rate: number) => {
    setEditingRowIndex(index);
    setEditItemName(name);
    setEditItemQty(qty);
    setEditItemRate(rate);
  };

  const handleSaveLineItem = (index: number) => {
    if (billingMode === 'retailer') {
      setRetailerCustomItems(prev => prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            name: editItemName.trim() || item.name,
            qty: Math.max(1, editItemQty),
            rate: Math.max(0, editItemRate)
          };
        }
        return item;
      }));
      triggerToast('Invoice line item updated successfully.');
    } else {
      setSupplierCustomItems(prev => prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            name: editItemName.trim() || item.name,
            quantity: Math.max(1, editItemQty),
            unitPrice: Math.max(0, editItemRate)
          };
        }
        return item;
      }));
      triggerToast('Requisition line item updated successfully.');
    }
    setEditingRowIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
  };

  const handleRemoveRetailerItem = (index: number) => {
    setRetailerCustomItems(prev => prev.filter((_, i) => i !== index));
    triggerToast('Line item removed from retailer invoice.');
  };

  // Add Item in Supplier PO mode
  const handleAddSupplierItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSupplierItemName.trim();
    if (!trimmed) return;

    // Search SKU
    const matchedItem = items.find(i => i.name.toLowerCase() === trimmed.toLowerCase());
    const sku = matchedItem ? matchedItem.sku : `PO-SKU-${Math.floor(100 + Math.random() * 899)}`;

    setSupplierCustomItems(prev => [
      ...prev,
      {
        sku,
        name: trimmed,
        quantity: Math.max(1, newSupplierItemQty),
        unitPrice: Math.max(1, newSupplierItemPrice)
      }
    ]);

    setNewSupplierItemName('');
    triggerToast(`Added "${trimmed}" into supplier requisition memo successfully.`);
  };

  // Remove supplier item
  const handleRemoveSupplierItem = (index: number) => {
    setSupplierCustomItems(prev => prev.filter((_, i) => i !== index));
  };

  // Dispatch replenishment on approval (Replenishes warehouse items from Supplier Billing!)
  const handleApproveSupplierOrder = () => {
    if (onReplenish) {
      supplierCustomItems.forEach(item => {
        onReplenish(item.sku, item.quantity);
      });
      triggerToast(`🚨 SUCCESS: Contract memo processed! Ordered quantities have been compiled and sent to Central Warehouse reserves.`);
      setSupplierCustomItems([]);
    } else {
      triggerToast(`📋 Simulated Order Memo sent directly to ${selectedSupplierName}! System reserves updated.`);
    }
  };

  // Copy or Print Simulator
  const handleTriggerPrint = () => {
    window.print();
    triggerToast('Opening native browser printing overlay... All style layouts optimized for standard letter scale.');
  };

  // Simple quick reset of Invoice Numbering
  const regenerateInvoice = () => {
    const randomNum = Math.floor(1005 + Math.random() * 9000);
    setInvoiceNumber(billingMode === 'retailer' ? `INV-2026-${randomNum}` : `PO-SUP-${randomNum}`);
    triggerToast('Generated fresh sequential ledger serial number.');
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md" id="billing-telemetry-panel">
      {/* Dynamic Toast Status */}
      {successToast && (
        <div className="fixed top-4 right-4 bg-cyan-900 border border-cyan-500 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-xs font-mono max-w-sm animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Primary Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" /> Medical Billing & Letterhead Slot
          </h2>
          <p className="text-xs text-slate-400">Generate clean proof-of-dispatch and supplier purchase contract letters formatted for mobile.</p>
        </div>

        {/* Binary Selector */}
        <div className="bg-slate-950 p-1 rounded-lg border border-slate-850 flex gap-1 select-none">
          <button
            onClick={() => {
              setBillingMode('retailer');
              setInvoiceNumber(`INV-2026-${Math.floor(1005 + Math.random() * 9000)}`);
            }}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
              billingMode === 'retailer'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/25'
                : 'text-slate-400 border border-transparent hover:text-slate-200'
            }`}
          >
            🏥 Retailer Invoice
          </button>
          <button
            onClick={() => {
              setBillingMode('supplier');
              setInvoiceNumber(`PO-SUP-${Math.floor(1005 + Math.random() * 9000)}`);
            }}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
              billingMode === 'supplier'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/25'
                : 'text-slate-400 border border-transparent hover:text-slate-200'
            }`}
          >
            🏭 Supplier Purchase Order
          </button>
        </div>
      </div>

      {/* Main Two-Column Panel for inputs and real-time template view */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Row A: Config Controls (5 columns) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
            <h3 className="text-xs font-semibold font-mono text-slate-300 tracking-wider uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-cyan-400" /> Letterhead Custom Options
            </h3>

            {/* Target Selectors depending on Mode */}
            {billingMode === 'retailer' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Select Retailer Hospital *</label>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => {
                      setSelectedHospitalId(e.target.value);
                      setSelectedOrderId('all-summary');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer font-sans"
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Select Order Ledger Slot</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="all-summary">📋 Consolidated Operations Summary</option>
                    {hospitalOrders.length === 0 ? (
                      <option disabled>No current active dispatch receipts</option>
                    ) : (
                      hospitalOrders.map((o, idx) => (
                        <option key={o.id} value={o.id}>
                          Order {o.id} ({o.priority.toUpperCase()} - {o.status.toUpperCase()})
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Select &quot;Consolidated&quot; to aggregate across all delivery slots at once.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Select Manufacturer Supplier *</label>
                  <select
                    value={selectedSupplierName}
                    onChange={(e) => setSelectedSupplierName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {suppliers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-Form: Add arbitrary manufacturer items to PO */}
                <form onSubmit={handleAddSupplierItem} className="border border-slate-900 p-2.5 rounded-lg bg-slate-900/30 space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">📝 Populate Supplier Requisition line</span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      list="supplier-suggested-items"
                      placeholder="e.g. Hydrophilic Gown Shield"
                      value={newSupplierItemName}
                      onChange={(e) => setNewSupplierItemName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-600"
                    />
                    <datalist id="supplier-suggested-items">
                      {items.map(it => <option key={it.sku} value={it.name} />)}
                    </datalist>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 font-mono block">Rate (₹)</label>
                        <input
                          type="number"
                          min="1"
                          value={newSupplierItemPrice}
                          onChange={(e) => setNewSupplierItemPrice(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-mono block">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={newSupplierItemQty}
                          onChange={(e) => setNewSupplierItemQty(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newSupplierItemName.trim()}
                      className="w-full py-1 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white rounded text-[10px] font-mono font-bold cursor-pointer transition-colors"
                    >
                      Insert Product Line
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Shared Configurations: Series, Dates, Signature, Stamp */}
            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-900">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase flex items-center gap-1 justify-between">
                  <span>Ledger #</span>
                  <button onClick={regenerateInvoice} type="button" className="text-cyan-400 hover:underline text-[9px] cursor-pointer">Regen</button>
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 roundedpx-2.5 py-1 text-xs font-mono text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-105 cursor-pointer font-sans"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Pay on Delivery">Pay on Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Tax Rate (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="22"
                    step="1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-slate-900 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-350 shrink-0">{taxRate}%</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Design Theme</label>
                <select
                  value={logoStyle}
                  onChange={(e) => setLogoStyle(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-105 cursor-pointer"
                >
                  <option value="emergency">🏥 Emergency Red/Blue</option>
                  <option value="corporate">🏛️ Minimalist Slate</option>
                  <option value="tech">🦾 Tactical Cyber</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2.5 border-t border-slate-900">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={authorizedSignee}
                  onChange={(e) => setAuthorizedSignee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-150 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Watermark Document Stamp</label>
                <div className="flex flex-wrap gap-1">
                  {(['NONE', 'APPROVED', 'PAID', 'PENDING', 'URGENT'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDocumentStamp(st)}
                      className={`px-2 py-1 text-[9px] font-mono rounded font-bold cursor-pointer border uppercase transition-all ${
                        documentStamp === st
                          ? 'bg-amber-500/20 text-amber-350 border-amber-500/50'
                          : 'bg-slate-900 text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {st === 'NONE' ? 'None' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick PDF / Print guidelines */}
          <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5 text-amber-400" /> Operational Compliance
            </span>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Our letterheads feature a precise CSS Print layout wrapper matching state-standard clinical logistics laws. Triggers directly launch standard system handlers.
            </p>
          </div>
        </div>

        {/* Row B: Interactive Letterhead Preview Panel (7 columns) */}
        <div className="xl:col-span-7">
          <div className="bg-white text-slate-900 rounded-xl border-t-[6px] border-slate-200 shadow-2xl p-6 relative overflow-hidden font-sans min-h-[580px] flex flex-col justify-between" id="printable-letterhead-core">
            
            {/* Watermark Sticker Display */}
            {documentStamp !== 'NONE' && (
              <div className={`absolute right-10 top-24 border-[3px] border-dashed rotate-12 px-4 py-1.5 rounded text-xs font-bold font-mono tracking-widest select-none ${
                documentStamp === 'PAID' ? 'text-emerald-500 border-emerald-500 bg-emerald-50' :
                documentStamp === 'APPROVED' ? 'text-cyan-500 border-cyan-500 bg-cyan-50' :
                documentStamp === 'URGENT' ? 'text-rose-500 border-rose-500 bg-rose-50' :
                'text-amber-500 border-amber-500 bg-amber-50'
              }`}>
                {documentStamp}
              </div>
            )}

            {/* Letterhead Top Banner Header */}
            <div>
              {/* Designer Top Accent Bar */}
              <div className="flex h-1.5 w-full rounded-full overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-red-600 via-amber-500 to-indigo-650 w-full h-full" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between border-b pb-5 mb-5 border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    logoStyle === 'emergency' ? 'bg-gradient-to-br from-red-600 to-amber-500 shadow-md shadow-red-200' :
                    logoStyle === 'corporate' ? 'bg-gradient-to-br from-slate-900 to-slate-700 shadow-md shadow-slate-200' :
                    'bg-slate-900 border border-slate-200 shadow-md'
                  }`}>
                    {billingMode === 'retailer' ? <Shield className="w-6 h-6 text-indigo-600" /> : <Layers className="w-6 h-6 text-emerald-600" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-base font-bold tracking-wider text-slate-900 font-serif-display uppercase leading-tight">
                        {billingMode === 'retailer' ? 'HS FLEET & MEDICARE' : 'HS PHARMA CONTRACT RESERVES'}
                      </h1>
                      <span className="text-[8px] bg-slate-100 text-slate-600 tracking-widest uppercase font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200">
                        {billingMode === 'retailer' ? 'MED-LOGISTICS' : 'OEM-MANUFACTURING'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wide uppercase block mt-1">
                      {billingMode === 'retailer' ? 'Central Drugs & Surgical Supply Transit Hub' : 'Primary Bulk Ingredient & Surgical Chain'}
                    </span>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1.5 text-[8.5px] font-mono text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> CDSCO No: CD-2026-DL95</span>
                      <span>•</span>
                      <span>GSTIN: 07AAAFM1024L1ZX</span>
                      <span>•</span>
                      <span>ISO 9001 & GMP</span>
                    </div>
                  </div>
                </div>

                <div className="text-right mt-4 md:mt-0 font-mono">
                  <div className="inline-block bg-slate-50 border border-slate-100 rounded px-2.5 py-1 mb-1">
                    <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                      {billingMode === 'retailer' ? 'TAX INVOICE / RET-MEMO' : 'PURCHASE REQUISITION NOTE'}
                    </h2>
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <p>Ref: <span className="font-bold text-slate-700">#{invoiceNumber}</span></p>
                    <p>Date: {invoiceDate}</p>
                  </div>
                </div>
              </div>

              {/* Sender / Receiver Bio-Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-5 font-mono">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">ISSUED BY (SENDER):</span>
                  {billingMode === 'retailer' ? (
                    <div className="space-y-0.5 text-slate-700 font-sans">
                      <p className="font-bold text-slate-800">HS Fleet &amp; Medicare Hub</p>
                      <p className="text-[10px]">Pradhan Mantri Jan Aushadhi Central Depot</p>
                      <p className="text-[10px]">Dwarka Sec-5, New Delhi - 110075 | Support: +91 11-28082006</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 text-slate-700 font-sans">
                      <p className="font-bold text-slate-800">{selectedSupplierName || 'Primary Supplier Core'}</p>
                      <p className="text-[10px]">Authorized Medical Manufacturer</p>
                      <p className="text-[10px]">Quality Standard SLA Active | Registry: INDIA-PHARMA</p>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">BILLING TO (RECEIVER):</span>
                  {billingMode === 'retailer' ? (
                    <div className="space-y-0.5 text-slate-700 font-sans">
                      <p className="font-bold text-slate-800">{currentHospital?.name || 'Local Healthcare Node'}</p>
                      <p className="text-[10px]">{currentHospital?.address || 'Registered Surgical District Code'}</p>
                      <p className="text-[10px]">Node ID: {currentHospital?.id || 'HOSP-UNKNOWN'} | Priority Tier: {currentHospital?.urgency || 'Medium'}</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 text-slate-700 font-sans">
                      <p className="font-bold text-slate-800">HS Fleet &amp; Medicare Central Depot</p>
                      <p className="text-[10px]">Sector Master Warehousing Complex</p>
                      <p className="text-[10px]">Direct Requisition Clerk ID: HS-L4-DEPOT</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates and Terms Table Area */}
              <div className="grid grid-cols-3 gap-2 border border-slate-200 rounded-lg p-2.5 mb-5 text-[10px] text-center font-mono bg-white">
                <div className="border-r">
                  <span className="text-slate-400 block uppercase text-[8px] mb-0.5">DATE OF ISSUE</span>
                  <span className="text-slate-800 font-bold">{invoiceDate}</span>
                </div>
                <div className="border-r">
                  <span className="text-slate-400 block uppercase text-[8px] mb-0.5">PAYMENT TERMS</span>
                  <span className="text-slate-800 font-bold">{paymentTerms}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[8px] mb-0.5">EST. DELIVERY DEADLINE</span>
                  <span className="text-slate-800 font-bold">{dueDate}</span>
                </div>
              </div>

              {/* Materials Particulars Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] font-mono text-slate-400 uppercase">
                      <th className="py-2 pl-1 w-2/12">SKU ID</th>
                      <th className="py-2 w-4/12">Surgical Product / Item Particulars</th>
                      <th className="py-2 text-right w-1/12">Qty</th>
                      <th className="py-2 text-right w-2/12">Unit Rate</th>
                      <th className="py-2 text-right w-2/12">Total (₹)</th>
                      <th className="py-2 text-right w-1/12 pr-1 print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingMode === 'retailer' ? (
                      retailerSummary.lineItems.map((curr, index) => (
                        <tr key={`${curr.sku}-${index}`} className="border-b border-slate-100 text-slate-700 font-sans select-none my-1.5 hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 pl-1 font-mono text-[10px] font-medium text-slate-500">{curr.sku}</td>
                          
                          {/* Item Particulars */}
                          <td className="py-2.5 font-medium text-slate-800 leading-snug">
                            {editingRowIndex === index ? (
                              <input
                                type="text"
                                value={editItemName}
                                onChange={(e) => setEditItemName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                              />
                            ) : (
                              <span>{curr.name}</span>
                            )}
                          </td>
                          
                          {/* Quantity */}
                          <td className="py-2.5 text-right font-mono font-medium">
                            {editingRowIndex === index ? (
                              <input
                                type="number"
                                min="1"
                                value={editItemQty}
                                onChange={(e) => setEditItemQty(parseInt(e.target.value) || 0)}
                                className="w-16 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[11px] text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                              />
                            ) : (
                              <span>{curr.qty}</span>
                            )}
                          </td>
                          
                          {/* Unit Rate */}
                          <td className="py-2.5 text-right font-mono">
                            {editingRowIndex === index ? (
                              <input
                                type="number"
                                min="0"
                                value={editItemRate}
                                onChange={(e) => setEditItemRate(parseFloat(e.target.value) || 0)}
                                className="w-20 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[11px] text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                              />
                            ) : (
                              <span>₹{curr.rate.toFixed(2)}</span>
                            )}
                          </td>
                          
                          {/* Total */}
                          <td className="py-2.5 text-right font-mono font-bold">
                            ₹{curr.total.toFixed(2)}
                          </td>
                          
                          {/* Action Cell */}
                          <td className="py-2.5 text-right print:hidden pr-1 font-mono">
                            {editingRowIndex === index ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveLineItem(index)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-55 rounded transition-colors cursor-pointer"
                                  title="Save"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5 grayscale hover:grayscale-0 transition-all">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditRow(index, curr.name, curr.qty, curr.rate)}
                                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title="Edit Line"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRetailerItem(index)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Delete Line"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      supplierCustomItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 font-mono text-[11px] text-slate-400 text-center uppercase border-b border-slate-200">
                            No Supplier Items Added. Add an item from the configuration panel.
                          </td>
                        </tr>
                      ) : (
                        supplierCustomItems.map((curr, index) => (
                          <tr key={`${curr.sku}-${index}`} className="border-b border-slate-100 text-slate-700 font-sans select-none hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 pl-1 font-mono text-[10px] font-medium text-slate-500">{curr.sku}</td>
                            
                            {/* Product Name */}
                            <td className="py-2.5 font-medium text-slate-800 leading-snug">
                              {editingRowIndex === index ? (
                                <input
                                  type="text"
                                  value={editItemName}
                                  onChange={(e) => setEditItemName(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                                />
                              ) : (
                                <span>{curr.name}</span>
                              )}
                            </td>
                            
                            {/* Quantity */}
                            <td className="py-2.5 text-right font-mono font-medium">
                              {editingRowIndex === index ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editItemQty}
                                  onChange={(e) => setEditItemQty(parseInt(e.target.value) || 0)}
                                  className="w-16 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[11px] text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                                />
                              ) : (
                                <span>{curr.quantity}</span>
                              )}
                            </td>
                            
                            {/* Unit Rate */}
                            <td className="py-2.5 text-right font-mono">
                              {editingRowIndex === index ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={editItemRate}
                                  onChange={(e) => setEditItemRate(parseFloat(e.target.value) || 0)}
                                  className="w-20 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[11px] text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                                />
                              ) : (
                                <span>₹{curr.unitPrice.toFixed(2)}</span>
                              )}
                            </td>
                            
                            {/* Line Total */}
                            <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                              ₹{(curr.quantity * curr.unitPrice).toFixed(2)}
                            </td>
                            
                            {/* Action elements cell */}
                            <td className="py-2.5 text-right print:hidden pr-1 font-mono">
                              {editingRowIndex === index ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveLineItem(index)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                    title="Save"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5 grayscale hover:grayscale-0 transition-all">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditRow(index, curr.name, curr.quantity, curr.unitPrice)}
                                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title="Edit Line"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSupplierItem(index)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title="Delete Line"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Subtotal, tax, aggregate block */}
              <div className="flex justify-end mt-4">
                <div className="w-full sm:w-1/2 space-y-2 border-t pt-3 text-xs font-sans text-slate-600">
                  <div className="flex justify-between">
                    <span>Depot Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{billingMode === 'retailer' ? retailerSummary.subtotal.toFixed(2) : supplierSummary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-550">
                    <span className="flex items-center gap-1">Tax Adjustments ({taxRate}%):</span>
                    <span className="font-mono text-slate-800">
                      +₹{billingMode === 'retailer' ? retailerSummary.taxAndFees.toFixed(2) : supplierSummary.taxAndFees.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                    <span>Grand Command Total:</span>
                    <span className="font-mono text-cyan-600">
                      ₹{billingMode === 'retailer' ? retailerSummary.grantTotal.toFixed(2) : supplierSummary.grantTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer containing Signature space and terms note */}
            <div className="mt-6 pt-5 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-450 text-center sm:text-left select-none">
              <div>
                <p className="font-bold text-slate-600 uppercase tracking-widest text-[8px] mb-1">Standard Clinical Memo Note:</p>
                <p className="leading-snug max-w-sm text-slate-400 font-sans">
                  Materials are packaged & transferred strictly complying with international bio-transport protocols. Sterile security seals intact.
                </p>
              </div>

              <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                <div className="h-8 flex items-end justify-center">
                  <span className="font-sans italic text-emerald-600 font-semibold tracking-wider p-1 text-[11px] bg-emerald-50 rounded border border-emerald-300">
                    ✓ SECURE CLOUD AUTHENTICATED
                  </span>
                </div>
                <div className="w-40 border-t border-slate-700 mt-2.5" />
                <span className="text-[8px] text-slate-400 uppercase mt-1">Authorized Command Personnel</span>
                <span className="text-slate-700 font-semibold text-[9px] truncate max-w-[170px]">{authorizedSignee}</span>
              </div>
            </div>

          </div>

          {/* User action buttons directly under preview box */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTriggerPrint}
              className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border border-slate-800/80 transition-all font-mono shadow-md"
            >
              <Printer className="w-4 h-4 text-cyan-400" /> Print Formal Letterhead
            </button>

            {billingMode === 'supplier' && supplierCustomItems.length > 0 && (
              <button
                onClick={handleApproveSupplierOrder}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-950/20"
              >
                <CheckCircle className="w-4 h-4" /> Finalize PO & Replenish Stock
              </button>
            )}

            {billingMode === 'retailer' && (
              <button
                onClick={() => {
                  triggerToast(`Status memo for ${currentHospital?.name || 'Retailer'} dispatched via secure encrypted channel as active receipt proof.`);
                  setDocumentStamp('PAID');
                }}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-950/20"
              >
                <Download className="w-4 h-4" /> Save Receipt & Mark Paid
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
