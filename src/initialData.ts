/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SurgicalItem, HospitalNode, DispatchOrder, LogisticsVehicle, ActivityLog } from './types';

export const INITIAL_ITEMS: SurgicalItem[] = [
  {
    sku: "S-INST-001",
    name: "Carbon Steel Surgical Blades (No. 11)",
    category: "Instruments",
    stockLevel: 250,
    minRequired: 100,
    capacity: 500,
    unit: "box of 100",
    unitPrice: 850.0,
    supplier: "Sun Pharmaceutical Industries Ltd.",
    lastUpdated: "2026-05-29"
  },
  {
    sku: "S-SPEC-002",
    name: "Orthopedic Cortical Screws (4.5mm)",
    category: "Specialized",
    stockLevel: 45,
    minRequired: 30,
    capacity: 100,
    unit: "sterile unit",
    unitPrice: 4500.0,
    supplier: "Biocon Ltd.",
    lastUpdated: "2026-05-28"
  },
  {
    sku: "S-CONS-003",
    name: "Sterile Absorbable Chromic Sutures 2-0",
    category: "Consumables",
    stockLevel: 15, // Below security trigger value 80!
    minRequired: 80,
    capacity: 300,
    unit: "box of 36",
    unitPrice: 1800.0,
    supplier: "Dr. Reddy's Laboratories",
    lastUpdated: "2026-05-29"
  },
  {
    sku: "S-INST-004",
    name: "Micro-vascular Forceps (Curved)",
    category: "Instruments",
    stockLevel: 12, // Below safety level 15!
    minRequired: 15,
    capacity: 40,
    unit: "unit",
    unitPrice: 8900.0,
    supplier: "Lupin Pharmaceuticals",
    lastUpdated: "2026-05-27"
  },
  {
    sku: "S-SPEC-005",
    name: "Angioplasty Balloon Catheter Kit",
    category: "Specialized",
    stockLevel: 6, // Below safety level 10!
    minRequired: 10,
    capacity: 30,
    unit: "sterile kit",
    unitPrice: 12500.0,
    supplier: "Sun Pharmaceutical Industries Ltd.",
    lastUpdated: "2026-05-29"
  },
  {
    sku: "S-PPE-006",
    name: "Infrared-Sterilized Latex Surgical Gloves",
    category: "PPE",
    stockLevel: 650,
    minRequired: 200,
    capacity: 1000,
    unit: "box of 100",
    unitPrice: 1200.0,
    supplier: "Cipla Ltd.",
    lastUpdated: "2026-05-29"
  },
  {
    sku: "S-PPE-007",
    name: "Surgical Gowns (AAMI Level 3 Splash Protection)",
    category: "PPE",
    stockLevel: 180,
    minRequired: 150,
    capacity: 500,
    unit: "pack of 50",
    unitPrice: 3500.0,
    supplier: "Cipla Ltd.",
    lastUpdated: "2026-05-28"
  },
  {
    sku: "S-INST-008",
    name: "Pneumatic Surgical Drill Bits Pack",
    category: "Instruments",
    stockLevel: 12,
    minRequired: 8,
    capacity: 25,
    unit: "pack of 3",
    unitPrice: 7500.0,
    supplier: "Biocon Ltd.",
    lastUpdated: "2026-05-25"
  },
  {
    sku: "S-SPEC-009",
    name: "Vascular Graft (Polyester 6mm)",
    category: "Specialized",
    stockLevel: 14,
    minRequired: 5,
    capacity: 15,
    unit: "sterile piece",
    unitPrice: 32000.0,
    supplier: "Zydus Lifesciences",
    lastUpdated: "2026-05-22"
  },
  {
    sku: "S-CONS-010",
    name: "Povidone-Iodine Sterile Scrub Pads",
    category: "Consumables",
    stockLevel: 120,
    minRequired: 50,
    capacity: 250,
    unit: "pack of 10",
    unitPrice: 950.0,
    supplier: "Dr. Reddy's Laboratories",
    lastUpdated: "2026-05-29"
  }
];

export const INITIAL_HOSPITALS: HospitalNode[] = [
  {
    id: "H-AIIMS",
    name: "AIIMS Apex Trauma Centre, New Delhi",
    type: "Trauma Center",
    coordinates: { x: 42, y: 22 },
    urgency: "high",
    contactNumber: "+91 11-26588500",
    address: "Ansari Nagar East, New Delhi 110029"
  },
  {
    id: "H-APOLLO",
    name: "Apollo Hospital Main Centre, Chennai",
    type: "Surgical Pavilion",
    coordinates: { x: 55, y: 78 },
    urgency: "medium",
    contactNumber: "+91 44-28290200",
    address: "Greams Road, Thousand Lights, Chennai 600006"
  },
  {
    id: "H-FORTIS",
    name: "Fortis Hospital & Cardiac Care, Mumbai",
    type: "Trauma Center",
    coordinates: { x: 25, y: 56 },
    urgency: "high",
    contactNumber: "+91 22-67994111",
    address: "Mulund West, Goregaon-Mulund Link Road, Mumbai 400078"
  },
  {
    id: "H-NARAYANA",
    name: "Narayana Institute of Cardiac Sciences",
    type: "Childrens Hospital",
    coordinates: { x: 48, y: 72 },
    urgency: "low",
    contactNumber: "+91 80-71222222",
    address: "Bommasandra Industrial Area, Bengaluru 560099"
  }
];

export const WAREHOUSE_COORDINATES = { x: 45, y: 50, name: "Pradhan Mantri Jan Aushadhi Central Depot" };

export const INITIAL_VEHICLES: LogisticsVehicle[] = [
  {
    id: "V-COURIER",
    name: "Emergency Bio-Courier (V-1)",
    type: "emergency-courier",
    status: "idle",
    speed: 0.04, // fastest
    progress: 0,
    x: 45,
    y: 50
  },
  {
    id: "V-THERMO",
    name: "Thermo-Secure Logistics (V-2)",
    type: "refrigerated-truck",
    status: "idle",
    speed: 0.015, // slowest, safe cooling
    progress: 0,
    x: 45,
    y: 50
  },
  {
    id: "V-CARGO",
    name: "Surgical Supply Van (V-3)",
    type: "cargo-van",
    status: "idle",
    speed: 0.025, // medium
    progress: 0,
    x: 45,
    y: 50
  }
];

export const INITIAL_ORDERS: DispatchOrder[] = [
  {
    id: "ORD-1001",
    hospitalId: "H-AIIMS",
    hospitalName: "AIIMS Apex Trauma Centre, New Delhi",
    items: [
      { sku: "S-SPEC-005", name: "Angioplasty Balloon Catheter Kit", quantity: 3 },
      { sku: "S-INST-004", name: "Micro-vascular Forceps (Curved)", quantity: 4 }
    ],
    priority: "critical",
    status: "requested",
    totalCost: 73100.00,
    createdAt: "2026-05-29T08:15:00Z"
  },
  {
    id: "ORD-1002",
    hospitalId: "H-NARAYANA",
    hospitalName: "Narayana Institute of Cardiac Sciences",
    items: [
      { sku: "S-INST-001", name: "Carbon Steel Surgical Blades (No. 11)", quantity: 5 },
      { sku: "S-CONS-010", name: "Povidone-Iodine Sterile Scrub Pads", quantity: 2 }
    ],
    priority: "routine",
    status: "preparing",
    vehicleId: "V-CARGO",
    totalCost: 6150.00,
    createdAt: "2026-05-29T09:10:00Z"
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "2026-05-29T07:30:00Z",
    type: "alert",
    message: "CRITICAL STORAGE WARNING: Sterile Absorbable Chromic Sutures 2-0 dropped below core reserve levels (15 packs remaining). Minimum required: 80.",
    severity: "critical"
  },
  {
    id: "log-2",
    timestamp: "2026-05-29T08:15:00Z",
    type: "order_placed",
    message: "CRITICAL order ORD-1001 placed by AIIMS Apex Trauma Centre, New Delhi for urgent bypass components.",
    severity: "warning"
  },
  {
    id: "log-3",
    timestamp: "2026-05-29T09:10:00Z",
    type: "order_placed",
    message: "Routine order ORD-1002 registered for Narayana Institute of Cardiac Sciences, Bengaluru.",
    severity: "info"
  },
  {
    id: "log-4",
    timestamp: "2026-05-29T09:20:00Z",
    type: "replenish",
    message: "Bulk replenishment successful: +200 Sterile Latex Surgical Gloves added from safe reserve.",
    severity: "info"
  }
];
