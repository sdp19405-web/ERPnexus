import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Download, Trash2, Edit2, Monitor, AlertCircle,
  Clock, CheckCircle2, Laptop, UserCheck, Wrench, RefreshCw
} from "lucide-react";
import { erpServices, ITAsset } from "../services/erpDataServices";
import { useITAssets, useNotification, useConfirmDialog, usePagination, useSearch, useBulkOperations } from "../hooks/useERP";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/erpExportUtils";

export function ITAssetsModuleComplete() {
  const { data: assets, create, update, remove, refresh } = useITAssets(erpServices.itAssets);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } = useSearch(assets, ["id", "name", "type", "assignedTo"]);
  const { items: paginatedAssets, pagination } = usePagination(searchResults, 15);
  const { selected, toggleSelect, selectAll, deselectAll } = useBulkOperations(paginatedAssets);

  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);
  const [formData, setFormData] = useState<Partial<ITAsset>>({});
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    setEditingAsset(null);
    setFormData({
      name: "",
      type: "Laptop",
      assignedTo: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      status: "Available",
    });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((asset: ITAsset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.name) {
      notification.error("Asset Name is required");
      return;
    }

    const dataToSave = {
      name: formData.name,
      type: formData.type || "Laptop",
      assignedTo: formData.assignedTo || "Unassigned",
      purchaseDate: formData.purchaseDate || new Date().toISOString().split("T")[0],
      status: formData.status as any || "Available",
    };

    if (editingAsset) {
      if (update(editingAsset.id, dataToSave)) {
        notification.success("IT Asset updated");
        setShowForm(false);
        refresh();
      }
    } else {
      if (create(dataToSave)) {
        notification.success("IT Asset created");
        setShowForm(false);
        refresh();
      }
    }
  }, [editingAsset, formData, create, update, notification, refresh]);

  const handleDelete = useCallback((id: string) => {
    confirmDialog.open("Delete Asset", "Are you sure you want to delete this IT Asset?", () => {
      if (remove(id)) {
        notification.success("Asset deleted");
        refresh();
      }
    });
  }, [remove, confirmDialog, notification, refresh]);

  const handleExport = useCallback((format: "csv" | "excel" | "pdf") => {
    const dataToExport = searchResults.map(a => ({
      "ID": a.id, "Name": a.name, "Type": a.type,
      "Assigned To": a.assignedTo, "Purchase Date": a.purchaseDate, "Status": a.status
    }));
    const filename = `it_assets_${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") exportToCSV(dataToExport, { filename });
    else if (format === "excel") exportToExcel(dataToExport, { filename, sheetName: "IT Assets" });
    else exportToPDF(dataToExport, { filename, title: "IT Assets Report" });
    notification.success(`Exported as ${format.toUpperCase()}`);
  }, [searchResults, notification]);

  const stats = useMemo(() => ({
    total: assets.length,
    inUse: assets.filter(a => a.status === "In Use").length,
    available: assets.filter(a => a.status === "Available").length,
    maintenance: assets.filter(a => a.status === "Maintenance").length
  }), [assets]);

  const types = useMemo(() => Array.from(new Set(assets.map(a => a.type))), [assets]);
  
  const filteredAssets = useMemo(() => {
    let result = paginatedAssets;
    if (filterType) result = result.filter(a => a.type === filterType);
    if (filterStatus) result = result.filter(a => a.status === filterStatus);
    return result;
  }, [paginatedAssets, filterType, filterStatus]);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Assets", value: stats.total, icon: Monitor, gradient: "from-blue-600 to-blue-500", sub: "All hardware" },
          { label: "In Use", value: stats.inUse, icon: UserCheck, gradient: "from-emerald-600 to-emerald-500", sub: "Assigned" },
          { label: "Available", value: stats.available, icon: Laptop, gradient: "from-violet-600 to-violet-500", sub: "In stock" },
          { label: "Maintenance", value: stats.maintenance, icon: Wrench, gradient: "from-amber-600 to-amber-500", sub: "Under repair" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-4 text-white shadow-lg`}
          >
            <div className="flex items-start justify-between mb-3">
              <item.icon size={24} className="opacity-80" />
              <span className="text-xs opacity-75 font-semibold">{item.sub}</span>
            </div>
            <p className="text-2xl font-extrabold mb-1">{item.value}</p>
            <p className="text-xs opacity-90">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <Search size={18} className="text-muted-foreground" />
          <input type="text" placeholder="Search assets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filterType || ""} onChange={e => setFilterType(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Types</option>
            {types.map((t, i) => <option key={i} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus || ""} onChange={e => setFilterStatus(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Status</option>
            <option value="In Use">In Use</option>
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
          <button onClick={handleAdd} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-1">
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left">
                  <input type="checkbox" checked={selected.length === filteredAssets.length && filteredAssets.length > 0}
                    onChange={() => selected.length === filteredAssets.length ? deselectAll() : selectAll()} className="rounded" />
                </th>
                <th className="p-3 text-left font-semibold text-muted-foreground">ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Name</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Type</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Assigned To</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Purchase Date</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(asset.id)} onChange={() => toggleSelect(asset.id)} className="rounded" />
                  </td>
                  <td className="p-3 font-bold text-blue-600 text-xs">{asset.id}</td>
                  <td className="p-3 font-semibold text-foreground text-xs">{asset.name}</td>
                  <td className="p-3 text-muted-foreground text-xs">{asset.type}</td>
                  <td className="p-3 text-muted-foreground text-xs">{asset.assignedTo}</td>
                  <td className="p-3 font-mono text-xs text-foreground">{asset.purchaseDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ring-1 ${
                      asset.status === "Available" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : 
                      asset.status === "In Use" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                      asset.status === "Maintenance" ? "bg-amber-50 text-amber-700 ring-amber-200" :
                      "bg-slate-50 text-slate-700 ring-slate-200"
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-1">
                    <button onClick={() => handleEdit(asset)} className="p-1.5 hover:bg-muted rounded-lg text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(asset.id)} className="p-1.5 hover:bg-muted rounded-lg text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Showing {filteredAssets.length === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, searchResults.length)} of {searchResults.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => pagination.previous()} disabled={!pagination.hasPrevious} className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold disabled:opacity-50">Prev</button>
            <span className="text-xs text-muted-foreground">Page {pagination.currentPage} of {Math.ceil(searchResults.length / pagination.pageSize) || 1}</span>
            <button onClick={() => pagination.next()} disabled={!pagination.hasNext} className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">Export Assets</span>
        <div className="flex gap-2">
          {["csv", "excel", "pdf"].map((fmt) => (
            <button key={fmt} onClick={() => handleExport(fmt as any)} className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted-dark font-semibold uppercase flex items-center gap-1">
              <Download size={14} /> {fmt}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-4">{editingAsset ? "Edit Asset" : "Add Asset"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Asset Name *</label>
                <input type="text" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Type</label>
                <input type="text" value={formData.type || ""} onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Assigned To</label>
                <input type="text" value={formData.assignedTo || ""} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Purchase Date</label>
                  <input type="date" value={formData.purchaseDate || ""} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
                  <select value={formData.status || "Available"} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none">
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg bg-muted font-semibold text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm">Save</button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-2">{confirmDialog.data?.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{confirmDialog.data?.body}</p>
            <div className="flex gap-2">
              <button onClick={() => confirmDialog.close()} className="flex-1 px-4 py-2 rounded-lg bg-muted font-semibold text-sm">Cancel</button>
              <button onClick={() => confirmDialog.confirm()} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
