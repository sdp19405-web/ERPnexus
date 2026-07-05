/**
 * Comprehensive ERP Module Data Services
 * Handles all CRUD operations, data persistence, and business logic
 * for Dashboard, Sales, CRM, Procurement, Inventory, Warehouse, 
 * Manufacturing, Quality, Finance, HRMS, Payroll, Projects, etc.
 */

// ═════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS FOR ALL MODULES
// ═════════════════════════════════════════════════════════════════════════════

// SALES MODULE TYPES
export interface Lead {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  score?: number;
  industry: string;
  stage: 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Lost';
  value: string;
  expectedClose: string;
  owner: string;
  source: string;
  lastContact: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  activities: Activity[];
}

export interface Customer {
  id: string;
  name: string;
  type: 'Individual' | 'Organization' | 'Reseller' | 'Distributor';
  email: string;
  score?: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNo?: string;
  creditLimit: string;
  paymentTerms: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  registeredDate: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrder {
  id: string;
  customer: string;
  orderDate: string;
  dueDate: string;
  items: OrderItem[];
  subtotal: string;
  tax: string;
  total: string;
  status: 'Draft' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  total: string;
}

// CRM MODULE TYPES
export interface CRMLead {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  stage: 'Hot' | 'Warm' | 'Cold' | 'Qualified';
  score: number;
  lastContact: string;
  owner: string;
  interactions: Interaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  date: string;
  subject: string;
  notes: string;
  attendees: string[];
  duration?: number;
  outcome?: string;
}

export interface ServiceTicket {
  id: string;
  company: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  agent: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// PROCUREMENT MODULE TYPES

export interface DocumentRecord {
  id: string;
  title: string;
  category: string;
  uploadedBy: string;
  size: string;
  version: string;
  status: 'Active' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface ITAsset {
  id: string;
  name: string;
  type: string;
  assignedTo: string;
  purchaseDate: string;
  status: 'In Use' | 'Available' | 'Maintenance' | 'Retired';
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface SupplyChainRecord {
  id: string;
  shipmentId: string;
  origin: string;
  destination: string;
  carrier: string;
  status: 'In Transit' | 'Delivered' | 'Delayed' | 'Pending';
  eta: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  orders: number;
  value: string;
  status: 'Active' | 'On Hold' | 'Inactive';
  contact: string;
  leadTime: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  vendor: string;
  poDate: string;
  dueDate: string;
  items: POItem[];
  status: 'Draft' | 'Approved' | 'Received' | 'Cancelled' | 'On Hold';
  value: string;
  approver: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface POItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  receivedQty: number;
}

export interface RFQ {
  id: string;
  vendors: string[];
  items: RFQItem[];
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Received' | 'Closed';
  winner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFQItem {
  id: string;
  description: string;
  quantity: number;
  uom: string;
  requiredDate: string;
  budget: string;
}

// INVENTORY MODULE TYPES
export interface StockTransaction {
  id: string;
  transactionType: 'In' | 'Out' | 'Transfer' | 'Adjustment';
  sku: string;
  productName: string;
  quantity: number;
  warehouse: string;
  zone?: string;
  batchNo?: string;
  serialNo?: string;
  reference: string;
  reason: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  reorderQty: number;
  unitPrice: string;
  warehouse: string;
  zone: string;
  lastReceived: string;
  lastShipped: string;
  status: 'Active' | 'Inactive' | 'Discontinued';
  createdAt: string;
  updatedAt: string;
}

// MANUFACTURING MODULE TYPES
export interface WorkOrder {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  plannedDate: string;
  dueDate: string;
  status: 'Draft' | 'Released' | 'In Progress' | 'Completed' | 'Cancelled';
  machine?: string;
  operator?: string;
  bom?: BillOfMaterial[];
  routing?: RoutingStep[];
  completedQty: number;
  scrapQty: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillOfMaterial {
  id: string;
  component: string;
  quantity: number;
  uom: string;
  materialCost: string;
}

export interface RoutingStep {
  id: string;
  sequence: number;
  operation: string;
  machine: string;
  estimatedTime: number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

// QUALITY MODULE TYPES
export interface Inspection {
  id: string;
  product: string;
  batch: string;
  inspector: string;
  result: 'Pass' | 'Fail' | 'Pending';
  defects: number;
  samplesChecked: number;
  date: string;
  notes: string;
  createdAt: string;
}

export interface CAPA {
  id: string;
  issue: string;
  source: 'Inspection' | 'Customer' | 'Audit' | 'Lab Test';
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'In Progress' | 'Closed';
  owner: string;
  dueDate: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

// FINANCE MODULE TYPES
export interface Invoice {
  id: string;
  customer: string;
  amount: string;
  dueDate: string;
  raisedDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  items: InvoiceItem[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  date: string;
  mode: 'NEFT' | 'RTGS' | 'Cheque' | 'Cash' | 'Credit Card';
  reference: string;
  status: 'Pending' | 'Cleared' | 'Failed';
  notes: string;
  createdAt: string;
}

export interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  debit: string;
  credit: string;
  balance: string;
  createdAt: string;
}

// HRMS MODULE TYPES
export interface Employee {
  id: string;
  name: string;
  email: string;
  score?: number;
  phone: string;
  dept: string;
  role: string;
  manager?: string;
  salary: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended';
  address: string;
  city: string;
  state: string;
  country: string;
  aadharNo?: string;
  panNo?: string;
  bankAccount?: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Weekend' | 'Holiday';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Paternity' | 'Unpaid';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approver?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

// PAYROLL MODULE TYPES
export interface Payroll {
  id: string;
  employeeId: string;
  period: string;
  basic: string;
  hra: string;
  special: string;
  grossSalary: string;
  pf: string;
  esi: string;
  tds: string;
  otherDeductions: string;
  netSalary: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

// PROJECTS MODULE TYPES
export interface Project {
  id: string;
  name: string;
  manager: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'On Track' | 'At Risk' | 'On Hold' | 'Completed' | 'Cancelled';
  budget: string;
  spent: string;
  progress: number;
  team: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Done';
  dueDate: string;
  startDate: string;
  completedDate?: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

// COMMON TYPES
export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'viewed' | 'submitted' | 'approved';
  description: string;
  createdBy: string;
  createdAt: string;
  timestamp: string;
  changes?: Record<string, { old: any; new: any }>;
}

export interface Comment {
  id: string;
  recordId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Attachment {
  id: string;
  recordId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface AuditLog {
  id: string;
  recordId: string;
  module: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
  changedFields?: Record<string, { oldValue: any; newValue: any }>;
  changedBy: string;
  timestamp: string;
  ipAddress?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS FOR DATA STORAGE
// ═════════════════════════════════════════════════════════════════════════════

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getStorageData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
}

export function setStorageData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SERVICE FACTORY PATTERN FOR ALL MODULES
// ═════════════════════════════════════════════════════════════════════════════

interface IDataService<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T;
  update(id: string, data: Partial<T>): T | undefined;
  delete(id: string): boolean;
  search(query: string, searchFields: string[]): T[];
  logActivity(recordId: string, activity: Omit<Activity, 'id' | 'createdAt'>): void;
}

class DataService<T extends { id?: string; createdAt?: string; updatedAt?: string }> implements IDataService<T> {
  protected storageKey: string;
  protected records: T[] = [];
  protected activities: Activity[] = [];

  constructor(storageKey: string) {
    this.storageKey = storageKey;
    this.records = getStorageData<T>(storageKey);
  }

  getAll(): T[] {
    return [...this.records];
  }

  getById(id: string): T | undefined {
    return this.records.find(r => (r as any).id === id);
  }

  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const record = {
      ...(data as any),
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as T;
    this.records.push(record);
    this.persist();
    this.logActivity((record as any).id, {
      type: 'created',
      description: `Record created`,
      createdBy: 'System',
      timestamp: new Date().toISOString()
    });
    return record;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const index = this.records.findIndex(r => (r as any).id === id);
    if (index === -1) return undefined;

    const oldRecord = { ...this.records[index] };
    const changes: Record<string, { old: any; new: any }> = {};

    Object.keys(data).forEach(key => {
      if ((data as any)[key] !== (this.records[index] as any)[key]) {
        changes[key] = {
          old: (this.records[index] as any)[key],
          new: (data as any)[key]
        };
      }
    });

    this.records[index] = {
      ...this.records[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    this.logActivity(id, {
      type: 'updated',
      description: `Record updated: ${Object.keys(changes).join(', ')}`,
      createdBy: 'System',
      timestamp: new Date().toISOString(),
      changes
    });

    return this.records[index];
  }

  delete(id: string): boolean {
    const index = this.records.findIndex(r => (r as any).id === id);
    if (index === -1) return false;

    this.records.splice(index, 1);
    this.persist();
    this.logActivity(id, {
      type: 'deleted' as any,
      description: 'Record deleted',
      createdBy: 'System',
      timestamp: new Date().toISOString()
    });

    return true;
  }

  search(query: string, searchFields: string[]): T[] {
    const lowerQuery = query.toLowerCase();
    return this.records.filter(record => {
      return searchFields.some(field => {
        const value = (record as any)[field];
        return value && value.toString().toLowerCase().includes(lowerQuery);
      });
    });
  }

  logActivity(recordId: string, activity: Omit<Activity, 'id' | 'createdAt'>): void {
    const auditLog: Activity = {
      id: generateId('ACT'),
      ...activity,
      createdAt: new Date().toISOString()
    };
    this.activities.push(auditLog);
    setStorageData(`activities_${this.storageKey}`, this.activities);
  }

  protected persist(): void {
    setStorageData<T>(this.storageKey, this.records);
  }

  getActivities(recordId: string): Activity[] {
    return this.activities.filter(a => (a as any).recordId === recordId);
  }

  getAllActivities(): Activity[] {
    return [...this.activities];
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE-SPECIFIC SERVICES
// ═════════════════════════════════════════════════════════════════════════════

export class SalesService extends DataService<Lead> {
  constructor() {
    super('erp_sales_leads');
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    if (this.records.length === 0) {
      const sampleLeads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          company: 'Maruti Suzuki',
          contact: 'Rajesh Sharma',
          phone: '+91 98765 11001',
          email: 'rajesh@maruti.com',
          industry: 'Automotive',
          stage: 'Proposal',
          value: '₹48,00,000',
          expectedClose: '30 Jun',
          owner: 'Priya S.',
          source: 'Referral',
          lastContact: '27 Jun 2024',
          notes: '',
          activities: [],
          createdBy: 'System',
        },
        {
          company: 'Infosys BPO',
          contact: 'Meera Iyer',
          phone: '+91 98123 45678',
          email: 'meera@infosys.com',
          industry: 'IT Services',
          stage: 'Qualified',
          value: '₹22,50,000',
          expectedClose: '15 Jul',
          owner: 'Rahul V.',
          source: 'Website',
          lastContact: '26 Jun 2024',
          notes: '',
          activities: [],
          createdBy: 'System',
        },
        {
          company: 'Mahindra Logistics',
          contact: 'Arun Shah',
          phone: '+91 97654 32109',
          email: 'arun@mahindra.com',
          industry: 'Logistics',
          stage: 'Negotiation',
          value: '₹91,00,000',
          expectedClose: '10 Jul',
          owner: 'Kavita R.',
          source: 'Trade Show',
          lastContact: '25 Jun 2024',
          notes: '',
          activities: [],
          createdBy: 'System',
        },
      ];
      sampleLeads.forEach(lead => this.create(lead));
    }
  }

  converter(lead: Lead): Customer {
    return {
      id: generateId('CUST'),
      name: lead.company,
      type: 'Organization',
      email: lead.email,
      phone: lead.phone,
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      creditLimit: lead.value,
      paymentTerms: '30 Days',
      status: 'Active',
      registeredDate: new Date().toISOString(),
      owner: lead.owner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  changePriority(leadId: string, newStage: Lead['stage']): Lead | undefined {
    return this.update(leadId, { stage: newStage } as Partial<Lead>);
  }

  changeOwner(leadId: string, newOwner: string): Lead | undefined {
    return this.update(leadId, { owner: newOwner } as Partial<Lead>);
  }

  getLeadsByStage(stage: Lead['stage']): Lead[] {
    return this.records.filter(lead => lead.stage === stage);
  }

  getLeadsByOwner(owner: string): Lead[] {
    return this.records.filter(lead => lead.owner === owner);
  }
}

export class CustomerService extends DataService<Customer> {
  constructor() {
    super('erp_crm_customers');
  }
}

export class SalesOrderService extends DataService<SalesOrder> {
  constructor() {
    super('erp_sales_orders');
  }

  getTotalValue(): string {
    const total = this.records.reduce((sum, order) => {
      const amount = parseFloat(order.total.replace(/[^\d.]/g, ''));
      return sum + amount;
    }, 0);
    return `₹${(total / 100000).toFixed(2)} Lakh`;
  }

  getOrdersByStatus(status: SalesOrder['status']): SalesOrder[] {
    return this.records.filter(order => order.status === status);
  }
}


export class DocumentService extends DataService<DocumentRecord> {
  constructor() { super('erp_documents'); }
}
export class ITAssetService extends DataService<ITAsset> {
  constructor() { super('erp_it_assets'); }
}
export class MaintenanceService extends DataService<MaintenanceRecord> {
  constructor() { super('erp_maintenance'); }
}
export class SupplyChainService extends DataService<SupplyChainRecord> {
  constructor() { super('erp_supply_chain'); }
}

export class VendorService extends DataService<Vendor> {
  constructor() {
    super('erp_procurement_vendors');
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    if (this.records.length === 0) {
      const sampleVendors: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Steel Corp India',
          category: 'Raw Materials',
          rating: 4.8,
          orders: 42,
          value: '₹1.8 Cr',
          status: 'Active',
          contact: 'Raj Mehta',
          leadTime: '7 days',
          terms: 'NET 30'
        }
      ];
      sampleVendors.forEach(vendor => this.create(vendor));
    }
  }

  getVendorsByRating(minRating: number): Vendor[] {
    return this.records.filter(v => v.rating >= minRating);
  }

  getActiveVendors(): Vendor[] {
    return this.records.filter(v => v.status === 'Active');
  }
}

export class PurchaseOrderService extends DataService<PurchaseOrder> {
  constructor() {
    super('erp_procurement_pos');
  }

  getOrdersByStatus(status: PurchaseOrder['status']): PurchaseOrder[] {
    return this.records.filter(po => po.status === status);
  }

  approvePO(poId: string, approver: string): PurchaseOrder | undefined {
    return this.update(poId, {
      status: 'Approved',
      approver
    } as Partial<PurchaseOrder>);
  }

  rejectPO(poId: string): PurchaseOrder | undefined {
    return this.update(poId, { status: 'Cancelled' } as Partial<PurchaseOrder>);
  }
}

export class InventoryService extends DataService<InventoryItem> {
  constructor() {
    super('erp_inventory_items');
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    if (this.records.length === 0) {
      const samples: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { sku: 'SKU-88342', productName: 'Steel Grade A Sheets', category: 'Raw Material', currentStock: 12, reorderLevel: 50, reorderQty: 100, unitPrice: '₹2,400', warehouse: 'WH-01 Mumbai', zone: 'A1', lastReceived: '2024-06-20', lastShipped: '2024-06-25', status: 'Active' },
        { sku: 'SKU-44221', productName: 'Hydraulic Pump Assembly', category: 'Components', currentStock: 847, reorderLevel: 200, reorderQty: 500, unitPrice: '₹18,420', warehouse: 'WH-02 Pune', zone: 'B2', lastReceived: '2024-06-18', lastShipped: '2024-06-26', status: 'Active' },
        { sku: 'SKU-77891', productName: 'Electronic Control Unit', category: 'Electronics', currentStock: 134, reorderLevel: 100, reorderQty: 200, unitPrice: '₹6,700', warehouse: 'WH-01 Mumbai', zone: 'C3', lastReceived: '2024-06-15', lastShipped: '2024-06-24', status: 'Active' },
        { sku: 'SKU-22103', productName: 'Precision Bearings 6205', category: 'Components', currentStock: 38, reorderLevel: 80, reorderQty: 160, unitPrice: '₹950', warehouse: 'WH-03 Delhi', zone: 'A2', lastReceived: '2024-06-10', lastShipped: '2024-06-22', status: 'Active' },
      ];
      samples.forEach(item => this.create(item));
    }
  }

  getLowStockItems(): InventoryItem[] {
    return this.records.filter(item => item.currentStock <= item.reorderLevel);
  }

  getItemBySKU(sku: string): InventoryItem | undefined {
    return this.records.find(item => item.sku === sku);
  }

  adjustStock(itemId: string, quantity: number): InventoryItem | undefined {
    const item = this.getById(itemId);
    if (!item) return undefined;
    return this.update(itemId, {
      currentStock: item.currentStock + quantity
    } as Partial<InventoryItem>);
  }

  getItemsByWarehouse(warehouse: string): InventoryItem[] {
    return this.records.filter(item => item.warehouse === warehouse);
  }
}

export class TransactionService extends DataService<StockTransaction> {
  constructor() {
    super('erp_inventory_transactions');
  }

  getTransactionsByType(type: StockTransaction['transactionType']): StockTransaction[] {
    return this.records.filter(t => t.transactionType === type);
  }

  getItemHistory(sku: string): StockTransaction[] {
    return this.records.filter(t => t.sku === sku);
  }
}

export class WorkOrderService extends DataService<WorkOrder> {
  constructor() {
    super('erp_manufacturing_workorders');
  }

  getWorkOrdersByStatus(status: WorkOrder['status']): WorkOrder[] {
    return this.records.filter(wo => wo.status === status);
  }

  startWorkOrder(woId: string, operator: string, machine: string): WorkOrder | undefined {
    return this.update(woId, {
      status: 'In Progress',
      operator,
      machine
    } as Partial<WorkOrder>);
  }

  completeWorkOrder(woId: string, completedQty: number, scrapQty: number): WorkOrder | undefined {
    return this.update(woId, {
      status: 'Completed',
      completedQty,
      scrapQty
    } as Partial<WorkOrder>);
  }
}

export class InspectionService extends DataService<Inspection> {
  constructor() {
    super('erp_quality_inspections');
  }

  getInspectionsByResult(result: Inspection['result']): Inspection[] {
    return this.records.filter(i => i.result === result);
  }

  getPassRate(): number {
    if (this.records.length === 0) return 0;
    const passed = this.records.filter(i => i.result === 'Pass').length;
    return (passed / this.records.length) * 100;
  }
}

export class CAPAService extends DataService<CAPA> {
  constructor() {
    super('erp_quality_capas');
  }

  getCAPAsByStatus(status: CAPA['status']): CAPA[] {
    return this.records.filter(c => c.status === status);
  }

  closeCAPA(capaId: string): CAPA | undefined {
    return this.update(capaId, { status: 'Closed' } as Partial<CAPA>);
  }
}

export class InvoiceService extends DataService<Invoice> {
  constructor() {
    super('erp_finance_invoices');
  }

  getTotalRevenue(): string {
    const total = this.records.reduce((sum, inv) => {
      const amount = parseFloat(inv.amount.replace(/[^\d.]/g, ''));
      return sum + amount;
    }, 0);
    return `₹${(total / 100000).toFixed(2)} Lakh`;
  }

  getInvoicesByStatus(status: Invoice['status']): Invoice[] {
    return this.records.filter(inv => inv.status === status);
  }

  markAsPaid(invoiceId: string): Invoice | undefined {
    return this.update(invoiceId, { status: 'Paid' } as Partial<Invoice>);
  }

  recordPayment(invoiceId: string, amount: string): Payment {
    const payment: Omit<Payment, 'id' | 'createdAt'> = {
      invoiceId,
      amount,
      date: new Date().toISOString().split('T')[0],
      mode: 'NEFT',
      reference: generateId('PMT'),
      status: 'Cleared',
      notes: 'Payment recorded'
    };
    return {
      id: generateId('PMT'),
      ...payment,
      createdAt: new Date().toISOString()
    };
  }
}

export class EmployeeService extends DataService<Employee> {
  constructor() {
    super('erp_hrms_employees');
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    if (this.records.length === 0) {
      const sampleEmployees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@company.com',
          phone: '+91 98765 12345',
          dept: 'Sales',
          role: 'Senior Manager',
          manager: 'Rajesh Kumar',
          salary: '₹75,000',
          joinDate: '2020-01-15',
          status: 'Active',
          address: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          aadharNo: 'XXXX XXXX 1234',
          panNo: 'ABCDE1234F',
          bankAccount: '123456789012',
          emergencyContact: 'Raj Sharma',
          emergencyPhone: '+91 98765 54321'
        }
      ];
      sampleEmployees.forEach(emp => this.create(emp));
    }
  }

  getEmployeesByDept(dept: string): Employee[] {
    return this.records.filter(emp => emp.dept === dept);
  }

  getEmployeesByStatus(status: Employee['status']): Employee[] {
    return this.records.filter(emp => emp.status === status);
  }

  getTotalHeadcount(): number {
    return this.records.filter(emp => emp.status === 'Active').length;
  }

  getTotalPayroll(): string {
    const total = this.records.reduce((sum, emp) => {
      const salary = parseFloat(emp.salary.replace(/[^\d.]/g, ''));
      return sum + salary;
    }, 0);
    return `₹${(total / 100000).toFixed(2)} Lakh`;
  }
}

export class AttendanceService extends DataService<Attendance> {
  constructor() {
    super('erp_hrms_attendance');
  }

  getEmployeeAttendance(employeeId: string, month: string | Date): Attendance[] {
    const monthStr = typeof month === 'string' ? month : month.toISOString().substring(0, 7);
    return this.records.filter(
      a => a.employeeId === employeeId && a.date.startsWith(monthStr)
    );
  }

  markPresent(employeeId: string, date: string): Attendance {
    const existing = this.records.find(a => a.employeeId === employeeId && a.date === date);
    if (existing) {
      this.update((existing as any).id, { status: 'Present' } as Partial<Attendance>);
      return existing;
    }
    return this.create({
      employeeId,
      date,
      status: 'Present'
    });
  }

  getAttendanceRate(employeeId: string, month: string): number {
    const attendance = this.getEmployeeAttendance(employeeId, month);
    const present = attendance.filter(a => a.status === 'Present').length;
    const totalWorkingDays = attendance.filter(a => a.status !== 'Weekend').length;
    return totalWorkingDays > 0 ? (present / totalWorkingDays) * 100 : 0;
  }
}

export class LeaveService extends DataService<LeaveRequest> {
  constructor() {
    super('erp_hrms_leaves');
  }

  getLeavesByStatus(status: LeaveRequest['status']): LeaveRequest[] {
    return this.records.filter(lr => lr.status === status);
  }

  approveLeave(leaveId: string, approver: string): LeaveRequest | undefined {
    return this.update(leaveId, {
      status: 'Approved',
      approver,
      approvedDate: new Date().toISOString()
    } as Partial<LeaveRequest>);
  }

  rejectLeave(leaveId: string, reason: string): LeaveRequest | undefined {
    return this.update(leaveId, {
      status: 'Rejected',
      rejectionReason: reason
    } as Partial<LeaveRequest>);
  }

  getEmployeeLeaveBalance(employeeId: string, year: number): Record<string, number> {
    const leaveByType: Record<string, number> = {};
    this.records
      .filter(lr => lr.employeeId === employeeId && lr.approvedDate?.startsWith(year.toString()))
      .forEach(lr => {
        leaveByType[lr.type] = (leaveByType[lr.type] || 0) + lr.days;
      });
    return leaveByType;
  }
}

export class PayrollService extends DataService<Payroll> {
  constructor() {
    super('erp_payroll_records');
  }

  getPayrollByPeriod(period: string): Payroll[] {
    return this.records.filter(p => p.period === period);
  }

  generatePayroll(employeeId: string, period: string, components: any): Payroll {
    const existing = this.records.find(p => p.employeeId === employeeId && p.period === period);
    if (existing) {
      return this.update((existing as any).id, { ...components } as Partial<Payroll>) || existing;
    }
    return this.create({
      employeeId,
      period,
      ...components
    });
  }

  markAsPaid(payrollId: string): Payroll | undefined {
    return this.update(payrollId, {
      status: 'Paid',
      paidDate: new Date().toISOString()
    } as Partial<Payroll>);
  }

  getMonthlyPayrollCost(period: string): string {
    const payrolls = this.getPayrollByPeriod(period);
    const total = payrolls.reduce((sum, p) => {
      const net = parseFloat(p.netSalary.replace(/[^\d.]/g, ''));
      return sum + net;
    }, 0);
    return `₹${(total / 100000).toFixed(2)} Lakh`;
  }
}

export class ProjectService extends DataService<Project> {
  constructor() {
    super('erp_projects');
  }

  getProjectsByStatus(status: Project['status']): Project[] {
    return this.records.filter(p => p.status === status);
  }

  addTeamMember(projectId: string, memberId: string): Project | undefined {
    const project = this.getById(projectId);
    if (!project) return undefined;
    if (project.team.includes(memberId)) return project;
    return this.update(projectId, {
      team: [...project.team, memberId]
    } as Partial<Project>);
  }

  updateProgress(projectId: string, progress: number): Project | undefined {
    return this.update(projectId, { progress: Math.min(100, progress) } as Partial<Project>);
  }

  getTotalBudget(): string {
    const total = this.records.reduce((sum, p) => {
      const budget = parseFloat(p.budget.replace(/[^\d.]/g, ''));
      return sum + budget;
    }, 0);
    return `₹${(total / 100000).toFixed(2)} Lakh`;
  }
}

export class TaskService extends DataService<ProjectTask> {
  constructor() {
    super('erp_project_tasks');
  }

  getTasksByProject(projectId: string): ProjectTask[] {
    return this.records.filter(t => t.projectId === projectId);
  }

  getTasksByStatus(status: ProjectTask['status']): ProjectTask[] {
    return this.records.filter(t => t.status === status);
  }

  getTasksByAssignee(assignee: string): ProjectTask[] {
    return this.records.filter(t => t.assignee === assignee);
  }

  startTask(taskId: string): ProjectTask | undefined {
    return this.update(taskId, {
      status: 'In Progress',
      startDate: new Date().toISOString().split('T')[0]
    } as Partial<ProjectTask>);
  }

  completeTask(taskId: string): ProjectTask | undefined {
    return this.update(taskId, {
      status: 'Done',
      completedDate: new Date().toISOString()
    } as Partial<ProjectTask>);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// GLOBAL SERVICE REGISTRY
// ═════════════════════════════════════════════════════════════════════════════

export interface Role {
  id: string;
  name: string;
  description: string;
  modules: string;
  createdAt: string;
}
export class RoleService extends DataService<Role> { constructor() { super("erp_roles"); } }
export class GLAccountService extends DataService<GLAccount> { constructor() { super("erp_gl_accounts"); } }
export class PaymentService extends DataService<Payment> { constructor() { super("erp_payments"); } }

export const erpServices = {
  documents: new DocumentService(),
  itAssets: new ITAssetService(),
  maintenance: new MaintenanceService(),
  supplyChain: new SupplyChainService(),
  sales: new SalesService(),
  customers: new CustomerService(),
  salesOrders: new SalesOrderService(),
  vendors: new VendorService(),
  purchaseOrders: new PurchaseOrderService(),
  inventory: new InventoryService(),
  transactions: new TransactionService(),
  workOrders: new WorkOrderService(),
  inspections: new InspectionService(),
  capas: new CAPAService(),
  invoices: new InvoiceService(),
  employees: new EmployeeService(),
  attendance: new AttendanceService(),
  leaves: new LeaveService(),
  payroll: new PayrollService(),
  projects: new ProjectService(),
  tasks: new TaskService(),
  glAccounts: new GLAccountService(),
  payments: new PaymentService(),
  roles: new RoleService()
};

export default erpServices;
