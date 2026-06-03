/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  SurgicalItem, 
  HospitalNode, 
  DispatchOrder, 
  ActivityLog, 
  OrderPriority 
} from './types';
import { 
  INITIAL_ITEMS, 
  INITIAL_HOSPITALS, 
  INITIAL_ORDERS, 
  INITIAL_LOGS,
  WAREHOUSE_COORDINATES
} from './initialData';
import { InteractiveLogisticsMap } from './components/InteractiveLogisticsMap';
import { InventoryTable } from './components/InventoryTable';
import { HospitalOrdersList } from './components/HospitalOrdersList';
import { LogisticsAnalytics } from './components/LogisticsAnalytics';
import { SupplierManager } from './components/SupplierManager';
import { HospitalManager } from './components/HospitalManager';
import { BillingLetterhead } from './components/BillingLetterhead';
import { RedistributionHub } from './components/RedistributionHub';
import { 
  Activity, 
  Play, 
  Pause, 
  ShieldAlert, 
  Flame, 
  RefreshCw,
  Database
} from 'lucide-react';

export default function App() {
  // --- Core Application States ---
  const [items, setItems] = useState<SurgicalItem[]>(() => {
    const saved = localStorage.getItem('surg_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [suppliers, setSuppliers] = useState<string[]>(() => {
    const saved = localStorage.getItem('surg_suppliers');
    return saved ? JSON.parse(saved) : [
      "Apex Surgical Inc.", 
      "OsteoMed Devices", 
      "Ethicon Logistics", 
      "SurgiCraft Co.", 
      "Guardian Protective", 
      "Vascutech Biotech"
    ];
  });

  const [hospitals, setHospitals] = useState<HospitalNode[]>(() => {
    const saved = localStorage.getItem('surg_hospitals');
    return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
  });

  const [orders, setOrders] = useState<DispatchOrder[]>(() => {
    const saved = localStorage.getItem('surg_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('surg_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [nodeInventories, setNodeInventories] = useState<Record<string, Record<string, number>>>(() => {
    const saved = localStorage.getItem('distributor_nodeInventories');
    if (saved) return JSON.parse(saved);
    return {
      "H-AIIMS": { "S-INST-001": 25, "S-CONS-003": 12 },
      "H-APOLLO": { "S-SPEC-002": 8, "S-PPE-006": 40 },
      "H-AUSHADHI": { "S-CONS-010": 30, "S-PPE-007": 15 },
      "H-SANJIVANI": { "S-INST-001": 15, "S-CONS-010": 20 },
      "H-FRANCHISE-CENTRAL": { "S-SPEC-009": 4, "S-INST-008": 6 }
    };
  });

  useEffect(() => {
    localStorage.setItem('distributor_nodeInventories', JSON.stringify(nodeInventories));
  }, [nodeInventories]);

  // --- Visual & Simulation States ---
  const [selectedHospital, setSelectedHospital] = useState<HospitalNode | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'hospitals' | 'inventory' | 'analytics' | 'billing'>('map');
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // multiplier: 1x, 2x, 5x
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);

  const loggerEndRef = useRef<HTMLDivElement>(null);

  // --- Local Persistence ---
  useEffect(() => {
    localStorage.setItem('surg_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('surg_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('surg_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('surg_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('surg_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  // --- Auto-scroll standard logs ---
  useEffect(() => {
    loggerEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Core Safety Scan (Alert Ticker Engine) ---
  useEffect(() => {
    const deficits = items.filter(i => i.stockLevel <= i.minRequired).map(i => i.name);
    const newAlerts: string[] = [];
    if (deficits.length > 0) {
      newAlerts.push(`CRITICAL ALLOCATION WARNING: ${deficits.length} surgical commodities are currently dropping below safety reserve limits.`);
    }
    const urgentOrders = orders.filter(o => o.priority === 'critical' && o.status !== 'delivered');
    if (urgentOrders.length > 0) {
      newAlerts.push(`VITAL REFILL REQUEST: Retailer outlets have ${urgentOrders.length} critical depletion orders awaiting approval!`);
    }
    setSystemAlerts(newAlerts);
  }, [items, orders]);

  // --- Synchronous Simulation Telemetry Tick (100ms interval) ---
  // --- Autonomous Store Refill Generator Sim Ticker ---
  useEffect(() => {
    let intervalId: any = null;

    if (simulationRunning) {
      intervalId = setInterval(() => {
        // Automatic random store customer activity spike to simulate a busy retail environment
        const chance = 0.05 * simulationSpeed;
        if (Math.random() < chance && hospitals.length > 0 && items.length > 0) {
          const randomHosp = hospitals[Math.floor(Math.random() * hospitals.length)];
          const randomItemsList: { sku: string; name: string; quantity: number }[] = [];
          
          // Select 1 to 2 random items to require restocking
          const itemsToPick = [...items].sort(() => 0.5 - Math.random()).slice(0, Math.floor(1 + Math.random() * 2));
          itemsToPick.forEach(i => {
            randomItemsList.push({
              sku: i.sku,
              name: i.name,
              quantity: Math.floor(4 + Math.random() * 12)
            });
          });

          handleAddOrder({
            hospitalId: randomHosp.id,
            hospitalName: randomHosp.name,
            items: randomItemsList,
            priority: Math.random() > 0.8 ? 'urgent' : 'routine',
            status: 'requested'
          });
        }
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [simulationRunning, simulationSpeed, hospitals, items]);

  // --- Handlers & Actions ---

  // Register brand new retail branch outlet
  const handleAddHospital = (newHosp: HospitalNode) => {
    setHospitals(prev => [...prev, newHosp]);
    const addLog: ActivityLog = {
      id: `log-hosp-add-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'replenish',
      message: `🏢 NEW BRANCH CONNECTED: Registered new retail/pharmacy branch "${newHosp.name}" into regional distribution ledger at coordinates [${newHosp.coordinates.x}x, ${newHosp.coordinates.y}y].`,
      severity: 'info'
    };
    setLogs(l => [addLog, ...l]);
  };

  // Edit hospital/retailer details
  const handleEditHospital = (updatedHosp: HospitalNode) => {
    setHospitals(prev => prev.map(h => h.id === updatedHosp.id ? updatedHosp : h));
    setOrders(prev => prev.map(o => o.hospitalId === updatedHosp.id ? { ...o, hospitalName: updatedHosp.name } : o));
    const editLog: ActivityLog = {
      id: `log-hosp-edit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'replenish',
      message: `⚙️ BRANCH METADATA UPDATED: Parametres for "${updatedHosp.name}" (ID: ${updatedHosp.id}) updated successfully. Coordinates: [${updatedHosp.coordinates.x}x, ${updatedHosp.coordinates.y}y].`,
      severity: 'info'
    };
    setLogs(l => [editLog, ...l]);
  };

  // Turn off hospital node coordinates
  const handleRemoveHospital = (id: string) => {
    const target = hospitals.find(h => h.id === id);
    if (!target) return;

    setHospitals(prev => prev.filter(h => h.id !== id));
    
    // Auto cancel/clear pending requested orders from this hospital
    const ordersToCancel = orders.filter(ord => ord.hospitalId === id && ord.status !== 'delivered');
    setOrders(prevOrders => prevOrders.filter(ord => {
      return !(ord.hospitalId === id && ord.status !== 'delivered');
    }));

    const newLogs: ActivityLog[] = [];
    const nowMs = Date.now();
    const timestampStr = new Date().toISOString();

    ordersToCancel.forEach((ord, index) => {
      newLogs.push({
        id: `log-hosp-cancel-${nowMs}-${ord.id}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timestampStr,
        type: 'alert',
        message: `🚫 PURGED ORDER: Pending request ${ord.id} cancelled automatically due to hospital node shutdown.`,
        severity: 'warning'
      });
    });

    newLogs.push({
      id: `log-hosp-remove-${nowMs}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      type: 'alert',
      message: `🗑️ OFFLINE LOG: Terminated telemetry for "${target.name}". Dismantling active fleet supply protocols. Network connection severed.`,
      severity: 'warning'
    });

    setLogs(prev => [...newLogs, ...prev]);

    if (selectedHospital?.id === id) {
      setSelectedHospital(null);
    }
  };

  // Add a brand new surgical supplier
  const handleAddSupplier = (name: string) => {
    setSuppliers(prev => [...prev, name]);
    const addLog: ActivityLog = {
      id: `log-sup-add-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'replenish',
      message: `🤝 NEW CONTRACT: Registered surgical manufacturer "${name}" to provider network hierarchy.`,
      severity: 'info'
    };
    setLogs(l => [addLog, ...l]);
  };

  // Edit professional supplier details
  const handleEditSupplier = (oldName: string, newName: string) => {
    setSuppliers(prev => prev.map(s => s === oldName ? newName : s));
    
    // Update all items currently associated with oldName to use newName
    setItems(prevItems => prevItems.map(item => {
      if (item.supplier === oldName) {
        return {
          ...item,
          supplier: newName
        };
      }
      return item;
    }));

    const editLog: ActivityLog = {
      id: `log-sup-edit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'replenish',
      message: `⚙️ SUPPLIER CONTRACT MODIFIED: Contract entity "${oldName}" modified to "${newName}". Supply chains merged.`,
      severity: 'info'
    };
    setLogs(l => [editLog, ...l]);
  };

  // Terminate surgical supplier contract
  const handleRemoveSupplier = (name: string) => {
    setSuppliers(prev => prev.filter(s => s !== name));
    
    // Reassign items from this supplier to Default/Central Reserves
    setItems(prevItems => prevItems.map(item => {
      if (item.supplier === name) {
        return {
          ...item,
          supplier: 'Central Reserves'
        };
      }
      return item;
    }));

    const removeLog: ActivityLog = {
      id: `log-sup-remove-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'alert',
      message: `🗑️ CONTRACT TERMINATED: Supplier contract for "${name}" dissolved. Material responsibilities reassigned to Central Reserves.`,
      severity: 'warning'
    };
    setLogs(l => [removeLog, ...l]);
  };

  // Register brand new surgical item
  const handleAddItem = (newItem: SurgicalItem) => {
    setItems(prev => [newItem, ...prev]);
    const addLog: ActivityLog = {
      id: `log-item-add-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'replenish',
      message: `➕ ITEM REGISTERED: "${newItem.name}" (${newItem.sku}) created and associated with supplier "${newItem.supplier}". Capacity: ${newItem.capacity}.`,
      severity: 'info'
    };
    setLogs(l => [addLog, ...l]);
  };

  // Edit details of an existing surgical item
  const handleEditItem = (updatedItem: SurgicalItem) => {
    setItems(prev => prev.map(item => item.sku === updatedItem.sku ? updatedItem : item));
    const editLog: ActivityLog = {
      id: `log-item-edit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'replenish',
      message: `⚙️ ITEM CONFIGURATION UPDATED: "${updatedItem.name}" (${updatedItem.sku}) updated. Buffer target is now ${updatedItem.minRequired} units.`,
      severity: 'info'
    };
    setLogs(l => [editLog, ...l]);
  };

  // Remove logical surgical item from active catalog
  const handleRemoveItem = (sku: string) => {
    setItems(prev => prev.filter(item => item.sku !== sku));
    const deleteLog: ActivityLog = {
      id: `log-item-del-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'alert',
      message: `🗑️ ITEM RETIRED: Item with SKU "${sku}" has been retired and removed from active depot storage registry.`,
      severity: 'warning'
    };
    setLogs(l => [deleteLog, ...l]);
  };

  // 1. Manually replenish item stock in Central Depot
  const handleReplenishItem = (sku: string, amount: number) => {
    const targetItem = items.find(i => i.sku === sku);
    if (!targetItem) return;

    const refinedStock = Math.min(targetItem.capacity, targetItem.stockLevel + amount);

    setItems(prevItems => prevItems.map(item => {
      if (item.sku === sku) {
        return {
          ...item,
          stockLevel: refinedStock,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));

    const additionLog: ActivityLog = {
      id: `log-replenish-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'replenish',
      message: `📦 DEPOT REPLENISHMENT: Registered ${amount} units of ${targetItem.name}. Stock leveled to ${refinedStock} (Reserve Index secure).`,
      severity: 'info'
    };
    setLogs(l => [additionLog, ...l]);
  };

  // 2. Submit new emergency or routine hospital supply request
  const handleAddOrder = (newOrder: Omit<DispatchOrder, 'id' | 'createdAt' | 'totalCost'>) => {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();
    
    // Calculate total pricing cost based on kitted items
    const cost = newOrder.items.reduce((sum, item) => {
      const match = items.find(i => i.sku === item.sku);
      return sum + (match ? match.unitPrice * item.quantity : 0);
    }, 0);

    const fullOrder: DispatchOrder = {
      ...newOrder,
      id,
      createdAt,
      totalCost: cost
    };

    setOrders(prev => [fullOrder, ...prev]);

    // Create action warning logs
    const isCritical = newOrder.priority === 'critical';
    const placementLog: ActivityLog = {
      id: `log-order-placed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: createdAt,
      type: 'order_placed',
      message: `📑 DISPATCH INCOMING [${newOrder.priority.toUpperCase()}]: ${newOrder.hospitalName} requested ${newOrder.items.length} items. Total value: ₹${cost.toFixed(2)}.`,
      severity: isCritical ? 'critical' : newOrder.priority === 'urgent' ? 'warning' : 'info'
    };
    setLogs(l => [placementLog, ...l]);

    // Check if any ordered items are already below safety levels inside the Central Hub
    newOrder.items.forEach(orderItem => {
      const liveItem = items.find(i => i.sku === orderItem.sku);
      if (liveItem && liveItem.stockLevel < orderItem.quantity) {
        const warningLog: ActivityLog = {
          id: `log-order-warn-${Date.now()}-${orderItem.sku}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          type: 'alert',
          message: `🚨 MATERIAL DEFICIT: Requested ${orderItem.quantity}x of ${orderItem.name} but Central Hub holds only ${liveItem.stockLevel} units! Supply is in severe shortage.`,
          severity: 'warning'
        };
        setLogs(l => [warningLog, ...l]);
      }
    });
  };

  // 3. Approve and Deliver Order Instantly (deducts from depot, credits to retailer node)
  const handleDispatchOrder = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const targetHosp = hospitals.find(h => h.id === targetOrder.hospitalId);
    if (!targetHosp) return;

    // Deduct items from Central Hub inventory simulation
    setItems(prevItems => {
      return prevItems.map(item => {
        const orderPart = targetOrder.items.find(kitItem => kitItem.sku === item.sku);
        if (orderPart) {
          return {
            ...item,
            stockLevel: Math.max(0, item.stockLevel - orderPart.quantity),
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      });
    });

    // Credit delivered items directly to target retailer node's inventory inside distributor registries
    setNodeInventories(prevInv => {
      const nextInv = { ...prevInv };
      const nodeId = targetOrder.hospitalId;
      if (!nextInv[nodeId]) {
        nextInv[nodeId] = {};
      }
      targetOrder.items.forEach(it => {
        nextInv[nodeId][it.sku] = (nextInv[nodeId][it.sku] || 0) + it.quantity;
      });
      return nextInv;
    });

    // Update Order Status to delivered immediately
    setOrders(prevOrders => {
      return prevOrders.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'delivered',
            deliveredAt: new Date().toISOString()
          };
        }
        return ord;
      });
    });

    // Log the immediate fulfillment event
    const departureLog: ActivityLog = {
      id: `log-dispatch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'order_delivered',
      message: `🚚 DIRECT SHIPMENT COMPLETED: Purchase order ${orderId} approved and immediately delivered to ${targetHosp.name}. Retail shelves updated.`,
      severity: targetOrder.priority === 'critical' ? 'critical' : 'info'
    };
    setLogs(l => [departureLog, ...l]);
  };

  // 4. Cancel requested supply orders
  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    const cancelLog: ActivityLog = {
      id: `log-cancel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'alert',
      message: `❌ DEPROVISIONED: Refill purchase protocol ${orderId} has been manually cancelled by Wholesale HQ.`,
      severity: 'warning'
    };
    setLogs(l => [cancelLog, ...l]);
  };

  // Edit details of a requested supply order
  const handleEditOrder = (updatedOrder: DispatchOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    const editLog: ActivityLog = {
      id: `log-order-edit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'order_placed',
      message: `📑 REQUEST AMENDED: Order ${updatedOrder.id} dispatch parameters reformulated by logistics. Urgency: ${updatedOrder.priority.toUpperCase()}. Cost Adjusted.`,
      severity: updatedOrder.priority === 'critical' ? 'critical' : 'info'
    };
    setLogs(l => [editLog, ...l]);
  };

  // Stock Redistribution Handler (Balances items between outlets)
  const handleTransferStock = (sku: string, sourceId: string, destId: string, quantity: number) => {
    if (sourceId === 'CENTRAL_DEPOT') {
      const matchedItem = items.find(i => i.sku === sku);
      if (!matchedItem || matchedItem.stockLevel < quantity) {
        return { success: false, message: "Insufficient stock level in the Central Depot." };
      }
      
      setItems(prevItems => prevItems.map(i => {
        if (i.sku === sku) {
          return { ...i, stockLevel: i.stockLevel - quantity, lastUpdated: new Date().toLocaleTimeString() };
        }
        return i;
      }));

      setNodeInventories(prev => {
        const next = { ...prev };
        if (!next[destId]) next[destId] = {};
        next[destId][sku] = (next[destId][sku] || 0) + quantity;
        return next;
      });

      const logTransfer: ActivityLog = {
        id: `log-redistrib-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        type: 'replenish',
        message: `📦 DEPOT REDISTRIBUTION: Transited ${quantity}x of ${sku} from Central Depot to Retail Outlet "${hospitals.find(h => h.id === destId)?.name || destId}".`,
        severity: 'info'
      };
      setLogs(prev => [logTransfer, ...prev]);

      return { success: true, message: `Transited ${quantity}x units of ${sku} from Central Depot successfully!` };
    } else {
      const sourceStockAvailable = nodeInventories[sourceId]?.[sku] || 0;
      if (sourceStockAvailable < quantity) {
        return { success: false, message: `Insufficient stock level at Selected Source Retailer node.` };
      }

      setNodeInventories(prev => {
        const next = { ...prev };
        
        if (next[sourceId]) {
          next[sourceId][sku] = Math.max(0, (next[sourceId][sku] || 0) - quantity);
        }

        const realDestId = destId === 'CENTRAL_DEPOT' ? 'CENTRAL_DEPOT' : destId;
        if (realDestId === 'CENTRAL_DEPOT') {
          setItems(prevItems => prevItems.map(i => {
            if (i.sku === sku) {
              return { ...i, stockLevel: i.stockLevel + quantity, lastUpdated: new Date().toLocaleTimeString() };
            }
            return i;
          }));
        } else {
          if (!next[realDestId]) next[realDestId] = {};
          next[realDestId][sku] = (next[realDestId][sku] || 0) + quantity;
        }

        return next;
      });

      const sourceName = hospitals.find(h => h.id === sourceId)?.name || sourceId;
      const destName = destId === 'CENTRAL_DEPOT' ? 'Central Depot' : (hospitals.find(h => h.id === destId)?.name || destId);
      
      const logTransfer: ActivityLog = {
        id: `log-redistrib-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        type: 'replenish',
        message: `🔄 INTER-NODE BALANCING: Transferred ${quantity}x of ${sku} directly from "${sourceName}" to "${destName}". Stock balanced successfully.`,
        severity: 'info'
      };
      setLogs(prev => [logTransfer, ...prev]);

      return { 
        success: true, 
        message: `Successfully redistributed ${quantity}x of ${sku} from ${sourceName.slice(0, 20)} to ${destName.slice(0, 20)}!` 
      };
    }
  };

  // 5. Simulate Random Wholesale Shopping Rush Event (Generates sudden real-time hospital orders)
  const triggerRandomTraumaSurgery = () => {
    if (hospitals.length === 0) return;
    // Pick a random store outlet
    const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];
    
    // Select 1 to 2 random surgical items to kit up
    const randomItems: { sku: string; name: string; quantity: number }[] = [];
    const itemSlotsToPick = [...items].sort(() => 0.5 - Math.random()).slice(0, Math.floor(1 + Math.random() * 2));
    
    itemSlotsToPick.forEach(i => {
      randomItems.push({
        sku: i.sku,
        name: i.name,
        quantity: Math.floor(5 + Math.random() * 15)
      });
    });

    const isCritical = Math.random() > 0.4;
    const priority: OrderPriority = isCritical ? 'critical' : 'urgent';

    handleAddOrder({
      hospitalId: randomHospital.id,
      hospitalName: randomHospital.name,
      items: randomItems,
      priority,
      status: 'requested'
    });

    // Alert Log for checkout notification
    const surgeryAlert: ActivityLog = {
      id: `log-surgery-alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type: 'alert',
      message: `🚨 DEMAND SPIKE: Sudden high-volume consumer refill request processed from ${randomHospital.name}. Approve immediately.`,
      severity: 'critical'
    };
    setLogs(l => [surgeryAlert, ...l]);
  };

  // 6. Complete Reset to pristine presets
  const handleTriggerFactoryRestore = () => {
    localStorage.removeItem('surg_items');
    localStorage.removeItem('surg_orders');
    localStorage.removeItem('surg_logs');
    localStorage.removeItem('surg_suppliers');
    localStorage.removeItem('surg_hospitals');
    setItems(INITIAL_ITEMS);
    setOrders(INITIAL_ORDERS);
    setLogs(INITIAL_LOGS);
    setHospitals(INITIAL_HOSPITALS);
    setSuppliers([
      "Sun Pharmaceutical Industries Ltd.",
      "Biocon Ltd.",
      "Dr. Reddy's Laboratories",
      "Lupin Pharmaceuticals",
      "Cipla Ltd.",
      "Divi's Laboratories"
    ]);
    setSelectedHospital(null);
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-12 antialiased">
      
      {/* 1. TOP ALERT TICKER BAR */}
      {systemAlerts.length > 0 ? (
        <div className="bg-rose-950/90 border-b border-rose-800/60 py-2.5 px-4 text-xs font-mono font-medium flex items-center justify-between text-rose-200">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse flex-shrink-0" />
            <span className="truncate scroll-text tracking-wide uppercase animate-pulse">{systemAlerts[0]}</span>
          </div>
          <div className="flex-shrink-0 pl-3">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] bg-rose-900 border border-rose-700/85">COMMAND SECTOR ALERTIMG</span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/80 border-b border-emerald-800/40 py-2 px-4 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>ALL LOGISTICS SECTORS ONLINE: Local surgical supply reserves matching regional municipal quotas.</span>
        </div>
      )}

      {/* 2. CORPORATE HEADER */}
      <header className="bg-slate-950 border-b border-slate-900 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center p-1 font-bold text-sky-400">
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-sans uppercase">Pharmaceutical Distributor Hub</h1>
                <span className="text-[10px] bg-slate-900 text-cyan-400 border border-slate-800 rounded px-1.5 font-mono">REGIONAL LEDGER</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Wholesale Operations Portal • Automated Store Refill Management</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Quick Action: Trigger sudden Wholesale Shopping Rush */}
            <button
              onClick={triggerRandomTraumaSurgery}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-600 hover:to-rose-500 transition-all text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-red-950 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-white animate-pulse" /> Simulate Consumer Demand Spike
            </button>

            {/* Time Control Dashboard */}
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setSimulationRunning(!simulationRunning)}
                className={`p-1 px-2 rounded-md text-[11px] font-mono font-medium flex items-center gap-1 cursor-pointer transition-all ${
                  simulationRunning 
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' 
                    : 'bg-rose-950/50 text-rose-450 border border-transparent'
                }`}
                title={simulationRunning ? "Pause fleet simulation ticker" : "Start fleet simulation ticker"}
              >
                {simulationRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {simulationRunning ? 'LIVE' : 'HOLD'}
              </button>

              <div className="h-4 w-[1px] bg-slate-800 mx-1" />

              <span className="text-[10px] text-slate-500 font-mono font-semibold px-1 tracking-tight">SPEED RATINGS:</span>
              {([1, 2, 5] as number[]).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`p-1 px-1.5 rounded font-mono text-[10px] cursor-pointer transition-colors ${
                    simulationSpeed === spd && simulationRunning
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {showResetConfirm ? (
              <div className="flex items-center gap-1 bg-slate-950 border border-rose-900/80 p-1 rounded-lg animate-fade-in relative z-50">
                <span className="text-[9px] text-red-400 font-bold font-mono px-1.5 uppercase tracking-wide">RESET ALL?</span>
                <button
                  onClick={() => {
                    handleTriggerFactoryRestore();
                    setShowResetConfirm(false);
                  }}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                >
                  YES
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-350 rounded text-[10px] font-medium cursor-pointer"
                >
                  NO
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 py-2 border border-slate-900 bg-slate-900/50 hover:bg-slate-900 text-slate-500 hover:text-slate-400 transition-colors rounded-lg flex items-center justify-center cursor-pointer"
                title="Factory reset supply reserves"
              >
                <RefreshCw className="w-3.5 h-3.5 text-red-500/80 hover:text-red-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. MOBILE TAB SWITCHER BAR */}
      <div className="lg:hidden px-4 mt-1.5">
        <div className="bg-slate-950 border border-slate-900 p-1 rounded-xl grid grid-cols-5 gap-0.5">
          <button
            onClick={() => setMobileTab('map')}
            className={`py-2 px-0.5 rounded-lg text-center font-mono text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
              mobileTab === 'map'
                ? 'bg-sky-500/15 text-sky-450 border border-sky-500/20 shadow-md'
                : 'text-slate-400 border border-transparent hover:text-slate-200'
            }`}
          >
            <span className="text-sm">🌐</span>
            <span className="truncate">Grid Map</span>
          </button>
          <button
            onClick={() => setMobileTab('hospitals')}
            className={`py-2 px-0.5 rounded-lg text-center font-mono text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
              mobileTab === 'hospitals'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-md'
                : 'text-slate-400 border border-transparent hover:text-slate-200'
            }`}
          >
            <span className="text-sm">🏥</span>
            <span className="truncate">Nodes</span>
          </button>
          <button
            onClick={() => setMobileTab('inventory')}
            className={`py-2 px-0.5 rounded-lg text-center font-mono text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
              mobileTab === 'inventory'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-md'
                : 'text-slate-400 border border-transparent hover:text-slate-200'
            }`}
          >
            <span className="text-sm">📦</span>
            <span className="truncate">Supplies</span>
          </button>
          <button
            onClick={() => setMobileTab('analytics')}
            className={`py-2 px-0.5 rounded-lg text-center font-mono text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
              mobileTab === 'analytics'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-md'
                : 'text-slate-400 border border-transparent hover:text-slate-200'
            }`}
          >
            <span className="text-sm">📊</span>
            <span className="truncate">Metrics</span>
          </button>
          <button
            onClick={() => setMobileTab('billing')}
            className={`py-2 px-0.5 rounded-lg text-center font-mono text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
              mobileTab === 'billing'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-md'
                : 'text-slate-400 border border-transparent hover:text-slate-200'
            }`}
          >
            <span className="text-sm">🧾</span>
            <span className="truncate">Billing</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN CORED DASHBOARD AREA */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-5 space-y-6">
        
        {/* --- DESKTOP VIEW LAYOUT (lg:grid, hidden on mobile) --- */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-stretch">
          {/* Tracking Map - 7 Columns */}
          <div className="lg:col-span-7 flex flex-col">
            <InteractiveLogisticsMap
              hospitals={hospitals}
              orders={orders}
              onSelectHospital={setSelectedHospital}
              selectedHospital={selectedHospital}
              onQuickOrder={(hospital) => setSelectedHospital(hospital)}
            />
          </div>

          {/* Dispatcher Orders Controller - 5 Columns */}
          <div className="lg:col-span-5 flex flex-col">
            <HospitalOrdersList
              orders={orders}
              hospitals={hospitals}
              items={items}
              onAddOrder={handleAddOrder}
              onDispatchOrder={handleDispatchOrder}
              onCancelOrder={handleCancelOrder}
              onEditOrder={handleEditOrder}
              selectedHospitalForOrder={selectedHospital}
              onClearSelectedHospital={() => setSelectedHospital(null)}
            />
          </div>
        </div>

        {/* Desktop Second Row - Inventory, Hospital & Supplier Manager / Analytics */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5">
          {/* Left Side: Inventory & Hospital Registry Manager - 7 Columns */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            <InventoryTable
              items={items}
              onReplenish={handleReplenishItem}
              suppliers={suppliers}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onRemoveItem={handleRemoveItem}
            />

            <HospitalManager
              hospitals={hospitals}
              onAddHospital={handleAddHospital}
              onRemoveHospital={handleRemoveHospital}
              onEditHospital={handleEditHospital}
            />

            <SupplierManager
              suppliers={suppliers}
              items={items}
              onAddSupplier={handleAddSupplier}
              onRemoveSupplier={handleRemoveSupplier}
              onEditSupplier={handleEditSupplier}
            />
          </div>

          {/* Right Side: Analytics & Logs - 5 Columns */}
          <div className="lg:col-span-5 flex flex-col space-y-5">
            <LogisticsAnalytics
              items={items}
              hospitals={hospitals}
              orders={orders}
            />

            {/* Live command logs telemetry stream */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col h-[280px]">
              <h2 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 pb-2.5 border-b border-slate-800/80 mb-3 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" /> Distributor Telemetry Data Feed
              </h2>

              <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[10px] text-slate-400 pr-1">
                {logs.map((l, idx) => (
                  <div 
                    key={`${l.id}-${idx}`} 
                    className={`p-2 rounded border transition-colors ${
                      l.severity === 'critical' ? 'bg-red-950/20 border-red-950 text-red-300' :
                      l.severity === 'warning' ? 'bg-amber-950/20 border-amber-950/40 text-amber-300' :
                      'bg-slate-950/45 border-slate-950 text-slate-350'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                      <span>• {l.type.toUpperCase().replace('_', ' ')}</span>
                      <span>{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    {l.message}
                  </div>
                ))}
                <div ref={loggerEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Third Row: Stock Redistribution Management Deck */}
        <div className="hidden lg:block">
          <RedistributionHub
            items={items}
            hospitals={hospitals}
            nodeInventories={nodeInventories}
            onTransfer={handleTransferStock}
          />
        </div>

        {/* Desktop Fourth Row: Billing & Document Letterhead Center */}
        <div className="hidden lg:block">
          <BillingLetterhead
            hospitals={hospitals}
            orders={orders}
            suppliers={suppliers}
            items={items}
            onReplenish={handleReplenishItem}
          />
        </div>

        {/* --- MOBILE/TABLET TABS VIEW LAYOUT (hidden on desktop lg) --- */}
        <div className="lg:hidden space-y-5">
          {/* Mobile Tab 1: Live Map & Active Queue */}
          {mobileTab === 'map' && (
            <div className="space-y-5">
              <InteractiveLogisticsMap
                hospitals={hospitals}
                orders={orders}
                onSelectHospital={setSelectedHospital}
                selectedHospital={selectedHospital}
                onQuickOrder={(hospital) => setSelectedHospital(hospital)}
              />
              <HospitalOrdersList
                orders={orders}
                hospitals={hospitals}
                items={items}
                onAddOrder={handleAddOrder}
                onDispatchOrder={handleDispatchOrder}
                onCancelOrder={handleCancelOrder}
                onEditOrder={handleEditOrder}
                selectedHospitalForOrder={selectedHospital}
                onClearSelectedHospital={() => setSelectedHospital(null)}
              />
            </div>
          )}

          {/* Mobile Tab 2: Hospital Manager Nodes */}
          {mobileTab === 'hospitals' && (
            <HospitalManager
              hospitals={hospitals}
              onAddHospital={handleAddHospital}
              onRemoveHospital={handleRemoveHospital}
              onEditHospital={handleEditHospital}
            />
          )}

          {/* Mobile Tab 3: Surgical Stock & Supplier SLAs */}
          {mobileTab === 'inventory' && (
            <div className="space-y-5">
              <InventoryTable
                items={items}
                onReplenish={handleReplenishItem}
                suppliers={suppliers}
                onAddItem={handleAddItem}
                onEditItem={handleEditItem}
                onRemoveItem={handleRemoveItem}
              />
              <SupplierManager
                suppliers={suppliers}
                items={items}
                onAddSupplier={handleAddSupplier}
                onRemoveSupplier={handleRemoveSupplier}
                onEditSupplier={handleEditSupplier}
              />
              <RedistributionHub
                items={items}
                hospitals={hospitals}
                nodeInventories={nodeInventories}
                onTransfer={handleTransferStock}
              />
            </div>
          )}

          {/* Mobile Tab 4: Diagnostics Intelligence & Logs */}
          {mobileTab === 'analytics' && (
            <div className="space-y-5">
              <LogisticsAnalytics
                items={items}
                hospitals={hospitals}
                orders={orders}
              />
              
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col h-[300px]">
                <h2 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 pb-2.5 border-b border-slate-800/80 mb-3 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" /> Distributor Telemetry Data Feed
                </h2>

                <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[10px] text-slate-400 pr-1">
                  {logs.map((l, idx) => (
                    <div 
                      key={`${l.id}-${idx}`} 
                      className={`p-2 rounded border transition-colors ${
                        l.severity === 'critical' ? 'bg-red-950/20 border-red-950 text-red-300' :
                        l.severity === 'warning' ? 'bg-amber-950/20 border-amber-950/40 text-amber-300' :
                        'bg-slate-950/45 border-slate-950 text-slate-350'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                        <span>• {l.type.toUpperCase().replace('_', ' ')}</span>
                        <span>{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      {l.message}
                    </div>
                  ))}
                  <div ref={loggerEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Tab 5: Dynamic Billing and Supplier Requisition Letterheads */}
          {mobileTab === 'billing' && (
            <BillingLetterhead
              hospitals={hospitals}
              orders={orders}
              suppliers={suppliers}
              items={items}
              onReplenish={handleReplenishItem}
            />
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 Wholesale & Distributor supply chain network • Retailer Refill System</p>
      </footer>
    </div>
  );
}
