// @ts-nocheck
import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Download, Trash2, Edit2, Filter,
  TrendingUp, AlertTriangle, DollarSign, Users, MoreHorizontal,
  CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { erpServices, Lead } from "../services/erpDataServices";
import { useSalesLeads, useNotification, useConfirmDialog, usePagination, useSearch, useBulkOperations } from "../hooks/useERP";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/erpExportUtils";

// ─── Sales Module Complete ────────────────────────────────────────────────────

interface SalesLeadFormData {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  stage?: string;
  value?: number;
  owner?: string;
  priority?: string;
}

export function SalesModuleComplete({ onNavigate }: { onNavigate?: (m: string) => void }) {
  const { data: leads, loading, error, create, update, remove, refresh } = useSalesLeads(erpServices.sales);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } = useSearch(leads, ["name", "contact", "email", "stage", "owner"]);
  const { items: paginatedLeads, pagination } = usePagination(searchResults, 20);
  const { selected, toggleSelect, selectAll, deselectAll, getSelected } = useBulkOperations(paginatedLeads);
  
  const [tab, setTab] = useState<"leads" | "analytics">("leads");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<SalesLeadFormData>({});
  const [filterStage, setFilterStage] = useState<string | null>(null);
  const [filterOwner, setFilterOwner] = useState<string | null>(null);

  // ─── CRUD Operations ──────────────────────────────────────────────────────

  const handleAddLead = useCallback(() => {
    setEditingLead(null);
    setFormData({
      name: "",
      contact: "",
      email: "",
      phone: "",
      stage: "Lead",
      value: 0,
      owner: "Unassigned",
      priority: "Medium",
    });
    setShowForm(true);
  }, []);

  const handleEditLead = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setFormData(lead);
    setShowForm(true);
  }, []);

  const handleSaveLead = useCallback(() => {
    if (!formData.name || !formData.contact) {
      notification.error("Company name and contact are required");
      return;
    }

    if (editingLead) {
      const updated = update(editingLead.id, formData);
      if (updated) {
        notification.success("Lead updated successfully");
        setShowForm(false);
        setEditingLead(null);
        refresh();
      } else {
        notification.error("Failed to update lead");
      }
    } else {
      const newLead = create(formData);
      if (newLead) {
        notification.success("Lead created successfully");
        setShowForm(false);
        setFormData({});
        refresh();
      } else {
        notification.error("Failed to create lead");
      }
    }
  }, [editingLead, formData, create, update, notification, refresh]);

  const handleDeleteLead = useCallback((leadId: string) => {
    confirmDialog.open(
      "Delete Lead",
      "Are you sure you want to delete this lead?",
      () => {
        if (remove(leadId)) {
          notification.success("Lead deleted successfully");
          refresh();
        } else {
          notification.error("Failed to delete lead");
        }
      }
    );
  }, [remove, confirmDialog, notification, refresh]);

  const handleBulkDelete = useCallback(() => {
    const selectedIds = getSelected();
    if (selectedIds.length === 0) {
      notification.warning("No leads selected");
      return;
    }

    confirmDialog.open(
      "Delete Multiple Leads",
      `Are you sure you want to delete ${selectedIds.length} leads?`,
      () => {
        let deleted = 0;
        selectedIds.forEach(id => {
          if (remove(id)) deleted++;
        });
        if (deleted > 0) {
          notification.success(`${deleted} leads deleted`);
          deselectAll();
          refresh();
        }
      }
    );
  }, [getSelected, remove, confirmDialog, notification, deselectAll, refresh]);

  const handleChangePriority = useCallback((leadId: string, priority: "High" | "Medium" | "Low") => {
    const updated = update(leadId, { priority });
    if (updated) {
      notification.success(`Priority changed to ${priority}`);
      refresh();
    }
  }, [update, notification, refresh]);

  const handleChangeOwner = useCallback((leadId: string, owner: string) => {
    const updated = update(leadId, { owner });
    if (updated) {
      notification.success(`Lead assigned to ${owner}`);
      refresh();
    }
  }, [update, notification, refresh]);

  const handleChangeStage = useCallback((leadId: string, stage: string) => {
    const updated = update(leadId, { stage });
    if (updated) {
      notification.success(`Stage changed to ${stage}`);
      refresh();
    }
  }, [update, notification, refresh]);

  // ─── Export Operations ─────────────────────────────────────────────────────

  const handleExport = useCallback((format: "csv" | "excel" | "pdf") => {
    const dataToExport = searchResults.map(l => ({
      id: l.id,
      company: l.name,
      contact: l.contact,
      email: l.email,
      phone: l.phone,
      stage: l.stage,
      value: `₹${l.value?.toLocaleString() || 0}`,
      owner: l.owner,
      priority: l.priority,
      score: l.score,
    }));

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `sales_leads_${timestamp}`;

    switch (format) {
      case "csv":
        exportToCSV(dataToExport, { filename });
        break;
      case "excel":
        exportToExcel(dataToExport, { filename, sheetName: "Sales Leads" });
        break;
      case "pdf":
        exportToPDF(dataToExport, { filename, title: "Sales Leads Report" });
        break;
    }
    notification.success(`Exported as ${format.toUpperCase()}`);
  }, [searchResults, notification]);

  // ─── Derived Data ────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: leads.length,
    byStage: {
      lead: leads.filter(l => l.stage === "Lead").length,
      qualified: leads.filter(l => l.stage === "Qualified").length,
      proposal: leads.filter(l => l.stage === "Proposal").length,
      negotiation: leads.filter(l => l.stage === "Negotiation").length,
      close: leads.filter(l => l.stage === "Close").length,
    },
    totalValue: leads.reduce((sum, l) => sum + (l.value || 0), 0),
    avgDealSize: leads.length > 0 ? leads.reduce((sum, l) => sum + (l.value || 0), 0) / leads.length : 0,
    avgScore: leads.length > 0 ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length : 0,
  }), [leads]);

  const filteredData = useMemo(() => {
    let result = paginatedLeads;
    if (filterStage) result = result.filter(l => l.stage === filterStage);
    if (filterOwner) result = result.filter(l => l.owner === filterOwner);
    return result;
  }, [paginatedLeads, filterStage, filterOwner]);

  const owners = useMemo(() => [...new Set(leads.map(l => l.owner))], [leads]);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, gradient: "from-blue-600 to-blue-500", sub: "+18 this week" },
          { label: "Total Pipeline", value: `₹${(stats.totalValue / 10000000).toFixed(1)}Cr`, icon: DollarSign, gradient: "from-emerald-600 to-emerald-500", sub: `Avg ₹${(stats.avgDealSize / 1000000).toFixed(1)}M` },
          { label: "Avg Lead Score", value: `${stats.avgScore.toFixed(0)}%`, icon: TrendingUp, gradient: "from-violet-600 to-violet-500", sub: "Quality metric" },
          { label: "Close Rate", value: `${((stats.byStage.close / stats.total) * 100).toFixed(1)}%`, icon: CheckCircle2, gradient: "from-amber-500 to-orange-500", sub: "This quarter" },
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
        {(["leads", "analytics"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "leads" ? "Leads & Management" : "Analytics"}
          </button>
        ))}
      </div>

      {/* Leads Tab */}
      {tab === "leads" && (
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
              <Search size={18} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filterStage || ""}
                onChange={(e) => setFilterStage(e.target.value || null)}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground"
              >
                <option value="">All Stages</option>
                <option value="Lead">Lead</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Close">Close</option>
              </select>
              <select
                value={filterOwner || ""}
                onChange={(e) => setFilterOwner(e.target.value || null)}
                className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground"
              >
                <option value="">All Owners</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
              <button
                onClick={handleAddLead}
                className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                <Plus size={16} /> New Lead
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === filteredData.length && filteredData.length > 0}
                        onChange={() => selected.length === filteredData.length ? deselectAll() : selectAll()}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Company</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Contact</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Email</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Value</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Stage</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Score</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Owner</th>
                    <th className="p-3 text-left font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(lead => (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3 font-semibold text-foreground">{lead.company}</td>
                      <td className="p-3 text-muted-foreground text-xs">{lead.contact}</td>
                      <td className="p-3 text-muted-foreground text-xs">{lead.email}</td>
                      <td className="p-3 font-bold text-foreground">₹{lead.value}</td>
                      <td className="p-3">
                        <select
                          value={lead.stage}
                          onChange={(e) => handleChangeStage(lead.id, e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg bg-muted border border-border text-foreground"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Close">Close</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${lead.score}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full bg-blue-500"
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-foreground">{lead.score}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.owner}
                          onChange={(e) => handleChangeOwner(lead.id, e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg bg-muted border border-border text-foreground"
                        >
                          {owners.map(owner => (
                            <option key={owner} value={owner}>{owner}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 flex items-center gap-1">
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
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
                Showing {filteredData.length === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, searchResults.length)} of {searchResults.length}
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
                  Page {pagination.currentPage} of {Math.ceil(searchResults.length / pagination.pageSize)}
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

          {/* Bulk Actions */}
          {selected.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                {selected.length} lead{selected.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete Selected
                </button>
                <button
                  onClick={() => deselectAll()}
                  className="px-3 py-1.5 text-xs rounded-lg bg-muted text-foreground hover:bg-muted-dark font-semibold"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

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

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4">Leads by Stage</h3>
            <div className="space-y-3">
              {Object.entries(stats.byStage).map(([stage, count]) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 capitalize">{stage}</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.total) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-6 rounded-lg flex items-center px-2.5 flex-1 bg-blue-500"
                  >
                    <span className="text-xs text-white font-bold">{count}</span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4">Key Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">Total Pipeline Value</span>
                <span className="font-bold text-foreground">₹{(stats.totalValue / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">Average Deal Size</span>
                <span className="font-bold text-foreground">₹{(stats.avgDealSize / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">Close Rate</span>
                <span className="font-bold text-foreground">{((stats.byStage.close / stats.total) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">Average Lead Score</span>
                <span className="font-bold text-foreground">{stats.avgScore.toFixed(0)}%</span>
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
            className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingLead ? "Edit Lead" : "New Lead"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Contact Person *</label>
                <input
                  type="text"
                  value={formData.contact || ""}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Enter contact name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Deal Value (₹)</label>
                <input
                  type="number"
                  value={formData.value || 0}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  placeholder="Enter deal value"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Stage</label>
                <select
                  value={formData.stage || "Lead"}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                >
                  <option value="Lead">Lead</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Close">Close</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Owner</label>
                <select
                  value={formData.owner || "Unassigned"}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                >
                  <option value="Unassigned">Unassigned</option>
                  {owners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Priority</label>
                <select
                  value={formData.priority || "Medium"}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm outline-none focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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
                onClick={handleSaveLead}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm"
              >
                {editingLead ? "Update" : "Create"}
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
            <h2 className="text-lg font-bold text-foreground mb-2">{confirmDialog.data?.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{confirmDialog.data?.body}</p>
            <div className="flex gap-2">
              <button
                onClick={() => confirmDialog.close()}
                className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted-dark font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.data?.onConfirm?.();
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
