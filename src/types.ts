/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SurgicalItem {
  sku: string;
  name: string;
  category: 'Instruments' | 'Consumables' | 'Specialized' | 'PPE';
  stockLevel: number;
  minRequired: number; // Safety trigger point
  capacity: number;    // Ideal max stocking level
  unit: string;
  unitPrice: number;   // Selling price to retailers (Retail/List Price)
  wholesalePrice?: number; // Cost price paid to manufacturers
  supplier: string;
  lastUpdated: string;
}

export interface HospitalNode {
  id: string;
  name: string;
  type: 'Trauma Center' | 'Surgical Pavilion' | 'Childrens Hospital' | 'Outpatient Clinic' | 'Retail Pharmacy Center' | 'Franchise Distribution Hub';
  coordinates: { x: number; y: number };
  urgency: 'low' | 'medium' | 'high';
  contactNumber: string;
  address: string;
}

export type OrderPriority = 'routine' | 'urgent' | 'critical';
export type OrderStatus = 'requested' | 'preparing' | 'in-transit' | 'delivered';

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
}

export interface DispatchOrder {
  id: string;
  hospitalId: string;
  hospitalName: string;
  items: OrderItem[];
  priority: OrderPriority;
  status: OrderStatus;
  vehicleId?: string;
  etaMinutes?: number;
  totalCost: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface LogisticsVehicle {
  id: string;
  name: string;
  type: 'emergency-courier' | 'refrigerated-truck' | 'cargo-van';
  status: 'idle' | 'loading' | 'en-route' | 'returning';
  currentOrderId?: string;
  speed: number; // grid units per frame/tick
  progress: number; // 0 to 1
  x: number;
  y: number;
  currentDestination?: { x: number; y: number; name: string };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'stock_low' | 'order_placed' | 'order_dispatched' | 'order_delivered' | 'replenish' | 'alert';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}
