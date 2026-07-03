# Warehouse Module - Architecture & Implementation Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Patterns](#design-patterns)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Data Flow](#data-flow)
6. [Extending the System](#extending-the-system)
7. [Backend Integration](#backend-integration)
8. [Performance Optimization](#performance-optimization)
9. [Security Considerations](#security-considerations)
10. [Deployment](#deployment)

## Architecture Overview

The Warehouse Management System follows a modern, layered architecture:

```
┌─────────────────────────────────────────────────────┐
│                   UI Components                      │
│     (WarehouseModuleComplete, EnhancedTable, etc)   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              Custom React Hooks                      │
│   (useReceiving, usePicking, useFilter, etc)        │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              Service Layer                          │
│ (receivingService, pickingService, etc)            │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│          Data Persistence Layer                     │
│    (localStorage → Backend API)                     │
└─────────────────────────────────────────────────────┘
```

### Layers Explained

1. **UI Components**: React components that render the UI and handle user interactions
2. **Custom Hooks**: Encapsulate business logic and state management
3. **Service Layer**: Provide CRUD operations and data access abstraction
4. **Persistence Layer**: Handle data storage (currently localStorage, extensible to APIs)

## Design Patterns

### 1. Service Pattern

Each warehouse entity has a corresponding service object:

```typescript
interface WarehouseService<T> {
  getAll(): T[]
  getById(id: string): T | undefined
  create(data: Omit<T, 'id'>): T
  update(id: string, data: Partial<T>): T | undefined
  delete(id: string): boolean
  search(query: string): T[]
}

const receivingService: WarehouseService<ReceivingRecord> = {
  // Implementation
};
```

**Benefits**:
- Centralized data access logic
- Easy to mock for testing
- Simple to replace with API calls
- Consistent interface across all entities

### 2. Custom Hooks Pattern

React hooks encapsulate component state and side effects:

```typescript
function useReceiving() {
  const [data, setData] = useState<ReceivingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CRUD operations
  const create = (newData: any) => { /* ... */ };
  const update = (id: string, updates: any) => { /* ... */ };
  const remove = (id: string) => { /* ... */ };
  
  return { data, loading, error, create, update, remove, refresh };
}
```

**Benefits**:
- Reusable state logic
- Testable functions
- Clear separation of concerns
- Easy to extend with additional features

### 3. Form Component Pattern

Generic form component with type-specific variants:

```typescript
// Generic form
<GenericForm fields={fieldConfig} onSubmit={handleSubmit} />

// Specific forms (built on GenericForm)
<ReceivingForm onSubmit={handleReceivingSubmit} />
<PickingForm onSubmit={handlePickingSubmit} />
```

**Benefits**:
- Code reuse across forms
- Consistent validation logic
- Easy to add new form types
- Simplified form management

### 4. Drawer Pattern

Detail drawer for viewing and editing records:

```typescript
<EnhancedDetailDrawer
  record={selectedRecord}
  isOpen={isDrawerOpen}
  onClose={handleClose}
  tabs={['details', 'timeline', 'comments', 'audit']}
/>
```

**Benefits**:
- Non-intrusive record viewing
- All operations in one place
- Preserves context
- Mobile friendly

### 5. Table Component Pattern

Reusable table with built-in features:

```typescript
<EnhancedInteractiveTable
  data={records}
  columns={tableColumns}
  onRowClick={handleRowClick}
  features={{ sort: true, search: true, pagination: true }}
/>
```

**Benefits**:
- Consistent table UI across modules
- Built-in common features
- Easy to customize
- Responsive design

## Component Architecture

### WarehouseModuleComplete Component Hierarchy

```
WarehouseModuleComplete
├── Header
│   ├── Title
│   └── Module Selector (tabs)
├── Dashboard View
│   ├── KPI Cards
│   │   ├── Today Receipts
│   │   ├── Today Dispatch
│   │   ├── Pending Picking
│   │   └── Open Tasks
│   └── Charts
│       ├── BarChart (Space Utilization)
│       └── PieChart (Activity Distribution)
├── Module-Specific Content
│   ├── Receiving Tab
│   │   ├── Action Buttons
│   │   │   ├── Add Record
│   │   │   ├── Export
│   │   │   └── Filter
│   │   └── EnhancedInteractiveTable
│   ├── Picking Tab
│   │   ├── Actions
│   │   └── Table
│   ├── Dispatch Tab
│   │   ├── Actions
│   │   └── Table
│   ├── Dock Tab
│   │   ├── Actions
│   │   └── Table
│   └── [Other tabs...]
└── EnhancedDetailDrawer
    ├── Tabs
    │   ├── Details
    │   │   ├── Record fields
    │   │   ├── Edit button
    │   │   └── Delete button
    │   ├── Timeline
    │   │   └── Activity events
    │   ├── Comments
    │   │   ├── Comment list
    │   │   └── Add comment form
    │   └── Audit Log
    │       └── Change history
    ├── Action Buttons
    │   ├── Save
    │   ├── Delete
    │   ├── Duplicate
    │   └── Export
    └── Modal Overlays
        ├── Delete confirmation
        ├── Add records form
        └── Export options
```

### Component Responsibilities

| Component | Responsibility | Props | State |
|-----------|-----------------|--------|-------|
| WarehouseModuleComplete | Main container, module switching | None | currentModule, selectedRecord |
| EnhancedInteractiveTable | Data display, pagination, sorting | data, columns, onRowClick | sortConfig, searchQuery, currentPage |
| EnhancedDetailDrawer | Record details, editing, comments | record, isOpen, onClose | editMode, activeTab, comments |
| GenericForm | Form rendering, validation | fields, onSubmit | formData, errors |
| [SpecificForm] | Type-specific form UI | onSubmit, initialData | Form inherited from GenericForm |

## State Management

### State at Different Levels

1. **Component State** (local component state):
```typescript
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [editMode, setEditMode] = useState(false);
```

2. **Hook State** (shared across components):
```typescript
const { data, loading, error, create, update } = useReceiving();
```

3. **Service State** (persisted to localStorage):
```typescript
localStorage.getItem('warehouse_receiving_records')
localStorage.setItem('warehouse_receiving_records', JSON.stringify(data))
```

### State Flow

```
User Action (click, submit, etc)
    ↓
Component Event Handler
    ↓
Hook Function (create, update, delete, search, etc)
    ↓
Service Layer (receivingService.create, etc)
    ↓
Persistence Layer (localStorage.setItem)
    ↓
State Update Triggers Re-render
    ↓
UI Updates with New Data
```

### Best Practices for State Management

1. **Keep state as local as possible**: Don't lift state higher than needed
2. **Use hooks for shared state**: Create custom hooks for commonly shared logic
3. **Avoid prop drilling**: Use context or hooks to skip intermediate components
4. **Normalize state**: Store data in a normalized format (flat structure)
5. **Use loading/error states**: Always indicate data loading and error conditions

## Data Flow

### Create Operation Flow

```
User clicks "Add Record" button
    ↓
Form modal opens
    ↓
User fills form and clicks submit
    ↓
GenericForm validates input
    ↓
If valid, calls onSubmit callback
    ↓
Hook's create() function called
    ↓
receivingService.create(data) called
    ↓
Service generates unique ID
    ↓
Service saves to localStorage
    ↓
Hook updates local state with new record
    ↓
Component re-renders with new data
    ↓
Toast notification shows "Record created"
    ↓
Modal closes
```

### Update Operation Flow

```
User clicks row in table
    ↓
Detail drawer opens with record
    ↓
User clicks "Edit" button
    ↓
Fields become editable
    ↓
User modifies fields and clicks "Save"
    ↓
Form validates updated data
    ↓
Hook's update() function called
    ↓
receivingService.update(id, updates) called
    ↓
Service updates record and timestamps
    ↓
Service saves to localStorage
    ↓
Timeline event added to activity log
    ↓
Hook updates local state
    ↓
Component re-renders with updated data
    ↓
Toast shows "Record updated"
    ↓
Drawer updates with new data
```

### Search/Filter Flow

```
User types in search box
    ↓
200ms debounce delay
    ↓
Hook's search() function called with query
    ↓
receivingService.search(query) called
    ↓
Service searches all records across multiple fields
    ↓
Matching records returned
    ↓
Hook updates searchResults state
    ↓
Table component receives filtered data
    ↓
Table re-renders with only matching records
```

## Extending the System

### Adding a New Warehouse Module

Follow these steps to add a completely new warehouse module:

#### Step 1: Define Data Types

```typescript
// In warehouseService.ts
interface NewModuleRecord {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  // ... other fields
}
```

#### Step 2: Create Service

```typescript
// In warehouseService.ts
const newModuleService: WarehouseService<NewModuleRecord> = {
  getAll: () => getStorageData<NewModuleRecord>('warehouse_new_module'),
  getById: (id) => { /* ... */ },
  create: (data) => { /* ... */ },
  update: (id, updates) => { /* ... */ },
  delete: (id) => { /* ... */ },
  search: (query) => { /* ... */ }
};
```

#### Step 3: Create Hook

```typescript
// In useWarehouse.ts
export function useNewModule() {
  return useCRUD<NewModuleRecord>(newModuleService);
}
```

#### Step 4: Create Form

```typescript
// In WarehouseForms.tsx
export function NewModuleForm({ onSubmit, initialData }) {
  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      options: ['Active', 'Inactive'],
      required: true 
    }
  ];

  return <GenericForm fields={fields} onSubmit={onSubmit} />;
}
```

#### Step 5: Add UI Component

```typescript
// In WarehouseModuleComplete.tsx
case "newModule":
  const { data: newModuleData } = useNewModule();
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowNewModuleForm(true)}>
          Add Record
        </button>
        <button onClick={() => exportToCSV(newModuleData)}>
          Export CSV
        </button>
      </div>
      <EnhancedInteractiveTable
        data={newModuleData}
        columns={['name', 'description', 'status']}
        onRowClick={(record) => setSelectedRecord(record)}
      />
    </div>
  );
```

#### Step 6: Add Module Tab

```typescript
// In WarehouseModuleComplete.tsx
const moduleList = [
  // ... existing modules
  { id: 'newModule', label: 'New Module', icon: IconComponent }
];
```

### Adding a New Field to Existing Module

1. Update the TypeScript interface:
```typescript
interface ReceivingRecord {
  // ... existing fields
  newField: string;  // Add new field
}
```

2. Update initialization function:
```typescript
const sampleRecord = {
  // ... existing fields
  newField: "default value"
};
```

3. Update form fields:
```typescript
const receivingFields = [
  // ... existing fields
  { name: 'newField', label: 'New Field', type: 'text' }
];
```

4. Update table columns in UI (automatic if using dynamic columns)

### Adding Advanced Features

#### Feature: Status Workflow

```typescript
// Define allowed state transitions
const statusTransitions: Record<string, string[]> = {
  'Pending': ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Pending'],
  'Completed': ['Archived']
};

// Add validation
function canTransitionTo(from: string, to: string): boolean {
  return statusTransitions[from]?.includes(to) ?? false;
}

// In update function
const updateWithValidation = (id: string, updates: any) => {
  const record = receivingService.getById(id);
  if (!canTransitionTo(record.status, updates.status)) {
    throw new Error('Invalid status transition');
  }
  return receivingService.update(id, updates);
};
```

#### Feature: Approval Workflow

```typescript
interface ApprovalState {
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

// Add approval logic to service
const submitForApproval = (id: string) => {
  const record = receivingService.getById(id);
  return receivingService.update(id, {
    ...record,
    approvalState: {
      status: 'Pending Approval',
      submittedDate: new Date().toISOString()
    }
  });
};
```

#### Feature: Audit Trail

```typescript
interface AuditLog {
  id: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
  changedFields?: Record<string, { oldValue: any; newValue: any }>;
  changedBy: string;
  timestamp: string;
  ipAddress?: string;
}

// Log every action
function createWithAudit(data: any, userId: string) {
  const record = receivingService.create(data);
  auditService.log({
    recordId: record.id,
    action: 'CREATE',
    changedBy: userId,
    timestamp: new Date().toISOString()
  });
  return record;
}
```

## Backend Integration

### Step 1: Set Up API Client

```typescript
// src/services/apiClient.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: data ? JSON.stringify(data) : undefined
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### Step 2: Update Service Layer

```typescript
// Update warehouseService.ts
async function getStorageData<T>(key: string): Promise<T[]> {
  // Replace localStorage with API call
  return apiCall<T[]>(`/${key}`);
}

async function setStorageData<T>(key: string, data: T[]): Promise<void> {
  await apiCall(`/${key}`, 'POST', { data });
}
```

### Step 3: Add Error Handling

```typescript
async function getStorageData<T>(key: string): Promise<T[]> {
  try {
    const data = await apiCall<T[]>(`/${key}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${key}:`, error);
    // Optionally fall back to localStorage cache
    return JSON.parse(localStorage.getItem(`cache_${key}`) || '[]');
  }
}
```

### Step 4: Add Retry Logic

```typescript
async function apiCallWithRetry<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall<T>(endpoint, method, data);
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Split large modules into separate chunks
const WarehouseModuleComplete = lazy(() => 
  import('./components/WarehouseModuleComplete')
);

// Use Suspense to show loading state
<Suspense fallback={<LoadingSpinner />}>
  <WarehouseModuleComplete />
</Suspense>
```

### 2. Memoization

```typescript
// Memoize expensive computations
const memoizedMetrics = useMemo(() => {
  return calculateMetrics(data);
}, [data]);

// Memoize components
const MemoizedTable = React.memo(EnhancedInteractiveTable);
```

### 3. Pagination

Always paginate large datasets:
```typescript
const { items, currentPage } = usePagination(records, 20);
```

### 4. Image Optimization

```typescript
// Lazy load images
<img loading="lazy" src={url} alt="label" />

// Use appropriate image sizes
<picture>
  <source media="(max-width: 640px)" srcSet="image-sm.jpg" />
  <img src="image-lg.jpg" alt="label" />
</picture>
```

### 5. Bundle Analysis

```bash
# Analyze bundle size
npm run build --analyze

# Check what's taking up space
npm install --save-dev esbuild-analyze
```

## Security Considerations

### 1. Input Validation

Always validate user input:
```typescript
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhoneNumber = (phone: string): boolean => {
  return /^\d{10,}$/.test(phone);
};
```

### 2. XSS Prevention

Escape HTML content:
```typescript
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
```

### 3. CSRF Protection

Include CSRF tokens in requests:
```typescript
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

fetch('/api/warehouse', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

### 4. Rate Limiting

Implement client-side rate limiting:
```typescript
const rateLimiter = (() => {
  let lastCall = 0;
  return (fn: () => void, delayMs = 1000) => {
    return () => {
      const now = Date.now();
      if (now - lastCall >= delayMs) {
        lastCall = now;
        fn();
      }
    };
  };
})();
```

### 5. Authentication

Always verify user identity:
```typescript
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`
  };
};
```

## Deployment

### Development

```bash
npm run dev
# Runs on http://localhost:5174
```

### Production Build

```bash
npm run build
# Creates optimized dist/ folder
```

### Environment Variables

Create `.env.production`:
```
REACT_APP_API_URL=https://api.production.com
REACT_APP_LOG_LEVEL=error
REACT_APP_ENABLE_TELEMETRY=true
```

### Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Authentication working
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Performance baseline established

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy
        run: npm run deploy
```

---

**Last Updated**: July 2024
**Version**: 1.0.0
**Status**: Complete Reference Guide
