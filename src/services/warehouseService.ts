// ─── Warehouse Service Layer ──────────────────────────────────────────────────
// Backend-ready: All CRUD operations abstracted for easy MongoDB integration

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReceivingRecord {
  id: string;
  grnNo: string;
  poNumber: string;
  vendor: string;
  items: string;
  quantity: string;
  warehouse: string;
  inspector: string;
  date: string;
  status: "Pending" | "QC Pending" | "Accepted" | "Rejected";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickingRecord {
  id: string;
  pickId: string;
  salesOrder: string;
  customer: string;
  zone: string;
  picker: string;
  items: number;
  picked: number;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed" | "On Hold";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackingRecord {
  id: string;
  packId: string;
  pickId: string;
  customer: string;
  boxes: number;
  weight: string;
  status: "Pending" | "In Progress" | "Completed";
  packedBy: string;
  packedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DispatchRecord {
  id: string;
  dispatchId: string;
  salesOrder: string;
  customer: string;
  destination: string;
  weight: string;
  courier: string;
  trackingNumber: string;
  vehicle?: string;
  driver?: string;
  status: "Draft" | "Dispatched" | "In Transit" | "Delivered";
  dispatchDate: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DockRecord {
  id: string;
  dockNumber: string;
  truckNumber: string;
  arrivalTime: string;
  departureTime?: string;
  status: "Empty" | "Loading" | "Unloading" | "Full" | "Completed";
  operator: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ZoneRecord {
  id: string;
  zoneName: string;
  warehouseId: string;
  capacity: number;
  usedCapacity: number;
  manager: string;
  temperature?: string;
  humidity?: string;
  status: "Active" | "Inactive" | "Maintenance";
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignmentRecord {
  id: string;
  taskId: string;
  employee: string;
  department: string;
  taskType: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "Assigned" | "In Progress" | "Completed" | "On Hold";
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarcodeRecord {
  id: string;
  barcode: string;
  sku: string;
  productName: string;
  quantity: number;
  warehouse: string;
  zone: string;
  bin: string;
  lastScanned: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentTrackingRecord {
  id: string;
  shipmentId: string;
  dispatchId: string;
  customer: string;
  status: "Pending" | "In Transit" | "Out for Delivery" | "Delivered";
  currentLocation: string;
  eta: string;
  courier: string;
  trackingUrl: string;
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GPSRecord {
  id: string;
  vehicleId: string;
  driver: string;
  dispatchId: string;
  latitude: number;
  longitude: number;
  currentStatus: string;
  speed: number;
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PutAwayRuleRecord {
  id: string;
  ruleId: string;
  sku: string;
  productName: string;
  bin: string;
  rack: string;
  zone: string;
  ruleType: "FIFO" | "LIFO" | "Random" | "Location-Based";
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseLocation {
  id: string;
  warehouse: string;
  capacity: number;
  utilized: number;
  items: number;
}

export interface WarehouseDashboardMetrics {
  todayReceipts: number;
  todayDispatches: number;
  pendingPicking: number;
  openTasks: number;
  spaceUtilization: number;
  lowStockItems: number;
  dockStatus: { total: number; active: number };
  activeShipments: number;
}

// ─── Local Storage Keys ────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  RECEIVING: "wh_receiving",
  PICKING: "wh_picking",
  PACKING: "wh_packing",
  DISPATCH: "wh_dispatch",
  DOCK: "wh_dock",
  ZONES: "wh_zones",
  TASKS: "wh_tasks",
  BARCODES: "wh_barcodes",
  SHIPMENTS: "wh_shipments",
  GPS: "wh_gps",
  PUTAWAY: "wh_putaway",
};

// ─── Helper Functions ──────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getStorageData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from storage:`, error);
    return [];
  }
}

function setStorageData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to storage:`, error);
  }
}

// ─── Receiving Service ────────────────────────────────────────────────────────

export const receivingService = {
  getAll: (): ReceivingRecord[] => getStorageData<ReceivingRecord>(STORAGE_KEYS.RECEIVING),
  
  getById: (id: string): ReceivingRecord | undefined => {
    const records = receivingService.getAll();
    return records.find(r => r.id === id);
  },
  
  create: (data: Omit<ReceivingRecord, "id" | "createdAt" | "updatedAt">): ReceivingRecord => {
    const records = receivingService.getAll();
    const newRecord: ReceivingRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.RECEIVING, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<ReceivingRecord>): ReceivingRecord | null => {
    const records = receivingService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.RECEIVING, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = receivingService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.RECEIVING, filtered);
    return true;
  },

  search: (query: string): ReceivingRecord[] => {
    return receivingService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Picking Service ──────────────────────────────────────────────────────────

export const pickingService = {
  getAll: (): PickingRecord[] => getStorageData<PickingRecord>(STORAGE_KEYS.PICKING),
  
  getById: (id: string): PickingRecord | undefined => {
    return pickingService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<PickingRecord, "id" | "createdAt" | "updatedAt">): PickingRecord => {
    const records = pickingService.getAll();
    const newRecord: PickingRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.PICKING, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<PickingRecord>): PickingRecord | null => {
    const records = pickingService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.PICKING, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = pickingService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.PICKING, filtered);
    return true;
  },

  search: (query: string): PickingRecord[] => {
    return pickingService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Packing Service ──────────────────────────────────────────────────────────

export const packingService = {
  getAll: (): PackingRecord[] => getStorageData<PackingRecord>(STORAGE_KEYS.PACKING),
  
  getById: (id: string): PackingRecord | undefined => {
    return packingService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<PackingRecord, "id" | "createdAt" | "updatedAt">): PackingRecord => {
    const records = packingService.getAll();
    const newRecord: PackingRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.PACKING, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<PackingRecord>): PackingRecord | null => {
    const records = packingService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.PACKING, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = packingService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.PACKING, filtered);
    return true;
  },

  search: (query: string): PackingRecord[] => {
    return packingService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Dispatch Service ──────────────────────────────────────────────────────────

export const dispatchService = {
  getAll: (): DispatchRecord[] => getStorageData<DispatchRecord>(STORAGE_KEYS.DISPATCH),
  
  getById: (id: string): DispatchRecord | undefined => {
    return dispatchService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<DispatchRecord, "id" | "createdAt" | "updatedAt">): DispatchRecord => {
    const records = dispatchService.getAll();
    const newRecord: DispatchRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.DISPATCH, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<DispatchRecord>): DispatchRecord | null => {
    const records = dispatchService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.DISPATCH, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = dispatchService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.DISPATCH, filtered);
    return true;
  },

  search: (query: string): DispatchRecord[] => {
    return dispatchService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Dock Service ─────────────────────────────────────────────────────────────

export const dockService = {
  getAll: (): DockRecord[] => getStorageData<DockRecord>(STORAGE_KEYS.DOCK),
  
  getById: (id: string): DockRecord | undefined => {
    return dockService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<DockRecord, "id" | "createdAt" | "updatedAt">): DockRecord => {
    const records = dockService.getAll();
    const newRecord: DockRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.DOCK, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<DockRecord>): DockRecord | null => {
    const records = dockService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.DOCK, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = dockService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.DOCK, filtered);
    return true;
  },

  search: (query: string): DockRecord[] => {
    return dockService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Zone Service ─────────────────────────────────────────────────────────────

export const zoneService = {
  getAll: (): ZoneRecord[] => getStorageData<ZoneRecord>(STORAGE_KEYS.ZONES),
  
  getById: (id: string): ZoneRecord | undefined => {
    return zoneService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<ZoneRecord, "id" | "createdAt" | "updatedAt">): ZoneRecord => {
    const records = zoneService.getAll();
    const newRecord: ZoneRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.ZONES, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<ZoneRecord>): ZoneRecord | null => {
    const records = zoneService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.ZONES, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = zoneService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.ZONES, filtered);
    return true;
  },

  search: (query: string): ZoneRecord[] => {
    return zoneService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Task Assignment Service ──────────────────────────────────────────────────

export const taskService = {
  getAll: (): TaskAssignmentRecord[] => getStorageData<TaskAssignmentRecord>(STORAGE_KEYS.TASKS),
  
  getById: (id: string): TaskAssignmentRecord | undefined => {
    return taskService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<TaskAssignmentRecord, "id" | "createdAt" | "updatedAt">): TaskAssignmentRecord => {
    const records = taskService.getAll();
    const newRecord: TaskAssignmentRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.TASKS, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<TaskAssignmentRecord>): TaskAssignmentRecord | null => {
    const records = taskService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.TASKS, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = taskService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.TASKS, filtered);
    return true;
  },

  search: (query: string): TaskAssignmentRecord[] => {
    return taskService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Barcode Service ──────────────────────────────────────────────────────────

export const barcodeService = {
  getAll: (): BarcodeRecord[] => getStorageData<BarcodeRecord>(STORAGE_KEYS.BARCODES),
  
  getById: (id: string): BarcodeRecord | undefined => {
    return barcodeService.getAll().find(r => r.id === id);
  },
  
  getByBarcode: (barcode: string): BarcodeRecord | undefined => {
    return barcodeService.getAll().find(r => r.barcode === barcode);
  },
  
  create: (data: Omit<BarcodeRecord, "id" | "createdAt" | "updatedAt">): BarcodeRecord => {
    const records = barcodeService.getAll();
    const newRecord: BarcodeRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.BARCODES, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<BarcodeRecord>): BarcodeRecord | null => {
    const records = barcodeService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.BARCODES, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = barcodeService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.BARCODES, filtered);
    return true;
  },

  search: (query: string): BarcodeRecord[] => {
    return barcodeService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Shipment Tracking Service ────────────────────────────────────────────────

export const shipmentService = {
  getAll: (): ShipmentTrackingRecord[] => getStorageData<ShipmentTrackingRecord>(STORAGE_KEYS.SHIPMENTS),
  
  getById: (id: string): ShipmentTrackingRecord | undefined => {
    return shipmentService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<ShipmentTrackingRecord, "id" | "createdAt" | "updatedAt">): ShipmentTrackingRecord => {
    const records = shipmentService.getAll();
    const newRecord: ShipmentTrackingRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.SHIPMENTS, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<ShipmentTrackingRecord>): ShipmentTrackingRecord | null => {
    const records = shipmentService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.SHIPMENTS, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = shipmentService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.SHIPMENTS, filtered);
    return true;
  },

  search: (query: string): ShipmentTrackingRecord[] => {
    return shipmentService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── GPS Service ──────────────────────────────────────────────────────────────

export const gpsService = {
  getAll: (): GPSRecord[] => getStorageData<GPSRecord>(STORAGE_KEYS.GPS),
  
  getById: (id: string): GPSRecord | undefined => {
    return gpsService.getAll().find(r => r.id === id);
  },
  
  getByVehicleId: (vehicleId: string): GPSRecord | undefined => {
    return gpsService.getAll().find(r => r.vehicleId === vehicleId);
  },
  
  create: (data: Omit<GPSRecord, "id" | "createdAt" | "updatedAt">): GPSRecord => {
    const records = gpsService.getAll();
    const newRecord: GPSRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.GPS, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<GPSRecord>): GPSRecord | null => {
    const records = gpsService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.GPS, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = gpsService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.GPS, filtered);
    return true;
  },

  search: (query: string): GPSRecord[] => {
    return gpsService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Put Away Rules Service ───────────────────────────────────────────────────

export const putAwayService = {
  getAll: (): PutAwayRuleRecord[] => getStorageData<PutAwayRuleRecord>(STORAGE_KEYS.PUTAWAY),
  
  getById: (id: string): PutAwayRuleRecord | undefined => {
    return putAwayService.getAll().find(r => r.id === id);
  },
  
  create: (data: Omit<PutAwayRuleRecord, "id" | "createdAt" | "updatedAt">): PutAwayRuleRecord => {
    const records = putAwayService.getAll();
    const newRecord: PutAwayRuleRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    setStorageData(STORAGE_KEYS.PUTAWAY, records);
    return newRecord;
  },
  
  update: (id: string, data: Partial<PutAwayRuleRecord>): PutAwayRuleRecord | null => {
    const records = putAwayService.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data, updatedAt: new Date().toISOString() };
    setStorageData(STORAGE_KEYS.PUTAWAY, records);
    return records[index];
  },
  
  delete: (id: string): boolean => {
    const records = putAwayService.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setStorageData(STORAGE_KEYS.PUTAWAY, filtered);
    return true;
  },

  search: (query: string): PutAwayRuleRecord[] => {
    return putAwayService.getAll().filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase()))
    );
  },
};

// ─── Dashboard Metrics Service ────────────────────────────────────────────────

export const dashboardService = {
  getMetrics: (): WarehouseDashboardMetrics => {
    const today = new Date().toLocaleDateString();
    const receiving = receivingService.getAll();
    const picking = pickingService.getAll();
    const dispatch = dispatchService.getAll();
    const tasks = taskService.getAll();
    const zones = zoneService.getAll();
    const shipments = shipmentService.getAll();
    const dock = dockService.getAll();

    const todayReceipts = receiving.filter(r => r.date.includes(today.split('/')[0])).length; // Simple date check
    const todayDispatches = dispatch.filter(d => d.dispatchDate.includes(today.split('/')[0])).length;
    const pendingPicking = picking.filter(p => p.status === "Pending" || p.status === "In Progress").length;
    const openTasks = tasks.filter(t => t.status !== "Completed").length;
    const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
    const usedCapacity = zones.reduce((sum, z) => sum + z.usedCapacity, 0);
    const spaceUtilization = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;
    const lowStockItems = 0; // Placeholder - would connect to inventory
    const activeDocks = dock.filter(d => d.status !== "Completed" && d.status !== "Empty").length;
    const activeShipments = shipments.filter(s => s.status === "In Transit" || s.status === "Out for Delivery").length;

    return {
      todayReceipts,
      todayDispatches,
      pendingPicking,
      openTasks,
      spaceUtilization,
      lowStockItems,
      dockStatus: { total: dock.length, active: activeDocks },
      activeShipments,
    };
  },

  getWarehouseLocations: (): WarehouseLocation[] => {
    return [
      { id: "WH-01", warehouse: "WH-01 Mumbai", capacity: 12000, utilized: 9840, items: 3241 },
      { id: "WH-02", warehouse: "WH-02 Pune", capacity: 18000, utilized: 12240, items: 2812 },
      { id: "WH-03", warehouse: "WH-03 Delhi", capacity: 8000, utilized: 5680, items: 2368 },
    ];
  },
};

// ─── Initialize Sample Data ────────────────────────────────────────────────────

export function initializeWarehouseData() {
  // Initialize with sample data if storage is empty
  if (receivingService.getAll().length === 0) {
    receivingService.create({
      grnNo: "GRN-2024-001",
      poNumber: "PO-7743",
      vendor: "Steel Corp India",
      items: "500 MT Steel Sheets",
      quantity: "500 MT",
      warehouse: "WH-01 Mumbai",
      inspector: "Raj K.",
      date: "27 Jun 2024",
      status: "Accepted",
    });

    receivingService.create({
      grnNo: "GRN-2024-002",
      poNumber: "PO-7748",
      vendor: "Siemens Ltd.",
      items: "50 Drive Controllers",
      quantity: "50 units",
      warehouse: "WH-01 Mumbai",
      inspector: "Meena P.",
      date: "26 Jun 2024",
      status: "QC Pending",
    });
  }

  if (pickingService.getAll().length === 0) {
    pickingService.create({
      pickId: "PCK-001",
      salesOrder: "SO-8821",
      customer: "Tata Motors",
      zone: "Zone A",
      picker: "Suresh K.",
      items: 8,
      picked: 8,
      priority: "High",
      status: "Completed",
      dueDate: "28 Jun 2024",
    });

    pickingService.create({
      pickId: "PCK-002",
      salesOrder: "SO-8822",
      customer: "Mahindra",
      zone: "Zone B",
      picker: "Raj V.",
      items: 14,
      picked: 9,
      priority: "High",
      status: "In Progress",
      dueDate: "28 Jun 2024",
    });
  }

  if (dispatchService.getAll().length === 0) {
    dispatchService.create({
      dispatchId: "DSP-001",
      salesOrder: "SO-8821",
      customer: "Tata Motors",
      destination: "Pune Plant",
      weight: "8.4 MT",
      courier: "BlueDart",
      trackingNumber: "BD9821441",
      status: "Dispatched",
      dispatchDate: "27 Jun 2024",
    });

    dispatchService.create({
      dispatchId: "DSP-002",
      salesOrder: "SO-8820",
      customer: "Mahindra",
      destination: "Nashik Plant",
      weight: "12.1 MT",
      courier: "DHL India",
      trackingNumber: "DHL442901",
      status: "In Transit",
      dispatchDate: "26 Jun 2024",
    });
  }

  if (dockService.getAll().length === 0) {
    dockService.create({
      dockNumber: "DOCK-01",
      truckNumber: "TN45JK1234",
      arrivalTime: "08:30 AM",
      status: "Loading",
      operator: "Rajesh D.",
    });
  }

  if (zoneService.getAll().length === 0) {
    zoneService.create({
      zoneName: "Zone A",
      warehouseId: "WH-01",
      capacity: 5000,
      usedCapacity: 4100,
      manager: "Suresh K.",
      status: "Active",
    });

    zoneService.create({
      zoneName: "Zone B",
      warehouseId: "WH-01",
      capacity: 4000,
      usedCapacity: 2720,
      manager: "Priya M.",
      status: "Active",
    });

    zoneService.create({
      zoneName: "Zone C",
      warehouseId: "WH-02",
      capacity: 6000,
      usedCapacity: 4200,
      manager: "Vikram R.",
      status: "Active",
    });
  }

  if (taskService.getAll().length === 0) {
    taskService.create({
      taskId: "TSK-001",
      employee: "Suresh K.",
      department: "Warehouse",
      taskType: "Receiving",
      description: "Check and verify incoming goods from PO-7743",
      priority: "High",
      dueDate: "28 Jun 2024",
      status: "In Progress",
      assignedBy: "Warehouse Manager",
    });

    taskService.create({
      taskId: "TSK-002",
      employee: "Raj V.",
      department: "Warehouse",
      taskType: "Picking",
      description: "Pick items for Sales Order SO-8822",
      priority: "High",
      dueDate: "28 Jun 2024",
      status: "In Progress",
      assignedBy: "Warehouse Manager",
    });
  }
}
