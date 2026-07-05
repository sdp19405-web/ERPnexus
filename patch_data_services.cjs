const fs = require('fs');
let content = fs.readFileSync('src/services/erpDataServices.ts', 'utf-8');

const interfaces = `
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
`;

const classes = `
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
`;

content = content.replace('export interface Vendor {', interfaces + '\nexport interface Vendor {');
content = content.replace('export class VendorService extends DataService<Vendor> {', classes + '\nexport class VendorService extends DataService<Vendor> {');

content = content.replace(
  'export const erpServices = {',
  'export const erpServices = {\n  documents: new DocumentService(),\n  itAssets: new ITAssetService(),\n  maintenance: new MaintenanceService(),\n  supplyChain: new SupplyChainService(),'
);

fs.writeFileSync('src/services/erpDataServices.ts', content);
