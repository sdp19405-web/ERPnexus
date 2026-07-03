# Warehouse Module - Quick Start Guide

## Getting Started

### Prerequisites

- Node.js 16+
- npm or pnpm
- VS Code or any modern IDE

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Server will run on: http://localhost:5174

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── services/
│   └── warehouseService.ts          # Core data management (12 services)
├── hooks/
│   └── useWarehouse.ts              # 18 custom hooks for CRUD/search/export
├── utils/
│   └── exportUtils.ts               # Multi-format export utilities
├── components/
│   ├── WarehouseModuleComplete.tsx  # Main warehouse UI component
│   └── WarehouseForms.tsx           # 11 warehouse forms
├── app/
│   └── App.tsx                      # Main app (updated routing)
└── styles/
    └── *.css                        # Global styles
```

## Quick Usage Examples

### Example 1: Create a Receiving Record

```typescript
import { receivingService } from "../services/warehouseService";

// Create a new receiving record
const newRecord = receivingService.create({
  grnNo: "GRN-2024-NEW",
  poNumber: "PO-9999",
  vendor: "New Vendor Ltd",
  items: "100 MT Products",
  quantity: "100 MT",
  warehouse: "WH-01 Mumbai",
  inspector: "Inspector Name",
  date: new Date().toISOString().split('T')[0],
  status: "Pending"
});

console.log("Created record:", newRecord);
```

### Example 2: Search for Records

```typescript
import { useWarehouseSearch } from "../hooks/useWarehouse";

function SearchComponent() {
  const search = useWarehouseSearch("GRN-2024");
  
  console.log("Found records:", search.results);
  console.log("Total found:", search.total);
}
```

### Example 3: Export Data

```typescript
import { useExportData } from "../hooks/useWarehouse";
import { exportToCSV, exportToExcel } from "../utils/exportUtils";

function ExportComponent() {
  const records = receivingService.getAll();
  
  // Export as CSV
  exportToCSV(records, { 
    filename: "receiving-records" 
  });
  
  // Export as Excel
  exportToExcel(records, { 
    filename: "receiving-records",
    sheetName: "Receiving"
  });
}
```

### Example 4: CRUD Operations with Hooks

```typescript
import { useReceiving } from "../hooks/useWarehouse";

function ReceivingModule() {
  const {
    data,           // Array of receiving records
    loading,        // Loading state
    error,          // Error state
    create,         // Create new record
    update,         // Update existing record
    remove,         // Delete record
    search,         // Search records
    refresh         // Refresh data
  } = useReceiving();

  const handleAddRecord = async () => {
    const newRecord = create({
      grnNo: "GRN-" + Date.now(),
      poNumber: "PO-NEW",
      vendor: "New Vendor",
      items: "Items description",
      quantity: "Qty",
      warehouse: "WH-01",
      inspector: "Inspector",
      date: new Date().toISOString().split('T')[0],
      status: "Pending"
    });
    refresh(); // Refresh the data
  };

  const handleEditRecord = (id: string, updates: any) => {
    update(id, updates);
    refresh();
  };

  const handleDeleteRecord = (id: string) => {
    remove(id);
    refresh();
  };

  const handleSearch = (query: string) => {
    const results = search(query);
    console.log("Search results:", results);
  };

  return (
    <div>
      <button onClick={handleAddRecord}>Add Record</button>
      {/* Render data, edit form, delete confirmation */}
    </div>
  );
}
```

### Example 5: Dashboard Metrics

```typescript
import { useWarehouseDashboardMetrics } from "../hooks/useWarehouse";

function Dashboard() {
  const metrics = useWarehouseDashboardMetrics();

  return (
    <div>
      <p>Today's Receipts: {metrics.todayReceipts}</p>
      <p>Today's Dispatches: {metrics.todayDispatches}</p>
      <p>Pending Picking: {metrics.pendingPicking}</p>
      <p>Open Tasks: {metrics.openTasks}</p>
      <p>Space Utilization: {metrics.spaceUtilization}%</p>
    </div>
  );
}
```

### Example 6: Advanced Filtering and Sorting

```typescript
import { useFilter, useSort, usePagination } from "../hooks/useWarehouse";

function AdvancedTable() {
  const records = receivingService.getAll();
  
  // Filter records
  const filtered = useFilter(records).filter(r => r.status === "Accepted");
  
  // Sort records
  const sorted = useSort(filtered).sort((a, b) => 
    a.grnNo.localeCompare(b.grnNo), "asc"
  );
  
  // Paginate
  const { items, currentPage, totalPages, goToPage } = usePagination(
    sorted, 
    10  // 10 items per page
  );

  return (
    <div>
      {items.map(record => (
        <div key={record.id}>{record.grnNo}</div>
      ))}
      <button onClick={() => goToPage(currentPage + 1)}>
        Next Page
      </button>
    </div>
  );
}
```

### Example 7: Using Bulk Operations

```typescript
import { useBulkOperations } from "../hooks/useWarehouse";

function BulkActionsComponent() {
  const { deleteMultiple, exportMultiple } = useBulkOperations(receivingService);

  const handleBulkDelete = (selectedIds: string[]) => {
    deleteMultiple(selectedIds);
    console.log("Deleted records:", selectedIds);
  };

  const handleBulkExport = (selectedIds: string[], format: "csv" | "json") => {
    exportMultiple(selectedIds, format);
  };

  return (
    <div>
      <button onClick={() => handleBulkDelete(["rec_001", "rec_002"])}>
        Delete Selected
      </button>
      <button onClick={() => handleBulkExport(["rec_001", "rec_002"], "csv")}>
        Export to CSV
      </button>
    </div>
  );
}
```

## Form Usage

### Using Pre-built Forms

All forms are available in `WarehouseForms.tsx`:

```typescript
import {
  ReceivingForm,
  PickingForm,
  DispatchForm,
  DockForm,
  ZoneForm,
  TaskForm,
  BarcodeForm,
  ShipmentForm,
  GPSForm
} from "../components/WarehouseForms";

function FormExamples() {
  const handleReceivingSubmit = (data: any) => {
    console.log("Form submitted:", data);
    receivingService.create(data);
  };

  return (
    <div>
      <ReceivingForm onSubmit={handleReceivingSubmit} />
      <PickingForm onSubmit={(data) => pickingService.create(data)} />
      <DispatchForm onSubmit={(data) => dispatchService.create(data)} />
      {/* ... other forms */}
    </div>
  );
}
```

### Creating Custom Forms

Use the `GenericForm` component:

```typescript
import { GenericForm } from "../components/WarehouseForms";

const customFields = [
  { 
    name: "grnNo", 
    label: "GRN Number", 
    type: "text", 
    required: true 
  },
  { 
    name: "vendor", 
    label: "Vendor Name", 
    type: "text", 
    required: true 
  },
  { 
    name: "quantity", 
    label: "Quantity", 
    type: "number", 
    required: true 
  },
  { 
    name: "date", 
    label: "Date", 
    type: "date", 
    required: true 
  }
];

<GenericForm 
  fields={customFields}
  onSubmit={(data) => console.log(data)}
/>
```

## Available Services

All services follow the same pattern:

```typescript
interface Service<T> {
  getAll(): T[]
  getById(id: string): T | undefined
  create(data: Omit<T, 'id'>): T
  update(id: string, data: Partial<T>): T | undefined
  delete(id: string): boolean
  search(query: string): T[]
}
```

### Services Available

1. `receivingService` - Receiving records
2. `pickingService` - Picking orders
3. `packingService` - Packing records
4. `dispatchService` - Dispatch records
5. `dockService` - Dock management
6. `zoneService` - Zone management
7. `taskService` - Task assignments
8. `barcodeService` - Barcode records
9. `shipmentService` - Shipment tracking
10. `gpsService` - GPS tracking
11. `putAwayService` - Put away rules
12. `dashboardService` - Dashboard metrics

## Data Persistence

Currently uses localStorage. To switch to backend:

1. Update `getStorageData` in `warehouseService.ts`:
```typescript
async function getStorageData<T>(key: string): Promise<T[]> {
  const response = await fetch(`/api/${key}`);
  return response.json();
}
```

2. Update `setStorageData` in `warehouseService.ts`:
```typescript
async function setStorageData<T>(key: string, data: T[]): Promise<void> {
  await fetch(`/api/${key}`, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
```

## Styling

All components use Tailwind CSS. Key classes:

- Colors: `blue-600`, `emerald-500`, `red-500`, `orange-500`, `purple-500`
- Dark mode: `dark:bg-gray-800`, `dark:text-white`
- Spacing: `p-4`, `m-2`, `gap-4`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` prefixes

Example:
```jsx
<div className="p-4 dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold">Title</h2>
</div>
```

## Performance Tips

1. **Pagination**: Use `usePagination` hook for large datasets
2. **Memoization**: Wrap components with `React.memo` if needed
3. **Debounce Search**: Search already has 200ms debounce
4. **Lazy Load**: Dialogs and drawers load content on open
5. **Image Optimization**: Use Next.js Image component or optimize manually

## Testing

### Manual Testing Checklist

- [ ] Create a new record in each module
- [ ] Edit an existing record
- [ ] Delete a record (confirm dialog)
- [ ] Search for records
- [ ] Filter records by status
- [ ] Sort columns
- [ ] Export to CSV
- [ ] Export to PDF
- [ ] View audit log
- [ ] Add comments to record
- [ ] Change module tabs
- [ ] Test on mobile (F12 > Mobile)
- [ ] Test dark mode toggle

### Unit Testing Example

```typescript
import { receivingService } from "../services/warehouseService";

describe("ReceivingService", () => {
  test("should create a receiving record", () => {
    const record = receivingService.create({
      grnNo: "TEST-001",
      poNumber: "PO-0001",
      vendor: "Test Vendor",
      items: "Test Items",
      quantity: "100",
      warehouse: "WH-01",
      inspector: "Inspector",
      date: "2024-07-28",
      status: "Pending"
    });
    
    expect(record.id).toBeDefined();
    expect(record.grnNo).toBe("TEST-001");
  });

  test("should retrieve a record by id", () => {
    const records = receivingService.getAll();
    const firstRecord = records[0];
    
    const retrieved = receivingService.getById(firstRecord.id);
    expect(retrieved).toEqual(firstRecord);
  });

  test("should search records", () => {
    const results = receivingService.search("GRN-2024");
    expect(results.length).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### Issue: Records not persisting
**Solution**: Check browser localStorage in DevTools → Application → LocalStorage

### Issue: Components not rendering
**Solution**: 
- Check console for errors (F12)
- Verify imports are correct
- Check data structure matches expected types

### Issue: Forms not submitting
**Solution**: 
- Check browser console for validation errors
- Verify all required fields are filled
- Check form field types match expected data types

### Issue: Export not working
**Solution**: 
- Verify data exists (check console.log)
- Check if browser blocks downloads (pop-up blocker)
- Try different export format

### Issue: Performance slow
**Solution**: 
- Use pagination for large datasets
- Reduce number of visible columns
- Close debug tools in DevTools
- Check for memory leaks in DevTools

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting (if configured)
npm run lint
```

## Browser DevTools Tips

1. **View localStorage**: F12 → Application → LocalStorage → http://localhost:5174
2. **View React state**: Install React DevTools extension
3. **View network requests**: F12 → Network tab (will show fetch calls after API integration)
4. **View performance**: F12 → Performance tab → Record and analyze

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [Framer Motion Documentation](https://www.framer.com/motion)

## Next Steps

1. Test all CRUD operations in browser
2. Test export functionality
3. Plan backend API implementation
4. Set up authentication
5. Configure production database
6. Deploy to production
7. Monitor performance and user feedback

---

**Last Updated**: July 2024
**Status**: Ready to Use
