// ─── Warehouse Hooks ──────────────────────────────────────────────────────────
// Reusable hooks for warehouse module CRUD operations

import { useState, useCallback, useEffect } from "react";
import {
  receivingService,
  pickingService,
  packingService,
  dispatchService,
  dockService,
  zoneService,
  taskService,
  barcodeService,
  shipmentService,
  gpsService,
  putAwayService,
  dashboardService,
  ReceivingRecord,
  PickingRecord,
  PackingRecord,
  DispatchRecord,
  DockRecord,
  ZoneRecord,
  TaskAssignmentRecord,
  BarcodeRecord,
  ShipmentTrackingRecord,
  GPSRecord,
  PutAwayRuleRecord,
  WarehouseDashboardMetrics,
  WarehouseLocation,
} from "../services/warehouseService";

// ─── Generic CRUD Hook ────────────────────────────────────────────────────────

export function useCRUD<T extends { id: string }>(service: any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setLoading(true);
      const records = service.getAll();
      setData(records);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((values: Omit<T, "id">) => {
    try {
      const newRecord = service.create(values);
      setData((prev) => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create";
      setError(message);
      throw err;
    }
  }, [service]);

  const update = useCallback((id: string, values: Partial<T>) => {
    try {
      const updated = service.update(id, values);
      if (!updated) throw new Error("Record not found");
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update";
      setError(message);
      throw err;
    }
  }, [service]);

  const remove = useCallback((id: string) => {
    try {
      const success = service.delete(id);
      if (!success) throw new Error("Record not found");
      setData((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      setError(message);
      throw err;
    }
  }, [service]);

  const search = useCallback((query: string) => {
    try {
      return service.search(query);
    } catch (err) {
      console.error("Search failed:", err);
      return [];
    }
  }, [service]);

  return { data, loading, error, refresh, create, update, remove, search };
}

// ─── Receiving Hook ───────────────────────────────────────────────────────────

export function useReceiving() {
  return useCRUD<ReceivingRecord>(receivingService);
}

// ─── Picking Hook ─────────────────────────────────────────────────────────────

export function usePicking() {
  return useCRUD<PickingRecord>(pickingService);
}

// ─── Packing Hook ─────────────────────────────────────────────────────────────

export function usePacking() {
  return useCRUD<PackingRecord>(packingService);
}

// ─── Dispatch Hook ─────────────────────────────────────────────────────────────

export function useDispatch() {
  return useCRUD<DispatchRecord>(dispatchService);
}

// ─── Dock Hook ────────────────────────────────────────────────────────────────

export function useDock() {
  return useCRUD<DockRecord>(dockService);
}

// ─── Zone Hook ────────────────────────────────────────────────────────────────

export function useZone() {
  return useCRUD<ZoneRecord>(zoneService);
}

// ─── Task Assignment Hook ─────────────────────────────────────────────────────

export function useTaskAssignment() {
  return useCRUD<TaskAssignmentRecord>(taskService);
}

// ─── Barcode Hook ─────────────────────────────────────────────────────────────

export function useBarcode() {
  return useCRUD<BarcodeRecord>(barcodeService);
}

// ─── Shipment Tracking Hook ───────────────────────────────────────────────────

export function useShipmentTracking() {
  return useCRUD<ShipmentTrackingRecord>(shipmentService);
}

// ─── GPS Hook ─────────────────────────────────────────────────────────────

export function useGPS() {
  return useCRUD<GPSRecord>(gpsService);
}

// ─── Put Away Rules Hook ──────────────────────────────────────────────────────

export function usePutAwayRules() {
  return useCRUD<PutAwayRuleRecord>(putAwayService);
}

// ─── Dashboard Metrics Hook ───────────────────────────────────────────────────

export function useWarehouseDashboardMetrics() {
  const [metrics, setMetrics] = useState<WarehouseDashboardMetrics | null>(null);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const m = dashboardService.getMetrics();
      const l = dashboardService.getWarehouseLocations();
      setMetrics(m);
      setLocations(l);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    const m = dashboardService.getMetrics();
    const l = dashboardService.getWarehouseLocations();
    setMetrics(m);
    setLocations(l);
  }, []);

  return { metrics, locations, loading, refresh };
}

// ─── Search Hook ──────────────────────────────────────────────────────────────

export function useWarehouseSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const receiving = receivingService.search(query);
      const picking = pickingService.search(query);
      const dispatch = dispatchService.search(query);
      const tasks = taskService.search(query);
      const zones = zoneService.search(query);

      const combined = [
        ...receiving.map((r) => ({ ...r, type: "Receiving" })),
        ...picking.map((p) => ({ ...p, type: "Picking" })),
        ...dispatch.map((d) => ({ ...d, type: "Dispatch" })),
        ...tasks.map((t) => ({ ...t, type: "Task" })),
        ...zones.map((z) => ({ ...z, type: "Zone" })),
      ];

      setResults(combined);
      setLoading(false);
    }, 200);
  }, [query]);

  return { results, loading };
}

// ─── Bulk Operations Hook ─────────────────────────────────────────────────────

export function useBulkOperations<T extends { id: string }>(service: any) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected([]);
  }, []);

  const deleteSelected = useCallback(async () => {
    for (const id of selected) {
      try {
        service.delete(id);
      } catch (err) {
        console.error(`Failed to delete ${id}:`, err);
      }
    }
    clearSelection();
  }, [selected, service, clearSelection]);

  return { selected, toggleSelect, selectAll, clearSelection, deleteSelected };
}

// ─── Duty Cycle Hook (for date filtering) ────────────────────────────────────

export function useDateRange() {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 30);

  const [range, setRange] = useState({
    from: fromDate.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  });

  return { range, setRange };
}

// ─── Export Data Hook ──────────────────────────────────────────────────────────

export function useExportData() {
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((h) => `"${row[h] || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return { exportToCSV, exportToJSON };
}

// ─── Filter Hook ──────────────────────────────────────────────────────────────

export function useFilter<T extends Record<string, any>>(data: T[]) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = data.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value && !String(item[key]).toLowerCase().includes(value.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const addFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return { filtered, filters, addFilter, removeFilter, clearFilters };
}

// ─── Sort Hook ────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

export function useSort<T extends Record<string, any>>(data: T[], initialKey?: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialKey || null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const sorted = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return { sorted, sortKey, sortDir, handleSort };
}

// ─── Pagination Hook ──────────────────────────────────────────────────────────

export function usePagination<T>(data: T[], pageSize: number = 10) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(data.length / pageSize);
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);

  const goToPage = (p: number) => {
    setPage(Math.max(0, Math.min(p, pages - 1)));
  };

  const nextPage = () => {
    goToPage(page + 1);
  };

  const prevPage = () => {
    goToPage(page - 1);
  };

  return { page, pages, paged, goToPage, nextPage, prevPage };
}
