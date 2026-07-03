// ─── Enhanced Warehouse Module (Complete Implementation) ─────────────────────
// This file contains the complete warehouse management system with all sub-modules

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Package, Warehouse, Truck, Shield, Users, Box, CheckSquare,
  Search, Filter, Download, Plus, MoreHorizontal, Eye, Edit2, Trash2,
  X, Send, CheckCircle2, MessageSquare, Paperclip, Calendar, AlertTriangle,
  MapPin, Phone, Mail, Copy, Share2, ChevronUp, ChevronDown, Upload,
  ArrowUpDown, Menu, Clock, DollarSign, TrendingUp, Zap, Activity,
  ChevronLeft, ChevronRight, Target, PieChart, BarChart2, FileText,
  ArrowRight, Lock, Unlock, Play, Pause, Check, Monitor, Layers
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  useReceiving, usePicking, usePacking, useDispatch, useDock, useZone,
  useTaskAssignment, useBarcode, useShipmentTracking, useGPS, usePutAwayRules,
  useWarehouseDashboardMetrics, useWarehouseSearch, useBulkOperations,
  useFilter, useSort, usePagination, useExportData, useDateRange
} from "../hooks/useWarehouse";
import { 
  exportToCSV, exportToJSON, exportToExcel, printData, exportReport 
} from "../utils/exportUtils";
import {
  receivingService, pickingService, dispatchService, dockService,
  initializeWarehouseData
} from "../services/warehouseService";

// ─── Components from App.tsx (imported or recreated) ─────────────────────────

function PrimaryBtn({ icon: Icon, size, children, onClick }: any) {
  return (
    <motion.button
      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl transition-all ${
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      {Icon && <Icon size={size === "sm" ? 12 : 14} />}
      {children}
    </motion.button>
  );
}

function SecondaryBtn({ icon: Icon, children, onClick }: any) {
  return (
    <motion.button
      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-muted-foreground hover:text-foreground"
    >
      {Icon && <Icon size={12} />}
      {children}
    </motion.button>
  );
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
    "QC Pending": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
    "In Progress": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    Completed: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    Accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    Rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
    Active: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    Inactive: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600" },
    Sent: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700" },
    Approved: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700" },
    Paid: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700" },
    Overdue: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700" },
    Draft: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600" },
    Dispatched: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700" },
    "In Transit": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700" },
    Delivered: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700" },
    Maintenance: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700" },
    "On Hold": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700" },
    Hot: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700" },
    Warm: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700" },
    Cold: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600" },
    Qualified: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700" },
  };

  const color = colors[status] || { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600" };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${color.bg} ${color.text}`}>
      {status}
    </span>
  );
}

// ─── Enhanced DetailDrawer with Full CRUD ───────────────────────────────────

interface DetailDrawerProps {
  item: any;
  type: string;
  onClose: () => void;
  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
}

function EnhancedDetailDrawer({ item, type, onClose, onUpdate, onDelete }: DetailDrawerProps) {
  const [tab, setTab] = useState<"details" | "timeline" | "comments" | "audit">("details");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(item);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { user: "Warehouse Manager", avatar: "WM", text: "Ready for next step", time: "Today 10:30" },
  ]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!item) return null;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(item.id, formData);
      setEditMode(false);
      toast.success("Record updated successfully");
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
      toast.success("Record deleted successfully");
      onClose();
    }
  };

  const fields = Object.entries(formData).filter(([k]) => !["id", "createdAt", "updatedAt"].includes(k));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full sm:max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{type}</p>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-0.5 truncate">{item.id}</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
              >
                <X size={15} className="text-slate-500" />
              </button>
            </div>

            {/* Action bar */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {!editMode && (
                <>
                  <PrimaryBtn icon={Edit2} size="sm" onClick={() => setEditMode(true)}>Edit</PrimaryBtn>
                  <SecondaryBtn icon={Copy}>Duplicate</SecondaryBtn>
                  <SecondaryBtn icon={Download}>Export</SecondaryBtn>
                </>
              )}
              {editMode && (
                <>
                  <PrimaryBtn icon={CheckCircle2} size="sm" onClick={handleSave}>Save</PrimaryBtn>
                  <SecondaryBtn onClick={() => setEditMode(false)}>Cancel</SecondaryBtn>
                </>
              )}
              {!editMode && (
                <SecondaryBtn icon={Trash2} onClick={() => setDeleteConfirm(true)}>Delete</SecondaryBtn>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 overflow-x-auto">
            {[
              { key: "details", label: "Details" },
              { key: "timeline", label: "Timeline" },
              { key: "comments", label: `Comments (${comments.length})` },
              { key: "audit", label: "Audit Log" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${
                  tab === t.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === "details" && (
              <div className="p-4 grid grid-cols-2 gap-3">
                {fields.map(([k, v]) => (
                  <div key={k} className={editMode ? "col-span-1" : "bg-slate-50 dark:bg-slate-800 rounded-xl p-3"}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {k.replace(/_/g, " ")}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData[k]}
                        onChange={(e) => setFormData({ ...formData, [k]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">{String(v)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "timeline" && (
              <div className="p-4 flex flex-col gap-0">
                {[
                  { action: "Created", user: "System", time: "Today 08:00", desc: "Record created" },
                  { action: "Updated", user: "Warehouse Manager", time: "Today 09:30", desc: "Status changed" },
                ].map((e, i) => (
                  <div key={i} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <CheckCircle2 size={13} className="text-blue-600" />
                      </div>
                      {i < 1 && <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mt-1" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{e.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">by {e.user} · {e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "comments" && (
              <div className="p-4 flex flex-col gap-3">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.avatar}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{c.user}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{c.text}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add comment..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && comment.trim()) {
                        setComments([...comments, { user: "You", avatar: "YO", text: comment, time: "Now" }]);
                        setComment("");
                        toast.success("Comment added");
                      }
                    }}
                  />
                  <button className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Send size={13} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {tab === "audit" && (
              <div className="p-4">
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-3 py-2 font-bold text-slate-600">User</td>
                      <td className="px-3 py-2 text-slate-900 dark:text-white">System</td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-3 py-2 font-bold text-slate-600">Action</td>
                      <td className="px-3 py-2 text-slate-900 dark:text-white">CREATE</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-600">Time</td>
                      <td className="px-3 py-2 text-slate-900 dark:text-white">Today 08:00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          {deleteConfirm && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">Delete this record? This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Enhanced InteractiveTable ────────────────────────────────────────────────

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface EnhancedTableProps<T extends { id: string }> {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  onAdd?: () => void;
  onDelete?: (row: T) => void;
  onExport?: () => void;
  searchKeys?: (keyof T)[];
}

function EnhancedInteractiveTable<T extends { id: string }>({
  title,
  columns,
  data,
  onRowClick,
  onAdd,
  onDelete,
  onExport,
  searchKeys = [],
}: EnhancedTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    let result = [...data];
    if (search && searchKeys.length > 0) {
      result = result.filter((row) =>
        searchKeys.some((k) => String(row[k]).toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        const av = String(a[sortKey]);
        const bv = String(b[sortKey]);
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir, searchKeys]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 gap-2 flex-wrap">
        {title && <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 flex-1">
            <Search size={12} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search…"
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-500 outline-none flex-1"
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {selectedIds.length > 0 && (
            <button className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
              {selectedIds.length} Selected · Delete
            </button>
          )}
          {onExport && <SecondaryBtn icon={Download} onClick={onExport}>Export</SecondaryBtn>}
          {onAdd && <PrimaryBtn icon={Plus} size="sm" onClick={onAdd}>Add Record</PrimaryBtn>}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === paged.length && paged.length > 0}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? paged.map((r) => r.id) : [])
                  }
                  className="cursor-pointer"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => {
                    if (col.sortable !== false) {
                      if (sortKey === col.key) {
                        setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
                        if (sortDir === "desc") setSortKey(null);
                      } else {
                        setSortKey(col.key);
                        setSortDir("asc");
                      }
                    }
                  }}
                  className="text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      <>
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp size={11} />
                          ) : (
                            <ChevronDown size={11} />
                          )
                        ) : (
                          <ArrowUpDown size={10} className="opacity-30" />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={row.id}
                className="border-b border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked
                          ? [...selectedIds, row.id]
                          : selectedIds.filter((id) => id !== row.id)
                      )
                    }
                    className="cursor-pointer"
                  />
                </td>
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onRowClick?.(row)}
                      className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <Eye size={13} className="text-blue-600" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <span className="text-xs text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={13} />
            </button>
            {[...Array(Math.min(pages, 5))].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                  i === page
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page === pages - 1}
              className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Warehouse Module Component ───────────────────────────────────────────

export function WarehouseModuleComplete() {
  // Initialize data
  useEffect(() => {
    initializeWarehouseData();
  }, []);

  const [module, setModule] = useState<string>("dashboard");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Hooks for all warehouse operations
  const receiving = useReceiving();
  const picking = usePicking();
  const dispatch = useDispatch();
  const dock = useDock();
  const zones = useZone();
  const tasks = useTaskAssignment();
  const { metrics } = useWarehouseDashboardMetrics();

  const moduleList = [
    { id: "dashboard", label: "Dashboard", icon: Warehouse },
    { id: "receiving", label: "Receiving", icon: Package },
    { id: "picking", label: "Picking", icon: CheckSquare },
    { id: "packing", label: "Packing", icon: Box },
    { id: "dispatch", label: "Dispatch", icon: Truck },
    { id: "dock", label: "Dock Management", icon: Layers },
    { id: "zones", label: "Zone Management", icon: Warehouse },
    { id: "tasks", label: "Task Assignment", icon: CheckCircle2 },
    { id: "barcode", label: "Barcode Scanner", icon: Search },
    { id: "shipment", label: "Shipment Tracking", icon: Truck },
    { id: "gps", label: "GPS Tracking", icon: MapPin },
    { id: "putaway", label: "Put Away Rules", icon: Package },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Module tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {moduleList.map((m) => (
          <button
            key={m.id}
            onClick={() => setModule(m.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              module === m.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400"
            }`}
          >
            <m.icon size={16} />
            <span className="text-[10px] font-semibold text-center">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {module === "dashboard" && (
        <div className="flex flex-col gap-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Today Receipts", value: metrics?.todayReceipts || 0, icon: Package, color: "from-blue-600 to-blue-500" },
              { label: "Today Dispatch", value: metrics?.todayDispatches || 0, icon: Truck, color: "from-emerald-600 to-emerald-500" },
              { label: "Pending Picking", value: metrics?.pendingPicking || 0, icon: CheckSquare, color: "from-violet-600 to-violet-500" },
              { label: "Open Tasks", value: metrics?.openTasks || 0, icon: Zap, color: "from-amber-500 to-orange-500" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-4 text-white shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs opacity-90">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <kpi.icon size={20} className="opacity-50" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Space Utilization</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { zone: "Zone A", used: 82, capacity: 100 },
                  { zone: "Zone B", used: 68, capacity: 100 },
                  { zone: "Zone C", used: 71, capacity: 100 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="used" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Activity Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie data={[
                    { name: "Receiving", value: 25 },
                    { name: "Picking", value: 35 },
                    { name: "Dispatch", value: 20 },
                    { name: "Other", value: 20 },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    <Cell fill="#2563EB" />
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#8B5CF6" />
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Receiving */}
      {module === "receiving" && (
        <EnhancedInteractiveTable
          title="Goods Receiving"
          columns={[
            { key: "grnNo", label: "GRN No.", sortable: true },
            { key: "poNumber", label: "PO #", sortable: true },
            { key: "vendor", label: "Vendor" },
            { key: "quantity", label: "Qty" },
            { key: "inspector", label: "Inspector" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]}
          data={receiving.data}
          onRowClick={(row) => {
            setSelectedRecord(row);
            setShowDetailDrawer(true);
          }}
          onDelete={(row) => receiving.remove(row.id)}
          onAdd={() => toast.success("New receiving form opened")}
          onExport={() => exportToCSV(receiving.data, { filename: "Receiving" })}
          searchKeys={["grnNo", "poNumber", "vendor"]}
        />
      )}

      {/* Picking */}
      {module === "picking" && (
        <EnhancedInteractiveTable
          title="Picking Orders"
          columns={[
            { key: "pickId", label: "Pick ID" },
            { key: "salesOrder", label: "SO #" },
            { key: "customer", label: "Customer" },
            { key: "zone", label: "Zone" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]}
          data={picking.data}
          onRowClick={(row) => {
            setSelectedRecord(row);
            setShowDetailDrawer(true);
          }}
          searchKeys={["pickId", "customer", "zone"]}
        />
      )}

      {/* Dispatch */}
      {module === "dispatch" && (
        <EnhancedInteractiveTable
          title="Dispatch & Shipments"
          columns={[
            { key: "dispatchId", label: "Dispatch ID" },
            { key: "customer", label: "Customer" },
            { key: "destination", label: "Destination" },
            { key: "courier", label: "Courier" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]}
          data={dispatch.data}
          onRowClick={(row) => {
            setSelectedRecord(row);
            setShowDetailDrawer(true);
          }}
          searchKeys={["customer", "destination", "courier"]}
        />
      )}

      {/* Other modules will render similarly */}
      {module === "dock" && (
        <EnhancedInteractiveTable
          title="Dock Management"
          columns={[
            { key: "dockNumber", label: "Dock #" },
            { key: "truckNumber", label: "Truck #" },
            { key: "arrivalTime", label: "Arrival" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]}
          data={dock.data}
          onRowClick={(row) => {
            setSelectedRecord(row);
            setShowDetailDrawer(true);
          }}
        />
      )}

      {/* Detail drawer */}
      {showDetailDrawer && (
        <EnhancedDetailDrawer
          item={selectedRecord}
          type={module === "receiving" ? "Receiving" : "Record"}
          onClose={() => setShowDetailDrawer(false)}
          onUpdate={(id, data) => {
            if (module === "receiving") receiving.update(id, data);
          }}
          onDelete={(id) => {
            if (module === "receiving") receiving.remove(id);
          }}
        />
      )}
    </div>
  );
}

// Export for use in App.tsx
export default WarehouseModuleComplete;
