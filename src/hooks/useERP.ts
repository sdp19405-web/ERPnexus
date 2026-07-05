/**
 * Comprehensive ERP Module Hooks
 * Reusable React hooks for CRUD operations, search, filter, sort, pagination, and export
 * Works with all erpDataServices
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Lead, Customer, SalesOrder, Vendor, PurchaseOrder, InventoryItem,
  StockTransaction, WorkOrder, Inspection, CAPA, Invoice, Employee,
  Attendance, LeaveRequest, Payroll, Project, ProjectTask, Activity,
  GLAccount, Payment, Role
} from '../services/erpDataServices';

// ═════════════════════════════════════════════════════════════════════════════
// CORE CRUD HOOK
// ═════════════════════════════════════════════════════════════════════════════

export function useCRUD<T extends { id?: string }>(service: any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setLoading(true);
      const records = service.getAll();
      setData(records);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((newData: any) => {
    try {
      const record = service.create(newData);
      setData(prev => [...prev, record]);
      return record;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [service]);

  const update = useCallback((id: string, updates: any) => {
    try {
      const updated = service.update(id, updates);
      if (updated) {
        setData(prev => prev.map(r => (r.id === id ? updated : r)));
      }
      return updated;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [service]);

  const remove = useCallback((id: string) => {
    try {
      const success = service.delete(id);
      if (success) {
        setData(prev => prev.filter(r => r.id !== id));
      }
      return success;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [service]);

  const search = useCallback((query: string, searchFields: string[]) => {
    try {
      const results = service.search(query, searchFields);
      return results;
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  }, [service]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    search,
    refresh,
    setData
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE-SPECIFIC HOOKS
// ═════════════════════════════════════════════════════════════════════════════

export function useSalesLeads(service: any) {
  const crud = useCRUD<Lead>(service);
  const [filteredStage, setFilteredStage] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!filteredStage) return crud.data;
    return crud.data.filter(lead => lead.stage === filteredStage);
  }, [crud.data, filteredStage]);

  const changePriority = useCallback((leadId: string, stage: any) => {
    return crud.update(leadId, { stage });
  }, [crud]);

  const changeOwner = useCallback((leadId: string, owner: string) => {
    return crud.update(leadId, { owner });
  }, [crud]);

  return {
    ...crud,
    filteredData,
    setFilteredStage,
    changePriority,
    changeOwner
  };
}

export function useCustomers(service: any) {
  return useCRUD<Customer>(service);
}

export function useSalesOrders(service: any) {
  const crud = useCRUD<SalesOrder>(service);

  const updateOrderStatus = useCallback((orderId: string, status: SalesOrder['status']) => {
    return crud.update(orderId, { status });
  }, [crud]);

  return {
    ...crud,
    updateOrderStatus
  };
}

export function useVendors(service: any) {
  const crud = useCRUD<Vendor>(service);

  const getActiveVendors = useCallback(() => {
    return crud.data.filter(v => v.status === 'Active');
  }, [crud.data]);

  const updateVendorStatus = useCallback((vendorId: string, status: Vendor['status']) => {
    return crud.update(vendorId, { status });
  }, [crud]);

  return {
    ...crud,
    getActiveVendors,
    updateVendorStatus
  };
}

export function usePurchaseOrders(service: any) {
  const crud = useCRUD<PurchaseOrder>(service);

  const approvePO = useCallback((poId: string, approver: string) => {
    return crud.update(poId, { status: 'Approved', approver });
  }, [crud]);

  const rejectPO = useCallback((poId: string) => {
    return crud.update(poId, { status: 'Cancelled' });
  }, [crud]);

  return {
    ...crud,
    approvePO,
    rejectPO
  };
}

export function useInventory(service: any) {
  const crud = useCRUD<InventoryItem>(service);

  const getLowStockItems = useCallback(() => {
    return crud.data.filter(item => item.currentStock <= item.reorderLevel);
  }, [crud.data]);

  const adjustStock = useCallback((itemId: string, quantity: number) => {
    const item = crud.data.find(i => i.id === itemId);
    if (!item) return null;
    return crud.update(itemId, { currentStock: item.currentStock + quantity });
  }, [crud]);

  return {
    ...crud,
    getLowStockItems,
    adjustStock
  };
}

export function useWorkOrders(service: any) {
  const crud = useCRUD<WorkOrder>(service);

  const startWorkOrder = useCallback((woId: string, operator: string, machine: string) => {
    return crud.update(woId, { status: 'In Progress', operator, machine });
  }, [crud]);

  const completeWorkOrder = useCallback((woId: string, completedQty: number, scrapQty: number) => {
    return crud.update(woId, { status: 'Completed', completedQty, scrapQty });
  }, [crud]);

  return {
    ...crud,
    startWorkOrder,
    completeWorkOrder
  };
}

export function useInspections(service: any) {
  const crud = useCRUD<Inspection>(service);

  const passRate = useMemo(() => {
    if (crud.data.length === 0) return 0;
    const passed = crud.data.filter(i => i.result === 'Pass').length;
    return (passed / crud.data.length) * 100;
  }, [crud.data]);

  return {
    ...crud,
    passRate
  };
}

export function useCAPAs(service: any) {
  const crud = useCRUD<CAPA>(service);

  const closeCAPA = useCallback((capaId: string) => {
    return crud.update(capaId, { status: 'Closed' });
  }, [crud]);

  return {
    ...crud,
    closeCAPA
  };
}

export function useInvoices(service: any) {
  const crud = useCRUD<Invoice>(service);

  const markAsPaid = useCallback((invoiceId: string) => {
    return crud.update(invoiceId, { status: 'Paid' });
  }, [crud]);

  const recordPayment = useCallback((invoiceId: string) => {
    return crud.update(invoiceId, { status: 'Paid' });
  }, [crud]);

  return {
    ...crud,
    markAsPaid,
    recordPayment
  };
}

export function useEmployees(service: any) {
  const crud = useCRUD<Employee>(service);

  const getEmployeesByDept = useCallback((dept: string) => {
    return crud.data.filter(emp => emp.dept === dept);
  }, [crud.data]);

  const getActiveEmployees = useCallback(() => {
    return crud.data.filter(emp => emp.status === 'Active');
  }, [crud.data]);

  return {
    ...crud,
    getEmployeesByDept,
    getActiveEmployees
  };
}

export function useAttendance(service: any) {
  const crud = useCRUD<Attendance>(service);

  const markPresent = useCallback((employeeId: string, date: string) => {
    return crud.create({ employeeId, date, status: 'Present' });
  }, [crud]);

  const getEmployeeAttendance = useCallback((employeeId: string, month: string) => {
    return crud.data.filter(
      a => a.employeeId === employeeId && a.date.startsWith(month)
    );
  }, [crud.data]);

  return {
    ...crud,
    markPresent,
    getEmployeeAttendance
  };
}

export function useLeaves(service: any) {
  const crud = useCRUD<LeaveRequest>(service);

  const approveLeave = useCallback((leaveId: string, approver: string) => {
    return crud.update(leaveId, {
      status: 'Approved',
      approver,
      approvedDate: new Date().toISOString()
    });
  }, [crud]);

  const rejectLeave = useCallback((leaveId: string, reason: string) => {
    return crud.update(leaveId, {
      status: 'Rejected',
      rejectionReason: reason
    });
  }, [crud]);

  const getPendingLeaves = useCallback(() => {
    return crud.data.filter(lr => lr.status === 'Pending');
  }, [crud.data]);

  return {
    ...crud,
    approveLeave,
    rejectLeave,
    getPendingLeaves
  };
}

export function usePayroll(service: any) {
  const crud = useCRUD<Payroll>(service);

  const getPayrollByPeriod = useCallback((period: string) => {
    return crud.data.filter(p => p.period === period);
  }, [crud.data]);

  const markAsPaid = useCallback((payrollId: string) => {
    return crud.update(payrollId, {
      status: 'Paid',
      paidDate: new Date().toISOString()
    });
  }, [crud]);

  return {
    ...crud,
    getPayrollByPeriod,
    markAsPaid
  };
}

export function useProjects(service: any) {
  const crud = useCRUD<Project>(service);
  return { ...crud };
}

export function useTasks(service: any) {
  const crud = useCRUD<ProjectTask>(service);
  return { ...crud };
}

export function useGLAccounts(service: any) {
  const crud = useCRUD<GLAccount>(service);
  return { ...crud };
}

export function usePayments(service: any) {
  const crud = useCRUD<Payment>(service);
  return { ...crud };
}

export function useRoles(service: any) {
  const crud = useCRUD<Role>(service);
  return { ...crud };
}

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═════════════════════════════════════════════════════════════════════════════

export function useSearch<T extends { id?: string }>(data: T[], searchFields: string[]) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(data);

  useEffect(() => {
    if (!query.trim()) {
      setResults(data);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = data.filter(item => {
      return searchFields.some(field => {
        const value = (item as any)[field];
        return value && value.toString().toLowerCase().includes(lowerQuery);
      });
    });

    setResults(filtered);
  }, [query, data, searchFields]);

  return {
    query,
    setQuery,
    results
  };
}

export function useFilter<T>(data: T[]) {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filtered = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return (item as any)[key] === value;
      });
    });
  }, [data, filters]);

  return {
    filters,
    setFilters,
    filtered
  };
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export function useSort<T extends Record<string, any>>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  const sorted = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return [...data];
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [data, sortConfig]);

  const toggleSort = useCallback((key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  }, []);

  return {
    sorted,
    sortConfig,
    toggleSort
  };
}

export function usePagination<T>(data: T[], pageSize: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / pageSize));
  }, [data.length, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = data.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const pagination = useMemo(() => ({
    currentPage,
    pageSize,
    totalPages,
    next: nextPage,
    previous: prevPage,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  }), [currentPage, pageSize, totalPages, nextPage, prevPage]);

  return {
    items,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    reset,
    pagination,
  };
}

export function useBulkOperations<T extends { id?: string }>(data: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    if (selectedIds.size === ids.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  }, [selectedIds.size]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(data.map(item => (item as { id?: string }).id).filter(Boolean) as string[]));
  }, [data]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedItems = useCallback(() => {
    return data.filter(item => selectedIds.has((item as { id?: string }).id!));
  }, [data, selectedIds]);

  const getSelected = useCallback(() => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selected = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds,
    selected,
    toggleSelect,
    toggleSelectAll,
    selectAll,
    deselectAll,
    getSelectedItems,
    getSelected,
    clearSelection,
    selectionCount: selectedIds.size,
    isAllSelected: data.length > 0 && selectedIds.size === data.length
  };
}

export function useFormState<T>(initialData?: Partial<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => new Set([...prev, field]));
  }, []);

  const setFormErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  const reset = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setTouched(new Set());
  }, [initialData]);

  return {
    formData,
    setFormData,
    errors,
    setFormErrors,
    touched,
    handleChange,
    handleBlur,
    reset
  };
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);

  const open = useCallback((arg1: any, arg2?: string, arg3?: () => void | Promise<void>) => {
    if (typeof arg1 === 'string' && arg2 !== undefined) {
      setData({ title: arg1, body: arg2, onConfirm: arg3 });
    } else {
      setData(arg1);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const confirm = useCallback(async (onConfirm?: (item: any) => void | Promise<void>) => {
    if (data?.onConfirm) {
      await data.onConfirm();
    } else if (onConfirm && data) {
      await onConfirm(data);
    }
    close();
  }, [data, close]);

  return {
    isOpen,
    data,
    open,
    close,
    confirm
  };
}

export function useNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const notify = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now();
    const notification = { id, type, message };
    setNotifications(prev => [...prev, notification]);

    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warning(message);
    else toast.info(message);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);

    return id;
  }, []);

  const remove = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    notify,
    remove,
    success: (message: string) => notify('success', message),
    error: (message: string) => notify('error', message),
    info: (message: string) => notify('info', message),
    warning: (message: string) => notify('warning', message)
  };
}

export default {
  useCRUD,
  useSalesLeads,
  useCustomers,
  useSalesOrders,
  useVendors,
  usePurchaseOrders,
  useInventory,
  useWorkOrders,
  useInspections,
  useCAPAs,
  useInvoices,
  useEmployees,
  useAttendance,
  useLeaves,
  usePayroll,
  useProjects,
  useTasks,
  useGLAccounts,
  usePayments,
  useRoles,
  useSearch,
  useFilter,
  useSort,
  usePagination,
  useBulkOperations,
  useFormState,
  useConfirmDialog,
  useNotification
};


export function useDocuments(service: any) { return useCRUD<import('../services/erpDataServices').DocumentRecord>(service); }
export function useITAssets(service: any) { return useCRUD<import('../services/erpDataServices').ITAsset>(service); }
export function useMaintenance(service: any) { return useCRUD<import('../services/erpDataServices').MaintenanceRecord>(service); }
export function useSupplyChain(service: any) { return useCRUD<import('../services/erpDataServices').SupplyChainRecord>(service); }
