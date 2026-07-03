# Module Conversion Cheat Sheet - 1 Module in 45 Minutes

## Quick Copy-Paste Template

### Step 1: Copy Template File (1 minute)
```bash
cp src/components/SalesModuleComplete.tsx src/components/[ModuleName]ModuleComplete.tsx
```

### Step 2: Main Global Search & Replace (5 minutes)

Change ALL instances in the new file:

| Find | Replace |
|------|---------|
| `SalesModuleComplete` | `[ModuleName]ModuleComplete` |
| `useSalesLeads` | `use[ModuleName]` |
| `erpServices.sales` | `erpServices.[serviceName]` |
| `Lead` (type) | `[YourType]` |
| `leads` (variable) | `[records]` |
| `lead` (singular) | `[record]` |
| "Sales Lead" | "[Your Entity Name]" |
| "Company", "Contact" | "[Your Fields]" |

### Step 3: Update Form Fields (10 minutes)

Replace this section:
```typescript
const [formData, setFormData] = useState<SalesLeadFormData>({
  name: "", contact: "", email: "", phone: "",
  stage: "Lead", value: 0, owner: "Unassigned", priority: "Medium",
});
```

With your module's fields. Example for Inventory:
```typescript
const [formData, setFormData] = useState<InventoryFormData>({
  itemCode: "", itemName: "", sku: "", quantity: 0,
  unitCost: 0, warehouse: "Main", status: "Active",
});
```

### Step 4: Update Table Columns (10 minutes)

Replace table headers and rows:
```typescript
// Before (Sales)
<th>Company</th>
<th>Contact</th>
<th>Value</th>

// After (Inventory)
<th>Item Code</th>
<th>Item Name</th>
<th>Quantity</th>
```

### Step 5: Update KPI Cards (5 minutes)

Replace this:
```typescript
{ label: "Total Leads", value: stats.total, ... }
```

With your module metrics. Example:
```typescript
{ label: "Total Items", value: stats.total, ... }
{ label: "Low Stock Items", value: stats.lowStock, ... }
```

### Step 6: Update Stats Calculation (5 minutes)

Replace:
```typescript
const stats = useMemo(() => ({
  total: leads.length,
  byStage: { ... },
  totalValue: leads.reduce(...),
}), [leads]);
```

With your module logic. Example:
```typescript
const stats = useMemo(() => ({
  total: items.length,
  lowStock: items.filter(i => i.quantity < i.reorderLevel).length,
  totalValue: items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0),
}), [items]);
```

### Step 7: Update Hooks & Services (5 minutes)

Find & replace hook usage:
```typescript
// Before
const { data: leads, ... } = useSalesLeads(erpServices.sales);
const { data: vendors } = useVendors(erpServices.vendors);

// After  
const { data: items, ... } = useInventory(erpServices.inventory);
const { data: warehouses } = useWarehouses(erpServices.warehouses);
```

### Step 8: Test Build (2 minutes)
```bash
npm run build
```

**Total: 45 minutes per module**

---

## Module-Specific Customizations

### For INVENTORY:
**Form Fields**:
```typescript
itemCode, itemName, sku, categoryCode, quantity, unitCost, 
reorderLevel, reorderQuantity, warehouseId, binLocation, 
expiryDate, batchNumber, status
```

**Import Change**:
```typescript
import { useInventory } from "../hooks/useERP";
import { erpServices, InventoryItem } from "../services/erpDataServices";
```

**Stats**:
```typescript
total: items.length,
lowStock: items.filter(i => i.quantity < i.reorderLevel).length,
totalValue: items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0),
```

---

### For HRMS:
**Form Fields**:
```typescript
empId, name, email, phone, dateOfBirth, gender, 
designation, department, reportingManager, salaryGrade, 
dateOfJoining, status
```

**Import Change**:
```typescript
import { useEmployees } from "../hooks/useERP";
import { erpServices, Employee } from "../services/erpDataServices";
```

**Stats**:
```typescript
total: employees.length,
byDept: { ... },
active: employees.filter(e => e.status === "Active").length,
```

---

### For FINANCE:
**Form Fields**:
```typescript
invoiceNumber, customerId, vendorId, invoiceDate, dueDate, 
amount, tax, total, itemDescription, paymentMode, status
```

**Import Change**:
```typescript
import { useInvoices } from "../hooks/useERP";
import { erpServices, Invoice } from "../services/erpDataServices";
```

**Stats**:
```typescript
total: invoices.length,
paid: invoices.filter(i => i.status === "Paid").length,
overdue: invoices.filter(i => i.dueDate < today && i.status !== "Paid").length,
totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
```

---

### For PROJECTS:
**Form Fields**:
```typescript
projectCode, projectName, description, startDate, endDate,
budget, status, manager, team, priority
```

**Import Change**:
```typescript
import { useProjects, useTasks } from "../hooks/useERP";
import { erpServices, Project, ProjectTask } from "../services/erpDataServices";
```

**Stats**:
```typescript
total: projects.length,
active: projects.filter(p => p.status === "Active").length,
completed: projects.filter(p => p.status === "Completed").length,
```

---

### For MANUFACTURING:
**Form Fields**:
```typescript
workOrderId, itemId, quantity, machineId, operatorId,
startDate, endDate, quantityCompleted, quantityScrap, status
```

**Import Change**:
```typescript
import { useWorkOrders } from "../hooks/useERP";
import { erpServices, WorkOrder } from "../services/erpDataServices";
```

**Stats**:
```typescript
total: workOrders.length,
inProgress: workOrders.filter(w => w.status === "In Progress").length,
completed: workOrders.filter(w => w.status === "Completed").length,
```

---

## Minimal Code Changes Required

**Top-level state changes**:
```typescript
// Usually just need to add your module's specific fields
const [formData, setFormData] = useState<YourFormData>({
  // Copy from your module's type definition
});

// Add any module-specific state
const [filterWarehouse, setFilterWarehouse] = useState<string | null>(null);
```

**That's probably 60% of the work done!**

---

## File Organization After Completion

```
src/
├── components/
│   ├── SalesModuleComplete.tsx           ✅
│   ├── ProcurementModuleComplete.tsx     ✅
│   ├── InventoryModuleComplete.tsx       (Next)
│   ├── HRMSModuleComplete.tsx
│   ├── FinanceModuleComplete.tsx
│   ├── ProjectsModuleComplete.tsx
│   ├── ManufacturingModuleComplete.tsx
│   ├── QualityModuleComplete.tsx
│   ├── AdminModuleComplete.tsx
│   ├── ReportsModuleComplete.tsx
│   ├── WarehouseModuleComplete.tsx       ✅
│   └── [Other components]
├── services/
│   └── erpDataServices.ts                ✅ (All services ready)
├── hooks/
│   └── useERP.ts                         ✅ (All hooks ready)
├── utils/
│   └── erpExportUtils.ts                 ✅ (All exports ready)
└── app/
    └── App.tsx                           (Update imports here)
```

---

## Fastest Possible Path

```bash
# 1. Create inventorymodule (copy + search/replace)
cp src/components/SalesModuleComplete.tsx src/components/InventoryModuleComplete.tsx
# Edit file with search/replace: Sales→Inventory, useSalesLeads→useInventory, etc.

# 2. Build to verify
npm run build

# 3. Move to next module (repeat for HRMS, Finance, Projects, etc.)
cp src/components/SalesModuleComplete.tsx src/components/HRMSModuleComplete.tsx
# Edit + build

# 4. Continue until all 15 modules done
```

**Each module: ~45 minutes = ~9-11 hours for all**

---

## Testing Each Module

```bash
# After creating each module, run:
npm run build

# If build succeeds, module is ready
# If build fails, check error message and fix

# Then test in browser:
npm run dev
# Navigate to module and verify:
# - Add button creates records
# - Edit button updates records  
# - Delete shows confirmation
# - Search works
# - Export generates file
```

---

## Common Issues & Fixes

### Issue: "Is not assignable to type"
**Fix**: Update the `useFormData` type to match your module's fields
```typescript
interface InventoryFormData {
  itemCode?: string;
  itemName?: string;
  // ... etc
}
```

### Issue: "Property 'xxx' does not exist"
**Fix**: Make sure you updated all references to old field names
```bash
# Search for old field names and replace
# e.g., if copying from Sales, remove "company" and "contact" fields
```

### Issue: Build error about missing import
**Fix**: Check that you imported the right hook and service
```typescript
import { useInventory } from "../hooks/useERP"; // Right
import { useSalesLeads } from "../hooks/useERP"; // Wrong for Inventory
```

---

## Pro Tips for Speed

1. **Use IDE Find & Replace** - Faster than manual editing
   - Ctrl+H (or Cmd+H) to open Find & Replace
   - Replace all instances at once

2. **Create a checklist** - Mark off each section as you complete
   - [ ] Copy file
   - [ ] Update imports
   - [ ] Update form fields
   - [ ] Update table columns
   - [ ] Update KPI cards
   - [ ] Update stats
   - [ ] Build & test

3. **Keep a reference module open** - Look at Sales while editing new module
   - Side-by-side comparison helps mapping fields

4. **Test incrementally** - Build after each major change
   - Catch errors early rather than at the end

---

## Next Module After Current

After completing Inventory (45 min), quickest order:

1. **Inventory** →  Stock CRUD (easier, simpler form)
2. **HRMS** →  Employee CRUD (straightforward fields)
3. **Finance** →  Invoice CRUD (similar to Sales)
4. **Projects** →  Project CRUD (similar structure)
5. **Manufacturing** →  Work order CRUD (includes approvals)
6. **Quality** →  Inspection CRUD
7. **Admin** →  Settings/Users
8. **Reports** →  Data aggregation

---

## Build Output to Expect

After creating each new module:
```
✓ 2625 modules transformed.
✓ rendering chunks...
✓ computing gzip size...

dist/index.html                     0.79 kB │ gzip:   0.45 kB
dist/assets/index-[hash].css    138.XX kB │ gzip:  20.XX kB
dist/assets/index-[hash].js   1,022.XX kB │ gzip: 276.XX kB

✓ built in 2.XX s
```

If you see "✓ built in 2.XX s", everything is good!

---

## Success = 45 Minutes Per Module ✅
