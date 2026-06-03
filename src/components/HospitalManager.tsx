/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HospitalNode } from '../types';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2,
  Phone, 
  Crosshair, 
  Compass, 
  AlertCircle,
  HelpCircle,
  Check,
  X
} from 'lucide-react';

interface HospitalManagerProps {
  hospitals: HospitalNode[];
  onAddHospital: (newHosp: HospitalNode) => void;
  onRemoveHospital: (id: string) => void;
  onEditHospital: (updatedHosp: HospitalNode) => void;
}

const PRESETS = [
  { name: 'North Sector', x: 30, y: 15 },
  { name: 'East Coast', x: 85, y: 35 },
  { name: 'South Heights', x: 45, y: 85 },
  { name: 'West Plains', x: 15, y: 55 },
  { name: 'Central Zone', x: 65, y: 45 }
];

export const HospitalManager: React.FC<HospitalManagerProps> = ({
  hospitals,
  onAddHospital,
  onRemoveHospital,
  onEditHospital,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<HospitalNode['type']>('Retail Pharmacy Center');
  const [coordX, setCoordX] = useState<number>(35);
  const [coordY, setCoordY] = useState<number>(35);
  const [urgency, setUrgency] = useState<HospitalNode['urgency']>('medium');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const applyPreset = (x: number, y: number) => {
    setCoordX(x);
    setCoordY(y);
  };

  const startEdit = (hosp: HospitalNode) => {
    setEditingHospitalId(hosp.id);
    setName(hosp.name);
    setType(hosp.type);
    setCoordX(hosp.coordinates.x);
    setCoordY(hosp.coordinates.y);
    setUrgency(hosp.urgency);
    setContactNumber(hosp.contactNumber);
    setAddress(hosp.address);
    setErrorMsg('');
    setShowAddForm(true);

    // Scroll to form or top of manager container
    const element = document.getElementById('hospital-manager-header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    setName('');
    setType('Retail Pharmacy Center');
    setCoordX(35);
    setCoordY(35);
    setUrgency('medium');
    setContactNumber('');
    setAddress('');
    setErrorMsg('');
    setEditingHospitalId(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedContact = contactNumber.trim() || "+91-98765-43210";
    const trimmedAddress = address.trim() || "Local Retail Hub District";

    if (!trimmedName) {
      setErrorMsg('Retailer Node Name is required.');
      return;
    }

    if (!editingHospitalId && hospitals.some(h => hospNameMatch(h.name, trimmedName))) {
      setErrorMsg('A retailer outlet with this name is already registered.');
      return;
    }

    if (editingHospitalId && hospitals.some(h => h.id !== editingHospitalId && hospNameMatch(h.name, trimmedName))) {
      setErrorMsg('Another retailer outlet with this name is already registered.');
      return;
    }

    // Coordinates safety checks (bound within 5-95)
    const refinedX = Math.min(95, Math.max(5, coordX));
    const refinedY = Math.min(95, Math.max(5, coordY));

    if (editingHospitalId) {
      onEditHospital({
        id: editingHospitalId,
        name: trimmedName,
        type,
        coordinates: { x: refinedX, y: refinedY },
        urgency,
        contactNumber: trimmedContact,
        address: trimmedAddress
      });
    } else {
      const id = `H-${trimmedName.toUpperCase().replace(/\s+/g, '-').slice(0, 10)}-${Math.floor(100 + Math.random() * 900)}`;
      onAddHospital({
        id,
        name: trimmedName,
        type,
        coordinates: { x: refinedX, y: refinedY },
        urgency,
        contactNumber: trimmedContact,
        address: trimmedAddress
      });
    }

    handleCancel();
  };

  const hospNameMatch = (n1: string, n2: string) => n1.toLowerCase() === n2.toLowerCase();

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md" id="hospital-manager-root">
      {/* Header Panel */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3" id="hospital-manager-header">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" /> Retail Outlet & Pharmacy Registry
          </h2>
          <p className="text-xs text-slate-400">Add retail franchise counters, regional stores, and franchise distribution channels establishing direct distributor tracking.</p>
        </div>

        <button
          onClick={() => {
            if (showAddForm) {
              handleCancel();
            } else {
              setShowAddForm(true);
            }
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors w-full sm:w-auto justify-center ${
            showAddForm
              ? 'bg-slate-800 text-slate-350 border border-slate-700'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/20 border border-cyan-500/20'
          }`}
        >
          {showAddForm ? (editingHospitalId ? 'Cancel Editing' : 'Cancel Registration') : 'Register New Retailer'}
        </button>
      </div>

      {/* Add New Hospital / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-4 shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-xs font-semibold font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 animate-pulse" /> {editingHospitalId ? `EDIT OUTLET SPECIFICATION: ${editingHospitalId}` : 'CONFIGURING ASSOCIATES'}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Location Input Zone</span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/55 text-rose-450 text-[11px] flex gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-450" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wide">Retailer Outlet / Pharmacy Name *</label>
              <input
                type="text"
                placeholder="e.g. Sanjivani Pharma Zone"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-700"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wide">Associate Outlet Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as HospitalNode['type'])}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="Retail Pharmacy Center">Retail Pharmacy Center</option>
                <option value="Franchise Distribution Hub">Franchise Distribution Hub</option>
              </select>
            </div>
          </div>

          {/* Map Placement with Sliders and Quick Presets */}
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> Regional Map Distribution Coordinates
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.x, p.y)}
                    className="px-2 py-1 bg-slate-950 hover:bg-cyan-950 text-[9px] font-mono rounded border border-slate-800 hover:border-cyan-800 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                  >
                    📍 {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* X Coords Slider Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <span className="sm:col-span-2 text-[10px] font-mono text-slate-400">Horizontal (X):</span>
              <div className="sm:col-span-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCoordX(Math.max(5, coordX - 5))}
                  className="w-7 h-7 bg-slate-950 rounded flex items-center justify-center font-bold text-slate-400 hover:text-cyan-400 border border-slate-850 cursor-pointer text-xs"
                >
                  -
                </button>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={coordX}
                  onChange={(e) => setCoordX(parseInt(e.target.value))}
                  className="flex-1 accent-cyan-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setCoordX(Math.min(95, coordX + 5))}
                  className="w-7 h-7 bg-slate-950 rounded flex items-center justify-center font-bold text-slate-400 hover:text-cyan-400 border border-slate-850 cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
              <span className="sm:col-span-2 text-right font-mono font-bold text-cyan-400 text-xs">{coordX} / 100</span>
            </div>

            {/* Y Coords Slider Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <span className="sm:col-span-2 text-[10px] font-mono text-slate-400">Vertical (Y):</span>
              <div className="sm:col-span-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCoordY(Math.max(5, coordY - 5))}
                  className="w-7 h-7 bg-slate-950 rounded flex items-center justify-center font-bold text-slate-400 hover:text-cyan-400 border border-slate-850 cursor-pointer text-xs"
                >
                  -
                </button>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={coordY}
                  onChange={(e) => setCoordY(parseInt(e.target.value))}
                  className="flex-1 accent-cyan-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setCoordY(Math.min(95, coordY + 5))}
                  className="w-7 h-7 bg-slate-950 rounded flex items-center justify-center font-bold text-slate-400 hover:text-cyan-400 border border-slate-850 cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
              <span className="sm:col-span-2 text-right font-mono font-bold text-cyan-400 text-xs">{coordY} / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wide">Physical Address</label>
              <input
                type="text"
                placeholder="e.g. 100 Jan-Aushadhi Marg, Block C"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-700"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wide">Representative Hotline</label>
              <input
                type="text"
                placeholder="e.g. +91 94444 11000"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide">Replenishment Priority / Status Alert Trigger</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as HospitalNode['urgency'][]).map((urg) => (
                <button
                  key={urg}
                  type="button"
                  onClick={() => setUrgency(urg)}
                  className={`py-2 rounded-lg border text-center font-mono capitalize text-[11px] cursor-pointer transition-all ${
                    urgency === urg
                      ? urg === 'high' ? 'bg-red-500/20 text-red-400 border-red-500' : 
                        urg === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-md shadow-cyan-950/20"
            >
              {editingHospitalId ? 'Update Outlet Design' : 'Add Outlet'}
            </button>
          </div>
        </form>
      )}

      {/* Hospital Director Listing with responsive touch interfaces */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {hospitals.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
            <Building2 className="w-8 h-8 text-slate-800 mx-auto mb-2 animate-pulse" />
            No retailer outlets currently registered.
          </div>
        ) : (
          hospitals.map((hosp) => {
            const urgencyBadge = (
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase border ${
                hosp.urgency === 'high' ? 'bg-red-950/80 text-red-400 border-red-800 animate-pulse' :
                hosp.urgency === 'medium' ? 'bg-amber-950/80 text-amber-400 border-amber-800' :
                'bg-emerald-950/80 text-emerald-400 border-emerald-800'
              }`}>
                {hosp.urgency === 'high' ? 'High Alert' : hosp.urgency === 'medium' ? 'Standard' : 'Low alert'}
              </span>
            );

            const iconPrefix = hosp.type === 'Retail Pharmacy Center' ? '💊' : hosp.type === 'Franchise Distribution Hub' ? '📦' : '🏪';

            return (
              <div
                key={hosp.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800/80 transition-all gap-3.5 group relative overflow-hidden"
              >
                {/* visual sidebar decoration indicating node type */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                  hosp.urgency === 'high' ? 'bg-red-500' : hosp.urgency === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />

                <div className="space-y-1 pl-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">{iconPrefix}</span>
                    <h4 className="font-semibold text-slate-100 text-sm font-sans tracking-tight leading-snug">{hosp.name}</h4>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 rounded-md px-1.5 py-0.2 font-mono">
                      {hosp.id}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono font-medium flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                      {hosp.type}
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-[10px] text-cyan-400 font-bold">
                      <MapPin className="w-3 h-3 text-cyan-400 pointer-events-none" /> Coordinates: {hosp.coordinates.x}x, {hosp.coordinates.y}y
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed font-sans pt-0.5">
                    📍 {hosp.address} | <span className="font-mono text-slate-400">{hosp.contactNumber}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 border-t border-slate-900/60 pt-2.5 sm:pt-0 sm:border-t-0 shrink-0">
                  <div className="sm:hidden">
                    {urgencyBadge}
                  </div>
                  <div className="hidden sm:block">
                    {urgencyBadge}
                  </div>

                  {deletingId === hosp.id ? (
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-red-500/30 p-1.5 rounded-lg animate-fade-in">
                      <span className="text-[10px] text-red-400 font-semibold font-mono px-1.5">Unlink outlet?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveHospital(hosp.id);
                          setDeletingId(null);
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-white pointer-events-none" /> Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium cursor-pointer transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(hosp)}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 border border-slate-900 hover:border-cyan-800/40 rounded-lg transition-all cursor-pointer bg-slate-950 flex items-center justify-center gap-1 text-xs"
                        title={`Edit ${hosp.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[11px] font-medium">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingId(hosp.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-rose-950/30 border border-slate-900 hover:border-rose-900/40 rounded-lg transition-all cursor-pointer bg-slate-950 flex items-center justify-center gap-1 text-xs"
                        title={`Remove ${hosp.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[11px] font-medium">Unlink</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
