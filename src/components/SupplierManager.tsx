/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Shield, Users, HelpCircle, Layers, AlertCircle, Check, X } from 'lucide-react';
import { SurgicalItem } from '../types';

interface SupplierManagerProps {
  suppliers: string[];
  items: SurgicalItem[];
  onAddSupplier: (name: string) => void;
  onRemoveSupplier: (name: string) => void;
  onEditSupplier: (oldName: string, newName: string) => void;
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({
  suppliers,
  items,
  onAddSupplier,
  onRemoveSupplier,
  onEditSupplier,
}) => {
  const [newSupplierName, setNewSupplierName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingSupplier, setDeletingSupplier] = useState<string | null>(null);

  // Editing state
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSupplierName.trim();
    if (!trimmed) return;

    if (suppliers.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('This supplier partner is already registered in the active database.');
      return;
    }

    onAddSupplier(trimmed);
    setNewSupplierName('');
    setErrorMsg('');
  };

  const startEdit = (sup: string) => {
    setEditingSupplier(sup);
    setEditingName(sup);
    setEditError('');
  };

  const saveEdit = (oldName: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    if (trimmed !== oldName && suppliers.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setEditError('This name is already used by another supplier partner.');
      return;
    }

    onEditSupplier(oldName, trimmed);
    setEditingSupplier(null);
    setEditingName('');
    setEditError('');
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="mb-4 border-b border-slate-800/80 pb-3">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" /> Surgical Provider Directory
        </h2>
        <p className="text-xs text-slate-400">Register and manage upstream surgical manufacturer contracts and regional dispatch channels.</p>
      </div>

      {/* Add Supplier Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter new supplier name (e.g., Stryker Devices)..."
              value={newSupplierName}
              onChange={(e) => {
                setNewSupplierName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              required
              className="bg-slate-950/80 border border-slate-800 text-slate-100 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 block w-full px-3 py-2 font-sans"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-emerald-950/20"
          >
            <Plus className="w-3.5 h-3.5" /> Registry Contract
          </button>
        </div>
        {errorMsg && (
          <p className="text-rose-450 font-mono text-[10px] mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errorMsg}
          </p>
        )}
      </form>

      {/* Suppliers Active List Grid */}
      <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
        {suppliers.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
            <Layers className="w-6 h-6 text-slate-800 mx-auto mb-1 animate-pulse" />
            No active supplier contracts. All operations on standby.
          </div>
        ) : (
          suppliers.map((sup) => {
            // Count total items supplied by this entity
            const count = items.filter(i => i.supplier === sup).length;
            const isEditing = editingSupplier === sup;

            return (
              <div
                key={sup}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/85 border border-slate-900 hover:border-slate-800 transition-all text-xs font-sans group"
              >
                {isEditing ? (
                  <div className="flex-1 mr-2 space-y-1">
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-slate-900 border border-emerald-500/50 text-slate-100 text-xs rounded px-2.5 py-1 w-full focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(sup)}
                        className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded cursor-pointer"
                        title="Save settings"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSupplier(null)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded cursor-pointer"
                        title="Cancel edit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {editError && (
                      <p className="text-rose-400 text-[10px] font-mono">{editError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-200">{sup}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                      <span className="bg-slate-900 border border-slate-800/80 px-1.5 py-0.2 rounded text-[9px] text-slate-400">
                        Active SLA Target
                      </span>
                      <span>• {count} surgical items supplied</span>
                    </div>
                  </div>
                )}

                {!isEditing && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {deletingSupplier === sup ? (
                      <div className="flex items-center gap-1 bg-slate-900 border border-red-500/30 p-1 rounded animate-fade-in">
                        <span className="text-[9px] text-red-400 font-bold px-1 font-mono">Delete?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveSupplier(sup);
                            setDeletingSupplier(null);
                          }}
                          className="p-1 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer text-[10px] uppercase font-bold flex items-center gap-0.5"
                          title="Confirm Delete"
                        >
                          <Check className="w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSupplier(null)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded cursor-pointer text-[10px] uppercase font-bold flex items-center gap-0.5"
                          title="Cancel"
                        >
                          <X className="w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(sup)}
                          className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                          title={`Edit contract name for ${sup}`}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-450 hover:text-emerald-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSupplier(sup)}
                          className="p-1 text-slate-500 hover:text-rose-450 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title={`Terminate contract for ${sup}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </>
                    )}
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
