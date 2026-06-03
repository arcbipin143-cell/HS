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
    wholesalePrice: 650.0,
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
    wholesalePrice: 3400.0,
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
    wholesalePrice: 1350.0,
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
    wholesalePrice: 6800.0,
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
    wholesalePrice: 9500.0,
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
    wholesalePrice: 900.0,
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
    wholesalePrice: 2650.0,
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
    wholesalePrice: 5800.0,
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
    wholesalePrice: 24500.0,
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
    wholesalePrice: 700.0,
    supplier: "Dr. Reddy's Laboratories",
    lastUpdated: "2026-05-29"
  }
];

export const INITIAL_HOSPITALS: HospitalNode[] = [
  {
    id: "H-AIIMS",
    name: "AIIMS Plaza Retail Pharmacy, New Delhi",
    type: "Retail Pharmacy Center",
    coordinates: { x: 42, y: 22 },
    urgency: "high",
    contactNumber: "+91 11-26588500",
    address: "Ansari Nagar East, New Delhi 110029"
  },
  {
    id: "H-APOLLO",
    name: "Apollo Retail Pharmacy Center, Chennai",
    type: "Retail Pharmacy Center",
    coordinates: { x: 55, y: 78 },
    urgency: "medium",
    contactNumber: "+91 44-28290200",
    address: "Greams Road, Thousand Lights, Chennai 600006"
  },
  {
    id: "H-AUSHADHI",
    name: "Jan Aushadhi Retail Pharmacy, Zone-6",
    type: "Retail Pharmacy Center",
    coordinates: { x: 78, y: 28 },
    urgency: "medium",
    contactNumber: "+91 11-23061144",
    address: "Paharganj Sector Hub, New Delhi 110055"
  },
  {
    id: "H-SANJIVANI",
    name: "Sanjivani Medicals Franchise #14",
    type: "Retail Pharmacy Center",
    coordinates: { x: 18, y: 38 },
    urgency: "low",
    contactNumber: "+91 22-98421054",
    address: "Andheri West, Link Road, Mumbai 405521"
  },
  {
    id: "H-FRANCHISE-CENTRAL",
    name: "Max Health Distribution Franchise Hub",
    type: "Franchise Distribution Hub",
    coordinates: { x: 68, y: 64 },
    urgency: "high",
    contactNumber: "+91 80-44919593",
    address: "Whitefield Main Rd, Bengaluru 560066"
  }
];

export const WAREHOUSE_COORDINATES = { x: 45, y: 50, name: "Pradhan Mantri Jan Aushadhi Central Depot" };

export const INITIAL_ORDERS: DispatchOrder[] = [
  {
    id: "ORD-1001",
    hospitalId: "H-AIIMS",
    hospitalName: "AIIMS Plaza Retail Pharmacy, New Delhi",
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
    hospitalId: "H-AUSHADHI",
    hospitalName: "Jan Aushadhi Retail Pharmacy, Zone-6",
    items: [
      { sku: "S-INST-001", name: "Carbon Steel Surgical Blades (No. 11)", quantity: 5 },
      { sku: "S-CONS-010", name: "Povidone-Iodine Sterile Scrub Pads", quantity: 2 }
    ],
    priority: "routine",
    status: "delivered",
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
    message: "CRITICAL order ORD-1001 placed by AIIMS Plaza Retail Pharmacy, New Delhi for stock replenishment.",
    severity: "warning"
  },
  {
    id: "log-3",
    timestamp: "2026-05-29T09:10:00Z",
    type: "order_placed",
    message: "Routine order ORD-1002 registered for Jan Aushadhi Retail Pharmacy, Zone-6.",
    severity: "info"
  },
  {
    id: "log-4",
    timestamp: "2026-05-29T09:20:00Z",
    type: "replenish",
    message: "Bulk replenishment successful: +200 Sterile Latex Surgical Gloves added to central distributor stock.",
    severity: "info"
  }
];
