import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Plus, Search, Trash2, Edit2, AlertTriangle, Package, Truck, DollarSign } from "lucide-react";
import { erpServices, InventoryItem } from "../services/erpDataServices";
import { useInventory, useSearch, usePagination, useBulkOperations, useNotification, useConfirmDialog } from "../hooks/useERP";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/erpExportUtils";

type InventoryFormData = Partial<Pick<InventoryItem, "sku" | "productName" | "category" | "warehouse" | "currentStock" | "reorderLevel" | "status">>;

export function InventoryModuleComplete() {
  const { data: items, error, create, update, remove, refresh } = useInventory(erpServices.inventory);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();
  const { query, setQuery, results: searchResults } = useSearch(items, ["sku", "productName", "category", "warehouse", "status"]);
  const { items: paginatedItems, pagination } = usePagination(searchResults, 15);
  const { selected, toggleSelect, selectAll, deselectAll, getSelected } = useBulkOperations(paginatedItems);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    sku: "",
    productName: "",
    category: "Raw Material",
    warehouse: "WH-01 Mumbai",
    currentStock: 0,
    reorderLevel: 0,
    status: "Active",
  });
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterWarehouse, setFilterWarehouse] = useState<string | null>(null);

  const handleAddItem = useCallback(() => {
    setEditingItem(null);
    setFormData({ sku: "", productName: "", category: "Raw Material", warehouse: "WH-01 Mumbai", currentStock: 0, reorderLevel: 0, status: "Active" });
    setShowForm(true);
  }, []);

  const handleEditItem = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      productName: item.productName,
      category: item.category,
      warehouse: item.warehouse,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      status: item.status,
    });
    setShowForm(true);
  }, []);

  const handleSaveItem = useCallback(() => {
    if (!formData.sku || !formData.productName) {
      notification.error("SKU and item name are required.");
      return;
    }

    const payload = {
      sku: formData.sku,
      productName: formData.productName,
      category: formData.category || "Raw Material",
      warehouse: formData.warehouse || "WH-01 Mumbai",
      currentStock: formData.currentStock ?? 0,
      reorderLevel: formData.reorderLevel ?? 0,
      reorderQty: (formData.reorderLevel ?? 0) * 2,
      unitPrice: "₹0",
      zone: "A1",
      lastReceived: new Date().toISOString().split("T")[0],
      lastShipped: new Date().toISOString().split("T")[0],
      status: formData.status || "Active",
    };

    if (editingItem) {
      const updated = update(editingItem.id, payload);
      if (updated) {
        notification.success("Inventory item updated successfully.");
        setShowForm(false);
        setEditingItem(null);
        refresh();
      } else {
        notification.error("Failed to update inventory item.");
      }
    } else {
      const created = create(payload);
      if (created) {
        notification.success("Inventory item added successfully.");
        setShowForm(false);
        refresh();
      } else {
        notification.error("Failed to add inventory item.");
      }
    }
  }, [create, editingItem, formData, notification, refresh, update]);

  const handleConfirmDelete = useCallback(async (item: InventoryItem) => {
    if (remove(item.id)) {
      notification.success("Inventory item deleted.");
      refresh();
    } else {
      notification.error("Failed to delete inventory item.");
    }
  }, [notification, refresh, remove]);

  const handleBulkDelete = useCallback(() => {
    const selectedIds = getSelected();
    if (!selectedIds.length) {
      notification.warning("No inventory items selected.");
      return;
    }
    confirmDialog.open({ bulk: true, ids: selectedIds });
  }, [confirmDialog, getSelected, notification]);

  const handleExport = useCallback((format: "csv" | "excel" | "pdf") => {
    const dataToExport = searchResults.map(item => ({
      SKU: item.sku,
      Name: item.productName,
      Category: item.category,
      Warehouse: item.warehouse,
      Stock: item.currentStock,
      Reorder: item.reorderLevel,
      Status: item.status,
    }));

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `inventory_register_${timestamp}`;

    if (format === "csv") exportToCSV(dataToExport, { filename, title: "Inventory Register" });
    if (format === "excel") exportToExcel(dataToExport, { filename, title: "Inventory Register" });
    if (format === "pdf") exportToPDF(dataToExport, { filename, title: "Inventory Register" });

    notification.success(`Exported inventory as ${format.toUpperCase()}.`);
  }, [notification, searchResults]);

  const stats = useMemo(() => ({
    total: items.length,
    lowStock: items.filter(item => item.currentStock < item.reorderLevel).length,
    stockValue: items.reduce((sum, item) => sum + (item.currentStock * 1200), 0),
    pendingTransfers: 12,
  }), [items]);

  const warehouses = useMemo(() => [...new Set(items.map(item => item.warehouse))], [items]);

  const filteredItems = useMemo(() => {
    let result = paginatedItems;
    if (filterStatus) result = result.filter(item => item.status === filterStatus);
    if (filterWarehouse) result = result.filter(item => item.warehouse === filterWarehouse);
    return result;
  }, [filterStatus, filterWarehouse, paginatedItems]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total SKUs", value: stats.total.toLocaleString(), icon: Package, gradient: "from-blue-600 to-blue-500", sub: "Across 3 warehouses" },
          { label: "Stock Value", value: `₹${(stats.stockValue / 10000000).toFixed(1)} Cr`, icon: DollarSign, gradient: "from-emerald-600 to-emerald-500", sub: "+2.1% MoM" },
          { label: "Low Stock Items", value: stats.lowStock.toString(), icon: AlertTriangle, gradient: "from-amber-500 to-orange-500", sub: "Immediate action" },
          { label: "Pending Transfers", value: stats.pendingTransfers.toString(), icon: Truck, gradient: "from-violet-600 to-violet-500", sub: "3 warehouses" },
        ].map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
            className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-4 text-white shadow-lg`}>
            <div className="flex items-start justify-between mb-3">
              <item.icon size={22} className="opacity-80" />
              <span className="text-xs opacity-75 font-semibold">{item.sub}</span>
            </div>
            <p className="text-2xl font-extrabold mb-1">{item.value}</p>
            <p className="text-xs opacity-90">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <Search size={18} className="text-muted-foreground" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inventory..."
            className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select value={filterStatus || ""} onChange={(e) => setFilterStatus(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Discontinued">Discontinued</option>
          </select>
          <select value={filterWarehouse || ""} onChange={(e) => setFilterWarehouse(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Warehouses</option>
            {warehouses.map(warehouse => <option key={warehouse} value={warehouse}>{warehouse}</option>)}
          </select>
          <button onClick={handleAddItem} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left">
                  <input type="checkbox" checked={selected.length === filteredItems.length && filteredItems.length > 0}
                    onChange={() => selected.length === filteredItems.length ? deselectAll() : selectAll()} className="rounded" />
                </th>
                <th className="p-3 text-left font-semibold text-muted-foreground">SKU</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Item Name</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Category</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Stock</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Reorder</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Warehouse</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" /></td>
                  <td className="p-3 font-mono text-muted-foreground">{item.sku}</td>
                  <td className="p-3 font-semibold text-foreground">{item.productName}</td>
                  <td className="p-3 text-xs text-muted-foreground">{item.category}</td>
                  <td className={`p-3 font-bold ${item.currentStock < item.reorderLevel ? "text-red-600" : "text-foreground"}`}>{item.currentStock.toLocaleString()}</td>
                  <td className="p-3 text-xs text-muted-foreground">{item.reorderLevel.toLocaleString()}</td>
                  <td className="p-3 text-xs text-muted-foreground">{item.warehouse}</td>
                  <td className="p-3 text-xs"><span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">{item.status}</span></td>
                  <td className="p-3 flex items-center gap-1">
                    <button onClick={() => handleEditItem(item)} className="p-1.5 rounded-lg hover:bg-muted text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => confirmDialog.open(item)} className="p-1.5 rounded-lg hover:bg-muted text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/30">
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => handleExport("csv")} className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted-dark">CSV</button>
            <button onClick={() => handleExport("excel")} className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted-dark">Excel</button>
            <button onClick={() => handleExport("pdf")} className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted-dark">PDF</button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700">Delete Selected</button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button onClick={() => pagination.previous()} disabled={!pagination.hasPrevious} className="px-3 py-1 rounded-lg bg-muted hover:bg-muted-dark disabled:opacity-50">Previous</button>
            <span>Page {pagination.currentPage} of {Math.max(1, Math.ceil(searchResults.length / pagination.pageSize))}</span>
            <button onClick={() => pagination.next()} disabled={!pagination.hasNext} className="px-3 py-1 rounded-lg bg-muted hover:bg-muted-dark disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl shadow-xl max-w-xl w-full p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">{editingItem ? "Edit Inventory Item" : "New Inventory Item"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold text-muted-foreground block mb-1">SKU *</label>
                <input type="text" value={formData.sku || ""} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Item Name *</label>
                <input type="text" value={formData.productName || ""} onChange={e => setFormData({ ...formData, productName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                <input type="text" value={formData.category || ""} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Warehouse</label>
                <input type="text" value={formData.warehouse || ""} onChange={e => setFormData({ ...formData, warehouse: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Stock</label>
                <input type="number" value={formData.currentStock ?? 0} onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Reorder Level</label>
                <input type="number" value={formData.reorderLevel ?? 0} onChange={e => setFormData({ ...formData, reorderLevel: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500" /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted-dark">Cancel</button>
              <button onClick={handleSaveItem} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{editingItem ? "Update Item" : "Create Item"}</button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-bold text-foreground mb-3">Confirm Delete</h2>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this inventory item?</p>
            <div className="flex gap-2">
              <button onClick={() => confirmDialog.close()} className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted-dark">Cancel</button>
              <button onClick={() => confirmDialog.confirm(async (item: InventoryItem & { bulk?: boolean; ids?: string[] }) => {
                if (item.bulk && item.ids) {
                  const deletedCount = item.ids.reduce((count, id) => remove(id) ? count + 1 : count, 0);
                  if (deletedCount > 0) { notification.success(`${deletedCount} item(s) deleted.`); refresh(); }
                } else {
                  await handleConfirmDelete(item);
                }
              })} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>}
    </div>
  );
}
