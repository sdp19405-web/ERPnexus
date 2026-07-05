import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Download, Trash2, Edit2, Truck, AlertCircle,
  Clock, CheckCircle2, MapPin, Map, RefreshCw
} from "lucide-react";
import { erpServices, SupplyChainRecord } from "../services/erpDataServices";
import { useSupplyChain, useNotification, useConfirmDialog, usePagination, useSearch, useBulkOperations } from "../hooks/useERP";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/erpExportUtils";

export function SupplyChainModuleComplete() {
  const { data: records, create, update, remove, refresh } = useSupplyChain(erpServices.supplyChain);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } = useSearch(records, ["id", "shipmentId", "origin", "destination", "carrier"]);
  const { items: paginatedRecords, pagination } = usePagination(searchResults, 15);
  const { selected, toggleSelect, selectAll, deselectAll } = useBulkOperations(paginatedRecords);

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SupplyChainRecord | null>(null);
  const [formData, setFormData] = useState<Partial<SupplyChainRecord>>({});
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    setEditingRecord(null);
    setFormData({
      shipmentId: `SHP-${Math.floor(1000 + Math.random() * 9000)}`,
      origin: "",
      destination: "",
      carrier: "",
      eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending",
    });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((record: SupplyChainRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.origin || !formData.destination) {
      notification.error("Origin and Destination are required");
      return;
    }

    const dataToSave = {
      shipmentId: formData.shipmentId || `SHP-${Date.now()}`,
      origin: formData.origin,
      destination: formData.destination,
      carrier: formData.carrier || "Standard Carrier",
      eta: formData.eta || new Date().toISOString().split("T")[0],
      status: formData.status as any || "Pending",
    };

    if (editingRecord) {
      if (update(editingRecord.id, dataToSave)) {
        notification.success("Shipment record updated");
        setShowForm(false);
        refresh();
      }
    } else {
      if (create(dataToSave)) {
        notification.success("Shipment record created");
        setShowForm(false);
        refresh();
      }
    }
  }, [editingRecord, formData, create, update, notification, refresh]);

  const handleDelete = useCallback((id: string) => {
    confirmDialog.open("Delete Record", "Are you sure you want to delete this shipment record?", () => {
      if (remove(id)) {
        notification.success("Record deleted");
        refresh();
      }
    });
  }, [remove, confirmDialog, notification, refresh]);

  const handleExport = useCallback((format: "csv" | "excel" | "pdf") => {
    const dataToExport = searchResults.map(r => ({
      "ID": r.id, "Shipment ID": r.shipmentId, "Origin": r.origin,
      "Destination": r.destination, "Carrier": r.carrier, "ETA": r.eta, "Status": r.status
    }));
    const filename = `supply_chain_${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") exportToCSV(dataToExport, { filename });
    else if (format === "excel") exportToExcel(dataToExport, { filename, sheetName: "Supply Chain" });
    else exportToPDF(dataToExport, { filename, title: "Supply Chain Report" });
    notification.success(`Exported as ${format.toUpperCase()}`);
  }, [searchResults, notification]);

  const stats = useMemo(() => ({
    total: records.length,
    inTransit: records.filter(r => r.status === "In Transit").length,
    delayed: records.filter(r => r.status === "Delayed").length,
    delivered: records.filter(r => r.status === "Delivered").length
  }), [records]);

  const filteredRecords = useMemo(() => {
    let result = paginatedRecords;
    if (filterStatus) result = result.filter(r => r.status === filterStatus);
    return result;
  }, [paginatedRecords, filterStatus]);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Shipments", value: stats.total, icon: Map, gradient: "from-blue-600 to-blue-500", sub: "All logistics" },
          { label: "In Transit", value: stats.inTransit, icon: Truck, gradient: "from-emerald-600 to-emerald-500", sub: "On the move" },
          { label: "Delayed", value: stats.delayed, icon: AlertCircle, gradient: "from-amber-600 to-amber-500", sub: "Needs action" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle2, gradient: "from-violet-600 to-violet-500", sub: "Completed" },
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
          <input type="text" placeholder="Search shipments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filterStatus || ""} onChange={e => setFilterStatus(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delayed">Delayed</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button onClick={handleAdd} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-1">
            <Plus size={16} /> New Shipment
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
                <th className="p-3 text-left font-semibold text-muted-foreground">Shipment ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Origin</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Destination</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Carrier</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">ETA</th>
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
                  <td className="p-3 font-mono text-foreground text-xs">{record.shipmentId}</td>
                  <td className="p-3 text-muted-foreground text-xs flex items-center gap-1"><MapPin size={12}/>{record.origin}</td>
                  <td className="p-3 text-muted-foreground text-xs">{record.destination}</td>
                  <td className="p-3 font-semibold text-foreground text-xs">{record.carrier}</td>
                  <td className="p-3 font-mono text-foreground text-xs">{record.eta}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ring-1 ${
                      record.status === "Delivered" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : 
                      record.status === "In Transit" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                      record.status === "Delayed" ? "bg-red-50 text-red-700 ring-red-200" :
                      "bg-slate-50 text-slate-700 ring-slate-200"
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
        <span className="text-sm font-semibold text-foreground">Export Shipments</span>
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
            <h2 className="text-lg font-bold mb-4">{editingRecord ? "Edit Shipment" : "New Shipment"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Shipment ID</label>
                <input type="text" value={formData.shipmentId || ""} onChange={e => setFormData({ ...formData, shipmentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" disabled />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Origin *</label>
                  <input type="text" value={formData.origin || ""} onChange={e => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Destination *</label>
                  <input type="text" value={formData.destination || ""} onChange={e => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Carrier</label>
                <input type="text" value={formData.carrier || ""} onChange={e => setFormData({ ...formData, carrier: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">ETA</label>
                  <input type="date" value={formData.eta || ""} onChange={e => setFormData({ ...formData, eta: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
                  <select value={formData.status || "Pending"} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none">
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Delivered">Delivered</option>
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
