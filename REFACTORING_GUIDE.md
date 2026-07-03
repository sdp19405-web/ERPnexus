# Complete ERP Refactoring Guide - From Demo to Production

## Overview

This document provides the complete refactoring strategy to convert the entire ERP from demo toast messages to fully functional production code.

## Architecture Pattern

All modules follow this pattern:

```
Component (UI) → Hooks (State) → Services (BusinessLogic) → localStorage (Data)
```

### Example: Sales Module Conversion

**BEFORE (Demo):**
```typescript
function SalesModule() {
  return (
    <button onClick={() => toast.success("Form opened")}>Add Lead</button>
  );
}
```

**AFTER (Production):**
```typescript
function SalesModule() {
  const { data, create, update, remove } = useSalesLeads(erpServices.sales);
  const notification = useNotification();

  const handleAddLead = (formData) => {
    const newLead = create(formData);
    notification.success('Lead created successfully');
  };

  return (
    <button onClick={() => handleAddLead({...})}>Add Lead</button>
  );
}
```

## Module Implementation Checklist

### 1. DASHBOARD Module
- ✅ Fetch real metrics from services
- ✅ Calculate actual KPIs (lead count, revenue, etc.)
- ✅ Use real chart data

### 2. SALES Module (CRM Leads)
- ✅ Create Lead service in erpDataServices ✓
- ✅ Create useSalesLeads hook in useERP ✓
- Schema: Lead => (company, contact, email, phone, stage, value, owner, etc.)
- CRUD: Create, Read, Update, Delete leads
- Actions: Change stage, Change owner, Convert to customer
- Search: By company, contact, email
- Export: CSV, Excel, PDF

### 3. CRM Module (Customers & Interactions)
- ✅ Create CustomerService ✓
- Schema: Customer => (name, email, phone, type, status, etc.)
- CRUD: Create, Update, Delete customers
- Interactions: Track calls, emails, meetings
- Tickets: Track service requests
- Search by company name
- Export customer list

### 4. PROCUREMENT Module
- ✅ Services created (Vendor, PurchaseOrder, RFQ)
- ✅ Hooks created
- CRUD: Create/Edit/Delete POs
- Approval workflow: Pending → Approved → Received
- Vendor rating and selection
- RFQ management
- Search and export

### 5. INVENTORY Module
- ✅ Services created (InventoryItem, StockTransaction)
- ✅ Hooks created
- Stock In/Out operations
- Transfers between warehouses
- Adjustments with reasons
- Low stock alerts
- Barcode tracking
- Export inventory list

### 6. WAREHOUSE Module
- ✅ COMPLETE - Use as reference pattern
- All 12 sub-modules functional
- Real CRUD operations
- Dashboard metrics
- Multi-format export

### 7. MANUFACTURING Module
- Schema: WorkOrder => (product, quantity, status, machine, operator, BOM, routing)
- CRUD: Create, Edit, Complete work orders
- BOM: Bill of Materials management
- Routing: Machine routing steps
- Status: Draft → Released → In Progress → Completed
- Scrap tracking
- Quality checks

### 8. QUALITY Module
- Schema: Inspection, CAPA
- CRUD: Create inspections, Track CAPAs
- Results: Pass/Fail/Pending
- Defect tracking
- Approval workflow for CAPAs
- Reports and metrics

### 9. FINANCE Module
- Schema: Invoice, Payment, GLAccount
- CRUD: Create invoices, Record payments
- Invoice status: Draft → Sent → Paid
- Payment tracking with modes (NEFT, RTGS, Cheque)
- General ledger management
- Income statement, Balance sheet
- Export financial reports

### 10. HRMS Module
- Schema: Employee, Attendance, LeaveRequest
- CRUD: Add employee, Mark attendance, Process leave
- Attendance: Present, Absent, Leave, Weekend
- Let approval workflow
- Leave balance calculation
- Department view
- Export reports

### 11. PAYROLL Module
- Schema: Payroll record
- Generate payroll for period
- Components: Basic, HRA, Special Allowance, PF, ESI, TDS
- Status: Draft → Pending → Approved → Paid
- Payslip generation
- Export payslips PDF

### 12. PROJECTS Module
- Schema: Project, ProjectTask
- CRUD: Create projects, Create tasks
- Task status: Todo → In Progress → Done
- Task assignment
- Progress tracking
- Timeline view
- Kanban board view

### 13. REPORTS Module
- Sales reports: Revenue, Lead conversion
- Inventory reports: Stock levels, Turnover
- Finance reports: Profit & Loss, Balance Sheet
- HR reports: Attendance, Payroll
- All with charts and export

## Implementation Steps for Each Module

### Step 1: Import Services and Hooks
```typescript
import { erpServices } from "../services/erpDataServices";
import { useYourModule } from "../hooks/useERP";
import { exportToCSV, printData } from "../utils/erpExportUtils";
```

### Step 2: Use Hooks in Component
```typescript
function YourModule() {
  const { data, loading, error, create, update, remove, search } = useYourModule(erpServices.yourService);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();

  // Now use these directly instead of demo data
}
```

### Step 3: Replace Static Data
```typescript
// BEFORE
const staticData = [{id: '1', name: 'Sample'}];
const [records, setRecords] = useState(staticData);

// AFTER
const { data: records } = useYourModule(erpServices.yourService);
```

### Step 4: Replace Toast Messages
```typescript
// BEFORE
<button onClick={() => toast.success("Form opened")}>Add</button>

// AFTER
<button onClick={() => {
  const newRecord = create(formData);
  if (newRecord) {
    notification.success('Record created');
  } else {
    notification.error('Failed to create');
  }
}}>Add</button>
```

### Step 5: Implement Real Actions
```typescript
// BEFORE (Demo)
onAdd={() => toast.success("New record form opened")}

//AFTER (Production)
onAdd={() => {
  // Open modal, handle form submission
  const result = create(formData);
  if (result) {
    notification.success('Record created');
    refresh();
  }
}}
```

### Step 6: Add Delete Confirmation
```typescript
const { open: openDeleteConfirm } = useConfirmDialog();

const handleDelete = (recordId) => {
  openDeleteConfirm(recordId);
  // Show confirmation dialog
  // On confirm, call remove(recordId)
};
```

### Step 7: Add Export Functionality
```typescript
const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
  switch(format) {
    case 'csv':
      exportToCSV(data, { filename: 'export' });
      break;
    case 'excel':
      exportToExcel(data, { filename: 'export' });
      break;
    case 'pdf':
      exportToPDF(data, { filename: 'export' });
      break;
  }
  notification.success(`Exported as ${format.toUpperCase()}`);
};
```

## Code Generation Template

For each module, follow this template:

```typescript
function MODULENAME() {
  // 1. Initialize hooks for CRUD
  const { data, loading, error, create, update, remove, search, refresh } = useYOURHOOK(erpServices.yourService);
  
  // 2. Initialize utility hooks
  const notification = useNotification();
  const { open: openConfirmDialog } = useConfirmDialog();
  const { items: paginatedItems, ...pagination } = usePagination(data, 20);
  const { query, setQuery, results: searchResults } = useSearch(data, ['field1', 'field2']);
  
  // 3. State for models
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  
  // 4. CRUD Handlers
  const handleCreate = (formData) => {
    const newRecord = create(formData);
    if (newRecord) {
      notification.success('Record created');
      setShowForm(false);
      setFormData({});
    }
  };
  
  const handleUpdate = (id, updates) => {
    const updated = update(id, updates);
    if (updated) {
      notification.success('Record updated');
    }
  };
  
  const handleDelete = (id) => {
    openConfirmDialog(() => {
      if (remove(id)) {
        notification.success('Record deleted');
      }
    });
  };
  
  // 5. Render UI with real data
  return (
    <InteractiveTable 
      title="Records"
      data={searchResults}
      onAdd={handleCreate}
      onDelete={handleDelete}
      onEdit={handleUpdate}
      searchValue={query}
      onSearch={setQuery}
    />
  );
}
```

## File Locations Reference

- Services: `src/services/erpDataServices.ts`
- Hooks: `src/hooks/useERP.ts`
- Export Utils: `src/utils/erpExportUtils.ts`
- Components: `src/components/`
- App Routes: `src/app/App.tsx`

## Testing Each Module After Refactor

1. **Create**: Click "Add" button, fill form, verify data persists after refresh
2. **Read**: Verify data displays in table
3. **Update**: Edit record, verify changes persist
4. **Delete**: Delete record, confirm deletion, verify removal
5. **Search**: Search for specific records
6. **Export**: Export in different formats
7. **Print**: Print records

## Performance Considerations

- Use pagination for lists with >20 items
- Implement debounced search (200ms)
- Lazy load detail drawers
- Consider code-splitting for large modules

## Data Persistence

Current: localStorage
Future: Replace in `erpDataServices.ts`:
```typescript
// Change from
const data = localStorage.getItem(key);

// To
const response = await fetch(`/api/${key}`);
const data = await response.json();
```

## Approval Workflows

Many modules need approval workflows:

```typescript
interface ApprovableRecord {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approver?: string;
  approvalDate?: string;
}

const handleApprove = (recordId, approverName) => {
  update(recordId, {
    status: 'Approved',
    approver: approverName,
    approvalDate: new Date().toISOString()
  });
};

const handleReject = (recordId, reason) => {
  update(recordId, {
    status: 'Rejected',
    approver: currentUser,
    rejectionReason: reason
  });
};
```

## Module Priority Order

1. **High Priority** (Complete ASAP):
   - Sales (CRM Leads)
   - Procurement (Purchase Orders)
   - HRMS (Employees)
   - Finance (Invoices)

2. **Medium Priority** (Complete Soon):
   - Manufacturing
   - Inventory
   - Quality
   - Projects

3. **Lower Priority** (Complete Later):
   - Reports
   - Admin
   - Customer Portal
   - Vendor Portal

## Success Criteria

✅ No more toast messages for demo actions
✅ All buttons perform actual CRUD operations
✅ Data persists across page refreshes
✅ Search, filter, sort work with real data
✅ Export functions generate actual files
✅ Forms validate input correctly
✅ Delete confirmation dialogs appear
✅ Error handling shows real error messages
✅ TypeScript strict mode passes
✅ Build completes without errors

## Known Limitations (Phase 1)

- No real-time updates (WebSocket integration needed for Phase 2)
- No complex approval workflows with email notifications (Phase 2)
- No file uploads/attachments (Phase 2)
- No advanced reporting with pivot tables (Phase 2)
- No AI-powered features (Phase 3)

These can be added in future phases while maintaining the current architecture.

## Summary

The complete refactor involves:
1. ✅ Data services for all modules
2. ✅ Custom hooks for all modules
3. ✅ Export utilities for all modules
4. ⏳ Replacing module components in App.tsx (IN PROGRESS)
5. ⏳ Testing all modules
6. ⏳ Finalizing build and deployment

---

**Current Status**: Phase 1 - Infrastructure Complete (Services, Hooks, Utils Created)
**Next Steps**: Phase 2 - Module Implementation (This is the largest task)
**Estimated Effort**: Each module takes 30-60 minutes to fully convert
