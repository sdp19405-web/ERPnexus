import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Download, Trash2, Edit2, FileText, Upload,
  Clock, CheckCircle2, Shield, FolderKanban, Activity, X
} from "lucide-react";
import { erpServices, DocumentRecord } from "../services/erpDataServices";
import { useDocuments, useNotification, useConfirmDialog, usePagination, useSearch, useBulkOperations } from "../hooks/useERP";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/erpExportUtils";

export function DocumentsModuleComplete() {
  const { data: docs, create, update, remove, refresh } = useDocuments(erpServices.documents);
  const notification = useNotification();
  const confirmDialog = useConfirmDialog();
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults } = useSearch(docs, ["id", "title", "category", "uploadedBy"]);
  const { items: paginatedDocs, pagination } = usePagination(searchResults, 15);
  const { selected, toggleSelect, selectAll, deselectAll } = useBulkOperations(paginatedDocs);

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [formData, setFormData] = useState<Partial<DocumentRecord>>({});
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    setEditingDoc(null);
    setFormData({
      title: "",
      category: "General",
      uploadedBy: "Current User",
      size: "0 KB",
      version: "1.0",
      status: "Active",
    });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((doc: DocumentRecord) => {
    setEditingDoc(doc);
    setFormData({ ...doc });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.title) {
      notification.error("Title is required");
      return;
    }

    const dataToSave = {
      title: formData.title,
      category: formData.category || "General",
      uploadedBy: formData.uploadedBy || "System",
      size: formData.size || "1.2 MB",
      version: formData.version || "1.0",
      status: formData.status as any || "Active",
    };

    if (editingDoc) {
      if (update(editingDoc.id, dataToSave)) {
        notification.success("Document updated");
        setShowForm(false);
        refresh();
      }
    } else {
      if (create(dataToSave)) {
        notification.success("Document created");
        setShowForm(false);
        refresh();
      }
    }
  }, [editingDoc, formData, create, update, notification, refresh]);

  const handleDelete = useCallback((id: string) => {
    confirmDialog.open("Delete Document", "Are you sure you want to delete this document?", () => {
      if (remove(id)) {
        notification.success("Document deleted");
        refresh();
      }
    });
  }, [remove, confirmDialog, notification, refresh]);

  const handleExport = useCallback((format: "csv" | "excel" | "pdf") => {
    const dataToExport = searchResults.map(d => ({
      "ID": d.id, "Title": d.title, "Category": d.category,
      "Uploader": d.uploadedBy, "Size": d.size, "Version": d.version, "Status": d.status
    }));
    const filename = `documents_${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") exportToCSV(dataToExport, { filename });
    else if (format === "excel") exportToExcel(dataToExport, { filename, sheetName: "Documents" });
    else exportToPDF(dataToExport, { filename, title: "Documents Report" });
    notification.success(`Exported as ${format.toUpperCase()}`);
  }, [searchResults, notification]);

  const stats = useMemo(() => ({
    total: docs.length,
    active: docs.filter(d => d.status === "Active").length,
    archived: docs.filter(d => d.status === "Archived").length,
    categories: new Set(docs.map(d => d.category)).size
  }), [docs]);

  const categories = useMemo(() => Array.from(new Set(docs.map(d => d.category))), [docs]);
  const filteredDocs = useMemo(() => filterCategory ? paginatedDocs.filter(d => d.category === filterCategory) : paginatedDocs, [paginatedDocs, filterCategory]);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Documents", value: stats.total, icon: FileText, gradient: "from-blue-600 to-blue-500", sub: "All files" },
          { label: "Active", value: stats.active, icon: CheckCircle2, gradient: "from-emerald-600 to-emerald-500", sub: "Current versions" },
          { label: "Archived", value: stats.archived, icon: FolderKanban, gradient: "from-amber-600 to-amber-500", sub: "Legacy files" },
          { label: "Categories", value: stats.categories, icon: Shield, gradient: "from-violet-600 to-violet-500", sub: "Classifications" },
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
          <input type="text" placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filterCategory || ""} onChange={e => setFilterCategory(e.target.value || null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground">
            <option value="">All Categories</option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <button onClick={handleAdd} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-1">
            <Plus size={16} /> Upload Doc
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
                  <input type="checkbox" checked={selected.length === filteredDocs.length && filteredDocs.length > 0}
                    onChange={() => selected.length === filteredDocs.length ? deselectAll() : selectAll()} className="rounded" />
                </th>
                <th className="p-3 text-left font-semibold text-muted-foreground">ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Title</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Category</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Uploader</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Size</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Version</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggleSelect(doc.id)} className="rounded" />
                  </td>
                  <td className="p-3 font-bold text-blue-600 text-xs">{doc.id}</td>
                  <td className="p-3 font-semibold text-foreground text-xs">{doc.title}</td>
                  <td className="p-3 text-muted-foreground text-xs">{doc.category}</td>
                  <td className="p-3 text-muted-foreground text-xs">{doc.uploadedBy}</td>
                  <td className="p-3 font-mono text-xs text-foreground">{doc.size}</td>
                  <td className="p-3 font-mono text-xs text-foreground">v{doc.version}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ring-1 ${
                      doc.status === "Active" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-700 ring-slate-200"
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-1">
                    <button onClick={() => handleEdit(doc)} className="p-1.5 hover:bg-muted rounded-lg text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-muted rounded-lg text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Showing {filteredDocs.length === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, searchResults.length)} of {searchResults.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => pagination.previous()} disabled={!pagination.hasPrevious} className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold disabled:opacity-50">Prev</button>
            <span className="text-xs text-muted-foreground">Page {pagination.currentPage} of {Math.ceil(searchResults.length / pagination.pageSize) || 1}</span>
            <button onClick={() => pagination.next()} disabled={!pagination.hasNext} className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">Export Documents</span>
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
            <h2 className="text-lg font-bold mb-4">{editingDoc ? "Edit Document" : "Upload Document"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Title *</label>
                <input type="text" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                <input type="text" value={formData.category || ""} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
                <select value={formData.status || "Active"} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none">
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Version</label>
                  <input type="text" value={formData.version || ""} onChange={e => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">File Size</label>
                  <input type="text" value={formData.size || "1.2 MB"} onChange={e => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm outline-none" />
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
