import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Download, Trash2, Edit2, Wrench, AlertCircle,
  Clock, CheckCircle2, Activity, Settings, AlertTriangle
} from "lucide-react";
import { erpServices, MaintenanceRecord } from "../services/erpDataServices";
import { useMaintenance, useNotification, useConfirmDialog, usePagination, useSearch, useBulkOperations } from "../hooks/useERP";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/erpExportUtils";

export function MaintenanceModuleComplete() {
  const { data: records, create, update, remove, refresh } = useMaintenance(erpServices.maintenance);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } = useSearch(records, ["id", "assetId", "issue", "assignedTo"]);
  const { items: paginatedRecords, pagination } = usePagination(searchResults, 15);
  const { selected, toggleSelect, selectAll, deselectAll } = useBulkOperations(paginatedRecords);

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({});
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    setEditingRecord(null);
    setFormData({
      assetId: "",
      issue: "",
      priority: "Medium",
      assignedTo: "",
      status: "Open",
    });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((record: MaintenanceRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.assetId || !formData.issue) {
      notification.error("Asset ID and Issue description are required");
      return;
    }

    const dataToSave = {
      assetId: formData.assetId,
      issue: formData.issue,
      priority: formData.priority as any || "Medium",
      assignedTo: formData.assignedTo || "Unassigned",
      status: formData.status as any || "Open",
    };

    if (editingRecord) {
      if (update(editingRecord.id, dataToSave)) {
        notification.success("Maintenance record updated");
        setShowForm(false);
        refresh();
      }
    } else {
      if (create(dataToSave)) {
        notification.success("Maintenance record created");
        setShowForm(false);
        refresh();
      }
    }
  }, [editingRecord, formData, create, update, notification, refresh]);

  const handleDelete = useCallback((id: string) => {
    confirmDialog.open("Delete Record", "Are you sure you want to delete this maintenance record?", () => {
      if (remove(id)) {
        notification.success("Record deleted");
        refresh();
      }
    });
  }, [remove, confirmDialog, notification, refresh]);

  const handleExport = useCallback((format: "csv" | "excel" | "pdf") => {
    const dataToExport = searchResults.map(r => ({
      "ID": r.id, "Asset ID": r.assetId, "Issue": r.issue,
      "Priority": r.priority, "Assigned To": r.assignedTo, "Status": r.status
    }));
    const filename = `maintenance_${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") exportToCSV(dataToExport, { filename });
    else if (format === "excel") exportToExcel(dataToExport, { filename, sheetName: "Maintenance" });
    else exportToPDF(dataToExport, { filename, title: "Maintenance Report" });
    notification.success(`Exported as ${format.toUpperCase()}`);
  }, [searchResults, notification]);

  const stats = useMemo(() => ({
    total: records.length,
    open: records.filter(r => r.status === "Open" || r.status === "In Progress").length,
    critical: records.filter(r => r.priority === "Critical" && r.status !== "Closed" && r.status !== "Resolved").length,
    resolved: records.filter(r => r.status === "Resolved" || r.status === "Closed").length
  }), [records]);

  const filteredRecords = useMemo(() => {
    let result = paginatedRecords;
    if (filterPriority) result = result.filter(r => r.priority === filterPriority);
    if (filterStatus) result = result.filter(r => r.status === filterStatus);
    return result;
  }, [paginatedRecords, filterPriority, filterStatus]);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Records", value: stats.total, icon: Wrench, gradient: "from-blue-600 to-blue-500", sub: "All tickets" },
          { label: "Active Issues", value: stats.open, icon: Activity, gradient: "from-amber-600 to-amber-500", sub: "In progress/Open" },
          { label: "Critical", value: stats.critical, icon: AlertTriangle, gradient: "from-red-600 to-red-500", sub: "Needs attention" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, gradient: "from-emerald-600 to-emerald-500", sub: "Completed" },
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
          <input type="text" placeholder="Search maintenance records..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filterPriority || ""} onChange={e => setFilterPriority(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select value={filterStatus || ""} onChange={e => setFilterStatus(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <button onClick={handleAdd} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-1">
            <Plus size={16} /> New Ticket
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
                  <input type="checkbox" checked={selected.length === filteredRecords.length && filteredRecords.length > 0}
                    onChange={() => selected.length === filteredRecords.length ? deselectAll() : selectAll()} className="rounded" />
                </th>
                <th className="p-3 text-left font-semibold text-muted-foreground">ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Asset ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Issue</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Priority</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Assigned To</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(record.id)} onChange={() => toggleSelect(record.id)} className="rounded" />
                  </td>
                  <td className="p-3 font-bold text-blue-600 text-xs">{record.id}</td>
                  <td className="p-3 font-mono text-foreground text-xs">{record.assetId}</td>
                  <td className="p-3 text-muted-foreground text-xs">{record.issue}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ring-1 ${
                      record.priority === "Critical" ? "bg-red-50 text-red-700 ring-red-200" : 
                      record.priority === "High" ? "bg-orange-50 text-orange-700 ring-orange-200" :
                      record.priority === "Medium" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                      "bg-slate-50 text-slate-700 ring-slate-200"
                    }`}>
                      {record.priority}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{record.assignedTo}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ring-1 ${
                      record.status === "Resolved" || record.status === "Closed" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : 
                      record.status === "In Progress" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                      "bg-amber-50 text-amber-700 ring-amber-200"
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-1">
                    <button onClick={() => handleEdit(record)} className="p-1.5 hover:bg-muted rounded-lg text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(record.id)} className="p-1.5 hover:bg-muted rounded-lg text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Showing {filteredRecords.length === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, searchResults.length)} of {searchResults.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => pagination.previous()} disabled={!pagination.hasPrevious} className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold disabled:opacity-50">Prev</button>
            <span className="text-xs text-muted-foreground">Page {pagination.currentPage} of {Math.ceil(searchResults.length / pagination.pageSize) || 1}</span>
            <button onClick={() => pagination.next()} disabled={!pagination.hasNext} className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">Export Records</span>
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
            <h2 className="text-lg font-bold mb-4">{editingRecord ? "Edit Record" : "New Record"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Asset ID *</label>
                <input type="text" value={formData.assetId || ""} onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Issue Description *</label>
                <textarea value={formData.issue || ""} onChange={e => setFormData({ ...formData, issue: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Assigned To</label>
                <input type="text" value={formData.assignedTo || ""} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Priority</label>
                  <select value={formData.priority || "Medium"} onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
                  <select value={formData.status || "Open"} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
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
