import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Download, Trash2, Edit2, Check, X, AlertCircle,
  Clock, CheckCircle2, DollarSign, Truck, TrendingUp, Star
} from "lucide-react";
import { erpServices, PurchaseOrder } from "../services/erpDataServices";
import { usePurchaseOrders, useVendors, useNotification, useConfirmDialog, usePagination, useSearch, useBulkOperations } from "../hooks/useERP";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/erpExportUtils";

interface POFormData {
  vendorId?: string;
  itemsDescription?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  dueDate?: string;
  poDate?: string;
  status?: string;
}

export function ProcurementModuleComplete() {
  // ─── Hooks ────────────────────────────────────────────────────────────────

  const { data: pos, loading, error, create, update, remove, refresh } = usePurchaseOrders(erpServices.purchaseOrders);
  const { data: vendors } = useVendors(erpServices.vendors);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } = useSearch(pos, ["id", "vendorId", "status", "itemsDescription"]);
  const { items: paginatedPos, pagination } = usePagination(searchResults, 15);
  const { selected, toggleSelect, selectAll, deselectAll, getSelected } = useBulkOperations(paginatedPos);

  // ─── State ────────────────────────────────────────────────────────────────

  const [showForm, setShowForm] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState<POFormData>({});
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterVendor, setFilterVendor] = useState<string | null>(null);
  const [tab, setTab] = useState<"pos" | "vendors" | "analytics">("pos");

  // ─── CRUD Operations ──────────────────────────────────────────────────────

  const handleAddPO = useCallback(() => {
    setEditingPO(null);
    setFormData({
      vendorId: "",
      itemsDescription: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      poDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    });
    setShowForm(true);
  }, []);

  const handleEditPO = useCallback((po: PurchaseOrder) => {
    setEditingPO(po);
    setFormData(po);
    setShowForm(true);
  }, []);

  const handleSavePO = useCallback(() => {
    if (!formData.vendorId || !formData.itemsDescription) {
      notification.error("Vendor and items are required");
      return;
    }

    const total = (formData.quantity || 0) * (formData.unitPrice || 0);

    const dataToSave = {
      ...formData,
      total,
    };

    if (editingPO) {
      const updated = update(editingPO.id, dataToSave);
      if (updated) {
        notification.success("PO updated successfully");
        setShowForm(false);
        setEditingPO(null);
        refresh();
      } else {
        notification.error("Failed to update PO");
      }
    } else {
      const newPO = create(dataToSave);
      if (newPO) {
        notification.success("PO created successfully");
        setShowForm(false);
        setFormData({});
        refresh();
      } else {
        notification.error("Failed to create PO");
      }
    }
  }, [editingPO, formData, create, update, notification, refresh]);

  const handleDeletePO = useCallback((poId: string) => {
    confirmDialog.open(
      "Delete PO",
      "Are you sure? This will remove the purchase order permanently.",
      () => {
        if (remove(poId)) {
          notification.success("PO deleted successfully");
          refresh();
        } else {
          notification.error("Failed to delete PO");
        }
      }
    );
  }, [remove, confirmDialog, notification, refresh]);

  // ─── Approval Workflow ─────────────────────────────────────────────────────

  const handleApprovePO = useCallback((poId: string) => {
    confirmDialog.open(
      "Approve PO",
      "Approve this purchase order? It will be sent to the vendor.",
      () => {
        const updated = update(poId, { status: "Approved" });
        if (updated) {
          notification.success("PO approved and sent to vendor");
          refresh();
        }
      }
    );
  }, [update, confirmDialog, notification, refresh]);

  const handleRejectPO = useCallback((poId: string) => {
    confirmDialog.open(
      "Reject PO",
      "Reject this purchase order? It will be marked as rejected.",
      () => {
        const updated = update(poId, { status: "Rejected" });
        if (updated) {
          notification.success("PO rejected");
          refresh();
        }
      }
    );
  }, [update, confirmDialog, notification, refresh]);

  const handleReceivePO = useCallback((poId: string) => {
    confirmDialog.open(
      "Receive PO",
      "Mark PO as received? This will update your inventory.",
      () => {
        const updated = update(poId, { status: "Received" });
        if (updated) {
          notification.success("PO received and inventory updated");
          refresh();
        }
      }
    );
  }, [update, confirmDialog, notification, refresh]);

  // ─── Export ───────────────────────────────────────────────────────────────

  const handleExport = useCallback((format: "csv" | "excel" | "pdf") => {
    const dataToExport = searchResults.map(po => ({
      "PO ID": po.id,
      "Vendor": po.vendorId,
      "Items": po.itemsDescription,
      "Qty": po.quantity,
      "Unit Price": `₹${po.unitPrice?.toLocaleString()}`,
      "Total": `₹${po.total?.toLocaleString()}`,
      "Due Date": po.dueDate,
      "Status": po.status,
    }));

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `purchase_orders_${timestamp}`;

    switch (format) {
      case "csv":
        exportToCSV(dataToExport, { filename });
        break;
      case "excel":
        exportToExcel(dataToExport, { filename, sheetName: "Purchase Orders" });
        break;
      case "pdf":
        exportToPDF(dataToExport, { filename, title: "Purchase Orders Report" });
        break;
    }
    notification.success(`Exported as ${format.toUpperCase()}`);
  }, [searchResults, notification]);

  // ─── Derived Data ────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: pos.length,
    draft: pos.filter(p => p.status === "Draft").length,
    approved: pos.filter(p => p.status === "Approved").length,
    received: pos.filter(p => p.status === "Received").length,
    rejected: pos.filter(p => p.status === "Rejected").length,
    totalValue: pos.reduce((sum, p) => sum + (p.total || 0), 0),
    pendingApproval: pos.filter(p => p.status === "Draft" || p.status === "Pending").length,
  }), [pos]);

  const vendorNames = useMemo(() => [...new Set(pos.map(p => p.vendorId))], [pos]);

  const filteredPos = useMemo(() => {
    let result = paginatedPos;
    if (filterStatus) result = result.filter(p => p.status === filterStatus);
    if (filterVendor) result = result.filter(p => p.vendorId === filterVendor);
    return result;
  }, [paginatedPos, filterStatus, filterVendor]);

  // ─── Components ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total POs", value: stats.total, icon: Truck, gradient: "from-blue-600 to-blue-500", sub: `₹${(stats.totalValue / 10000000).toFixed(1)}Cr` },
          { label: "Pending Approval", value: stats.pendingApproval, icon: Clock, gradient: "from-amber-600 to-amber-500", sub: "Awaiting action" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, gradient: "from-emerald-600 to-emerald-500", sub: "On order" },
          { label: "Received", value: stats.received, icon: TrendingUp, gradient: "from-violet-600 to-violet-500", sub: "In inventory" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["pos", "vendors", "analytics"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "pos" ? "Purchase Orders" : t === "vendors" ? "Vendors" : "Analytics"}
          </button>
        ))}
      </div>

      {/* POs Tab */}
      {tab === "pos" && (
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
              <Search size={18} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search POs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Received">Received</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={filterVendor || ""}
                onChange={(e) => setFilterVendor(e.target.value || null)}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground"
              >
                <option value="">All Vendors</option>
                {vendorNames.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <button
                onClick={handleAddPO}
                className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                <Plus size={16} /> New PO
              </button>
            </div>
          </div>

          {/* POs Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === filteredPos.length && filteredPos.length > 0}
                        onChange={() => selected.length === filteredPos.length ? deselectAll() : selectAll()}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">PO ID</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Vendor</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Items</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Qty</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Total</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Due Date</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPos.map(po => (
                    <tr key={po.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(po.id)}
                          onChange={() => toggleSelect(po.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3 font-bold text-blue-600 text-xs">{po.id}</td>
                      <td className="p-3 font-semibold text-foreground text-xs">{po.vendorId}</td>
                      <td className="p-3 text-muted-foreground text-xs">{po.itemsDescription}</td>
                      <td className="p-3 text-foreground font-mono text-xs">{po.quantity}</td>
                      <td className="p-3 font-bold text-foreground">₹{(po.total || 0).toLocaleString()}</td>
                      <td className="p-3 text-muted-foreground text-xs">{po.dueDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ring-1 ${
                          po.status === "Approved" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
                          po.status === "Draft" || po.status === "Pending" ? "bg-amber-50 text-amber-700 ring-amber-200" :
                          po.status === "Received" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                          "bg-red-50 text-red-700 ring-red-200"
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-1">
                        {(po.status === "Draft" || po.status === "Pending") && (
                          <>
                            <button
                              onClick={() => handleApprovePO(po.id)}
                              className="p-1.5 hover:bg-muted rounded-lg transition-colors text-emerald-600"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleRejectPO(po.id)}
                              className="p-1.5 hover:bg-muted rounded-lg transition-colors text-red-600"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {po.status === "Approved" && (
                          <button
                            onClick={() => handleReceivePO(po.id)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors text-blue-600"
                            title="Mark as Received"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditPO(po)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePO(po.id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
              <span className="text-xs text-muted-foreground">
                Showing {filteredPos.length === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, searchResults.length)} of {searchResults.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => pagination.previous()}
                  disabled={!pagination.hasPrevious}
                  className="px-3 py-1 rounded-lg bg-muted hover:bg-muted-dark text-xs font-semibold disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs text-muted-foreground">
                  Page {pagination.currentPage} of {Math.ceil(searchResults.length / pagination.pageSize) || 1}
                </span>
                <button
                  onClick={() => pagination.next()}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 rounded-lg bg-muted hover:bg-muted-dark text-xs font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Export Data</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport("csv")}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted-dark text-foreground font-semibold flex items-center gap-1"
              >
                <Download size={14} /> CSV
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted-dark text-foreground font-semibold flex items-center gap-1"
              >
                <Download size={14} /> Excel
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted-dark text-foreground font-semibold flex items-center gap-1"
              >
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {tab === "vendors" && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-4">Active Vendors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map(v => (
              <div key={v.id} className="border border-border rounded-lg p-4">
                <p className="font-bold text-foreground mb-1">{v.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{v.email}</p>
                <p className="text-xs text-muted-foreground mb-3">{v.phone}</p>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-600">{v.rating || 0}★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold text-foreground mb-4">PO Status Distribution</h3>
            <div className="space-y-2">
              {[
                { label: "Draft", count: stats.draft, color: "bg-gray-500" },
                { label: "Approved", count: stats.approved, color: "bg-emerald-500" },
                { label: "Received", count: stats.received, color: "bg-blue-500" },
                { label: "Rejected", count: stats.rejected, color: "bg-red-500" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{s.label}</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.total > 0 ? (s.count / stats.total) * 100 : 0}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-6 rounded-lg flex items-center px-2 flex-1 ${s.color}`}
                  >
                    {s.count > 0 && <span className="text-xs text-white font-bold">{s.count}</span>}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold text-foreground mb-4">Spending Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-muted rounded">
                <span className="text-xs text-muted-foreground">Total Spent</span>
                <span className="font-bold text-foreground">₹{(stats.totalValue / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span className="text-xs text-muted-foreground">Average PO Value</span>
                <span className="font-bold text-foreground">₹{stats.total > 0 ? (stats.totalValue / stats.total / 1000000).toFixed(1) : 0}M</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span className="text-xs text-muted-foreground">Total Vendors</span>
                <span className="font-bold text-foreground">{vendorNames.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingPO ? "Edit Purchase Order" : "New Purchase Order"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Vendor *</label>
                <select
                  value={formData.vendorId || ""}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Items Description *</label>
                <textarea
                  value={formData.itemsDescription || ""}
                  onChange={(e) => setFormData({ ...formData, itemsDescription: e.target.value })}
                  placeholder="Describe items being ordered"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={formData.unitPrice || 0}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Total</label>
                  <input
                    type="text"
                    disabled
                    value={`₹${((formData.quantity || 0) * (formData.unitPrice || 0)).toLocaleString()}`}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">PO Date</label>
                  <input
                    type="date"
                    value={formData.poDate || ""}
                    onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ""}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted-dark font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePO}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm"
              >
                {editingPO ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl shadow-xl max-w-sm w-full p-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-2">{confirmDialog.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{confirmDialog.message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => confirmDialog.close()}
                className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted-dark font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm?.();
                  confirmDialog.close();
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold text-sm"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
