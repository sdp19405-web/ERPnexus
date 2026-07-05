// @ts-nocheck
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Warehouse, Factory,
  Shield, Truck, DollarSign, UserCheck, CreditCard, Wrench, FolderKanban,
  Monitor, FileText, BarChart3, Bot, Settings, Globe, Store,
  Search, Bell, Sun, Moon, ChevronDown, ChevronRight, Menu,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock,
  Plus, Filter, Download, MoreHorizontal, Eye, Edit2, Send, RefreshCw,
  Building2, Zap, Activity, Target, PieChart, LogOut, User,
  ChevronLeft, Calendar, Box, Key, BarChart2, AlertTriangle, ArrowRight,
  Sparkles, X, LifeBuoy, Mic, HelpCircle, Trash2, Copy, Upload,
  ArrowUpDown, ChevronUp, CheckSquare, Square, SlidersHorizontal,
  ArrowLeft, ExternalLink, Lock, Unlock, Play, Pause, Check,
  MapPin, Phone, Mail, Star, MessageSquare, Paperclip, Layers, Share2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart as ReLineChart, Line,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import WarehouseModuleComplete from "../components/WarehouseModuleComplete";
import { InventoryModuleComplete } from "../components/InventoryModuleComplete";
import { ProcurementModuleComplete } from "../components/ProcurementModuleComplete";
import { DocumentsModuleComplete } from "../components/DocumentsModuleComplete";
import { ITAssetsModuleComplete } from "../components/ITAssetsModuleComplete";
import { MaintenanceModuleComplete } from "../components/MaintenanceModuleComplete";
import { SupplyChainModuleComplete } from "../components/SupplyChainModuleComplete";
import { AIReportModal } from "../components/AIReportModal";
import { erpServices, Lead, Vendor, PurchaseOrder, Invoice, Employee, Project, ProjectTask } from "../services/erpDataServices";
import { useCRUD } from "../hooks/useERP";
import { useSearch, useFilter, useSort, useLeads, useCustomers, useSalesOrders, useVendors, usePurchaseOrders, useInventory, useStockTransactions, useWorkOrders, useInspections, useCAPAs, useInvoices, useEmployees, useGLAccounts, usePayments, useRoles } from "../hooks/useERP";
import { recordMetaService } from "../services/recordMetaService";
import { exportToCSV, exportToExcel, exportToPDF, printData, exportPresets } from "../utils/erpExportUtils";

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const check = () => setBp({
      isMobile: window.innerWidth < 640,
      isTablet: window.innerWidth < 1024,
    });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(parseFloat((eased * target).toFixed(decimals)));
      if (pct < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals]);
  return val;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleId =
  | "dashboard" | "sales" | "crm" | "procurement" | "inventory"
  | "warehouse" | "manufacturing" | "quality" | "supply-chain"
  | "finance" | "hrms" | "payroll" | "maintenance" | "projects"
  | "it-assets" | "documents" | "reports" | "ai-assistant"
  | "admin" | "customer-portal" | "vendor-portal";

interface DemoUser {
  email: string; password: string; role: string; name: string;
  avatar: string; avatarColor: string; dept: string;
  allowedModules: ModuleId[];
}

type SortDir = "asc" | "desc" | null;

// ─── RBAC Users ───────────────────────────────────────────────────────────────

const ALL_MODULES: ModuleId[] = [
  "dashboard","sales","crm","procurement","inventory","warehouse",
  "manufacturing","quality","supply-chain","finance","hrms","payroll",
  "maintenance","projects","it-assets","documents","reports","ai-assistant",
  "admin","customer-portal","vendor-portal"
];

const DEMO_USERS: DemoUser[] = [
  { email:"ceo@nexuserp.com",        password:"demo", role:"CEO",                  name:"Vikram Mehta",      avatar:"VM", avatarColor:"from-blue-600 to-blue-500",      dept:"Executive",     allowedModules: ALL_MODULES },
  { email:"admin@nexuserp.com",      password:"demo", role:"Admin",                name:"Rahul Verma",       avatar:"RV", avatarColor:"from-violet-600 to-violet-500",  dept:"IT / Admin",    allowedModules: ALL_MODULES },
  { email:"sales@nexuserp.com",      password:"demo", role:"Sales Executive",      name:"Priya Sharma",      avatar:"PS", avatarColor:"from-emerald-600 to-emerald-500",dept:"Sales",         allowedModules:["dashboard","sales","crm","reports","ai-assistant"] },
  { email:"crm@nexuserp.com",        password:"demo", role:"CRM Executive",        name:"Kavita Rao",        avatar:"KR", avatarColor:"from-fuchsia-600 to-fuchsia-500",dept:"CRM",           allowedModules:["dashboard","crm","sales","ai-assistant"] },
  { email:"finance@nexuserp.com",    password:"demo", role:"Finance Manager",      name:"Karan Singh",       avatar:"KS", avatarColor:"from-amber-600 to-amber-500",    dept:"Finance",       allowedModules:["dashboard","finance","reports","documents","ai-assistant"] },
  { email:"hr@nexuserp.com",         password:"demo", role:"HR Manager",           name:"Deepa Nair",        avatar:"DN", avatarColor:"from-pink-600 to-pink-500",      dept:"HR",            allowedModules:["dashboard","hrms","payroll","reports","ai-assistant"] },
  { email:"payroll@nexuserp.com",    password:"demo", role:"Payroll Manager",      name:"Ravi Menon",        avatar:"RM", avatarColor:"from-rose-600 to-rose-500",      dept:"Payroll",       allowedModules:["dashboard","payroll","hrms","reports"] },
  { email:"purchase@nexuserp.com",   password:"demo", role:"Purchase Manager",     name:"Arun Patel",        avatar:"AP", avatarColor:"from-cyan-600 to-cyan-500",      dept:"Procurement",   allowedModules:["dashboard","procurement","inventory","reports","ai-assistant"] },
  { email:"inventory@nexuserp.com",  password:"demo", role:"Inventory Manager",    name:"Sanjay Gupta",      avatar:"SG", avatarColor:"from-lime-600 to-lime-500",      dept:"Inventory",     allowedModules:["dashboard","inventory","warehouse","procurement","ai-assistant"] },
  { email:"production@nexuserp.com", password:"demo", role:"Production Manager",   name:"Anita Joshi",       avatar:"AJ", avatarColor:"from-orange-600 to-orange-500",  dept:"Manufacturing", allowedModules:["dashboard","manufacturing","inventory","quality","warehouse","maintenance","ai-assistant"] },
  { email:"quality@nexuserp.com",    password:"demo", role:"Quality Manager",      name:"Meena Pillai",      avatar:"MP", avatarColor:"from-violet-600 to-violet-500",  dept:"Quality",       allowedModules:["dashboard","quality","manufacturing","reports","ai-assistant"] },
  { email:"warehouse@nexuserp.com",  password:"demo", role:"Warehouse Manager",    name:"Suresh Kumar",      avatar:"SK", avatarColor:"from-teal-600 to-teal-500",      dept:"Warehouse",     allowedModules:["dashboard","warehouse","inventory","supply-chain","ai-assistant"] },
  { email:"projects@nexuserp.com",   password:"demo", role:"Project Manager",      name:"Nitin Shah",        avatar:"NS", avatarColor:"from-indigo-600 to-indigo-500",  dept:"Projects",      allowedModules:["dashboard","projects","documents","reports","ai-assistant"] },
  { email:"maintenance@nexuserp.com",password:"demo", role:"Maintenance Engineer", name:"Ramesh Iyer",       avatar:"RI", avatarColor:"from-yellow-600 to-yellow-500",  dept:"Maintenance",   allowedModules:["dashboard","maintenance","manufacturing","reports"] },
  { email:"employee@nexuserp.com",   password:"demo", role:"Employee",             name:"Pooja Desai",       avatar:"PD", avatarColor:"from-green-600 to-green-500",    dept:"General",       allowedModules:["dashboard","hrms","documents","ai-assistant"] },
  { email:"auditor@nexuserp.com",    password:"demo", role:"Auditor",              name:"Lata Krishnan",     avatar:"LK", avatarColor:"from-slate-600 to-slate-500",    dept:"Audit",         allowedModules:["dashboard","finance","reports","documents","admin"] },
  { email:"supplier@nexuserp.com",   password:"demo", role:"Supplier",             name:"MRF Tyres Ltd.",    avatar:"MR", avatarColor:"from-zinc-600 to-zinc-500",      dept:"External",      allowedModules:["vendor-portal"] },
  { email:"customer@nexuserp.com",   password:"demo", role:"Customer",             name:"Tata Motors Ltd.",  avatar:"TM", avatarColor:"from-sky-600 to-sky-500",        dept:"External",      allowedModules:["customer-portal"] },
  { email:"vendor@nexuserp.com",     password:"demo", role:"Vendor",               name:"Steel Corp India",  avatar:"SC", avatarColor:"from-stone-600 to-stone-500",    dept:"External",      allowedModules:["vendor-portal"] },
];

// ─── Static Data ──────────────────────────────────────────────────────────────

const revenueData = [
  { month:"Jan", revenue:4.2, profit:1.1, expenses:3.1 },
  { month:"Feb", revenue:5.8, profit:1.6, expenses:4.2 },
  { month:"Mar", revenue:5.1, profit:1.4, expenses:3.7 },
  { month:"Apr", revenue:6.7, profit:2.1, expenses:4.6 },
  { month:"May", revenue:7.2, profit:2.4, expenses:4.8 },
  { month:"Jun", revenue:8.1, profit:2.9, expenses:5.2 },
  { month:"Jul", revenue:7.6, profit:2.6, expenses:5.0 },
  { month:"Aug", revenue:9.3, profit:3.2, expenses:6.1 },
  { month:"Sep", revenue:8.8, profit:3.0, expenses:5.8 },
  { month:"Oct", revenue:10.2,profit:3.8, expenses:6.4 },
  { month:"Nov", revenue:11.4,profit:4.2, expenses:7.2 },
  { month:"Dec", revenue:12.8,profit:5.1, expenses:7.7 },
];

const salesPipeline = [
  { stage:"Leads",       value:342, color:"#60A5FA" },
  { stage:"Qualified",   value:218, color:"#34D399" },
  { stage:"Proposal",    value:127, color:"#FBBF24" },
  { stage:"Negotiation", value:64,  color:"#F87171" },
  { stage:"Closed",      value:38,  color:"#A78BFA" },
];

const moduleDistribution = [
  { name:"Sales",        value:32, color:"#2563EB" },
  { name:"Manufacturing",value:24, color:"#22C55E" },
  { name:"Finance",      value:18, color:"#F59E0B" },
  { name:"HR",           value:14, color:"#8B5CF6" },
  { name:"Procurement",  value:12, color:"#EF4444" },
];

const productionData = [
  { day:"Mon", planned:420, actual:395 },
  { day:"Tue", planned:380, actual:372 },
  { day:"Wed", planned:450, actual:438 },
  { day:"Thu", planned:410, actual:389 },
  { day:"Fri", planned:390, actual:382 },
  { day:"Sat", planned:320, actual:301 },
];

const recentActivities = [
  { id:1, user:"Priya Sharma",   action:"Created Sales Order SO-2024-8821",   module:"Sales",        time:"2 min ago",  avatar:"PS", color:"bg-blue-500" },
  { id:2, user:"Rahul Verma",    action:"Approved PO-7743 · ₹4.8L",           module:"Procurement",  time:"8 min ago",  avatar:"RV", color:"bg-emerald-500" },
  { id:3, user:"Anita Joshi",    action:"Started Work Order WO-1192",          module:"Manufacturing",time:"15 min ago", avatar:"AJ", color:"bg-violet-500" },
  { id:4, user:"System",         action:"Low Stock Alert — SKU-88342",         module:"Inventory",    time:"22 min ago", avatar:"SY", color:"bg-amber-500" },
  { id:5, user:"Karan Singh",    action:"Payroll Processed — 328 employees",   module:"Payroll",      time:"1 hr ago",   avatar:"KS", color:"bg-rose-500" },
  { id:6, user:"Deepa Nair",     action:"Invoice INV-4421 sent · ₹12.4L",     module:"Finance",      time:"2 hr ago",   avatar:"DN", color:"bg-cyan-500" },
];

const NOTIFICATIONS: { id:number; type:string; title:string; body:string; time:string; read:boolean; module:ModuleId }[] = [
  { id:1, type:"success", title:"Purchase Order Approved",     body:"PO-7743 for ₹4.8L approved by Rahul Verma",        time:"2 min ago",  read:false, module:"procurement" },
  { id:2, type:"warning", title:"Machine Down Alert",          body:"MC-04 Press Brake offline — maintenance required",  time:"12 min ago", read:false, module:"maintenance" },
  { id:3, type:"danger",  title:"Low Inventory — Critical",    body:"SKU-88342 Steel Sheets: only 12 units remaining",   time:"22 min ago", read:false, module:"inventory"   },
  { id:4, type:"info",    title:"Invoice Generated",           body:"INV-4421 for ₹12.4L sent to Tata Motors",          time:"1 hr ago",   read:true,  module:"finance"     },
  { id:5, type:"info",    title:"Employee Leave Request",      body:"Anita Joshi requested 3 days leave — Jul 2-4",      time:"2 hr ago",   read:true,  module:"hrms"        },
  { id:6, type:"success", title:"Production WO-1193 Complete", body:"Suspension Kit A2 — 120 units produced on target",  time:"3 hr ago",   read:true,  module:"manufacturing"},
];

const salesLeads = [
  { id:"LD-001", name:"Tata Motors Ltd.",    contact:"Sunil Kumar",   value:"₹48,00,000",    stage:"Proposal",    score:87, date:"27 Jun 2024", owner:"Priya S.",  email:"sunil@tatamotors.com", phone:"+91 98765 43210" },
  { id:"LD-002", name:"Infosys BPO",         contact:"Meera Iyer",    value:"₹22,50,000",    stage:"Qualified",   score:72, date:"26 Jun 2024", owner:"Rahul V.",  email:"meera@infosys.com",    phone:"+91 98123 45678" },
  { id:"LD-003", name:"Mahindra Logistics",  contact:"Arun Shah",     value:"₹91,00,000",    stage:"Negotiation", score:94, date:"25 Jun 2024", owner:"Kavita R.", email:"arun@mahindra.com",    phone:"+91 97654 32109" },
  { id:"LD-004", name:"Apollo Hospitals",    contact:"Dr. Rajan P.",  value:"₹35,75,000",    stage:"Lead",        score:54, date:"24 Jun 2024", owner:"Priya S.",  email:"rajan@apollo.com",     phone:"+91 96543 21098" },
  { id:"LD-005", name:"Reliance Retail",     contact:"Neha Gupta",    value:"₹1,24,00,000",  stage:"Closed Won",  score:100,date:"23 Jun 2024", owner:"Kiran M.",  email:"neha@reliance.com",    phone:"+91 95432 10987" },
  { id:"LD-006", name:"Air India MRO",       contact:"Capt. Vivek T.",value:"₹67,20,000",    stage:"Proposal",    score:81, date:"22 Jun 2024", owner:"Rahul V.",  email:"vivek@airindia.com",   phone:"+91 94321 09876" },
  { id:"LD-007", name:"ONGC Ltd.",           contact:"P.K. Sharma",   value:"₹2,14,00,000",  stage:"Qualified",   score:68, date:"21 Jun 2024", owner:"Priya S.",  email:"pk@ongc.com",          phone:"+91 93210 98765" },
  { id:"LD-008", name:"BHEL",               contact:"R. Krishnan",   value:"₹88,50,000",    stage:"Proposal",    score:76, date:"20 Jun 2024", owner:"Kavita R.", email:"krishnan@bhel.in",     phone:"+91 92109 87654" },
];

const employees = [
  { id:"EMP-1001", name:"Priya Sharma",   dept:"Sales",        role:"Senior Executive",     status:"Present",  leave:8,  salary:"₹65,000",  joined:"Mar 2021", email:"priya@nexus.com",   phone:"+91 98765 11111" },
  { id:"EMP-1002", name:"Rahul Verma",    dept:"Procurement",  role:"Purchase Manager",     status:"Present",  leave:12, salary:"₹82,000",  joined:"Jan 2019", email:"rahul@nexus.com",   phone:"+91 98765 22222" },
  { id:"EMP-1003", name:"Anita Joshi",    dept:"Manufacturing",role:"Production Lead",       status:"On Leave", leave:5,  salary:"₹74,000",  joined:"Aug 2020", email:"anita@nexus.com",   phone:"+91 98765 33333" },
  { id:"EMP-1004", name:"Karan Singh",    dept:"Finance",      role:"Accounts Manager",     status:"Present",  leave:15, salary:"₹88,000",  joined:"Jun 2018", email:"karan@nexus.com",   phone:"+91 98765 44444" },
  { id:"EMP-1005", name:"Deepa Nair",     dept:"HR",           role:"HR Business Partner",  status:"Present",  leave:10, salary:"₹71,000",  joined:"Nov 2021", email:"deepa@nexus.com",   phone:"+91 98765 55555" },
  { id:"EMP-1006", name:"Vikram Joshi",   dept:"IT",           role:"System Administrator", status:"WFH",       leave:7,  salary:"₹92,000",  joined:"Feb 2020", email:"vikram@nexus.com",  phone:"+91 98765 66666" },
  { id:"EMP-1007", name:"Suresh Kumar",   dept:"Warehouse",    role:"Warehouse Manager",    status:"Present",  leave:9,  salary:"₹68,000",  joined:"Apr 2020", email:"suresh@nexus.com",  phone:"+91 98765 77777" },
  { id:"EMP-1008", name:"Meena Pillai",   dept:"Quality",      role:"QA Engineer",          status:"Present",  leave:11, salary:"₹61,000",  joined:"Sep 2022", email:"meena@nexus.com",   phone:"+91 98765 88888" },
];

const inventoryItems = [
  { sku:"SKU-88342", name:"Steel Grade A Sheets",     category:"Raw Material", stock:12,   reorder:50,   value:"₹2,40,000",  warehouse:"WH-01 Mumbai", status:"Critical", supplier:"Steel Corp India" },
  { sku:"SKU-44221", name:"Hydraulic Pump Assembly",  category:"Components",   stock:847,  reorder:200,  value:"₹18,42,000", warehouse:"WH-02 Pune",   status:"Normal",   supplier:"Bosch India" },
  { sku:"SKU-77891", name:"Electronic Control Unit",  category:"Electronics",  stock:134,  reorder:100,  value:"₹6,70,000",  warehouse:"WH-01 Mumbai", status:"Normal",   supplier:"Siemens Ltd" },
  { sku:"SKU-22103", name:"Precision Bearings 6205",  category:"Components",   stock:38,   reorder:80,   value:"₹95,000",    warehouse:"WH-03 Delhi",  status:"Low",      supplier:"SKF India" },
  { sku:"SKU-55678", name:"Polymer Resin P-340",      category:"Raw Material", stock:2840, reorder:1000, value:"₹14,20,000", warehouse:"WH-02 Pune",   status:"Normal",   supplier:"BASF India" },
  { sku:"SKU-31102", name:"Aluminium Extrusion AL6",  category:"Raw Material", stock:220,  reorder:300,  value:"₹8,80,000",  warehouse:"WH-03 Delhi",  status:"Low",      supplier:"Hindalco" },
];

const productionOrders = [
  { id:"WO-1192", product:"Engine Block EV-7",     qty:50,  completed:42,  due:"28 Jun 2024", priority:"High",   machine:"MC-03", status:"In Progress", bom:"BOM-EV7", customer:"Tata Motors" },
  { id:"WO-1193", product:"Suspension Kit A2",     qty:120, completed:120, due:"27 Jun 2024", priority:"Normal", machine:"MC-07", status:"Completed",   bom:"BOM-SA2", customer:"Mahindra" },
  { id:"WO-1194", product:"Brake Caliper Set",     qty:80,  completed:0,   due:"30 Jun 2024", priority:"Normal", machine:"MC-11", status:"Planned",     bom:"BOM-BC1", customer:"Maruti" },
  { id:"WO-1195", product:"Wiring Harness 220V",   qty:200, completed:156, due:"29 Jun 2024", priority:"High",   machine:"MC-02", status:"In Progress", bom:"BOM-WH2", customer:"BHEL" },
  { id:"WO-1196", product:"Transmission Shaft",    qty:30,  completed:8,   due:"02 Jul 2024", priority:"Low",    machine:"MC-09", status:"In Progress", bom:"BOM-TS1", customer:"Force Motors" },
];

const glAccounts = [
  { code:"1001", name:"Cash & Bank",               type:"Asset",   debit:"₹2,84,42,000", credit:"₹1,92,18,000", balance:"₹92,24,000" },
  { code:"2001", name:"Accounts Payable",          type:"Liability",debit:"₹48,22,000",  credit:"₹1,14,88,000", balance:"₹66,66,000" },
  { code:"3001", name:"Share Capital",             type:"Equity",  debit:"—",             credit:"₹5,00,00,000", balance:"₹5,00,00,000" },
  { code:"4001", name:"Revenue from Operations",   type:"Revenue", debit:"—",             credit:"₹12,84,10,000",balance:"₹12,84,10,000" },
  { code:"5001", name:"Cost of Goods Sold",        type:"Expense", debit:"₹7,22,44,000", credit:"—",             balance:"₹7,22,44,000" },
  { code:"5002", name:"Operating Expenses",        type:"Expense", debit:"₹2,14,66,000", credit:"—",             balance:"₹2,14,66,000" },
];

// ─── Global Search Index ──────────────────────────────────────────────────────

const SEARCH_INDEX = [
  { module:"inventory"   as ModuleId, title:"SKU-88342 — Steel Grade A Sheets",   type:"Inventory Item",  meta:"12 units · Critical stock" },
  { module:"inventory"   as ModuleId, title:"SKU-44221 — Hydraulic Pump Assembly", type:"Inventory Item",  meta:"847 units · WH-02 Pune" },
  { module:"sales"       as ModuleId, title:"SO-2024-8821 — Tata Motors Ltd.",     type:"Sales Order",     meta:"₹48L · Proposal stage" },
  { module:"sales"       as ModuleId, title:"LD-003 — Mahindra Logistics",         type:"Lead",            meta:"₹91L · Negotiation" },
  { module:"procurement" as ModuleId, title:"PO-7743 — Steel Corp India",          type:"Purchase Order",  meta:"₹4.8L · Approved" },
  { module:"procurement" as ModuleId, title:"PO-7744 — Bosch India",               type:"Purchase Order",  meta:"₹22.6L · Pending" },
  { module:"finance"     as ModuleId, title:"INV-2024-4421 — Tata Motors",         type:"Invoice",         meta:"₹12.4L · Sent" },
  { module:"hrms"        as ModuleId, title:"EMP-1001 — Priya Sharma",             type:"Employee",        meta:"Sales · Senior Executive" },
  { module:"hrms"        as ModuleId, title:"EMP-1004 — Karan Singh",              type:"Employee",        meta:"Finance · Accounts Manager" },
  { module:"manufacturing"as ModuleId,title:"WO-1192 — Engine Block EV-7",         type:"Work Order",      meta:"42/50 units · In Progress" },
  { module:"manufacturing"as ModuleId,title:"BOM-EV7 — Engine Block Bill of Materials",type:"BOM",         meta:"14 components · Active" },
  { module:"warehouse"   as ModuleId, title:"WH-01 Mumbai — Zone A",               type:"Warehouse",       meta:"Capacity 82% · Active" },
  { module:"quality"     as ModuleId, title:"CAPA-2024-012 — Surface defect",      type:"CAPA",            meta:"Open · Due 30 Jun" },
  { module:"projects"    as ModuleId, title:"PROJ-2024-08 — ERP Phase 2 Rollout",  type:"Project",         meta:"65% · On track" },
];

// ─── AI Smart Responses ───────────────────────────────────────────────────────

const AI_RESPONSES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords:["revenue","sales","income","turnover"],
    response:`**Revenue Analysis — June 2024**\n\n📈 MTD Revenue: **₹12.8 Crore** (+12.3% MoM)\n\nTop Revenue Sources:\n1. Tata Motors Ltd.     — ₹3.2 Cr  (25%)\n2. Mahindra Logistics  — ₹2.8 Cr  (21.9%)\n3. Infosys BPO         — ₹1.9 Cr  (14.8%)\n4. Air India MRO       — ₹1.6 Cr  (12.5%)\n\nQ1 FY25 YTD: ₹38.4 Cr (+9.8% YoY)\nTarget Achievement: 107%  ✅\n\nWould you like a region-wise breakdown?`
  },
  {
    keywords:["purchase order","po","procurement","pending purchase"],
    response:`**Pending Purchase Orders — 6 above ₹10L**\n\n| PO No.  | Vendor            | Value   | Due    |\n|---------|-------------------|---------|--------|\n| PO-7743 | Steel Corp India  | ₹48.2L  | 30 Jun |\n| PO-7744 | Bosch India       | ₹22.6L  | 02 Jul |\n| PO-7748 | Siemens Ltd       | ₹18.4L  | 05 Jul |\n| PO-7751 | ABB Automation    | ₹14.8L  | 08 Jul |\n| PO-7755 | Honeywell India   | ₹12.1L  | 10 Jul |\n| PO-7760 | Atlas Copco       | ₹10.8L  | 12 Jul |\n\n**Total Pending: ₹1,26,90,000**\n3 require approval before COB today.`
  },
  {
    keywords:["inventory","stock","warehouse","material"],
    response:`**Inventory Status Report**\n\n🔴 Critical (< reorder point): **2 items**\n• SKU-88342 Steel Sheets — 12 units (reorder: 50)\n• SKU-22103 Bearings 6205 — 38 units (reorder: 80)\n\n🟡 Low Stock (< 2× reorder): **1 item**\n• SKU-31102 Aluminium Extrusion — 220 units\n\n✅ Normal: 3 items\n\n**Total Inventory Value: ₹48.2 Crore**\nAcross 3 warehouses — Mumbai, Pune, Delhi\n\nRecommended POs to raise: 3`
  },
  {
    keywords:["machine","oee","equipment","downtime","production"],
    response:`**Machine Health Dashboard**\n\n| Machine     | Status      | OEE   | Uptime  |\n|-------------|-------------|-------|---------|\n| MC-01 CNC   | 🟢 Running  | 94%   | 99.2%   |\n| MC-02 Weld  | 🟢 Running  | 91%   | 98.7%   |\n| MC-03 Robot | 🟢 Running  | 88%   | 97.4%   |\n| MC-04 Press | 🟡 Maint.   | —     | 72.1%   |\n| MC-05 Assembly | 🟢 Running | 97% | 99.8%  |\n| MC-06 Paint | ⚪ Idle     | —     | —       |\n\n⚠️ MC-04 maintenance ticket: TKT-2024-441\nPredicted downtime: 4 hours\nAI suggests: Schedule on Sunday to avoid 8.4% throughput loss`
  },
  {
    keywords:["attendance","employee","hr","leave","absent"],
    response:`**HR Attendance Summary — Today (28 Jun)**\n\n✅ Present:    1,208  (94.2%)\n🏠 WFH:          48   (3.7%)\n🟡 On Leave:     24   (1.9%)\n❌ Absent:        4   (0.3%)\n\n**Total Workforce: 1,284 employees**\n\nDepartment highlights:\n• Sales: 98% attendance 🏆\n• Manufacturing: 96% attendance\n• Finance: 91% attendance\n\nPending leave approvals: 18 requests\nUnapproved overtime: 12 employees`
  },
  {
    keywords:["sales report","top customer","best client"],
    response:`**Sales Performance — June 2024**\n\nTop 5 Customers by Revenue:\n1. Tata Motors Ltd.    ₹3.2 Cr  ⬆ +18%\n2. Mahindra Logistics  ₹2.8 Cr  ⬆ +22%\n3. Infosys BPO         ₹1.9 Cr  ➡ +2%\n4. Air India MRO       ₹1.6 Cr  ⬆ +34%\n5. Reliance Retail     ₹1.4 Cr  ⬇ -8%\n\nConversion Rate: 42%\nAvg. Deal Size: ₹32.4 Lakhs\nDeals in Pipeline: 127 (₹42.8 Cr)\nDeals won this month: 38\n\nTarget: ₹12.0 Cr → Achieved: ₹12.8 Cr (107% ✅)`
  },
  {
    keywords:["profit","margin","ebitda","net profit"],
    response:`**Profitability Analysis — FY 2024 YTD**\n\nRevenue:              ₹128.4 Cr\nCost of Goods:        ₹72.2 Cr  (56.2%)\nGross Profit:         ₹56.2 Cr  (43.8%) ✅\n\nOperating Expenses:   ₹21.5 Cr  (16.7%)\nEBITDA:               ₹34.7 Cr  (27.0%) ✅\nDepreciation:         ₹4.2 Cr\nEBIT:                 ₹30.5 Cr\nInterest:             ₹2.8 Cr\nPBT:                  ₹27.7 Cr\nTax (25%):            ₹6.9 Cr\n**Net Profit:         ₹20.8 Cr  (16.2%)** 🏆\n\nTarget Net Margin: 15% → Achieved: 16.2% ✅`
  },
  {
    keywords:["payroll","salary","employee pay","wages","compensation"],
    response:`**Payroll Summary — June 2024**\n\n💰 Total Payroll Disbursed: **₹9.84 Crore**\n📅 Payment Date: 28 June 2024\n\nBreakdown:\n• Gross Salaries:    ₹10.62 Cr\n• PF (Employer):     ₹0.44 Cr\n• ESI (Employer):    ₹0.08 Cr\n• TDS Deducted:      ₹0.48 Cr\n• Net Disbursed:     ₹9.84 Cr\n\nEmployees Paid: 1,276 / 1,284\nPending: 8 (new joinees — docs pending)\n\nTop Earners:\n1. IT Department — Avg ₹78,400\n2. Finance — Avg ₹76,200\n3. Manufacturing — Avg ₹68,100\n\nNext payroll: July 28, 2024`
  },
  {
    keywords:["project","task","milestone","deadline","delivery"],
    response:`**Project Status — June 2024**\n\n📊 Active Projects: 4\n\n| Project               | Progress | Status     | Due     |\n|-----------------------|----------|------------|---------|\n| ERP Phase 2 Rollout   | 58%      | 🟢 On Track | 31 Aug  |\n| Data Migration        | 25%      | 🔴 At Risk  | 30 Jul  |\n| Mobile App Dev        | 74%      | 🟢 On Track | 30 Nov  |\n| ISO Compliance Drive  | 100%     | ✅ Complete | 15 Jun  |\n\nTotal Tasks: 82  ·  Completed: 43  ·  In Progress: 22  ·  Todo: 17\n\n⚠️ Risk Alert: Data Migration is 3 days behind schedule. Recommend escalation to Rahul V.`
  },
  {
    keywords:["vendor","supplier","procurement","purchase request","rfq"],
    response:`**Vendor & Procurement Summary**\n\n👥 Active Vendors: 48\n📋 Open POs: 18 (₹1.27 Cr total)\n📊 RFQs Active: 7\n\nTop Vendors by Performance:\n1. Steel Corp India  — Rating 4.8⭐  On-time 96%\n2. SKF India         — Rating 4.7⭐  On-time 94%\n3. Bosch India       — Rating 4.6⭐  On-time 91%\n\nPending Approvals: PO-7744, PO-7755 (require action today)\nSavings vs Budget: ₹8.4L (3.2% below budget)\n\n🤖 AI Recommendation: Consolidate orders with Steel Corp India to unlock 5% volume discount.`
  },
  {
    keywords:["quality","defect","inspection","capa","oee","scrap"],
    response:`**Quality Report — June 2024**\n\n✅ Inspection Pass Rate: **91.4%** (+2.1% MoM)\n❌ Defects Found: 18 (across 12 batches)\n📋 Open CAPAs: 8 (2 overdue)\n🗑️ Scrap Cost: ₹2.8L this month\n\nDefect Breakdown:\n• Dimensional variance: 35%\n• Surface finish: 28%\n• Functional: 22%\n• Visual: 15%\n\nOEE Score: 87.4% (industry avg: 65%) 🏆\n• Availability: 94.2%\n• Performance: 91.8%\n• Quality: 98.7%\n\nAI Alert: CAPA-012 overdue — surface defect on MC-03. Action required.`
  },
  {
    keywords:["cash flow","receivable","payable","outstanding","overdue"],
    response:`**Cash Flow Analysis — June 2024**\n\n💵 Cash Position: ₹42.6 Crore\n📥 Accounts Receivable: ₹28.4 Cr (14 invoices)\n📤 Accounts Payable: ₹18.2 Cr (pending)\n\nAging Analysis (Receivables):\n• 0-30 days:   ₹18.2 Cr  (64%)\n• 31-60 days:  ₹7.4 Cr   (26%) \n• 61-90 days:  ₹2.8 Cr   (10%)\n• 90+ days:    ₹0 Cr      (0%) ✅\n\nOverdue Invoices: 3\n• INV-4417 — Air India ₹18.4L (5 days overdue)\n\nProjected Cash Next 30 days: ₹38.2 Cr inflow expected\n\n💡 Recommendation: Follow up on INV-4417 immediately.`
  },
];

// ─── Navigation Config ────────────────────────────────────────────────────────

const navGroups = [
  { label:"Core Business", items:[
    { id:"dashboard"    as ModuleId, label:"Executive Dashboard", icon:LayoutDashboard },
    { id:"sales"        as ModuleId, label:"Sales",               icon:ShoppingCart },
    { id:"crm"          as ModuleId, label:"CRM",                 icon:Users },
    { id:"procurement"  as ModuleId, label:"Procurement",         icon:Package },
  ]},
  { label:"Operations", items:[
    { id:"inventory"    as ModuleId, label:"Inventory",           icon:Box },
    { id:"warehouse"    as ModuleId, label:"Warehouse",           icon:Warehouse },
    { id:"manufacturing"as ModuleId, label:"Manufacturing",       icon:Factory },
    { id:"quality"      as ModuleId, label:"Quality",             icon:Shield },
    { id:"supply-chain" as ModuleId, label:"Supply Chain",        icon:Truck },
    { id:"maintenance"  as ModuleId, label:"Maintenance",         icon:Wrench },
  ]},
  { label:"Finance & People", items:[
    { id:"finance"      as ModuleId, label:"Finance & Accounting",icon:DollarSign },
    { id:"hrms"         as ModuleId, label:"HRMS",                icon:UserCheck },
    { id:"payroll"      as ModuleId, label:"Payroll",             icon:CreditCard },
  ]},
  { label:"Enterprise", items:[
    { id:"projects"     as ModuleId, label:"Projects",            icon:FolderKanban },
    { id:"it-assets"    as ModuleId, label:"IT Assets",           icon:Monitor },
    { id:"documents"    as ModuleId, label:"Documents",           icon:FileText },
    { id:"reports"      as ModuleId, label:"Reports & Analytics", icon:BarChart3 },
    { id:"ai-assistant" as ModuleId, label:"AI Assistant",        icon:Bot },
  ]},
  { label:"Portals & Admin", items:[
    { id:"customer-portal"as ModuleId,label:"Customer Portal",    icon:Globe },
    { id:"vendor-portal"as ModuleId,  label:"Vendor Portal",      icon:Store },
    { id:"admin"        as ModuleId,  label:"Admin Panel",        icon:Settings },
  ]},
];

const allNavItems = navGroups.flatMap(g => g.items);

// ─── Motion Variants ──────────────────────────────────────────────────────────

const cardGrid = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } };
const cardItem  = { hidden:{ opacity:0,y:16,scale:0.97 }, show:{ opacity:1,y:0,scale:1,transition:{ duration:0.28 } } };

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

function Badge({ status }: { status:string }) {
  const map: Record<string,string> = {
    "In Progress":"bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    "Completed":  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    "Planned":    "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300",
    "High":       "bg-red-50 text-red-700 ring-1 ring-red-200",
    "Normal":     "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    "Low":        "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    "Critical":   "bg-red-50 text-red-700 ring-1 ring-red-200",
    "Present":    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "On Leave":   "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    "WFH":        "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    "Lead":       "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    "Qualified":  "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    "Proposal":   "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    "Negotiation":"bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    "Closed Won": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "Normal inv": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${map[status]||"bg-slate-100 text-slate-600"}`}>{status}</span>;
}

export function PrimaryBtn({ children,onClick,icon:Icon,size:sz="default",disabled }: {
  children:React.ReactNode; onClick?:()=>void; icon?:React.ElementType; size?:"sm"|"default"; disabled?:boolean;
}) {
  return (
    <motion.button whileHover={!disabled?{ y:-1,boxShadow:"0 8px 20px -4px rgba(37,99,235,0.45)" }:{}}
      whileTap={!disabled?{ scale:0.97 }:{}} onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 ${sz==="sm"?"text-xs px-3 py-1.5 min-h-[36px]":"text-sm px-4 py-2 min-h-[40px]"}`}>
      {Icon&&<Icon size={sz==="sm"?11:13}/>}{children}
    </motion.button>
  );
}

function SecondaryBtn({ children,onClick,icon:Icon }: { children:React.ReactNode; onClick?:()=>void; icon?:React.ElementType }) {
  return (
    <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={onClick}
      className="flex items-center gap-1.5 bg-card border border-border hover:border-blue-300 hover:text-blue-600 text-muted-foreground font-medium text-xs px-3 py-1.5 rounded-xl transition-all">
      {Icon&&<Icon size={11}/>}{children}
    </motion.button>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="animate-pulse bg-muted rounded-2xl h-28"/>)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="animate-pulse bg-muted rounded-2xl h-24"/>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="animate-pulse bg-muted rounded-2xl h-72 lg:col-span-2"/>
        <div className="animate-pulse bg-muted rounded-2xl h-72"/>
      </div>
    </div>
  );
}

// ─── Radial Gauge ─────────────────────────────────────────────────────────────

function RadialGauge({ value,label,sublabel,color }: { value:number; label:string; sublabel:string; color:string }) {
  const size=88, r=34, cx=44, cy=44;
  const circ = 2*Math.PI*r;
  const pct = Math.min(value/100,1);
  const animated = useCountUp(value,1000);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width:size,height:size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--muted)" strokeWidth={7}/>
          <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={circ} initial={{ strokeDashoffset:circ }}
            animate={{ strokeDashoffset:circ*(1-pct) }} transition={{ duration:1.2,ease:"easeOut" }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-foreground">{animated.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-xs font-bold text-foreground text-center">{label}</p>
      <p className="text-[10px] text-muted-foreground text-center">{sublabel}</p>
    </div>
  );
}

// ─── Gradient KPI Card ────────────────────────────────────────────────────────

function GradientKpi({ title,value,numericValue,change,changeLabel,icon:Icon,gradient,spark,onClick }: {
  title:string; value:string; numericValue?:number; change:number; changeLabel:string;
  icon:React.ElementType; gradient:string; spark?:number[]; onClick?:()=>void;
}) {
  const pos=change>=0;
  const counted=useCountUp(numericValue??0,1100);
  const displayValue=numericValue!==undefined?value.replace(/[\d.]+/,counted.toLocaleString("en-IN")):value;
  return (
    <motion.div variants={cardItem} whileHover={{ y:-4,boxShadow:"0 24px 48px -12px rgba(0,0,0,0.25)" }}
      onClick={onClick} className={`relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 cursor-pointer ${gradient}`}>
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl"/>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10 blur-xl"/>
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-white/65 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{displayValue}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon size={18} className="text-white"/>
        </div>
      </div>
      {spark&&(
        <div className="relative h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v,i)=>({ v,i }))}>
              <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.7)" fill="rgba(255,255,255,0.15)" strokeWidth={1.5} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="relative flex items-center gap-1.5">
        <span className="flex items-center gap-0.5 text-xs font-bold text-white">
          {pos?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{pos?"+":""}{change}%
        </span>
        <span className="text-xs text-white/55">{changeLabel}</span>
        {onClick&&<span className="ml-auto text-white/60 text-xs">Tap to drill →</span>}
      </div>
    </motion.div>
  );
}

function WhiteKpi({ title,value,numericValue,change,changeLabel,icon:Icon,iconBg,onClick }: {
  title:string; value:string; numericValue?:number; change:number; changeLabel:string;
  icon:React.ElementType; iconBg:string; onClick?:()=>void;
}) {
  const pos=change>=0;
  const counted=useCountUp(numericValue??0,1100);
  const displayValue=numericValue!==undefined?value.replace(/[\d,.]+/,counted.toLocaleString("en-IN")):value;
  return (
    <motion.div variants={cardItem} whileHover={{ y:-3,boxShadow:"0 12px 32px -8px rgba(0,0,0,0.12)" }}
      onClick={onClick} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2.5 cursor-pointer group">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
          <Icon size={16} className="text-white"/>
        </div>
      </div>
      <p className="text-xl font-extrabold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{displayValue}</p>
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center gap-0.5 text-xs font-bold ${pos?"text-emerald-600 dark:text-emerald-400":"text-red-500"}`}>
          {pos?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{pos?"+":""}{change}%
        </span>
        <span className="text-xs text-muted-foreground">{changeLabel}</span>
      </div>
    </motion.div>
  );
}

function ModuleGradientKpi({ items }: { items:{ label:string; value:string; sub:string; gradient:string; icon:React.ElementType }[] }) {
  return (
    <motion.div variants={cardGrid} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((k,i) => (
        <motion.div key={i} variants={cardItem} whileHover={{ y:-4,boxShadow:"0 20px 40px -10px rgba(0,0,0,0.22)" }}
          className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer ${k.gradient}`}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10 blur-xl"/>
          <div className="relative flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/65 uppercase tracking-wider">{k.label}</span>
            <k.icon size={14} className="text-white/80"/>
          </div>
          <p className="relative text-xl font-extrabold text-white" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{k.value}</p>
          <p className="relative text-xs text-white/55 mt-0.5">{k.sub}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Interactive Table ────────────────────────────────────────────────────────

function InteractiveTable<T extends Record<string,any>>({
  columns, data, onRowClick, searchKeys, title, onAdd, addLabel,
  onDelete, onEdit, onDuplicate, exportFilename = "export",
}: {
  columns:{ key:keyof T; label:string; render?:(v:T)=>React.ReactNode }[];
  data:T[]; onRowClick?:(row:T)=>void; searchKeys?:(keyof T)[];
  title?:string; onAdd?:()=>void; addLabel?:string;
  onDelete?:(row:T)=>void; onEdit?:(row:T)=>void; onDuplicate?:(row:T)=>void;
  exportFilename?:string;
}) {
  const { isMobile } = useBreakpoint();
  const [deleteTarget,setDeleteTarget]=useState<T|null>(null);
  const [search,setSearch]=useState("");
  const [sortKey,setSortKey]=useState<keyof T|null>(null);
  const [sortDir,setSortDir]=useState<SortDir>(null);
  const [page,setPage]=useState(0);
  const PAGE_SIZE = isMobile ? 4 : 5;

  const filtered=useMemo(()=>{
    let d=[...data];
    if(search&&searchKeys){
      d=d.filter(row=>searchKeys.some(k=>String(row[k]).toLowerCase().includes(search.toLowerCase())));
    }
    if(sortKey&&sortDir){
      d.sort((a,b)=>{
        const av=a[sortKey],bv=b[sortKey];
        const cmp=String(av).localeCompare(String(bv),undefined,{ numeric:true });
        return sortDir==="asc"?cmp:-cmp;
      });
    }
    return d;
  },[data,search,searchKeys,sortKey,sortDir]);

  const handleExport=(format:"csv"|"excel"|"pdf")=>{
    const rows=filtered.map(row=>{
      const flat:Record<string,unknown>={};
      columns.forEach(col=>{
        const val=row[col.key];
        flat[String(col.key)]=val==null?"":typeof val==="object"?JSON.stringify(val):val;
      });
      return flat;
    });
    const name=exportFilename.replace(/\s+/g,"_").toLowerCase();
    if(format==="csv") exportToCSV(rows,{ filename:name, title:title||exportFilename });
    if(format==="excel") exportToExcel(rows,{ filename:name, title:title||exportFilename });
    if(format==="pdf") exportToPDF(rows,{ filename:name, title:title||exportFilename });
    toast.success(`Exported ${filtered.length} records as ${format.toUpperCase()}`);
  };

  const [exportOpen,setExportOpen]=useState(false);
  const pages=Math.ceil(filtered.length/PAGE_SIZE);
  const paged=filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);

  const handleSort=(k:keyof T)=>{
    if(sortKey===k){ setSortDir(d=>d==="asc"?"desc":d==="desc"?null:"asc"); if(sortDir==="desc")setSortKey(null); }
    else{ setSortKey(k); setSortDir("asc"); }
  };

  // First two columns used as card title/subtitle on mobile
  const [titleCol, subtitleCol] = columns;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border gap-2 flex-wrap">
        {title&&<h3 className="font-bold text-foreground text-sm sm:text-base w-full sm:w-auto" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{title}</h3>}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5 flex-1">
            <Search size={12} className="text-muted-foreground flex-shrink-0"/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}
              placeholder="Search…" className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"/>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <SecondaryBtn icon={Filter}>Filter</SecondaryBtn>
          <div className="relative">
            <SecondaryBtn icon={Download} onClick={()=>setExportOpen(o=>!o)}>Export</SecondaryBtn>
            {exportOpen&&(
              <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[120px]">
                {(["csv","excel","pdf"] as const).map(fmt=>(
                  <button key={fmt} onClick={()=>{ handleExport(fmt); setExportOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors uppercase">{fmt}</button>
                ))}
              </div>
            )}
          </div>
          {onAdd&&<PrimaryBtn icon={Plus} size="sm" onClick={onAdd}>{addLabel||"Add New"}</PrimaryBtn>}
        </div>
      </div>

      {/* Mobile: stacked cards */}
      {isMobile ? (
        <div className="flex flex-col gap-0">
          <AnimatePresence mode="popLayout">
            {paged.map((row,i)=>(
              <motion.div key={String(row[columns[0].key])+i}
                initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ delay:i*0.04 }}
                onClick={()=>onRowClick?.(row)}
                className="border-b border-border p-4 hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors cursor-pointer active:bg-blue-50 dark:active:bg-blue-900/20">
                {/* Card header: first two columns */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">
                      {titleCol.render?titleCol.render(row):String(row[titleCol.key]??"")}
                    </div>
                    {subtitleCol&&(
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {subtitleCol.render?subtitleCol.render(row):String(row[subtitleCol.key]??"")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="w-9 h-9 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-xl active:scale-95 transition-transform"
                      onClick={e=>{e.stopPropagation();onRowClick?.(row);}}><Eye size={15} className="text-blue-600"/></button>
                    <button className="w-9 h-9 flex items-center justify-center bg-muted rounded-xl active:scale-95 transition-transform"
                      onClick={e=>{e.stopPropagation();(onEdit||onRowClick)?.(row);}}><Edit2 size={15} className="text-muted-foreground"/></button>
                  </div>
                </div>
                {/* Remaining columns as key-value pairs */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {columns.slice(2).map(col=>(
                    <div key={String(col.key)}>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{col.label}</p>
                      <div className="text-xs mt-0.5">{col.render?col.render(row):String(row[col.key]??"")}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Desktop/Tablet: full table with horizontal scroll */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                {columns.map(col=>(
                  <th key={String(col.key)} onClick={()=>handleSort(col.key)}
                    className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey===col.key?
                        (sortDir==="asc"?<ChevronUp size={11}/>:<ChevronDown size={11}/>):
                        <ArrowUpDown size={10} className="opacity-30"/>}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 w-20"/>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paged.map((row,i)=>(
                  <motion.tr key={String(row[columns[0].key])+i}
                    initial={{ opacity:0,x:-6 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }} transition={{ delay:i*0.03 }}
                    onClick={()=>onRowClick?.(row)}
                    className="border-b border-border hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group">
                    {columns.map(col=>(
                      <td key={String(col.key)} className="px-4 py-3 text-sm">
                        {col.render?col.render(row):String(row[col.key]??"")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" onClick={e=>{e.stopPropagation();onRowClick?.(row);}}><Eye size={13} className="text-blue-600"/></button>
                        <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" onClick={e=>{e.stopPropagation();(onEdit||onRowClick)?.(row);}}><Edit2 size={13} className="text-muted-foreground"/></button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" onClick={e=>{e.stopPropagation();onDelete?onDelete(row):setDeleteTarget(row);}}><Trash2 size={13} className="text-red-400"/></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget&&<ConfirmDeleteModal
        title="Delete Record"
        body="Are you sure you want to delete this record? This action cannot be undone."
        onConfirm={()=>{
          if(onDelete) onDelete(deleteTarget);
          else toast.error("Delete handler not configured");
          setDeleteTarget(null);
        }}
        onCancel={()=>setDeleteTarget(null)}/>}

      {/* Pagination */}
      {pages>1&&(
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-t border-border flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Showing {page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1">
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-xl disabled:opacity-40 hover:bg-muted transition-colors"><ChevronLeft size={13}/></button>
            {[...Array(Math.min(pages,5))].map((_,i)=>(
              <button key={i} onClick={()=>setPage(i)}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${i===page?"bg-blue-600 text-white":"border border-border hover:bg-muted text-muted-foreground"}`}>{i+1}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page===pages-1}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-xl disabled:opacity-40 hover:bg-muted transition-colors"><ChevronRight size={13}/></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ item,onClose,type,onSave,onDelete,onDuplicate,recordId }: {
  item:any; onClose:()=>void; type:string;
  onSave?:(updated:Record<string,unknown>)=>void;
  onDelete?:()=>void;
  onDuplicate?:()=>void;
  recordId?:string;
}) {
  const [tab,setTab]=useState<"details"|"timeline"|"comments"|"audit"|"attachments">("details");
  const [comment,setComment]=useState("");
  const [editing,setEditing]=useState(false);
  const [editData,setEditData]=useState<Record<string,unknown>>({});
  const [deleteConfirm,setDeleteConfirm]=useState(false);
  const metaKey=recordId||item?.id||"unknown";

  const defaultComments=[
    { user:"Priya S.",  avatar:"PS", text:"Reviewed and looks good. Proceeding with next steps.",   time:"Today 10:32" },
    { user:"Rahul V.",  avatar:"RV", text:"Please verify the pricing before final approval.",        time:"Today 11:15" },
  ];
  recordMetaService.seedDefaults(type, metaKey, { comments: defaultComments });

  const [comments,setComments]=useState(()=>recordMetaService.get(type, metaKey).comments.length
    ? recordMetaService.get(type, metaKey).comments
    : defaultComments);
  const [attachments,setAttachments]=useState(()=>recordMetaService.get(type, metaKey).attachments.length
    ? recordMetaService.get(type, metaKey).attachments
    : [
      { name:"Purchase_Order_PO-7743.pdf",  size:"248 KB", type:"pdf",  added:"Today" },
      { name:"Vendor_Quote_SCI.xlsx",       size:"84 KB",  type:"xlsx", added:"Yesterday" },
    ]);
  const fileInputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if(item) setEditData({ ...item });
  },[item]);

  if(!item) return null;
  const fields=Object.entries(editing?editData:item).filter(([k])=>!["id","activities"].includes(k));
  const recordLabel=item.name||item.product||item.title||item.company||item.id||"Record";

  const TABS=[
    { key:"details"    as const,label:"Details" },
    { key:"timeline"   as const,label:"Timeline" },
    { key:"comments"   as const,label:"Comments" },
    { key:"audit"      as const,label:"Audit Log" },
    { key:"attachments"as const,label:"Files" },
  ];

  const timelineEvents=[
    ...recordMetaService.get(type, metaKey).timeline.map(e=>({
      icon:MessageSquare, color:"bg-violet-100 dark:bg-violet-900/30", iconColor:"text-violet-600",
      action:e.action, user:e.user, time:e.time, desc:e.desc,
    })),
    { icon:CheckCircle2, color:"bg-emerald-100 dark:bg-emerald-900/30",iconColor:"text-emerald-600", action:"Record created",     user:"System",  time:"Today 08:45",  desc:`${type} record added to the system` },
    { icon:Edit2,        color:"bg-blue-100 dark:bg-blue-900/30",      iconColor:"text-blue-600",    action:"Fields updated",     user:"Priya S.", time:"Today 09:30",  desc:"Status and priority fields updated" },
  ];

  const auditLog=[
    { user:"Priya S.",  action:"CREATE",   field:"Record",       old:"—",          new:"Created",    time:"08:45:12" },
    { user:"Priya S.",  action:"UPDATE",   field:"Status",       old:"Draft",      new:"Active",     time:"09:31:04" },
    { user:"System",    action:"UPDATE",   field:"Modified By",  old:"—",          new:"Priya S.",   time:"09:31:04" },
    { user:"Rahul V.",  action:"COMMENT",  field:"Notes",        old:"—",          new:"Comment added",time:"11:15:22" },
  ];

  const attachmentsStatic=[
    { name:"Purchase_Order_PO-7743.pdf",  size:"248 KB", type:"pdf",  added:"Today" },
    { name:"Vendor_Quote_SCI.xlsx",       size:"84 KB",  type:"xlsx", added:"Yesterday" },
    { name:"Delivery_Schedule.docx",      size:"32 KB",  type:"docx", added:"25 Jun" },
  ];

  const addComment=()=>{
    if(!comment.trim()) return;
    const entry={ user:"You", avatar:"YO", text:comment, time:"Just now" };
    const updated=recordMetaService.addComment(type, metaKey, entry);
    setComments(updated);
    setComment("");
    toast.success("Comment saved");
  };

  const handleFileUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const attachment={
      name:file.name,
      size:`${Math.round(file.size/1024)} KB`,
      type:file.name.split(".").pop()||"file",
      added:"Just now",
    };
    const updated=recordMetaService.addAttachment(type, metaKey, attachment);
    setAttachments(updated);
    toast.success(`${file.name} attached`);
    e.target.value="";
  };

  const handleSave=()=>{
    if(onSave){
      onSave(editData);
      recordMetaService.addTimelineEvent(type, metaKey, { action:"Record updated", user:"You", time:"Just now", desc:"Fields saved from detail drawer" });
      toast.success("Changes saved");
      setEditing(false);
    } else {
      toast.success("Changes saved locally");
      setEditing(false);
    }
  };

  const handleDuplicate=()=>{
    if(onDuplicate){ onDuplicate(); toast.success(`${type} duplicated`); }
    else toast.info("Duplicate not available for this record type");
  };

  const handleExportPdf=()=>{
    exportToPDF([item],{ filename:type.replace(/\s+/g,"_").toLowerCase(), title:`${type} — ${recordLabel}` });
    toast.success("PDF export opened");
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
        <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }} transition={{ type:"spring",damping:25,stiffness:200 }}
          className="w-full sm:max-w-lg bg-card h-full shadow-2xl flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>

          {/* Header */}
          <div className="p-4 border-b border-border" style={{ background:"linear-gradient(to right,rgba(37,99,235,0.05),rgba(124,58,237,0.05))" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{type}</p>
                <h3 className="font-bold text-foreground text-base mt-0.5 truncate" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{recordLabel}</h3>
                {item.id&&<p className="text-xs font-mono text-muted-foreground mt-0.5">{item.id}</p>}
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-xl transition-colors flex-shrink-0">
                <X size={15} className="text-muted-foreground"/>
              </button>
            </div>
            {/* Action bar */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              <PrimaryBtn icon={Edit2} size="sm" onClick={()=>setEditing(e=>!e)}>{editing?"Cancel Edit":"Edit"}</PrimaryBtn>
              <SecondaryBtn icon={Copy} onClick={handleDuplicate}>Duplicate</SecondaryBtn>
              <SecondaryBtn icon={Download} onClick={handleExportPdf}>PDF</SecondaryBtn>
              <SecondaryBtn icon={Share2||ArrowRight} onClick={()=>{ navigator.clipboard?.writeText(window.location.href); toast.success("Link copied to clipboard"); }}>Share</SecondaryBtn>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-border px-3 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)}
                className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${tab===t.key?"border-blue-600 text-blue-600":"border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t.label}
                {t.key==="comments"&&<span className="ml-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full">{comments.length}</span>}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
            {tab==="details"&&(
              <div className="p-4 grid grid-cols-2 gap-2.5">
                {fields.map(([k,v])=>(
                  <div key={k} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{k.replace(/_/g," ")}</p>
                    {editing?(
                      <input value={String(editData[k]??"")} onChange={e=>setEditData(d=>({ ...d,[k]:e.target.value }))}
                        className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-400/30"/>
                    ):(
                      <p className="text-sm font-semibold text-foreground break-words">{String(v)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab==="timeline"&&(
              <div className="p-4 flex flex-col gap-0">
                {timelineEvents.map((e,i)=>(
                  <div key={i} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${e.color} flex items-center justify-center flex-shrink-0`}>
                        <e.icon size={13} className={e.iconColor}/>
                      </div>
                      {i<timelineEvents.length-1&&<div className="w-px flex-1 bg-border mt-1"/>}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground">{e.action}</p>
                        <span className="text-xs text-muted-foreground">by {e.user}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{e.desc}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==="comments"&&(
              <div className="p-4 flex flex-col gap-3">
                {comments.map((c,i)=>(
                  <motion.div key={i} initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
                    className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.avatar}</div>
                    <div className="flex-1 bg-muted rounded-xl rounded-tl-sm px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-foreground">{c.user}</p>
                        <p className="text-[10px] text-muted-foreground">{c.time}</p>
                      </div>
                      <p className="text-sm text-foreground">{c.text}</p>
                    </div>
                  </motion.div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input value={comment} onChange={e=>setComment(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter") addComment(); }}
                    placeholder="Add a comment… (Enter to send)"
                    className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400/60 transition-all"/>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={addComment}
                    className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Send size={13} className="text-white"/>
                  </motion.button>
                </div>
              </div>
            )}

            {tab==="audit"&&(
              <div className="p-4">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr className="border-b border-border">
                        {["User","Action","Field","Old Value","New Value","Time"].map(h=>(
                          <th key={h} className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map((row,i)=>(
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="px-3 py-2 font-semibold text-foreground">{row.user}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${row.action==="CREATE"?"bg-emerald-100 text-emerald-700":row.action==="UPDATE"?"bg-blue-100 text-blue-700":"bg-violet-100 text-violet-700"}`}>{row.action}</span>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{row.field}</td>
                          <td className="px-3 py-2 text-muted-foreground line-through">{row.old}</td>
                          <td className="px-3 py-2 text-foreground font-medium">{row.new}</td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">{row.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab==="attachments"&&(
              <div className="p-4 flex flex-col gap-3">
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}/>
                <motion.button whileHover={{ scale:1.02 }} onClick={()=>fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all group">
                  <Upload size={20} className="text-muted-foreground group-hover:text-blue-600 transition-colors"/>
                  <p className="text-xs font-semibold text-muted-foreground group-hover:text-blue-600">Click to upload or drag & drop</p>
                  <p className="text-[10px] text-muted-foreground">PDF, Excel, Word, Images (max 25MB)</p>
                </motion.button>
                {(attachments.length?attachments:attachmentsStatic).map((a,i)=>(
                  <motion.div key={i} whileHover={{ x:2 }}
                    className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${a.type==="pdf"?"bg-red-500":a.type==="xlsx"?"bg-emerald-500":"bg-blue-500"}`}>
                      {a.type.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.size} · Added {a.added}</p>
                    </div>
                    <Download size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"/>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border flex gap-2">
            <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2 rounded-xl text-sm flex items-center justify-center gap-1.5">
              <CheckCircle2 size={13}/> Save Changes
            </motion.button>
            <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={()=>setDeleteConfirm(true)}
              className="px-3 border border-red-200 text-red-500 font-semibold py-2 rounded-xl text-sm hover:bg-red-50 transition-colors">
              <Trash2 size={13}/>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {deleteConfirm&&<ConfirmDeleteModal title={`Delete ${type}`} body={`Delete "${recordLabel}"? This cannot be undone.`}
        onConfirm={()=>{ if(onDelete) onDelete(); else toast.error(`${type} deleted`); onClose(); }} onCancel={()=>setDeleteConfirm(false)}/>}
    </AnimatePresence>
  );
}

// ─── Global Search Modal ──────────────────────────────────────────────────────

function GlobalSearchModal({ onClose,onNavigate }: { onClose:()=>void; onNavigate:(m:ModuleId)=>void }) {
  const [q,setQ]=useState("");
  const results=useMemo(()=>{
    if(!q.trim())return SEARCH_INDEX.slice(0,6);
    return SEARCH_INDEX.filter(r=>
      r.title.toLowerCase().includes(q.toLowerCase())||
      r.type.toLowerCase().includes(q.toLowerCase())||
      r.meta.toLowerCase().includes(q.toLowerCase())
    );
  },[q]);

  const typeIcon: Record<string,React.ElementType> = {
    "Inventory Item":Box,"Sales Order":ShoppingCart,"Lead":Users,"Purchase Order":Package,
    "Invoice":FileText,"Employee":UserCheck,"Work Order":Factory,"BOM":Layers,"Warehouse":Warehouse,
    "CAPA":Shield,"Project":FolderKanban
  };
  const Layers2=({ size,className }: any)=><span className={`inline-block ${className}`} style={{ fontSize:size }}>⊞</span>;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-4 sm:pt-24 px-3 sm:px-4" onClick={onClose}>
        <motion.div initial={{ opacity:0,scale:0.95,y:-20 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.95 }}
          transition={{ duration:0.2 }} className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          onClick={e=>e.stopPropagation()}>
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search size={16} className="text-blue-500 flex-shrink-0"/>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Search across all ERP modules…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"/>
            <kbd className="text-xs text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
            {!q&&<p className="text-xs text-muted-foreground px-4 py-2 font-semibold uppercase tracking-wider">Recent & Suggested</p>}
            {results.length===0&&<p className="text-sm text-muted-foreground text-center py-8">No results for "{q}"</p>}
            {results.map((r,i)=>{
              const Icon=typeIcon[r.type]||FileText;
              return (
                <motion.button key={i} whileHover={{ x:4 }} onClick={()=>{ onNavigate(r.module); onClose(); toast.success(`Navigated to ${r.module}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors text-left border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-blue-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.meta}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-medium capitalize flex-shrink-0">{r.type}</span>
                  <ExternalLink size={12} className="text-muted-foreground opacity-50"/>
                </motion.button>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-border flex gap-4 text-xs text-muted-foreground">
            <span>↵ to select</span><span>↑↓ navigate</span><span>ESC close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Workflow Tracker ─────────────────────────────────────────────────────────

function WorkflowTracker({ onNavigate }: { onNavigate:(m:ModuleId)=>void }) {
  const [active,setActive]=useState(5);
  const steps=[
    { label:"Quotation",    module:"sales"          as ModuleId, icon:FileText,     done:true  },
    { label:"Sales Order",  module:"sales"          as ModuleId, icon:ShoppingCart, done:true  },
    { label:"Inv. Check",   module:"inventory"      as ModuleId, icon:Box,          done:true  },
    { label:"Purchase Req", module:"procurement"    as ModuleId, icon:Package,      done:true  },
    { label:"Purchase Ord", module:"procurement"    as ModuleId, icon:Package,      done:true  },
    { label:"Warehouse",    module:"warehouse"      as ModuleId, icon:Warehouse,    done:false },
    { label:"Production",   module:"manufacturing"  as ModuleId, icon:Factory,      done:false },
    { label:"QC Inspect",   module:"quality"        as ModuleId, icon:Shield,       done:false },
    { label:"Invoice",      module:"finance"        as ModuleId, icon:DollarSign,   done:false },
    { label:"Delivery",     module:"supply-chain"   as ModuleId, icon:Truck,        done:false },
  ];
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Order-to-Delivery Workflow</h3>
          <p className="text-xs text-muted-foreground mt-0.5">SO-2024-8821 — Tata Motors · Step {active+1} of {steps.length}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-emerald-200 dark:ring-emerald-800">
          <Play size={10}/> In Progress
        </div>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
        {steps.map((s,i)=>(
          <div key={i} className="flex items-center flex-shrink-0">
            <motion.button whileHover={{ scale:1.08 }} onClick={()=>{ setActive(i); onNavigate(s.module); toast.success(`Navigated to ${s.label}`); }}
              className={`flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all ${i===active?"bg-blue-600 shadow-md shadow-blue-500/25":s.done?"bg-emerald-50 dark:bg-emerald-900/20":"bg-muted"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i===active?"bg-white/20":s.done?"bg-emerald-100 dark:bg-emerald-900/40":""}`}>
                {s.done&&i!==active?<Check size={12} className="text-emerald-600"/>:<s.icon size={12} className={i===active?"text-white":"text-muted-foreground"}/>}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${i===active?"text-white":s.done?"text-emerald-700 dark:text-emerald-300":"text-muted-foreground"}`}>{s.label}</span>
            </motion.button>
            {i<steps.length-1&&<div className={`h-px w-3 flex-shrink-0 ${i<active?"bg-emerald-400":"bg-border"}`}/>}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div animate={{ width:`${(active/steps.length)*100}%` }} transition={{ duration:0.5 }}
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"/>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ onNavigate }: { onNavigate:(m:ModuleId)=>void }) {
  return (
    <div className="flex flex-col gap-6">
      {/* AI banner */}
      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4 }}
        className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4"
        style={{ background:"linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#7c3aed 100%)" }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage:"radial-gradient(circle at 75% 50%,#60a5fa 0%,transparent 60%)" }}/>
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-white"/>
        </div>
        <div className="flex-1 min-w-0 relative">
          <p className="text-sm font-bold text-white">AI Insight — Business Health Score: <span className="text-yellow-300">87 / 100 — Excellent</span></p>
          <p className="text-xs text-blue-100 mt-0.5">Revenue up 12.3% MoM · Inventory 94% efficient · 3 purchase approvals need attention</p>
        </div>
        <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={()=>onNavigate("reports")}
          className="relative text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-xl font-semibold text-white whitespace-nowrap border border-white/20">
          View Analytics →
        </motion.button>
      </motion.div>

      {/* Gradient KPI — clickable */}
      <motion.div variants={cardGrid} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GradientKpi title="Total Revenue" value="₹12.8 Cr" numericValue={12.8} change={12.3} changeLabel="vs last month" icon={TrendingUp} gradient="bg-gradient-to-br from-blue-600 to-blue-500" spark={[4.2,5.8,5.1,6.7,7.2,8.1,7.6,9.3,8.8,10.2,11.4,12.8]} onClick={()=>{ onNavigate("finance"); toast("Opening Finance Analytics…"); }} />
        <GradientKpi title="Net Profit" value="₹5.1 Cr" numericValue={5.1} change={18.6} changeLabel="vs last month" icon={DollarSign} gradient="bg-gradient-to-br from-emerald-600 to-emerald-500" spark={[1.1,1.6,1.4,2.1,2.4,2.9,2.6,3.2,3.0,3.8,4.2,5.1]} onClick={()=>{ onNavigate("reports"); toast("Opening Finance Reports…"); }} />
        <GradientKpi title="Active Orders" value="1,847" numericValue={1847} change={4.2} changeLabel="vs yesterday" icon={ShoppingCart} gradient="bg-gradient-to-br from-violet-600 to-violet-500" spark={[160,175,168,182,178,190,185,192,184,195,188,196]} onClick={()=>{ onNavigate("sales"); toast("Opening Sales Orders…"); }} />
        <GradientKpi title="Pending Invoices" value="₹3.2 Cr" numericValue={3.2} change={-6.1} changeLabel="vs last month" icon={AlertCircle} gradient="bg-gradient-to-br from-amber-500 to-orange-500" spark={[2.1,2.8,3.4,3.1,3.8,3.5,3.2,3.6,3.4,3.1,3.3,3.2]} onClick={()=>{ onNavigate("finance"); toast("Opening Invoice Management…"); }} />
      </motion.div>

      {/* White KPI — clickable */}
      <motion.div variants={cardGrid} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <WhiteKpi title="Production Output" value="3,842 units" numericValue={3842} change={7.8} changeLabel="vs last week" icon={Factory} iconBg="bg-cyan-500" onClick={()=>{ onNavigate("manufacturing"); toast("Opening Manufacturing Dashboard…"); }} />
        <WhiteKpi title="Inventory Value" value="₹48.2 Cr" numericValue={48.2} change={2.1} changeLabel="vs last month" icon={Box} iconBg="bg-indigo-500" onClick={()=>{ onNavigate("inventory"); toast("Opening Inventory Dashboard…"); }} />
        <WhiteKpi title="Employee Attendance" value="94.2%" numericValue={94.2} change={1.4} changeLabel="vs yesterday" icon={UserCheck} iconBg="bg-teal-500" onClick={()=>{ onNavigate("hrms"); toast("Opening HR Dashboard…"); }} />
        <WhiteKpi title="Machine Uptime" value="96.8%" numericValue={96.8} change={0.8} changeLabel="vs last week" icon={Activity} iconBg="bg-rose-500" onClick={()=>{ onNavigate("manufacturing"); toast("Opening Machine Dashboard…"); }} />
      </motion.div>

      {/* Revenue chart + Module Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Revenue & Profit Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">FY 2024 — Monthly</p>
            </div>
            <div className="flex gap-0.5 bg-muted rounded-xl p-0.5">
              {["1M","3M","6M","1Y"].map((p,i)=>(
                <button key={p} className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${i===3?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.22}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                <linearGradient id="proG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.22}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}Cr`}/>
              <Tooltip formatter={(v:number)=>[`₹${v} Cr`,""]} contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.1)" }}/>
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revG)"/>
              <Area type="monotone" dataKey="profit"  name="Profit"  stroke="#22C55E" strokeWidth={2.5} fill="url(#proG)"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
          className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <h3 className="font-bold text-foreground mb-1" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Module Usage</h3>
          <p className="text-xs text-muted-foreground mb-3">Active users by module</p>
          <ResponsiveContainer width="100%" height={170}>
            <RePieChart>
              <Pie data={moduleDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                {moduleDistribution.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
            </RePieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {moduleDistribution.map((m,i)=>(
              <button key={i} onClick={()=>onNavigate(["sales","manufacturing","finance","hrms","procurement"][i] as ModuleId)}
                className="flex items-center justify-between text-xs hover:bg-muted px-1 py-0.5 rounded-lg transition-colors">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background:m.color }}/><span className="text-muted-foreground">{m.name}</span></div>
                <span className="font-bold text-foreground">{m.value}%</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Business Health + Quick Actions + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
          className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow cursor-pointer" onClick={()=>onNavigate("reports")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Business Health</h3>
            <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full ring-1 ring-emerald-200">Excellent</span>
          </div>
          <div className="flex flex-wrap items-center justify-around py-2 gap-2">
            <RadialGauge value={87} label="Overall"  sublabel="Health Score" color="#2563EB"/>
            <RadialGauge value={94} label="Delivery" sublabel="On-time rate" color="#22C55E"/>
            <RadialGauge value={91} label="Quality"  sublabel="Pass rate"    color="#8B5CF6"/>
          </div>
        </motion.div>
        <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}
          className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label:"New Sales Order",  icon:ShoppingCart, color:"bg-blue-500",    hover:"hover:bg-blue-600",    mod:"sales"          as ModuleId },
              { label:"Create PO",        icon:Package,      color:"bg-violet-500",  hover:"hover:bg-violet-600",  mod:"procurement"    as ModuleId },
              { label:"Add Employee",     icon:UserCheck,    color:"bg-emerald-500", hover:"hover:bg-emerald-600", mod:"hrms"           as ModuleId },
              { label:"New Work Order",   icon:Factory,      color:"bg-cyan-500",    hover:"hover:bg-cyan-600",    mod:"manufacturing"  as ModuleId },
              { label:"Stock Transfer",   icon:Box,          color:"bg-amber-500",   hover:"hover:bg-amber-600",   mod:"inventory"      as ModuleId },
              { label:"Run Payroll",      icon:CreditCard,   color:"bg-rose-500",    hover:"hover:bg-rose-600",    mod:"payroll"        as ModuleId },
            ].map((a,i)=>(
              <motion.button key={i} whileHover={{ scale:1.04,y:-1 }} whileTap={{ scale:0.96 }}
                onClick={()=>{ onNavigate(a.mod); toast.success(`${a.label} — navigating…`); }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl ${a.color} ${a.hover} text-white text-xs font-semibold transition-colors shadow-sm`}>
                <a.icon size={14} className="flex-shrink-0"/><span className="leading-tight">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}
          className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Calendar</h3>
            <span className="text-xs font-semibold text-blue-600">June 2024</span>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {[null,null,null,null,null,null,1,...Array.from({length:29},(_,i)=>i+2)].map((day,i)=>{
              const today=day===28,hasEvent=[3,7,12,18,24,28].includes(day??-1);
              return (
                <div key={i} onClick={day?()=>toast(`June ${day} — ${hasEvent?"Events scheduled":"No events"}`):undefined}
                  className={`relative flex flex-col items-center justify-center rounded-lg h-7 text-xs cursor-pointer transition-all ${today?"bg-blue-600 text-white font-bold shadow-md":day?"hover:bg-muted text-foreground font-medium":"text-transparent"}`}>
                  {day}
                  {hasEvent&&!today&&<span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-500"/>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
            {[{ time:"10:00",title:"Board Review",color:"bg-blue-500" },{ time:"14:30",title:"Vendor Call",color:"bg-violet-500" }].map((e,i)=>(
              <button key={i} onClick={()=>toast(`${e.title} at ${e.time}`)}
                className="flex items-center gap-2 text-xs hover:bg-muted px-1 py-0.5 rounded-lg transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full ${e.color} flex-shrink-0`}/>
                <span className="text-muted-foreground font-mono">{e.time}</span>
                <span className="text-foreground font-semibold truncate">{e.title}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Workflow tracker */}
      <WorkflowTracker onNavigate={onNavigate}/>

      {/* Production + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Production Performance</h3>
            <button onClick={()=>onNavigate("manufacturing")} className="text-xs text-blue-600 font-semibold hover:underline">Full Report →</button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productionData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
              <Bar dataKey="planned" name="Planned" fill="#E0E7FF" radius={[4,4,0,0]}/>
              <Bar dataKey="actual"  name="Actual"  fill="#2563EB" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.35 }}
          className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Live Activity</h3>
            <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-3">
            {recentActivities.slice(0,5).map(act=>(
              <motion.div key={act.id} whileHover={{ x:2 }}
                onClick={()=>{ const mods:Record<string,ModuleId>={"Sales":"sales","Procurement":"procurement","Manufacturing":"manufacturing","Inventory":"inventory","Payroll":"payroll","Finance":"finance"}; onNavigate(mods[act.module]||"dashboard"); }}
                className="flex items-start gap-2.5 cursor-pointer group">
                <div className={`w-7 h-7 rounded-full ${act.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{act.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">{act.action}</p>
                  <p className="text-xs text-muted-foreground">{act.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Machine + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Machine Status</h3>
            <button onClick={()=>onNavigate("manufacturing")} className="text-xs text-blue-600 font-semibold hover:underline">Machine Dashboard →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id:"MC-01",name:"CNC Lathe A1",      status:"Running",     oee:94 },
              { id:"MC-02",name:"Injection Mould",   status:"Running",     oee:91 },
              { id:"MC-03",name:"Welding Robot",     status:"Running",     oee:88 },
              { id:"MC-04",name:"Press Brake",       status:"Maintenance", oee:0  },
              { id:"MC-05",name:"Assembly Line 1",   status:"Running",     oee:97 },
              { id:"MC-06",name:"Paint Booth",       status:"Idle",        oee:0  },
            ].map(m=>(
              <motion.div key={m.id} whileHover={{ scale:1.03 }} onClick={()=>{ onNavigate("maintenance"); toast(`${m.id}: ${m.name} — ${m.status}`); }}
                className="border border-border rounded-xl p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{m.id}</span>
                  <span className={`w-2 h-2 rounded-full ${m.status==="Running"?"bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]":m.status==="Maintenance"?"bg-amber-500":"bg-slate-400"}`}/>
                </div>
                <p className="text-xs font-bold text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.status}{m.oee>0?` · OEE ${m.oee}%`:""}</p>
                {m.oee>0&&<div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden"><motion.div initial={{ width:0 }} animate={{ width:`${m.oee}%` }} transition={{ duration:0.8,delay:0.3 }} className="h-full bg-emerald-500 rounded-full"/></div>}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Sales Pipeline</h3>
            <button onClick={()=>onNavigate("sales")} className="text-xs text-blue-600 font-semibold hover:underline">Full Pipeline →</button>
          </div>
          <div className="flex flex-col gap-3.5">
            {salesPipeline.map((s,i)=>(
              <div key={i} className="cursor-pointer" onClick={()=>onNavigate("sales")}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.stage}</span>
                  <span className="font-extrabold text-foreground">{s.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${(s.value/342)*100}%` }} transition={{ duration:0.7,delay:i*0.08 }}
                    className="h-full rounded-full" style={{ background:s.color }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-border">
            {[{ label:"Win Rate",value:"42%"},{ label:"Avg Deal",value:"₹32.4L"},{ label:"Cycle Time",value:"28d"}].map((s,i)=>(
              <button key={i} onClick={()=>onNavigate("sales")} className="text-center p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <p className="text-base font-extrabold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sales Module ─────────────────────────────────────────────────────────────

function SalesModule({ onNavigate }: { onNavigate:(m:ModuleId)=>void }) {
  const { data: leads, create, update, remove, refresh } = useCRUD<Lead>(erpServices.sales);
  const [drawer,setDrawer]=useState<any>(null);
  const [tab,setTab]=useState<"leads"|"analytics">("leads");
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState<Lead|null>(null);

  const tableData=useMemo(()=>leads.map(l=>({
    id:l.id, name:l.company, contact:l.contact, value:l.value, stage:l.stage,
    score: l.stage==="Closed Won"?100:l.stage==="Negotiation"?90:l.stage==="Proposal"?80:l.stage==="Qualified"?70:55,
    date:l.lastContact, owner:l.owner, email:l.email, phone:l.phone, _raw:l,
  })),[leads]);

  const openCreate=()=>{ setEditing(null); setShowForm(true); };
  const handleSave=(d:Record<string,string>)=>{
    const payload={
      company:d.company||d.name||"New Company", contact:d.contact||"", email:d.email||"",
      phone:d.phone||"", industry:d.industry||"General", stage:(d.stage||"New") as Lead["stage"],
      value:d.value||"₹0", expectedClose:d.expectedClose||"TBD", owner:d.owner||"Unassigned",
      source:d.source||"Direct", lastContact:"Today", notes:d.notes||"", activities:[], createdBy:"User",
    };
    if(editing){ update(editing.id,payload); toast.success("Lead updated"); }
    else { create(payload); toast.success("Lead created"); }
    refresh(); setShowForm(false);
  };
  const handleDelete=(row:any)=>{
    if(remove(row.id||row._raw?.id)){ toast.success("Lead deleted"); refresh(); setDrawer(null); }
  };
  const handleDuplicate=(row:any)=>{
    const src=row._raw||row;
    create({ ...src, company:`${src.company||src.name} (Copy)`, activities:[] });
    toast.success("Lead duplicated"); refresh();
  };
  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Leads",  value:String(leads.length),      sub:"+18 today",    gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Users },
        { label:"Sales Orders", value:"127",      sub:"₹42.8 Cr MTD", gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:ShoppingCart },
        { label:"Invoiced",     value:"₹28.4 Cr", sub:"+12.3% MoM",  gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:DollarSign },
        { label:"Overdue",      value:"₹3.2 Cr",  sub:"14 invoices",  gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:AlertTriangle },
      ]}/>
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["leads","analytics"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="leads"?"Leads & CRM":"Sales Analytics"}
          </button>
        ))}
      </div>
      {tab==="leads"&&(
        <InteractiveTable
          title="Leads & Customers"
          data={tableData}
          exportFilename="sales_leads"
          searchKeys={["name","contact","stage","owner"]}
          onRowClick={row=>setDrawer(row)}
          onAdd={openCreate}
          onDelete={handleDelete}
          onEdit={row=>{ setEditing(row._raw); setShowForm(true); }}
          onDuplicate={handleDuplicate}
          addLabel="New Lead"
          columns={[
            { key:"id",    label:"ID",    render:r=><span className="text-xs font-mono text-muted-foreground">{r.id}</span> },
            { key:"name",  label:"Company", render:r=><span className="font-bold text-foreground text-sm">{r.name}</span> },
            { key:"contact",label:"Contact", render:r=><span className="text-xs text-muted-foreground">{r.contact}</span> },
            { key:"value", label:"Value",  render:r=><span className="font-extrabold text-foreground font-mono text-xs">{r.value}</span> },
            { key:"stage", label:"Stage",  render:r=><Badge status={r.stage}/> },
            { key:"score", label:"Score",  render:r=>(
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width:`${r.score}%` }}/></div>
                  <span className="text-xs font-mono font-bold text-foreground">{r.score}</span>
                </div>
              )},
            { key:"owner", label:"Owner", render:r=><span className="text-xs text-muted-foreground">{r.owner}</span> },
          ]}
        />
      )}
      {tab==="analytics"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Monthly Sales Trend</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="revenue" name="Revenue (Cr)" fill="#2563EB" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Pipeline Funnel</h4>
            <div className="flex flex-col gap-2.5 mt-2">
              {salesPipeline.map((s,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 text-right">{s.stage}</span>
                  <motion.div initial={{ width:0 }} animate={{ width:`${(s.value/342)*100}%` }} transition={{ duration:0.6,delay:i*0.1 }}
                    className="h-6 rounded-lg flex items-center px-2.5 min-w-[40px]" style={{ background:s.color }}>
                    <span className="text-xs text-white font-bold">{s.value}</span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {drawer&&<DetailDrawer item={drawer} type="Sales Lead" recordId={drawer.id}
        onClose={()=>setDrawer(null)}
        onSave={updated=>{ update(drawer._raw?.id||drawer.id,{ company:String(updated.name||updated.company), contact:String(updated.contact), value:String(updated.value), stage:updated.stage as Lead["stage"], owner:String(updated.owner), email:String(updated.email), phone:String(updated.phone) }); refresh(); setDrawer(null); toast.success("Lead saved"); }}
        onDelete={()=>handleDelete(drawer)}
        onDuplicate={()=>handleDuplicate(drawer)}
      />}
      {showForm&&<CreateEditModal title={editing?"Edit Lead":"New Lead"} onClose={()=>setShowForm(false)} onSave={handleSave}
        initialData={editing?{ name:editing.company, contact:editing.contact, email:editing.email, phone:editing.phone, value:editing.value, stage:editing.stage, owner:editing.owner }:undefined}
        fields={[
          { key:"name", label:"Company", type:"text", required:true },
          { key:"contact", label:"Contact", type:"text", required:true },
          { key:"email", label:"Email", type:"email" },
          { key:"phone", label:"Phone", type:"text" },
          { key:"value", label:"Deal Value", type:"text" },
          { key:"stage", label:"Stage", type:"select", options:["New","Qualified","Proposal","Negotiation","Closed Won","Lost"] },
          { key:"owner", label:"Owner", type:"text" },
        ]}/>}
    </div>
  );
}

// ─── Manufacturing Module ─────────────────────────────────────────────────────

function ManufacturingModule() {
  const [drawer,setDrawer]=useState<any>(null);
  const [modal,setModal]=useState(false);
  const { data: records, create, update, remove, refresh } = useWorkOrders(erpServices.workOrders);
  
  const mappedRecords = records.map(r => ({
    id: r.id, product: r.productName, qty: r.quantity, completed: r.status === 'Completed' ? r.quantity : Math.floor(Math.random()*r.quantity), 
    due: r.dueDate, priority: "High", status: r.status
  }));

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Active Work Orders",value:"38",          sub:"12 high priority", gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Factory },
        { label:"Today's Output",    value:"1,284 units", sub:"+6.2% vs plan",   gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:TrendingUp },
        { label:"OEE Score",         value:"87.4%",       sub:"Industry avg 65%",gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Activity },
        { label:"Scrap Rate",        value:"2.1%",        sub:"Target: < 3%",    gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:AlertCircle },
      ]}/>
      <InteractiveTable
        title="Production Orders"
        data={mappedRecords}
        searchKeys={["id","product","status","priority"]}
        onRowClick={(row) => setDrawer(records.find(r => r.id === row.id) || row)}
        onAdd={()=>setModal(true)}
        addLabel="New Work Order"
        columns={[
          { key:"id",       label:"Work Order", render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
          { key:"product",  label:"Product",    render:r=><span className="font-bold text-foreground text-sm">{r.product}</span> },
          { key:"qty",      label:"Qty",        render:r=><span className="text-xs font-mono">{r.qty}</span> },
          { key:"completed",label:"Progress",   render:r=>(
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden"><motion.div initial={{ width:0 }} animate={{ width:`${(r.completed/r.qty)*100}%` }} transition={{ duration:0.8 }} className="h-full rounded-full bg-blue-500"/></div>
                <span className="text-xs font-mono text-foreground">{r.completed}/{r.qty}</span>
              </div>
            )},
          { key:"due",      label:"Due Date",   render:r=><span className="text-xs text-muted-foreground">{r.due}</span> },
          { key:"priority", label:"Priority",   render:r=><Badge status={r.priority}/> },
          { key:"status",   label:"Status",     render:r=><Badge status={r.status}/> },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Weekly Production vs Plan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
              <Bar dataKey="planned" name="Planned" fill="#E0E7FF" radius={[4,4,0,0]}/>
              <Bar dataKey="actual"  name="Actual"  fill="#2563EB" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>OEE Dashboard</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            {[{ label:"Availability",value:"94.2%",color:"text-blue-600",bg:"bg-blue-50 dark:bg-blue-900/20" },{ label:"Performance",value:"91.8%",color:"text-emerald-600",bg:"bg-emerald-50 dark:bg-emerald-900/20" },{ label:"Quality",value:"98.7%",color:"text-violet-600",bg:"bg-violet-50 dark:bg-violet-900/20" }].map((m,i)=>(
              <div key={i} className={`text-center p-3 ${m.bg} rounded-xl`}>
                <p className={`text-lg font-extrabold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-2 mb-1"><Sparkles size={13} className="text-emerald-600"/><span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">AI Optimization</span></div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Resequencing MC-03 and MC-07 could improve throughput by 8.4% and cut changeover by 22 min/day.</p>
          </div>
        </div>
      </div>
      {drawer&&<DetailDrawer item={drawer} type="Work Order" onClose={()=>setDrawer(null)} 
        onSave={(data) => { update(drawer.id, data); refresh(); setDrawer(null); toast.success("Work order updated"); }}
        onDelete={() => { remove(drawer.id); refresh(); setDrawer(null); toast.success("Work order deleted"); }}
      />}
      {modal&&<CreateEditModal title="New Work Order" onClose={()=>setModal(false)} 
        fields={[
          { key:"productCode", label:"Product Code", required:true },
          { key:"productName", label:"Product Name", required:true },
          { key:"quantity", label:"Quantity", type:"number", required:true },
          { key:"dueDate", label:"Due Date", type:"date", required:true },
          { key:"status", label:"Status", type:"select", options:["Draft","Released","In Progress","Completed","Cancelled"] }
        ]}
        onSave={(data) => {
          create({
            productCode: data.productCode, productName: data.productName,
            quantity: Number(data.quantity), dueDate: data.dueDate,
            status: (data.status as any) || 'Draft', plannedDate: new Date().toISOString().split('T')[0]
          });
          refresh(); setModal(false); toast.success("Work Order created");
        }}
      />}
    </div>
  );
}

// ─── Finance Module ───────────────────────────────────────────────────────────

function FinanceModule() {
  const [drawer,setDrawer]=useState<any>(null);
  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Assets",      value:"₹284.2 Cr",sub:"+2.8% QoQ",        gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Building2 },
        { label:"Total Liabilities", value:"₹112.8 Cr",sub:"-1.2% QoQ",        gradient:"bg-gradient-to-br from-red-600 to-red-500",      icon:CreditCard },
        { label:"Net Revenue",       value:"₹128.4 Cr",sub:"FY 2024 YTD",      gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:TrendingUp },
        { label:"Cash Position",     value:"₹42.6 Cr", sub:"Healthy liquidity", gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:DollarSign },
      ]}/>
      <InteractiveTable
        title="General Ledger"
        data={glAccounts}
        searchKeys={["code","name","type"]}
        onRowClick={setDrawer}
        onAdd={()=>toast.success("New journal entry opened")}
        addLabel="New Entry"
        columns={[
          { key:"code",   label:"Code",   render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.code}</span> },
          { key:"name",   label:"Account",render:r=><span className="font-bold text-foreground">{r.name}</span> },
          { key:"type",   label:"Type",   render:r=><span className={`text-xs px-2 py-0.5 rounded-lg font-bold ring-1 ${r.type==="Asset"?"bg-blue-50 text-blue-700 ring-blue-200":r.type==="Liability"?"bg-red-50 text-red-700 ring-red-200":r.type==="Revenue"?"bg-emerald-50 text-emerald-700 ring-emerald-200":r.type==="Equity"?"bg-violet-50 text-violet-700 ring-violet-200":"bg-amber-50 text-amber-700 ring-amber-200"}`}>{r.type}</span> },
          { key:"debit",  label:"Debit",  render:r=><span className="text-xs font-mono">{r.debit}</span> },
          { key:"credit", label:"Credit", render:r=><span className="text-xs font-mono">{r.credit}</span> },
          { key:"balance",label:"Balance",render:r=><span className="text-xs font-mono font-extrabold text-foreground">{r.balance}</span> },
        ]}
      />
      {drawer&&<DetailDrawer item={drawer} type="GL Account" onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ─── HRMS Module ──────────────────────────────────────────────────────────────

function HRMSModule() {
  const [drawer,setDrawer]=useState<any>(null);
  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Employees",  value:"1,284",sub:"+12 this month",      gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Users },
        { label:"Attendance Today", value:"94.2%",sub:"1,208 present",       gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:CheckCircle2 },
        { label:"Open Positions",   value:"24",   sub:"8 in final stage",    gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Target },
        { label:"Leave Requests",   value:"42",   sub:"18 pending approval", gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:Calendar },
      ]}/>
      <InteractiveTable
        title="Employee Directory"
        data={employees}
        searchKeys={["name","dept","role","status"]}
        onRowClick={setDrawer}
        onAdd={()=>toast.success("New employee form opened")}
        addLabel="Add Employee"
        columns={[
          { key:"id",   label:"Emp ID",    render:r=><span className="text-xs font-mono text-muted-foreground">{r.id}</span> },
          { key:"name", label:"Name",      render:r=>(
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">{r.name.split(" ").map((n:string)=>n[0]).join("")}</div>
                <span className="font-bold text-foreground text-sm">{r.name}</span>
              </div>
            )},
          { key:"dept",   label:"Dept",   render:r=><span className="text-xs text-muted-foreground">{r.dept}</span> },
          { key:"role",   label:"Role",   render:r=><span className="text-xs text-muted-foreground">{r.role}</span> },
          { key:"status", label:"Status", render:r=><Badge status={r.status}/> },
          { key:"salary", label:"Salary", render:r=><span className="text-xs font-mono font-extrabold text-foreground">{r.salary}</span> },
        ]}
      />
      {drawer&&<DetailDrawer item={drawer} type="Employee" onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ─── Inventory Module ─────────────────────────────────────────────────────────

function InventoryModule() {
  return <InventoryModuleComplete />;
}

// ─── AI Assistant Module ──────────────────────────────────────────────────────

function AIAssistant() {
  const [messages,setMessages]=useState([
    { role:"assistant",content:"Hello! I'm NexusERP AI Copilot. Ask me about revenue, inventory, payroll, projects, quality, or any module in your ERP.",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) },
  ]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);

  const getResponse=(q:string)=>{
    const lower=q.toLowerCase();
    const match=AI_RESPONSES.find(r=>r.keywords.some(k=>lower.includes(k)));
    return match?.response||`I'm analyzing your query: "${q}"\n\nSearching across Sales, Finance, Inventory, Manufacturing, and HR modules...\n\n✅ Query processed successfully.\nFor detailed analytics, please visit the Reports & Analytics module or specify a department (e.g., "Sales revenue", "Inventory status", "Machine health").`;
  };

  const send=()=>{
    if(!input.trim())return;
    const msg={ role:"user",content:input,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setMessages(p=>[...p,msg]);
    setInput(""); setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMessages(p=>[...p,{ role:"assistant",content:getResponse(msg.content),time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    },1400);
  };

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages,typing]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-200px)] min-h-[400px] sm:min-h-[520px] bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border flex items-center gap-3" style={{ background:"linear-gradient(to right,rgba(37,99,235,0.06),rgba(124,58,237,0.06))" }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30"><Sparkles size={18} className="text-white"/></div>
        <div>
          <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>NexusERP AI Copilot</h3>
          <p className="text-xs flex items-center gap-1 text-emerald-600">
            <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ repeat:Infinity,duration:1.5 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
            Online — GPT-4 powered · Data up to today
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <SecondaryBtn icon={Mic}>Voice</SecondaryBtn>
          <SecondaryBtn onClick={()=>setMessages([messages[0]])}>Clear</SecondaryBtn>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ scrollbarWidth:"none" }}>
        {messages.map((msg,i)=>(
          <motion.div key={i} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.22 }}
            className={`flex gap-3 ${msg.role==="user"?"flex-row-reverse":""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${msg.role==="assistant"?"bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md":"bg-gradient-to-br from-slate-600 to-slate-700 text-white"}`}>
              {msg.role==="assistant"?<Bot size={14}/>:"U"}
            </div>
            <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role==="user"?"items-end":"items-start"}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role==="assistant"?"bg-muted text-foreground rounded-tl-sm":"bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm shadow-sm"}`}>
                <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
              </div>
              <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
            </div>
          </motion.div>
        ))}
        {typing&&(
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><Bot size={14} className="text-white"/></div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                {[0,0.15,0.3].map(d=>(<motion.div key={d} animate={{ y:[0,-4,0] }} transition={{ repeat:Infinity,duration:0.7,delay:d }} className="w-2 h-2 rounded-full bg-muted-foreground/60"/>))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2 mb-2 flex-wrap">
          {["Revenue this month?","Pending POs?","Machine health?","Attendance today?","Payroll summary?","Cash flow?","Quality report?","Project status?"].map(s=>(
            <motion.button key={s} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={()=>{ setInput(s); }}
              className="text-xs border border-border bg-card px-2.5 py-1 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors text-muted-foreground">{s}</motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Ask anything about your ERP data…"
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 transition-all"/>
          <motion.button whileHover={{ scale:1.06,boxShadow:"0 4px 16px rgba(37,99,235,0.45)" }} whileTap={{ scale:0.95 }}
            onClick={send} className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-sm">
            <Send size={15} className="text-white"/>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Reports Module ───────────────────────────────────────────────────────────

function ReportsModule({ onNavigate }: { onNavigate:(m:ModuleId)=>void }) {
  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Scheduled Reports",value:"28",    sub:"Next: Today 6 PM",  gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Clock },
        { label:"Reports Generated",value:"1,284", sub:"This month",        gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:BarChart2 },
        { label:"BI Dashboards",    value:"14",    sub:"7 shared",          gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:PieChart },
        { label:"AI Reports",       value:"48",    sub:"Auto-generated",    gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:Sparkles },
      ]}/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Revenue 12M Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <ReLineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}Cr`}/>
              <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ fill:"#2563EB",r:3 }}/>
              <Line type="monotone" dataKey="profit"  name="Profit"  stroke="#22C55E" strokeWidth={2.5} dot={{ fill:"#22C55E",r:3 }}/>
            </ReLineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Quick Reports</h3>
            <PrimaryBtn icon={Plus} size="sm" onClick={()=>toast.success("AI Report Generator opened")}>AI Report</PrimaryBtn>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { name:"Profit & Loss Statement",  type:"Finance",       mod:"finance"       as ModuleId,updated:"Today" },
              { name:"Balance Sheet",            type:"Finance",       mod:"finance"       as ModuleId,updated:"Today" },
              { name:"Sales by Region",          type:"Sales",         mod:"sales"         as ModuleId,updated:"Yesterday" },
              { name:"Inventory Valuation",      type:"Inventory",     mod:"inventory"     as ModuleId,updated:"27 Jun" },
              { name:"Payroll Summary",          type:"HR",            mod:"payroll"       as ModuleId,updated:"27 Jun" },
              { name:"Production Efficiency",    type:"Manufacturing", mod:"manufacturing" as ModuleId,updated:"26 Jun" },
            ].map((r,i)=>(
              <motion.div key={i} whileHover={{ x:3 }} onClick={()=>{ onNavigate(r.mod); toast.success(`Opening ${r.name}…`); }}
                className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 transition-colors"><FileText size={13} className="text-blue-600"/></div>
                <span className="text-sm font-semibold text-foreground flex-1">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.type}</span>
                <span className="text-xs text-muted-foreground">{r.updated}</span>
                <Download size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>{ e.stopPropagation(); toast.success(`Downloading ${r.name}…`); }}/>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel({ onNavigate }: { onNavigate:(m:ModuleId)=>void }) {
  const [modal,setModal] = useState(false);
  const [editRole,setEditRole] = useState<any>(null);
  const { data: roleRecords, create: createRole, update: updateRole, remove: removeRole } = useRoles(erpServices.roles);
  
  // Seed initial roles if empty
  useEffect(() => {
    if(roleRecords.length === 0) {
      createRole({ name: 'Super Admin', description: 'Full system access', modules: '12', createdAt: new Date().toISOString() });
      createRole({ name: 'HR Manager', description: 'HR & Payroll access', modules: '4', createdAt: new Date().toISOString() });
      createRole({ name: 'Floor Supervisor', description: 'Manufacturing & QA', modules: '3', createdAt: new Date().toISOString() });
    }
  }, [roleRecords.length, createRole]);

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Users",  value:"284",    sub:"18 active sessions",gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Users },
        { label:"Active Roles", value:"14",     sub:"Role-based access", gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Shield },
        { label:"API Keys",     value:"12",     sub:"3 expire this month",gradient:"bg-gradient-to-br from-amber-500 to-orange-500", icon:Key },
        { label:"Audit Logs",   value:"48,221", sub:"Last 30 days",      gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:FileText },
      ]}/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>User Roles & Access</h3>
            <PrimaryBtn icon={Plus} size="sm" onClick={()=>setModal(true)}>Add Role</PrimaryBtn>
          </div>
          <div className="flex flex-col gap-2">
            {roleRecords.map((r,i)=>(
              <motion.div key={r.id} whileHover={{ x:2 }} onClick={()=>toast(`${r.name} — ${r.description}`)}
                className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-sm`}>{r.name?.[0]||'R'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{r.modules} modules</span>
                <div className="flex gap-1 items-center">
                  <button onClick={e=>{e.stopPropagation();setEditRole(r);}} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><Edit2 size={12} className="text-muted-foreground"/></button>
                  <button onClick={e=>{e.stopPropagation();removeRole(r.id);toast.success("Role deleted");}} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={12} className="text-red-500"/></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>System Settings</h3>
          <div className="flex flex-col">
            {[
              { label:"Company",     value:"NexusTech Manufacturing Pvt. Ltd." },
              { label:"Fiscal Year", value:"April 2024 — March 2025" },
              { label:"Currency",    value:"INR (₹)" },
              { label:"GST Number",  value:"27AABCT1332L1ZS" },
              { label:"Timezone",    value:"Asia/Kolkata (IST, UTC+5:30)" },
              { label:"Backup",      value:"Daily 02:00 AM · 30-day retention" },
            ].map((s,i)=>(
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0 pt-0.5">{s.label}</span>
                <span className="text-sm font-semibold text-foreground flex-1">{s.value}</span>
                <button onClick={()=>toast.success(`Editing ${s.label}…`)} className="p-1 hover:bg-muted rounded-lg flex-shrink-0 transition-colors"><Edit2 size={11} className="text-muted-foreground"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {(modal||editRole)&&<CreateEditModal title={editRole?"Edit Role":"Add Role"} onClose={()=>{setModal(false);setEditRole(null);}}
        initialData={editRole?{name:editRole.name,description:editRole.description,modules:editRole.modules}:undefined}
        onSave={(d)=>{
          if(editRole) { updateRole(editRole.id, { ...editRole, name:d.name, description:d.description, modules:d.modules }); toast.success("Role updated"); }
          else { createRole({ name: d.name, description: d.description, modules: d.modules||"0", createdAt: new Date().toISOString() }); toast.success("Role created"); }
          setModal(false); setEditRole(null);
        }}
        fields={[ { key:"name",label:"Role Name",required:true }, { key:"description",label:"Description",required:true }, { key:"modules",label:"Number of Modules Allowed",type:"number" } ]}/>}
    </div>
  );
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

function CustomerPortal() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gradient-to-br from-sky-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"/>
        <p className="text-xs font-semibold text-sky-200 uppercase tracking-wider mb-1">Customer Portal</p>
        <h2 className="text-2xl font-black" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Tata Motors Ltd.</h2>
        <p className="text-sky-100 text-sm mt-1">Customer ID: CUST-4421 · Account Manager: Priya Sharma</p>
        <div className="flex gap-4 mt-4">
          {[{ l:"Active Orders",v:"8"},{l:"Pending Payment",v:"₹12.4L"},{l:"Open Tickets",v:"2"}].map((s,i)=>(
            <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/20">
              <p className="text-base font-black">{s.v}</p><p className="text-xs text-sky-100">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { title:"My Orders",icon:ShoppingCart,items:[{ id:"SO-8821",desc:"Engine Blocks",status:"In Production",val:"₹48L"},{id:"SO-8756",desc:"Suspension Kits",status:"Delivered",val:"₹22L"}]},
          { title:"Invoices",icon:FileText,items:[{ id:"INV-4421",desc:"June Delivery",status:"Sent",val:"₹12.4L"},{id:"INV-4398",desc:"May Delivery",status:"Paid",val:"₹18.2L"}]},
          { title:"Support",icon:HelpCircle,items:[{ id:"TKT-091",desc:"Delivery delay Q2",status:"Open",val:"Priority: High"},{id:"TKT-087",desc:"Invoice mismatch",status:"Resolved",val:"Priority: Med"}]},
        ].map((sec,i)=>(
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center"><sec.icon size={15} className="text-sky-600"/></div>
              <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{sec.title}</h3>
            </div>
            <div className="flex flex-col gap-2">
              {sec.items.map((it,j)=>(
                <motion.div key={j} whileHover={{ x:2 }} onClick={()=>toast.success(`Opening ${it.id}…`)}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">{it.id}</p>
                    <p className="text-sm font-semibold text-foreground">{it.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge status={it.status}/>
                    <p className="text-xs text-muted-foreground mt-1">{it.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vendor Portal ────────────────────────────────────────────────────────────

function VendorPortal() {
  const [modal,setModal] = useState(false);
  const { data: invRecords, create: createInv, update: updateInv, remove: removeInv } = useInvoices(erpServices.invoices);
  
  // Filter for this specific mock vendor
  const vendorInvoices = invRecords.filter(i => i.customer === 'Steel Corp India');

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gradient-to-br from-stone-700 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"/>
        <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">Vendor Portal</p>
        <h2 className="text-2xl font-black" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Steel Corp India</h2>
        <p className="text-stone-300 text-sm mt-1">Vendor ID: VND-1021 · Category: Raw Materials</p>
        <div className="flex gap-4 mt-4">
          {[{l:"Open POs",v:"3"},{l:"Pending Payment",v:"₹48.2L"},{l:"Rating",v:"4.8/5"}].map((s,i)=>(
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/15">
              <p className="text-base font-black">{s.v}</p><p className="text-xs text-stone-300">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Purchase Orders</h3>
          <div className="flex flex-col gap-2">
            {[
              { id:"PO-7743",item:"Steel Grade A Sheets",qty:"500 MT",val:"₹48.2L",status:"Approved",due:"30 Jun" },
              { id:"PO-7698",item:"Steel Grade B Coils",qty:"200 MT",val:"₹18.6L",status:"Delivered",due:"20 Jun" },
              { id:"PO-7820",item:"HR Steel Sheets",qty:"300 MT",val:"₹28.4L",status:"Planned",due:"15 Jul" },
            ].map((po,i)=>(
              <motion.div key={i} whileHover={{ x:2 }} onClick={()=>toast.success(`Opening ${po.id}…`)}
                className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{po.id}</span>
                    <Badge status={po.status}/>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{po.item}</p>
                  <p className="text-xs text-muted-foreground">{po.qty} · Due: {po.due}</p>
                </div>
                <span className="font-extrabold text-foreground font-mono text-sm">{po.val}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Payment Status</h3>
          <div className="flex flex-col gap-2">
            {vendorInvoices.map((p,i)=>(
              <motion.div key={i} whileHover={{ x:2 }} onClick={()=>toast.success(`Invoice ${p.id} details…`)}
                className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{p.id}</span>
                    <Badge status={p.status}/>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {p.dueDate} · {p.issueDate}</p>
                </div>
                <span className="font-extrabold text-foreground font-mono text-sm">{p.total}</span>
                <button className="p-1 hover:bg-red-100 text-red-500 rounded" onClick={(e)=>{ e.stopPropagation(); removeInv(p.id); }}><Trash2 size={12}/></button>
              </motion.div>
            ))}
            {vendorInvoices.length === 0 && <div className="p-3 text-xs text-muted-foreground text-center">No invoices uploaded yet.</div>}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-xl">
            <PrimaryBtn onClick={()=>setModal(true)} icon={Upload}>Upload Invoice</PrimaryBtn>
          </div>
        </div>
      </div>
      {modal&&<CreateEditModal title="Upload Invoice" onClose={()=>setModal(false)}
        onSave={(d)=>{
          createInv({ customer: 'Steel Corp India', total: `₹${d.amount||0}`, subtotal: `₹${d.amount||0}`, tax: "0", dueDate: d.due, issueDate: new Date().toISOString().split('T')[0], status: 'Draft', items: [] });
          setModal(false); toast.success("Invoice uploaded successfully");
        }}
        fields={[ { key:"amount",label:"Total Amount (₹)",type:"number",required:true }, { key:"due",label:"Due Date",type:"date",required:true }, { key:"file",label:"Attach File",type:"text" } ]}/>}
    </div>
  );
}

// ─── Module Placeholder ───────────────────────────────────────────────────────

function ModulePlaceholder({ title,description,features,onFeatureClick }: {
  title:string; description:string; features:string[]; onFeatureClick?:(f:string)=>void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }}
        className="relative overflow-hidden rounded-2xl p-6 flex items-start gap-5 text-white"
        style={{ background:"linear-gradient(135deg,#1e3a8a,#2563eb,#7c3aed)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"/>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"><Sparkles size={22} className="text-white"/></div>
        <div className="relative">
          <h2 className="text-lg font-extrabold" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{title}</h2>
          <p className="text-sm text-blue-100 mt-1 max-w-2xl">{description}</p>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((f,i)=>(
          <motion.div key={i} initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} transition={{ delay:i*0.04 }}
            whileHover={{ y:-3,boxShadow:"0 8px 20px -4px rgba(37,99,235,0.18)" }}
            onClick={()=>{ onFeatureClick?.(f); toast.success(`Opening ${f}…`); }}
            className="bg-card border border-border rounded-2xl p-4 hover:border-blue-300 transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <CheckCircle2 size={14} className="text-blue-600"/>
            </div>
            <p className="text-sm font-semibold text-foreground">{f}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Create / Edit Modal ─────────────────────────────────────────────────────

function CreateEditModal({ title,fields,onClose,onSave,initialData }: {
  title:string;
  fields:{ key:string; label:string; type?:"text"|"select"|"date"|"number"|"textarea"|"checkbox"; options?:string[]; required?:boolean }[];
  onClose:()=>void; onSave:(data:Record<string,string>)=>void;
  initialData?:Record<string,string>;
}) {
  const [data,setData]=useState<Record<string,string>>(initialData||{});
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [saving,setSaving]=useState(false);

  const validate=()=>{
    const errs: Record<string,string>={};
    fields.filter(f=>f.required).forEach(f=>{ if(!data[f.key]?.trim()) errs[f.key]=`${f.label} is required`; });
    setErrors(errs);
    return Object.keys(errs).length===0;
  };

  const handleSave=()=>{
    if(!validate()) return;
    setSaving(true);
    setTimeout(()=>{ setSaving(false); onSave(data); onClose(); },1200);
  };

  const handleReset=()=>{ setData(initialData||{}); setErrors({}); };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
        <motion.div initial={{ opacity:0,y:60,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:60 }}
          transition={{ type:"spring",damping:22,stiffness:260 }}
          className="w-full sm:max-w-lg bg-card sm:border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
            <div>
              <h3 className="font-bold text-foreground text-base" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Fill in the fields below. Required fields are marked *</p>
            </div>
            <button onClick={onClose} disabled={saving} className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-xl transition-colors">
              <X size={15} className="text-muted-foreground"/>
            </button>
          </div>
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth:"none" }}>
            {fields.map(f=>(
              <div key={f.key} className={f.type==="textarea"?"sm:col-span-2":""}>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {f.label}{f.required&&<span className="text-red-500 ml-0.5">*</span>}
                </label>
                {f.type==="select"?(
                  <select value={data[f.key]||""} onChange={e=>{setData(d=>({...d,[f.key]:e.target.value}));setErrors(e2=>({...e2,[f.key]:""}));}}
                    className={`w-full bg-input-background border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500/25 transition-all ${errors[f.key]?"border-red-400 focus:border-red-400":"border-border focus:border-blue-400/60"}`}>
                    <option value="">Select…</option>
                    {f.options?.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                ):f.type==="textarea"?(
                  <textarea value={data[f.key]||""} onChange={e=>{setData(d=>({...d,[f.key]:e.target.value}));setErrors(e2=>({...e2,[f.key]:""}));}}
                    rows={3} placeholder={`Enter ${f.label.toLowerCase()}…`}
                    className={`w-full bg-input-background border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-blue-500/25 transition-all resize-none ${errors[f.key]?"border-red-400":"border-border focus:border-blue-400/60"}`}/>
                ):f.type==="checkbox"?(
                  <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                    <input type="checkbox" checked={data[f.key]==="true"} onChange={e=>setData(d=>({...d,[f.key]:String(e.target.checked)}))}
                      className="w-4 h-4 rounded border-border accent-blue-600"/>
                    <span className="text-sm text-foreground">{f.options?.[0]||"Enable"}</span>
                  </label>
                ):(
                  <input type={f.type||"text"} value={data[f.key]||""} onChange={e=>{setData(d=>({...d,[f.key]:e.target.value}));setErrors(e2=>({...e2,[f.key]:""}));}}
                    placeholder={`Enter ${f.label.toLowerCase()}…`}
                    className={`w-full bg-input-background border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-blue-500/25 transition-all ${errors[f.key]?"border-red-400 focus:border-red-400":"border-border focus:border-blue-400/60"}`}/>
                )}
                {errors[f.key]&&<p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{errors[f.key]}</p>}
              </div>
            ))}
          </div>
          <div className="p-4 sm:p-5 border-t border-border flex flex-wrap gap-2 sm:justify-end">
            <SecondaryBtn onClick={handleReset} icon={RefreshCw}>Reset</SecondaryBtn>
            <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
            <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-70 min-h-[40px]">
              {saving?(
                <><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:0.8,ease:"linear" }}><RefreshCw size={14}/></motion.div>Saving…</>
              ):(
                <><CheckCircle2 size={14}/>Save Record</>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Approve / Reject / Profile Modals ───────────────────────────────────────

function ApproveModal({ title,recordId,onClose }: { title:string; recordId:string; onClose:()=>void }) {
  const [notes,setNotes]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=()=>{
    setLoading(true);
    setTimeout(()=>{ setLoading(false); onClose(); toast.success(`✅ ${title} approved successfully`); },1000);
  };
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity:0,scale:0.9,y:16 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.9 }}
          transition={{ type:"spring",damping:22,stiffness:300 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
          <div className="p-5 flex items-start gap-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} className="text-emerald-600"/>
            </div>
            <div>
              <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Approve {title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Record: <span className="font-mono text-foreground">{recordId}</span></p>
            </div>
          </div>
          <div className="p-5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Approval Notes (Optional)</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Add any approval notes…"
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400/60 transition-all resize-none"/>
          </div>
          <div className="flex gap-3 p-4 pt-0">
            <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
            <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={handle} disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 disabled:opacity-70">
              {loading?<><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:0.8,ease:"linear" }}><RefreshCw size={13}/></motion.div>Approving…</>:<><CheckCircle2 size={13}/>Confirm Approve</>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function RejectModal({ title,recordId,onClose }: { title:string; recordId:string; onClose:()=>void }) {
  const [reason,setReason]=useState("");
  const [loading,setLoading]=useState(false);
  const reasons=["Insufficient budget","Missing documentation","Incorrect vendor","Policy violation","Needs revision","Duplicate request","Other"];
  const handle=()=>{
    if(!reason.trim()){ toast.error("Please provide a rejection reason"); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); onClose(); toast.error(`❌ ${title} rejected — Reason: ${reason}`); },1000);
  };
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity:0,scale:0.9,y:16 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.9 }}
          transition={{ type:"spring",damping:22,stiffness:300 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
          <div className="p-5 flex items-start gap-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <X size={18} className="text-red-600"/>
            </div>
            <div>
              <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Reject {title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Record: <span className="font-mono text-foreground">{recordId}</span></p>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Rejection Reason <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-1.5">
                {reasons.map(r=>(
                  <motion.button key={r} whileTap={{ scale:0.95 }} onClick={()=>setReason(r)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${reason===r?"bg-red-600 text-white border-red-600":"border-border text-muted-foreground hover:border-red-400 hover:text-red-600"}`}>
                    {r}
                  </motion.button>
                ))}
              </div>
            </div>
            <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={2} placeholder="Or type a custom reason…"
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-400/60 transition-all resize-none"/>
          </div>
          <div className="flex gap-3 p-4 pt-0">
            <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
            <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={handle} disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 disabled:opacity-70">
              {loading?<><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:0.8,ease:"linear" }}><RefreshCw size={13}/></motion.div>Rejecting…</>:<><X size={13}/>Confirm Reject</>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ProfileModal({ user, onClose, onLogout }: { user:DemoUser; onClose:()=>void; onLogout:()=>void }) {
  const [tab,setTab]=useState<"profile"|"settings"|"password">("profile");
  const [saving,setSaving]=useState(false);
  const [profileData,setProfileData]=useState({ name:user.name, email:user.email, phone:"+91 98765 43210", dept:user.dept, role:user.role });
  const [pwd,setPwd]=useState({ current:"",newpwd:"",confirm:"" });

  const save=(msg:string)=>{ setSaving(true); setTimeout(()=>{ setSaving(false); toast.success(msg); },1100); };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
        <motion.div initial={{ opacity:0,y:60 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:60 }}
          transition={{ type:"spring",damping:22,stiffness:260 }}
          className="w-full sm:max-w-lg bg-card sm:border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>My Account</h3>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-xl transition-colors"><X size={14} className="text-muted-foreground"/></button>
          </div>
          {/* User card */}
          <div className="p-4 border-b border-border flex items-center gap-4" style={{ background:"linear-gradient(to right,rgba(37,99,235,0.05),rgba(124,58,237,0.05))" }}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-xl font-black shadow-lg`}>{user.avatar}</div>
            <div>
              <p className="font-bold text-foreground text-base">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.role} · {user.dept}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">{user.email}</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex border-b border-border px-3">
            {(["profile","settings","password"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition-all -mb-px ${tab===t?"border-blue-600 text-blue-600":"border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t==="password"?"Change Password":t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="p-4 max-h-[40vh] overflow-y-auto" style={{ scrollbarWidth:"none" }}>
            {tab==="profile"&&(
              <div className="grid grid-cols-2 gap-3">
                {[{ key:"name",label:"Full Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},{key:"dept",label:"Department"},{key:"role",label:"Role"}].map(f=>(
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{f.label}</label>
                    <input value={profileData[f.key as keyof typeof profileData]} onChange={e=>setProfileData(p=>({...p,[f.key]:e.target.value}))}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400/60 transition-all"/>
                  </div>
                ))}
              </div>
            )}
            {tab==="settings"&&(
              <div className="flex flex-col gap-4">
                {[
                  { label:"Email Notifications",  desc:"Receive email alerts for approvals and alerts",   on:true },
                  { label:"Browser Notifications", desc:"Show desktop notifications for live updates",      on:true },
                  { label:"Dark Mode",             desc:"Use dark theme (also toggleable in header)",       on:false },
                  { label:"Compact View",          desc:"Reduce padding for denser data views",             on:false },
                  { label:"Auto-save Drafts",      desc:"Automatically save form progress",                 on:true },
                ].map((s,i)=>(
                  <label key={i} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={s.on} className="mt-0.5 w-4 h-4 rounded accent-blue-600"/>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {tab==="password"&&(
              <div className="flex flex-col gap-3">
                {[{ key:"current",label:"Current Password"},{key:"newpwd",label:"New Password"},{key:"confirm",label:"Confirm New Password"}].map(f=>(
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{f.label}</label>
                    <input type="password" value={pwd[f.key as keyof typeof pwd]} onChange={e=>setPwd(p=>({...p,[f.key]:e.target.value}))}
                      placeholder="••••••••••"
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400/60 transition-all"/>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Min. 8 characters with uppercase, number and special character.</p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="p-4 border-t border-border flex gap-2 justify-between">
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={()=>{ onLogout(); onClose(); }}
              className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors font-semibold">
              <LogOut size={13}/> Sign Out
            </motion.button>
            <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} disabled={saving}
              onClick={()=>save(tab==="profile"?"Profile updated":tab==="settings"?"Settings saved":"Password changed successfully")}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm disabled:opacity-70">
              {saving?<><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:0.8,ease:"linear" }}><RefreshCw size={13}/></motion.div>Saving…</>:<><CheckCircle2 size={13}/>Save Changes</>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── CRM Module ───────────────────────────────────────────────────────────────

const crmLeads = [
  { id:"CRM-001", company:"Maruti Suzuki",     contact:"Rajesh Sharma",   phone:"+91 98765 11001", email:"rajesh@maruti.com",  stage:"Hot",      score:92, last:"Today",      owner:"Priya S."  },
  { id:"CRM-002", company:"L&T Engineering",  contact:"Pradeep Nair",    phone:"+91 98765 11002", email:"pradeep@lnt.com",    stage:"Warm",     score:74, last:"Yesterday",  owner:"Kavita R." },
  { id:"CRM-003", company:"Wipro Ltd.",        contact:"Sneha Rao",       phone:"+91 98765 11003", email:"sneha@wipro.com",    stage:"Cold",     score:41, last:"3 days ago", owner:"Priya S."  },
  { id:"CRM-004", company:"Sun Pharma",        contact:"Dr. Mehta",       phone:"+91 98765 11004", email:"mehta@sunpharma.com",stage:"Hot",      score:88, last:"Today",      owner:"Rahul V."  },
  { id:"CRM-005", company:"Adani Ports",       contact:"Vikas Thakur",    phone:"+91 98765 11005", email:"vikas@adani.com",   stage:"Qualified",score:65, last:"2 days ago", owner:"Kavita R." },
  { id:"CRM-006", company:"Bajaj Auto",        contact:"Sunita Kumar",    phone:"+91 98765 11006", email:"sunita@bajaj.com",  stage:"Warm",     score:71, last:"Yesterday",  owner:"Priya S."  },
];

const crmTickets = [
  { id:"TKT-201", company:"Tata Motors",   issue:"Delayed delivery — WO-1192",      priority:"High",   status:"Open",     agent:"Priya S.",  created:"26 Jun" },
  { id:"TKT-202", company:"Infosys BPO",   issue:"Invoice discrepancy INV-4401",     priority:"Medium", status:"In Progress",agent:"Kavita R.",created:"25 Jun" },
  { id:"TKT-203", company:"Apollo Hosp.",  issue:"Product spec clarification",       priority:"Low",    status:"Resolved", agent:"Rahul V.",  created:"24 Jun" },
  { id:"TKT-204", company:"Mahindra",      issue:"Payment terms negotiation",        priority:"High",   status:"Open",     agent:"Priya S.",  created:"27 Jun" },
  { id:"TKT-205", company:"ONGC Ltd.",     issue:"Custom requirement for EV-9 kit",  priority:"Medium", status:"In Progress",agent:"Priya S.", created:"23 Jun" },
];

const meetings = [
  { id:"MTG-001", title:"Q3 Review — Tata Motors",     date:"28 Jun 2024", time:"10:00", type:"Video Call",   attendees:4, status:"Upcoming" },
  { id:"MTG-002", title:"Demo Walkthrough — Infosys",  date:"28 Jun 2024", time:"14:30", type:"In-Person",    attendees:6, status:"Upcoming" },
  { id:"MTG-003", title:"Proposal Discussion — ONGC",  date:"27 Jun 2024", time:"11:00", type:"Video Call",   attendees:3, status:"Completed" },
  { id:"MTG-004", title:"Follow-up — Bajaj Auto",      date:"02 Jul 2024", time:"15:00", type:"Phone Call",   attendees:2, status:"Scheduled" },
];

function CRMModule({ onNavigate }: { onNavigate:(m:ModuleId)=>void }) {
  const [tab,setTab]=useState<"leads"|"pipeline"|"meetings"|"tickets">("leads");
  const [drawer,setDrawer]=useState<any>(null);
  const [modal,setModal]=useState(false);

  const stageColors: Record<string,string> = {
    Hot:"bg-red-100 text-red-700 ring-1 ring-red-200", Warm:"bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    Cold:"bg-slate-100 text-slate-600 ring-1 ring-slate-200", Qualified:"bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  };

  const pipeline = [
    { stage:"New Lead",     color:"bg-slate-100 dark:bg-slate-800",  items:crmLeads.slice(0,2) },
    { stage:"Qualified",    color:"bg-blue-50 dark:bg-blue-900/20",   items:crmLeads.slice(2,3) },
    { stage:"Proposal",     color:"bg-violet-50 dark:bg-violet-900/20",items:crmLeads.slice(3,5) },
    { stage:"Negotiation",  color:"bg-amber-50 dark:bg-amber-900/20", items:crmLeads.slice(5,6) },
    { stage:"Closed Won",   color:"bg-emerald-50 dark:bg-emerald-900/20",items:[] },
  ];

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Leads",     value:"156",   sub:"+12 this week",   gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Users },
        { label:"Hot Prospects",   value:"38",    sub:"Need follow-up",  gradient:"bg-gradient-to-br from-red-600 to-red-500",      icon:Star },
        { label:"Open Tickets",    value:"14",    sub:"3 SLA breached",  gradient:"bg-gradient-to-br from-amber-500 to-orange-500", icon:AlertCircle },
        { label:"Meetings Today",  value:"6",     sub:"2 upcoming",      gradient:"bg-gradient-to-br from-violet-600 to-violet-500",icon:Calendar },
      ]}/>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit flex-wrap">
        {(["leads","pipeline","meetings","tickets"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="leads"?"Leads":t==="pipeline"?"Customer Pipeline":t==="meetings"?"Meetings":"Support Tickets"}
          </button>
        ))}
      </div>

      {tab==="leads"&&(
        <>
          <InteractiveTable title="CRM Leads" data={crmLeads} searchKeys={["company","contact","stage","owner"]} onRowClick={setDrawer}
            onAdd={()=>setModal(true)} addLabel="New Lead"
            columns={[
              { key:"id",      label:"ID",      render:r=><span className="text-xs font-mono text-muted-foreground">{r.id}</span> },
              { key:"company", label:"Company", render:r=><span className="font-bold text-foreground">{r.company}</span> },
              { key:"contact", label:"Contact", render:r=><div><p className="text-sm font-medium text-foreground">{r.contact}</p><p className="text-xs text-muted-foreground">{r.phone}</p></div> },
              { key:"stage",   label:"Stage",   render:r=><span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${stageColors[r.stage]||"bg-slate-100 text-slate-600"}`}>{r.stage}</span> },
              { key:"score",   label:"AI Score",render:r=>(
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${r.score}%`,background:r.score>80?"#22C55E":r.score>60?"#F59E0B":"#EF4444" }}/></div>
                    <span className="text-xs font-bold font-mono text-foreground">{r.score}</span>
                  </div>)},
              { key:"last",    label:"Last Contact", render:r=><span className="text-xs text-muted-foreground">{r.last}</span> },
              { key:"owner",   label:"Owner",  render:r=><span className="text-xs text-muted-foreground">{r.owner}</span> },
            ]}/>
          {modal&&<CreateEditModal title="New CRM Lead" onClose={()=>setModal(false)} onSave={d=>toast.success(`Lead created for ${d.company||"company"}`)}
            fields={[
              { key:"company",label:"Company Name" },{ key:"contact",label:"Contact Person" },
              { key:"phone",  label:"Phone" },         { key:"email", label:"Email",type:"text" },
              { key:"stage",  label:"Stage",type:"select",options:["Hot","Warm","Cold","Qualified"] },
              { key:"owner",  label:"Assigned To",type:"select",options:["Priya S.","Kavita R.","Rahul V."] },
            ]}/>}
        </>
      )}

      {tab==="pipeline"&&(
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth:"none" }}>
          {pipeline.map((col,i)=>(
            <div key={i} className="flex-shrink-0 w-64 sm:w-56 snap-start">
              <div className={`rounded-2xl p-3 ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{col.stage}</h4>
                  <span className="text-xs bg-white/60 dark:bg-white/10 text-foreground px-2 py-0.5 rounded-full font-semibold">{col.items.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {col.items.map((item,j)=>(
                    <motion.div key={j} whileHover={{ scale:1.02 }} onClick={()=>setDrawer(item)}
                      className="bg-card border border-border rounded-xl p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm font-bold text-foreground">{item.company}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.contact}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-blue-600 font-semibold">Score: {item.score}</span>
                        <span className="text-xs text-muted-foreground">{item.owner}</span>
                      </div>
                    </motion.div>
                  ))}
                  <motion.button whileHover={{ scale:1.02 }} onClick={()=>setModal(true)}
                    className="w-full border-2 border-dashed border-border rounded-xl p-2.5 text-xs text-muted-foreground hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
                    <Plus size={11}/> Add Lead
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="meetings"&&(
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Meetings & Calls</h3>
            <PrimaryBtn icon={Plus} size="sm" onClick={()=>toast.success("New meeting scheduled")}>Schedule Meeting</PrimaryBtn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {["ID","Title","Date","Time","Type","Attendees","Status",""].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {meetings.map((m,i)=>(
                  <motion.tr key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                    onClick={()=>toast.success(`Opening ${m.title}`)}
                    className="border-b border-border hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{m.id}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{m.title}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.date}</td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground">{m.time}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.attendees} people</td>
                    <td className="px-4 py-3"><Badge status={m.status}/></td>
                    <td className="px-4 py-3"><button onClick={e=>{e.stopPropagation();toast.success(`Joining ${m.title}…`);}} className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Join</button></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="tickets"&&(
        <InteractiveTable title="Support Tickets" data={crmTickets} searchKeys={["company","issue","status","priority"]}
          onRowClick={setDrawer} onAdd={()=>toast.success("New ticket opened")} addLabel="New Ticket"
          columns={[
            { key:"id",       label:"Ticket",   render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
            { key:"company",  label:"Company",  render:r=><span className="font-bold text-foreground">{r.company}</span> },
            { key:"issue",    label:"Issue",    render:r=><span className="text-sm text-muted-foreground">{r.issue}</span> },
            { key:"priority", label:"Priority", render:r=><Badge status={r.priority}/> },
            { key:"status",   label:"Status",   render:r=><Badge status={r.status}/> },
            { key:"agent",    label:"Agent",    render:r=><span className="text-xs text-muted-foreground">{r.agent}</span> },
            { key:"created",  label:"Created",  render:r=><span className="text-xs text-muted-foreground">{r.created}</span> },
          ]}/>
      )}

    </div>
  );
}

// ─── Quality Module ───────────────────────────────────────────────────────────

const inspections = [
  { id:"INS-001", product:"Engine Block EV-7",    batch:"B-2024-441", inspector:"Meena P.", result:"Pass",   date:"27 Jun", defects:0, samples:10 },
  { id:"INS-002", product:"Wiring Harness 220V",  batch:"B-2024-442", inspector:"Raj K.",   result:"Fail",   date:"27 Jun", defects:3, samples:20 },
  { id:"INS-003", product:"Brake Caliper Set",    batch:"B-2024-443", inspector:"Meena P.", result:"Pass",   date:"26 Jun", defects:0, samples:15 },
  { id:"INS-004", product:"Hydraulic Pump Assy.", batch:"B-2024-440", inspector:"Raj K.",   result:"Pending",date:"28 Jun", defects:0, samples:8  },
  { id:"INS-005", product:"Suspension Kit A2",    batch:"B-2024-439", inspector:"Meena P.", result:"Pass",   date:"26 Jun", defects:1, samples:30 },
];

const capas = [
  { id:"CAPA-012", issue:"Surface finish defect on EV-7",   source:"Inspection",  severity:"Major",  status:"Open",      owner:"Meena P.", due:"30 Jun", action:"Calibrate MC-03 tooling" },
  { id:"CAPA-011", issue:"Wiring short circuit — batch 441", source:"Customer",    severity:"Critical",status:"In Progress",owner:"Raj K.",  due:"28 Jun", action:"Replace batch, retrain ops" },
  { id:"CAPA-010", issue:"Dimension variance ±0.3mm",        source:"Audit",       severity:"Minor",  status:"Closed",    owner:"Meena P.", due:"22 Jun", action:"Update SOP-MC-03-v4" },
  { id:"CAPA-009", issue:"Coating adhesion failure",          source:"Lab Test",    severity:"Major",  status:"Open",      owner:"Raj K.",   due:"05 Jul", action:"Source new primer stock" },
];

function QualityModule() {
  const [tab,setTab]=useState<"inspection"|"capa"|"compliance">("inspection");
  const [drawer,setDrawer]=useState<any>(null);
  const [drawerType, setDrawerType] = useState<"inspection"|"capa">("inspection");
  const [modal,setModal]=useState<"inspection"|"capa"|false>(false);

  const { data: insRecords, create: createIns, update: updateIns, remove: removeIns, refresh: refreshIns } = useInspections(erpServices.inspections);
  const { data: capaRecords, create: createCapa, update: updateCapa, remove: removeCapa, refresh: refreshCapa } = useCAPAs(erpServices.capas);

  const mappedInspections = insRecords.map(r => ({ ...r, date: r.date || new Date().toISOString().split('T')[0], samples: r.samplesChecked }));
  const mappedCapas = capaRecords.map(r => ({ ...r, due: r.dueDate }));


  const severityStyle: Record<string,string> = {
    Critical:"bg-red-100 text-red-700 ring-1 ring-red-200",
    Major:   "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    Minor:   "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  };

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Inspections Today", value:"12",    sub:"8 passed · 2 failed", gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Shield },
        { label:"Pass Rate",         value:"91.4%", sub:"+2.1% vs last week",  gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:CheckCircle2 },
        { label:"Open CAPAs",        value:"8",     sub:"2 overdue",           gradient:"bg-gradient-to-br from-red-600 to-red-500",        icon:AlertTriangle },
        { label:"Scrap Cost",        value:"₹2.8L", sub:"This month",          gradient:"bg-gradient-to-br from-amber-500 to-orange-500",   icon:DollarSign },
      ]}/>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["inspection","capa","compliance"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="inspection"?"Inspection Plans":t==="capa"?"CAPA Dashboard":"Compliance & Audit"}
          </button>
        ))}
      </div>

      {tab==="inspection"&&(
        <>
          <InteractiveTable title="Inspection Management" data={mappedInspections} searchKeys={["product","inspector","result","batch"]}
            onRowClick={(r)=>{ setDrawerType("inspection"); setDrawer(insRecords.find(x=>x.id===r.id)||r); }} onAdd={()=>setModal("inspection")} addLabel="New Inspection"
            columns={[
              { key:"id",        label:"ID",         render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
              { key:"product",   label:"Product",    render:r=><span className="font-bold text-foreground">{r.product}</span> },
              { key:"batch",     label:"Batch",      render:r=><span className="text-xs font-mono text-muted-foreground">{r.batch}</span> },
              { key:"inspector", label:"Inspector",  render:r=><span className="text-xs text-muted-foreground">{r.inspector}</span> },
              { key:"samples",   label:"Samples",    render:r=><span className="text-xs font-mono text-foreground">{r.samples}</span> },
              { key:"defects",   label:"Defects",    render:r=><span className={`text-xs font-bold font-mono ${r.defects>0?"text-red-500":"text-emerald-600"}`}>{r.defects}</span> },
              { key:"result",    label:"Result",     render:r=><Badge status={r.result}/> },
              { key:"date",      label:"Date",       render:r=><span className="text-xs text-muted-foreground">{r.date}</span> },
            ]}/>
          {modal==="inspection"&&<CreateEditModal title="New Inspection Plan" onClose={()=>setModal(false)} 
            onSave={(d)=>{ 
              createIns({
                product: d.product, batch: d.batch, inspector: d.inspector,
                samplesChecked: Number(d.samples||0), defects: 0,
                result: 'Pending', date: d.date || new Date().toISOString().split('T')[0], notes: ''
              });
              refreshIns(); setModal(false); toast.success("Inspection created");
            }}
            fields={[
              { key:"product",   label:"Product",   type:"select", options:["Engine Block EV-7","Wiring Harness 220V","Brake Caliper Set","Suspension Kit A2"] },
              { key:"batch",     label:"Batch No."  },
              { key:"inspector", label:"Inspector",  type:"select", options:["Meena P.","Raj K.","Suresh V."] },
              { key:"samples",   label:"Sample Size",type:"number" },
              { key:"date",      label:"Date",       type:"date"   },
            ]}/>}
        </>
      )}

      {tab==="capa"&&(
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label:"Total CAPAs",    value:"24", sub:"This quarter",   color:"bg-blue-50 dark:bg-blue-900/20",    text:"text-blue-700 dark:text-blue-300" },
              { label:"Open",           value:"8",  sub:"Action required", color:"bg-red-50 dark:bg-red-900/20",      text:"text-red-700 dark:text-red-300" },
              { label:"In Progress",    value:"6",  sub:"On track",        color:"bg-amber-50 dark:bg-amber-900/20",  text:"text-amber-700 dark:text-amber-300" },
              { label:"Closed",         value:"10", sub:"Verified",        color:"bg-emerald-50 dark:bg-emerald-900/20",text:"text-emerald-700 dark:text-emerald-300" },
            ].map((s,i)=>(
              <div key={i} className={`${s.color} rounded-2xl p-4`}>
                <p className={`text-2xl font-black ${s.text}`} style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{s.value}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
          <InteractiveTable title="CAPA Dashboard" data={mappedCapas} searchKeys={["id","issue","status","severity","owner"]}
            onRowClick={(r)=>{ setDrawerType("capa"); setDrawer(capaRecords.find(x=>x.id===r.id)||r); }} onAdd={()=>setModal("capa")} addLabel="New CAPA"
            columns={[
              { key:"id",       label:"CAPA ID",   render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
              { key:"issue",    label:"Issue",     render:r=><span className="text-sm font-semibold text-foreground">{r.issue}</span> },
              { key:"source",   label:"Source",    render:r=><span className="text-xs text-muted-foreground">{r.source}</span> },
              { key:"severity", label:"Severity",  render:r=><span className={`text-xs px-2 py-0.5 rounded-md font-bold ${severityStyle[r.severity]||""}`}>{r.severity}</span> },
              { key:"status",   label:"Status",    render:r=><Badge status={r.status}/> },
              { key:"owner",    label:"Owner",     render:r=><span className="text-xs text-muted-foreground">{r.owner}</span> },
              { key:"due",      label:"Due Date",  render:r=><span className="text-xs text-muted-foreground">{r.due}</span> },
            ]}/>
          {modal==="capa"&&<CreateEditModal title="New CAPA Record" onClose={()=>setModal(false)}
            onSave={(d)=>{
              createCapa({
                issue: d.issue, source: (d.source as any) || 'Inspection', severity: (d.severity as any) || 'Minor',
                status: 'Open', owner: d.owner, dueDate: d.due, action: d.action
              });
              refreshCapa(); setModal(false); toast.success("CAPA record created");
            }}
            fields={[
              { key:"issue", label:"Issue Description", required:true },
              { key:"source", label:"Source", type:"select", options:["Inspection","Customer","Audit","Lab Test"] },
              { key:"severity", label:"Severity", type:"select", options:["Critical","Major","Minor"] },
              { key:"owner", label:"Owner", required:true },
              { key:"due", label:"Due Date", type:"date" },
              { key:"action", label:"Action Plan", required:true }
            ]}/>}
        </div>
      )}

      {tab==="compliance"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Compliance Status</h3>
            <div className="flex flex-col gap-3">
              {[
                { name:"ISO 9001:2015",       status:"Certified", expiry:"Mar 2026",   badge:"bg-emerald-100 text-emerald-700" },
                { name:"ISO 14001:2015",      status:"Certified", expiry:"Jun 2025",   badge:"bg-emerald-100 text-emerald-700" },
                { name:"IATF 16949",          status:"In Review",expiry:"Dec 2024",   badge:"bg-amber-100 text-amber-700" },
                { name:"BIS Certification",   status:"Certified", expiry:"Oct 2025",   badge:"bg-emerald-100 text-emerald-700" },
                { name:"CE Marking",          status:"Pending",   expiry:"—",          badge:"bg-slate-100 text-slate-600" },
              ].map((c,i)=>(
                <motion.div key={i} whileHover={{ x:2 }} onClick={()=>toast.success(`Opening ${c.name} certification details`)}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Shield size={14} className="text-blue-600"/></div>
                  <div className="flex-1"><p className="text-sm font-bold text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">Expires: {c.expiry}</p></div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${c.badge}`}>{c.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Upcoming Audits</h3>
            <div className="flex flex-col gap-3">
              {[
                { audit:"Internal Quality Audit",    date:"05 Jul 2024", dept:"Production",  auditor:"Lata K." },
                { audit:"Supplier Audit — Steel Corp",date:"10 Jul 2024",dept:"Procurement", auditor:"Meena P." },
                { audit:"ISO 9001 Surveillance",     date:"15 Aug 2024", dept:"QA Dept",     auditor:"External" },
              ].map((a,i)=>(
                <motion.div key={i} whileHover={{ x:2 }} onClick={()=>toast.success(`Opening audit: ${a.audit}`)}
                  className="flex items-start gap-3 p-3 border border-border rounded-xl hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0"><Calendar size={14} className="text-violet-600"/></div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{a.audit}</p>
                    <p className="text-xs text-muted-foreground">{a.date} · {a.dept} · {a.auditor}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {drawer&&<DetailDrawer item={drawer} type="Quality Record" onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ─── Procurement Module ───────────────────────────────────────────────────────

const vendors = [
  { id:"VND-1021", name:"Steel Corp India",   category:"Raw Materials",  rating:4.8, orders:42, value:"₹1.8 Cr", status:"Active",   contact:"Raj Mehta",   lead:"7 days" },
  { id:"VND-1022", name:"Bosch India",        category:"Components",     rating:4.6, orders:28, value:"₹92L",    status:"Active",   contact:"Priya Jain",  lead:"14 days" },
  { id:"VND-1023", name:"Siemens Ltd.",       category:"Electronics",    rating:4.4, orders:18, value:"₹64L",    status:"Active",   contact:"Anand Rao",   lead:"21 days" },
  { id:"VND-1024", name:"BASF India",         category:"Raw Materials",  rating:4.2, orders:12, value:"₹44L",    status:"Active",   contact:"Suman Das",   lead:"10 days" },
  { id:"VND-1025", name:"Atlas Copco",        category:"Equipment",      rating:3.9, orders:8,  value:"₹28L",    status:"On Hold",  contact:"Vikram P.",   lead:"30 days" },
  { id:"VND-1026", name:"SKF India",          category:"Components",     rating:4.7, orders:35, value:"₹78L",    status:"Active",   contact:"Nisha Gupta", lead:"5 days" },
];

const purchaseOrders = [
  { id:"PO-7743", vendor:"Steel Corp India",  item:"Steel Grade A Sheets",  qty:"500 MT",  value:"₹48.2L", status:"Approved",  due:"30 Jun", raised:"20 Jun", approver:"Rahul V." },
  { id:"PO-7744", vendor:"Bosch India",       item:"Fuel Injectors Set",    qty:"200 pcs", value:"₹22.6L", status:"Pending",   due:"02 Jul", raised:"22 Jun", approver:"Pending" },
  { id:"PO-7748", vendor:"Siemens Ltd.",      item:"Drive Controllers",     qty:"50 units",value:"₹18.4L", status:"Approved",  due:"05 Jul", raised:"21 Jun", approver:"Rahul V." },
  { id:"PO-7751", vendor:"ABB Automation",    item:"VFD Units 45kW",        qty:"10 units",value:"₹14.8L", status:"Received",  due:"08 Jul", raised:"18 Jun", approver:"Rahul V." },
  { id:"PO-7755", vendor:"Honeywell India",   item:"Pressure Sensors",      qty:"100 pcs", value:"₹12.1L", status:"Pending",   due:"10 Jul", raised:"24 Jun", approver:"Pending" },
  { id:"PO-7760", vendor:"Atlas Copco",       item:"Air Compressor 15HP",   qty:"2 units", value:"₹10.8L", status:"On Hold",   due:"12 Jul", raised:"23 Jun", approver:"—" },
];

function ProcurementModule() {
  const [tab,setTab]=useState<"vendors"|"pos"|"rfq">("vendors");
  const [drawer,setDrawer]=useState<any>(null);
  const [modal,setModal]=useState(false);
  const [approveTarget,setApproveTarget]=useState<any>(null);
  const [rejectTarget,setRejectTarget]=useState<any>(null);

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Active Vendors",  value:"48",    sub:"6 new this month",  gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Users },
        { label:"Open POs",        value:"18",    sub:"₹1.27 Cr pending",  gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Package },
        { label:"RFQs Active",     value:"7",     sub:"3 closing today",   gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:FileText },
        { label:"Savings MTD",     value:"₹8.4L", sub:"vs last month",     gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:TrendingDown },
      ]}/>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["vendors","pos","rfq"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="vendors"?"Vendor Master":t==="pos"?"Purchase Orders":"RFQ Management"}
          </button>
        ))}
      </div>

      {tab==="vendors"&&(
        <>
          <InteractiveTable title="Vendor Master" data={vendors} searchKeys={["name","category","status"]}
            onRowClick={setDrawer} onAdd={()=>setModal(true)} addLabel="Add Vendor"
            columns={[
              { key:"id",       label:"Vendor ID", render:r=><span className="text-xs font-mono text-muted-foreground">{r.id}</span> },
              { key:"name",     label:"Vendor",    render:r=><span className="font-bold text-foreground">{r.name}</span> },
              { key:"category", label:"Category",  render:r=><span className="text-xs text-muted-foreground">{r.category}</span> },
              { key:"rating",   label:"Rating",    render:r=>(
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-amber-500 fill-amber-500"/>
                    <span className="text-xs font-bold text-foreground">{r.rating}</span>
                  </div>)},
              { key:"orders",   label:"Orders",    render:r=><span className="text-xs font-mono text-foreground">{r.orders}</span> },
              { key:"value",    label:"Total Value",render:r=><span className="text-xs font-mono font-extrabold text-foreground">{r.value}</span> },
              { key:"lead",     label:"Lead Time", render:r=><span className="text-xs text-muted-foreground">{r.lead}</span> },
              { key:"status",   label:"Status",    render:r=><Badge status={r.status}/> },
            ]}/>
          {modal&&<CreateEditModal title="Add New Vendor" onClose={()=>setModal(false)} onSave={d=>toast.success(`Vendor ${d.name||"added"} successfully`)}
            fields={[
              { key:"name",     label:"Vendor Name" },{ key:"category",label:"Category",type:"select",options:["Raw Materials","Components","Electronics","Equipment","Services"] },
              { key:"contact",  label:"Contact Person" },{ key:"phone", label:"Phone" },
              { key:"email",    label:"Email" },{ key:"lead",label:"Lead Time (days)",type:"number" },
            ]}/>}
        </>
      )}

      {tab==="pos"&&(
        <InteractiveTable title="Purchase Orders" data={purchaseOrders} searchKeys={["id","vendor","item","status"]}
          onRowClick={setDrawer} onAdd={()=>toast.success("New PO form opened")} addLabel="Create PO"
          columns={[
            { key:"id",       label:"PO No.",    render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
            { key:"vendor",   label:"Vendor",    render:r=><span className="font-bold text-foreground">{r.vendor}</span> },
            { key:"item",     label:"Item",      render:r=><span className="text-sm text-muted-foreground">{r.item}</span> },
            { key:"qty",      label:"Qty",       render:r=><span className="text-xs font-mono text-foreground">{r.qty}</span> },
            { key:"value",    label:"Value",     render:r=><span className="text-xs font-mono font-extrabold text-foreground">{r.value}</span> },
            { key:"status",   label:"Status",    render:r=><Badge status={r.status}/> },
            { key:"due",      label:"Due Date",  render:r=><span className="text-xs text-muted-foreground">{r.due}</span> },
            { key:"approver", label:"Approver",  render:r=>(
                r.status==="Pending" ? (
                  <div className="flex gap-1">
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                      onClick={e=>{ e.stopPropagation(); setApproveTarget(r); }}
                      className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-0.5 rounded-lg font-bold transition-colors">Approve</motion.button>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                      onClick={e=>{ e.stopPropagation(); setRejectTarget(r); }}
                      className="text-[10px] bg-red-100 text-red-700 hover:bg-red-200 px-2 py-0.5 rounded-lg font-bold transition-colors">Reject</motion.button>
                  </div>
                ) : <span className="text-xs text-muted-foreground">{r.approver}</span>
            )},
          ]}/>
      )}
      {approveTarget&&<ApproveModal title="Purchase Order" recordId={approveTarget.id} onClose={()=>setApproveTarget(null)}/>}
      {rejectTarget&&<RejectModal title="Purchase Order" recordId={rejectTarget.id} onClose={()=>setRejectTarget(null)}/>}

      {tab==="rfq"&&(
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Active RFQs</h3>
            <PrimaryBtn icon={Plus} size="sm" onClick={()=>toast.success("New RFQ created")}>Create RFQ</PrimaryBtn>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { id:"RFQ-2024-041", item:"Polymer Resin P-340 — 2000 MT",  vendors:4, responses:3, closing:"29 Jun", status:"Open",   best:"BASF India — ₹52L" },
              { id:"RFQ-2024-042", item:"Electronic Control Units — 200",  vendors:5, responses:2, closing:"30 Jun", status:"Open",   best:"Siemens — ₹38L" },
              { id:"RFQ-2024-040", item:"Precision Bearings 6205 — 500",   vendors:3, responses:3, closing:"27 Jun", status:"Closed", best:"SKF India — ₹14.2L" },
              { id:"RFQ-2024-038", item:"Aluminium Extrusion AL6 — 1 MT",  vendors:6, responses:6, closing:"25 Jun", status:"Closed", best:"Hindalco — ₹22L" },
            ].map((r,i)=>(
              <motion.div key={i} whileHover={{ x:2 }} onClick={()=>toast.success(`Opening RFQ: ${r.id}`)}
                className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span>
                    <Badge status={r.status}/>
                  </div>
                  <p className="text-sm font-bold text-foreground">{r.item}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.responses}/{r.vendors} responses · Closing: {r.closing}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Best Quote</p>
                  <p className="text-sm font-bold text-emerald-600">{r.best}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {drawer&&<DetailDrawer item={drawer} type="Procurement Record" onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ─── Reports Module (with sub-report tabs) ────────────────────────────────────

function ReportsModuleFull({ onNavigate }: { onNavigate:(m:ModuleId)=>void }) {
  const [tab,setTab]=useState<"overview"|"sales"|"inventory"|"finance"|"production"|"quality"|"hr">("overview");
  const [aiModal, setAiModal] = useState(false);

  const salesByMonth=revenueData.slice(-6);

  const reportTabs=[
    { key:"overview"   as const,label:"Overview" },
    { key:"sales"      as const,label:"Sales" },
    { key:"inventory"  as const,label:"Inventory" },
    { key:"finance"    as const,label:"Finance" },
    { key:"production" as const,label:"Production" },
    { key:"quality"    as const,label:"Quality" },
    { key:"hr"         as const,label:"HR" },
  ];

  const inventoryValData=[
    { cat:"Raw Material",value:28.4 },{ cat:"WIP",value:8.2 },
    { cat:"Finished",value:9.6 },{ cat:"Spares",value:2.0 },
  ];

  const hrAttendance=[
    { dept:"Sales",present:98,absent:2 },{ dept:"Manufacturing",present:94,absent:6 },
    { dept:"Finance",present:91,absent:9 },{ dept:"HR",present:96,absent:4 },{ dept:"IT",present:100,absent:0 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Scheduled Reports",value:"28",    sub:"Next: Today 6 PM",  gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Clock },
        { label:"Reports Generated",value:"1,284", sub:"This month",        gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:BarChart2 },
        { label:"BI Dashboards",    value:"14",    sub:"7 shared",          gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:PieChart },
        { label:"AI Reports",       value:"48",    sub:"Auto-generated",    gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:Sparkles },
      ]}/>

      <div className="flex gap-1 bg-muted rounded-xl p-1 flex-wrap">
        {reportTabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${tab===t.key?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="overview"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Revenue 12M</h3>
            <ResponsiveContainer width="100%" height={220}>
              <ReLineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="month" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}Cr`}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ fill:"#2563EB",r:3 }}/>
                <Line type="monotone" dataKey="profit" stroke="#22C55E" strokeWidth={2.5} dot={{ fill:"#22C55E",r:3 }}/>
              </ReLineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Quick Reports</h3>
              <PrimaryBtn icon={Plus} size="sm" onClick={()=>setAiModal(true)}>AI Report</PrimaryBtn>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { name:"P&L Statement",         type:"Finance",       mod:"finance"        as ModuleId },
                { name:"Balance Sheet",          type:"Finance",       mod:"finance"        as ModuleId },
                { name:"Sales by Region",        type:"Sales",         mod:"sales"          as ModuleId },
                { name:"Inventory Valuation",    type:"Inventory",     mod:"inventory"      as ModuleId },
                { name:"Production Efficiency",  type:"Manufacturing", mod:"manufacturing"  as ModuleId },
                { name:"HR Headcount",           type:"HR",            mod:"hrms"           as ModuleId },
              ].map((r,i)=>(
                <motion.div key={i} whileHover={{ x:3 }} onClick={()=>{ onNavigate(r.mod); toast.success(`Opening ${r.name}…`); }}
                  className="flex items-center gap-3 p-2.5 border border-border rounded-xl hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 transition-colors"><FileText size={13} className="text-blue-600"/></div>
                  <span className="text-sm font-semibold text-foreground flex-1">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.type}</span>
                  <Download size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>{ 
                    e.stopPropagation(); 
                    const blob = new Blob([`Report: ${r.name}\nGenerated on: ${new Date().toISOString()}`], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${r.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
                    a.click();
                    toast.success(`Downloaded ${r.name}`); 
                  }}/>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="sales"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Monthly Sales vs Target</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="revenue" name="Revenue (Cr)" fill="#2563EB" radius={[6,6,0,0]}/>
                <Bar dataKey="profit"  name="Profit (Cr)"  fill="#22C55E" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Top Customers</h3>
            <div className="flex flex-col gap-2">
              {[{ name:"Tata Motors",   val:"₹3.2 Cr",pct:25,color:"#2563EB" },{ name:"Mahindra",      val:"₹2.8 Cr",pct:22,color:"#22C55E" },
                { name:"Infosys BPO",  val:"₹1.9 Cr",pct:15,color:"#8B5CF6" },{ name:"Air India",     val:"₹1.6 Cr",pct:12,color:"#F59E0B" },
                { name:"Others",       val:"₹3.3 Cr",pct:26,color:"#64748B" }].map((c,i)=>(
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-foreground">{c.name}</span><span className="font-bold text-foreground">{c.val}</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><motion.div initial={{ width:0 }} animate={{ width:`${c.pct}%` }} transition={{ duration:0.8,delay:i*0.1 }} className="h-full rounded-full" style={{ background:c.color }}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="inventory"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Stock Value by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={inventoryValData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}Cr`}/>
                <YAxis dataKey="cat" type="category" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="value" name="Value (Cr)" fill="#2563EB" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Stock Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RePieChart>
                <Pie data={[{ name:"Normal",value:68,color:"#22C55E" },{ name:"Low",value:24,color:"#F59E0B" },{ name:"Critical",value:8,color:"#EF4444" }]}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                  {[{ color:"#22C55E" },{ color:"#F59E0B" },{ color:"#EF4444" }].map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs mt-2">
              {[{ label:"Normal",color:"bg-emerald-500",v:"68%" },{ label:"Low",color:"bg-amber-500",v:"24%" },{ label:"Critical",color:"bg-red-500",v:"8%" }].map((s,i)=>(
                <div key={i} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 rounded-full ${s.color}`}/><span className="text-muted-foreground">{s.label}</span><span className="font-bold text-foreground">{s.v}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="finance"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData.slice(-6)}>
                <defs>
                  <linearGradient id="rG2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                  <linearGradient id="eG2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="month" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#rG2)"/>
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#eG2)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Financial Summary</h3>
            <div className="flex flex-col gap-3">
              {[
                { label:"Gross Revenue",     value:"₹128.4 Cr", pct:100,  color:"bg-blue-500" },
                { label:"Cost of Goods",     value:"₹72.2 Cr",  pct:56.2, color:"bg-red-400" },
                { label:"Gross Profit",      value:"₹56.2 Cr",  pct:43.8, color:"bg-emerald-500" },
                { label:"Operating Expenses",value:"₹21.5 Cr",  pct:16.7, color:"bg-amber-500" },
                { label:"Net Profit",        value:"₹20.8 Cr",  pct:16.2, color:"bg-violet-500" },
              ].map((s,i)=>(
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-foreground">{s.label}</span><span className="font-extrabold text-foreground">{s.value}</span></div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden"><motion.div initial={{ width:0 }} animate={{ width:`${s.pct}%` }} transition={{ duration:0.8,delay:i*0.1 }} className={`h-full rounded-full ${s.color}`}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="production"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Weekly Production</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="planned" name="Planned" fill="#E0E7FF" radius={[4,4,0,0]}/>
                <Bar dataKey="actual"  name="Actual"  fill="#2563EB" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>OEE Breakdown</h3>
            <div className="flex items-center justify-around py-4">
              <RadialGauge value={94} label="Availability" sublabel="Uptime ratio" color="#2563EB"/>
              <RadialGauge value={92} label="Performance" sublabel="Speed ratio" color="#22C55E"/>
              <RadialGauge value={99} label="Quality" sublabel="Yield ratio" color="#8B5CF6"/>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 font-semibold text-center">
              Overall OEE: 87.4% — Above industry average of 65%
            </div>
          </div>
        </div>
      )}

      {tab==="quality"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Pass/Fail Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[{ w:"W23",pass:94,fail:6 },{ w:"W24",pass:96,fail:4 },{ w:"W25",pass:91,fail:9 },{ w:"W26",pass:93,fail:7 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="w" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="pass" name="Pass %" fill="#22C55E" radius={[4,4,0,0]}/>
                <Bar dataKey="fail" name="Fail %" fill="#EF4444" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Defect Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RePieChart>
                <Pie data={[{ name:"Dimensional",value:35,color:"#EF4444" },{ name:"Surface",value:28,color:"#F59E0B" },{ name:"Functional",value:22,color:"#8B5CF6" },{ name:"Visual",value:15,color:"#2563EB" }]}
                  cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {[{ color:"#EF4444" },{ color:"#F59E0B" },{ color:"#8B5CF6" },{ color:"#2563EB" }].map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab==="hr"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Attendance by Department</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hrAttendance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`}/>
                <YAxis dataKey="dept" type="category" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Bar dataKey="present" name="Present %" fill="#22C55E" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Headcount & Attrition</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[{ label:"Total Headcount",v:"1,284",color:"text-blue-600" },{ label:"New Joinees (Jun)",v:"12",color:"text-emerald-600" },{ label:"Attrition Rate",v:"3.2%",color:"text-amber-600" },{ label:"Avg Tenure",v:"4.2 yrs",color:"text-violet-600" }].map((s,i)=>(
                <div key={i} className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className={`text-xl font-black ${s.color}`} style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{s.v}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Payroll MTD: ₹9.84 Crore · Disbursed on 28 Jun</p>
            </div>
          </div>
        </div>
      )}
      {aiModal && <AIReportModal onClose={() => setAiModal(false)} />}
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ title,body,onConfirm,onCancel }: {
  title:string; body:string; onConfirm:()=>void; onCancel:()=>void;
}) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
        <motion.div initial={{ opacity:0,scale:0.9,y:16 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.9 }}
          transition={{ type:"spring",damping:22,stiffness:300 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
          <div className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} className="text-red-600"/>
            </div>
            <div>
              <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{body}</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 pt-0">
            <SecondaryBtn onClick={onCancel}>Cancel</SecondaryBtn>
            <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.97 }} onClick={()=>{ onConfirm(); onCancel(); }}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-2 rounded-xl text-sm transition-colors shadow-sm">
              Delete Record
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────

function FilterDrawer({ title,fields,onClose,onApply }: {
  title:string; fields:{ label:string; options:string[] }[];
  onClose:()=>void; onApply:(filters:Record<string,string>)=>void;
}) {
  const [values,setValues]=useState<Record<string,string>>({});
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
        <motion.div initial={{ x:320 }} animate={{ x:0 }} exit={{ x:320 }} transition={{ type:"spring",damping:26,stiffness:220 }}
          className="w-full sm:w-80 bg-card h-full shadow-2xl border-l border-border flex flex-col" onClick={e=>e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>
              <SlidersHorizontal size={14} className="inline mr-2 text-blue-600"/>Filters — {title}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors"><X size={14} className="text-muted-foreground"/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5" style={{ scrollbarWidth:"none" }}>
            {fields.map(f=>(
              <div key={f.label}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{f.label}</label>
                <div className="flex flex-wrap gap-2">
                  {f.options.map(o=>(
                    <motion.button key={o} whileTap={{ scale:0.95 }} onClick={()=>setValues(v=>({...v,[f.label]:v[f.label]===o?"":o}))}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${values[f.label]===o?"bg-blue-600 text-white border-blue-600 shadow-sm":"border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600"}`}>
                      {o}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-border flex gap-3">
            <SecondaryBtn onClick={()=>{ setValues({}); }}>Reset All</SecondaryBtn>
            <PrimaryBtn onClick={()=>{ onApply(values); onClose(); toast.success("Filters applied"); }}>Apply Filters</PrimaryBtn>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Projects Module ──────────────────────────────────────────────────────────

const projectTasks = [
  { id:"TSK-001",title:"Set up development environment",  project:"ERP Phase 2",  assignee:"Vikram J.", priority:"High",   status:"Done",        due:"20 Jun",comments:3,attach:2 },
  { id:"TSK-002",title:"Design new module UI wireframes",  project:"ERP Phase 2",  assignee:"Priya S.",  priority:"High",   status:"In Progress", due:"28 Jun",comments:7,attach:4 },
  { id:"TSK-003",title:"Integrate payment gateway API",    project:"ERP Phase 2",  assignee:"Vikram J.", priority:"Medium", status:"In Progress", due:"30 Jun",comments:2,attach:1 },
  { id:"TSK-004",title:"Write test cases for Sales module",project:"ERP Phase 2",  assignee:"Meena P.", priority:"Low",    status:"Todo",        due:"05 Jul",comments:0,attach:0 },
  { id:"TSK-005",title:"Migrate legacy data to new schema",project:"Data Migration",assignee:"Rahul V.", priority:"High",   status:"Todo",        due:"10 Jul",comments:5,attach:3 },
  { id:"TSK-006",title:"User acceptance testing — Round 1",project:"ERP Phase 2",  assignee:"Priya S.", priority:"Medium", status:"Todo",        due:"15 Jul",comments:1,attach:0 },
];

const projectList = [
  { id:"PRJ-001",name:"ERP Phase 2 Rollout",   manager:"Nitin Shah",  tasks:24,done:14,budget:"₹42L",  status:"On Track",  due:"31 Aug 2024" },
  { id:"PRJ-002",name:"Data Migration Project", manager:"Rahul Verma", tasks:12,done:3, budget:"₹18L",  status:"At Risk",   due:"30 Jul 2024" },
  { id:"PRJ-003",name:"Mobile App Development", manager:"Vikram J.",   tasks:38,done:28,budget:"₹85L",  status:"On Track",  due:"30 Nov 2024" },
  { id:"PRJ-004",name:"ISO Compliance Drive",   manager:"Meena P.",    tasks:8, done:8, budget:"₹12L",  status:"Completed", due:"15 Jun 2024" },
];

function ProjectsModule() {
  const [view,setView]=useState<"board"|"list">("board");
  const [drawer,setDrawer]=useState<any>(null);

  const columns=[
    { status:"Todo",       color:"bg-slate-50 dark:bg-slate-800",   border:"border-slate-200 dark:border-slate-700" },
    { status:"In Progress",color:"bg-blue-50 dark:bg-blue-900/20",  border:"border-blue-200 dark:border-blue-800" },
    { status:"Done",       color:"bg-emerald-50 dark:bg-emerald-900/20",border:"border-emerald-200 dark:border-emerald-800" },
  ];

  const priorityColor: Record<string,string>={ High:"text-red-600",Medium:"text-amber-600",Low:"text-slate-500" };

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Active Projects", value:"4",  sub:"2 on track",      gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:FolderKanban },
        { label:"Total Tasks",     value:"82", sub:"43 completed",    gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:CheckCircle2 },
        { label:"Team Members",    value:"12", sub:"Across 4 projects",gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Users },
        { label:"Budget Used",     value:"62%",sub:"₹97L of ₹157L",  gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:DollarSign },
      ]}/>

      {/* Project selector */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Projects</h3>
          <div className="flex gap-2">
            <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
              <button onClick={()=>setView("board")} className={`text-xs px-3 py-1 rounded-md font-semibold transition-all ${view==="board"?"bg-card text-foreground shadow-sm":"text-muted-foreground"}`}>Board</button>
              <button onClick={()=>setView("list")} className={`text-xs px-3 py-1 rounded-md font-semibold transition-all ${view==="list"?"bg-card text-foreground shadow-sm":"text-muted-foreground"}`}>List</button>
            </div>
            <PrimaryBtn icon={Plus} size="sm" onClick={()=>toast.success("New project form opened")}>New Project</PrimaryBtn>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {projectList.map((p,i)=>(
            <motion.div key={i} whileHover={{ y:-2,boxShadow:"0 8px 24px -4px rgba(0,0,0,0.12)" }}
              onClick={()=>setDrawer(p)}
              className="border border-border rounded-xl p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{p.id}</span>
                <Badge status={p.status}/>
              </div>
              <p className="text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.manager} · Due {p.due}</p>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width:0 }} animate={{ width:`${(p.done/p.tasks)*100}%` }} transition={{ duration:0.8 }}
                  className="h-full rounded-full bg-blue-500"/>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.done}/{p.tasks} tasks · {p.budget}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      {view==="board"&&(
        <div>
          <h3 className="font-bold text-foreground mb-3" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Task Board — ERP Phase 2 Rollout</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth:"none" }}>
            {columns.map(col=>(
              <div key={col.status} className={`flex-shrink-0 w-72 snap-start rounded-2xl border ${col.border} ${col.color} p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{col.status}</h4>
                  <span className="text-xs bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded-full font-semibold text-foreground">
                    {projectTasks.filter(t=>t.status===col.status).length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {projectTasks.filter(t=>t.status===col.status).map((task,i)=>(
                    <motion.div key={i} whileHover={{ scale:1.02,boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}
                      onClick={()=>setDrawer(task)}
                      className="bg-card border border-border rounded-xl p-3 cursor-pointer shadow-sm">
                      <p className="text-xs font-mono text-muted-foreground mb-1">{task.id}</p>
                      <p className="text-sm font-semibold text-foreground leading-snug">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{task.project}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[8px] font-bold">
                            {task.assignee.split(" ").map(n=>n[0]).join("")}
                          </div>
                          <span className={`text-xs font-semibold ${priorityColor[task.priority]}`}>{task.priority}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.comments>0&&<span className="flex items-center gap-0.5"><MessageSquare size={10}/>{task.comments}</span>}
                          {task.attach>0&&<span className="flex items-center gap-0.5"><Paperclip size={10}/>{task.attach}</span>}
                          <span>{task.due}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <motion.button whileHover={{ scale:1.02 }} onClick={()=>toast.success("New task form opened")}
                    className="w-full border-2 border-dashed border-border rounded-xl p-2.5 text-xs text-muted-foreground hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
                    <Plus size={11}/> Add Task
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="list"&&(
        <InteractiveTable title="All Tasks" data={projectTasks} searchKeys={["title","project","assignee","status","priority"]}
          onRowClick={setDrawer} onAdd={()=>toast.success("New task created")} addLabel="New Task"
          columns={[
            { key:"id",       label:"ID",       render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
            { key:"title",    label:"Task",      render:r=><span className="font-semibold text-foreground">{r.title}</span> },
            { key:"project",  label:"Project",   render:r=><span className="text-xs text-muted-foreground">{r.project}</span> },
            { key:"assignee", label:"Assignee",  render:r=><span className="text-xs text-muted-foreground">{r.assignee}</span> },
            { key:"priority", label:"Priority",  render:r=><span className={`text-xs font-bold ${priorityColor[r.priority]}`}>{r.priority}</span> },
            { key:"status",   label:"Status",    render:r=><Badge status={r.status}/> },
            { key:"due",      label:"Due",       render:r=><span className="text-xs text-muted-foreground">{r.due}</span> },
          ]}/>
      )}

      {drawer&&<DetailDrawer item={drawer} type="Project Record" onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ─── Payroll Module ───────────────────────────────────────────────────────────

const payrollData = [
  { id:"PAY-1001",name:"Priya Sharma",   dept:"Sales",        basic:"₹40,000",hra:"₹16,000",special:"₹9,000", pf:"₹4,800",esi:"₹1,400",tds:"₹2,100",gross:"₹65,000",net:"₹56,700",status:"Paid" },
  { id:"PAY-1002",name:"Rahul Verma",    dept:"Procurement",  basic:"₹52,000",hra:"₹20,800",special:"₹9,200", pf:"₹6,240",esi:"₹0",    tds:"₹3,800",gross:"₹82,000",net:"₹71,960",status:"Paid" },
  { id:"PAY-1003",name:"Anita Joshi",    dept:"Manufacturing",basic:"₹48,000",hra:"₹16,000",special:"₹10,000",pf:"₹5,760",esi:"₹0",    tds:"₹2,900",gross:"₹74,000",net:"₹65,340",status:"Paid" },
  { id:"PAY-1004",name:"Karan Singh",    dept:"Finance",      basic:"₹56,000",hra:"₹22,400",special:"₹9,600", pf:"₹6,720",esi:"₹0",    tds:"₹5,200",gross:"₹88,000",net:"₹76,080",status:"Paid" },
  { id:"PAY-1005",name:"Deepa Nair",     dept:"HR",           basic:"₹46,000",hra:"₹18,400",special:"₹6,600", pf:"₹5,520",esi:"₹0",    tds:"₹2,600",gross:"₹71,000",net:"₹62,880",status:"Paid" },
  { id:"PAY-1006",name:"Vikram Joshi",   dept:"IT",           basic:"₹60,000",hra:"₹24,000",special:"₹8,000", pf:"₹7,200",esi:"₹0",    tds:"₹6,100",gross:"₹92,000",net:"₹78,700",status:"Pending" },
];

function PayrollModule() {
  const [tab,setTab]=useState<"payroll"|"analytics">("payroll");
  const [drawer,setDrawer]=useState<any>(null);
  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Payroll",    value:"₹9.84 Cr", sub:"June 2024",          gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:DollarSign },
        { label:"Employees Paid",   value:"1,276",    sub:"8 pending",           gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:UserCheck },
        { label:"PF Contribution",  value:"₹82.4L",   sub:"Employer + Employee", gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Shield },
        { label:"TDS Deducted",     value:"₹48.2L",   sub:"June 2024",           gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:CreditCard },
      ]}/>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["payroll","analytics"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="payroll"?"Payroll Register":"Analytics"}
          </button>
        ))}
      </div>

      {tab==="payroll"&&(
        <>
          <div className="flex justify-end gap-2">
            <SecondaryBtn icon={Download} onClick={()=>toast.success("Payroll exported to Excel")}>Export Excel</SecondaryBtn>
            <PrimaryBtn icon={Play} onClick={()=>toast.success("Payroll processing started for July 2024…")}>Run Payroll — Jul 2024</PrimaryBtn>
          </div>
          <InteractiveTable title="Payroll Register — June 2024" data={payrollData}
            searchKeys={["name","dept","status"]} onRowClick={setDrawer}
            columns={[
              { key:"id",     label:"Emp ID",   render:r=><span className="text-xs font-mono text-muted-foreground">{r.id}</span> },
              { key:"name",   label:"Employee", render:r=>(
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {r.name.split(" ").map((n:string)=>n[0]).join("")}
                    </div>
                    <span className="font-bold text-foreground">{r.name}</span>
                  </div>)},
              { key:"dept",   label:"Dept",     render:r=><span className="text-xs text-muted-foreground">{r.dept}</span> },
              { key:"basic",  label:"Basic",    render:r=><span className="text-xs font-mono text-foreground">{r.basic}</span> },
              { key:"gross",  label:"Gross",    render:r=><span className="text-xs font-mono font-bold text-foreground">{r.gross}</span> },
              { key:"pf",     label:"PF",       render:r=><span className="text-xs font-mono text-red-500">{r.pf}</span> },
              { key:"tds",    label:"TDS",      render:r=><span className="text-xs font-mono text-red-500">{r.tds}</span> },
              { key:"net",    label:"Net Pay",  render:r=><span className="text-xs font-mono font-extrabold text-emerald-600">{r.net}</span> },
              { key:"status", label:"Status",   render:r=><Badge status={r.status}/> },
            ]}/>
        </>
      )}

      {tab==="analytics"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Payroll Trend (6M)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ReLineChart data={[
                { m:"Jan",payroll:9.1 },{ m:"Feb",payroll:9.2 },{ m:"Mar",payroll:9.4 },
                { m:"Apr",payroll:9.5 },{ m:"May",payroll:9.7 },{ m:"Jun",payroll:9.84 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="m" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}Cr`}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Line type="monotone" dataKey="payroll" name="Payroll (Cr)" stroke="#2563EB" strokeWidth={2.5} dot={{ fill:"#2563EB",r:3 }}/>
              </ReLineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Department Breakdown</h3>
            <div className="flex flex-col gap-2.5">
              {[
                { dept:"Sales",        amt:"₹1.84 Cr",pct:19,color:"bg-blue-500" },
                { dept:"Manufacturing",amt:"₹2.12 Cr",pct:22,color:"bg-emerald-500" },
                { dept:"Finance",      amt:"₹1.28 Cr",pct:13,color:"bg-amber-500" },
                { dept:"HR",           amt:"₹0.94 Cr",pct:10,color:"bg-violet-500" },
                { dept:"IT",           amt:"₹1.42 Cr",pct:14,color:"bg-cyan-500" },
                { dept:"Others",       amt:"₹2.24 Cr",pct:22,color:"bg-slate-400" },
              ].map((d,i)=>(
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-foreground">{d.dept}</span>
                    <span className="font-bold text-foreground">{d.amt}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width:`${d.pct}%` }} transition={{ duration:0.7,delay:i*0.08 }}
                      className={`h-full rounded-full ${d.color}`}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {drawer&&<DetailDrawer item={drawer} type="Payroll Record" onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ─── Warehouse Module ─────────────────────────────────────────────────────────

const pickingOrders = [
  { id:"PCK-001", so:"SO-8821",  customer:"Tata Motors",    items:8,  picked:8,  zone:"Zone A",  picker:"Suresh K.", status:"Completed", due:"28 Jun" },
  { id:"PCK-002", so:"SO-8822",  customer:"Mahindra",       items:14, picked:9,  zone:"Zone B",  picker:"Raj V.",    status:"In Progress",due:"28 Jun" },
  { id:"PCK-003", so:"SO-8823",  customer:"Infosys BPO",    items:4,  picked:0,  zone:"Zone A",  picker:"—",         status:"Pending",    due:"29 Jun" },
  { id:"PCK-004", so:"SO-8824",  customer:"Apollo Hosp.",   items:22, picked:22, zone:"Zone C",  picker:"Suresh K.", status:"Completed",  due:"27 Jun" },
];

const receivingItems = [
  { id:"RCV-001", po:"PO-7743", vendor:"Steel Corp India",  items:"500 MT Steel Sheets",  date:"27 Jun", inspector:"Raj K.",   status:"Accepted",  qty:"500 MT" },
  { id:"RCV-002", po:"PO-7748", vendor:"Siemens Ltd.",      items:"50 Drive Controllers", date:"26 Jun", inspector:"Meena P.",  status:"QC Pending",qty:"50 units" },
  { id:"RCV-003", po:"PO-7751", vendor:"ABB Automation",    items:"10 VFD Units 45kW",    date:"25 Jun", inspector:"Raj K.",   status:"Accepted",  qty:"10 units" },
];

const dispatchItems = [
  { id:"DSP-001", so:"SO-8821", customer:"Tata Motors",    dest:"Pune Plant",    weight:"8.4 MT",  courier:"BlueDart", tracking:"BD9821441",status:"Dispatched",  date:"27 Jun" },
  { id:"DSP-002", so:"SO-8820", customer:"Mahindra",       dest:"Nashik Plant",  weight:"12.1 MT", courier:"DHL India",tracking:"DHL442901",status:"In Transit",  date:"26 Jun" },
  { id:"DSP-003", so:"SO-8818", customer:"BHEL",           dest:"Trichy Works",  weight:"24.8 MT", courier:"TCI Freight",tracking:"TCI88123",status:"Delivered",   date:"24 Jun" },
];

function WarehouseModule() {
  const [tab,setTab]=useState<"overview"|"receiving"|"picking"|"dispatch">("overview");
  const [drawer,setDrawer]=useState<any>(null);

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Today Receipts",  value:"3",     sub:"₹12.4L value",     gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Package },
        { label:"Picking Orders",  value:"12",    sub:"4 in progress",    gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:CheckSquare },
        { label:"Dispatched Today",value:"6",     sub:"84.2 MT shipped",  gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Truck },
        { label:"Space Utilization",value:"78%",  sub:"WH-01 · WH-02",   gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:Warehouse },
      ]}/>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit flex-wrap">
        {(["overview","receiving","picking","dispatch"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="overview"?"Overview":t==="receiving"?"Receiving":t==="picking"?"Picking & Packing":"Dispatch"}
          </button>
        ))}
      </div>

      {tab==="overview"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Warehouse Utilization</h3>
            {[
              { name:"WH-01 Mumbai", used:82, total:"12,000 sqft", items:3241 },
              { name:"WH-02 Pune",   used:68, total:"18,000 sqft", items:2812 },
              { name:"WH-03 Delhi",  used:71, total:"8,000 sqft",  items:2368 },
            ].map((w,i)=>(
              <div key={i} className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-foreground">{w.name}</span>
                  <span className="text-muted-foreground">{w.used}% full · {w.items.toLocaleString()} items</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${w.used}%` }} transition={{ duration:0.8,delay:i*0.1 }}
                    className={`h-full rounded-full ${w.used>80?"bg-amber-500":"bg-blue-500"}`}/>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{w.total}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Today's Activity</h3>
            <div className="flex flex-col gap-3">
              {[
                { time:"08:30",action:"Received PO-7743 — Steel Corp India",icon:Package,color:"bg-blue-500" },
                { time:"09:15",action:"Picking started — PCK-002 Mahindra",icon:CheckSquare,color:"bg-emerald-500" },
                { time:"10:00",action:"QC check — Siemens controllers",icon:Shield,color:"bg-violet-500" },
                { time:"11:30",action:"Dispatched DSP-001 — Tata Motors",icon:Truck,color:"bg-amber-500" },
                { time:"14:00",action:"Inventory count — Zone B",icon:Box,color:"bg-cyan-500" },
              ].map((a,i)=>(
                <motion.div key={i} whileHover={{ x:2 }} onClick={()=>toast.success(a.action)}
                  className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <a.icon size={12}/>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{a.time}</span>
                  <span className="text-xs font-medium text-foreground group-hover:text-blue-600 transition-colors">{a.action}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="receiving"&&(
        <InteractiveTable title="Receiving — Goods Inward" data={receivingItems}
          searchKeys={["id","po","vendor","status"]} onRowClick={setDrawer}
          onAdd={()=>toast.success("New GRN form opened")} addLabel="New GRN"
          columns={[
            { key:"id",       label:"GRN No.",   render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
            { key:"po",       label:"PO Ref.",   render:r=><span className="text-xs font-mono text-muted-foreground">{r.po}</span> },
            { key:"vendor",   label:"Vendor",    render:r=><span className="font-bold text-foreground">{r.vendor}</span> },
            { key:"items",    label:"Items",     render:r=><span className="text-sm text-muted-foreground">{r.items}</span> },
            { key:"qty",      label:"Quantity",  render:r=><span className="text-xs font-mono font-bold text-foreground">{r.qty}</span> },
            { key:"inspector",label:"Inspector", render:r=><span className="text-xs text-muted-foreground">{r.inspector}</span> },
            { key:"status",   label:"Status",    render:r=><Badge status={r.status}/> },
            { key:"date",     label:"Date",      render:r=><span className="text-xs text-muted-foreground">{r.date}</span> },
          ]}/>
      )}

      {tab==="picking"&&(
        <InteractiveTable title="Picking & Packing Orders" data={pickingOrders}
          searchKeys={["id","so","customer","status","zone"]} onRowClick={setDrawer}
          onAdd={()=>toast.success("New pick list created")} addLabel="New Pick List"
          columns={[
            { key:"id",      label:"Pick ID",  render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
            { key:"so",      label:"Sales Ord",render:r=><span className="text-xs font-mono text-muted-foreground">{r.so}</span> },
            { key:"customer",label:"Customer", render:r=><span className="font-bold text-foreground">{r.customer}</span> },
            { key:"items",   label:"Items",    render:r=>(
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width:`${(r.picked/r.items)*100}%` }}/>
                  </div>
                  <span className="text-xs font-mono">{r.picked}/{r.items}</span>
                </div>)},
            { key:"zone",    label:"Zone",    render:r=><span className="text-xs text-muted-foreground">{r.zone}</span> },
            { key:"picker",  label:"Picker",  render:r=><span className="text-xs text-muted-foreground">{r.picker}</span> },
            { key:"status",  label:"Status",  render:r=><Badge status={r.status}/> },
            { key:"due",     label:"Due",     render:r=><span className="text-xs text-muted-foreground">{r.due}</span> },
          ]}/>
      )}

      {tab==="dispatch"&&(
        <InteractiveTable title="Dispatch & Shipments" data={dispatchItems}
          searchKeys={["id","so","customer","status","courier"]} onRowClick={setDrawer}
          onAdd={()=>toast.success("New dispatch created")} addLabel="New Dispatch"
          columns={[
            { key:"id",       label:"Dispatch ID",render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
            { key:"so",       label:"SO Ref.",    render:r=><span className="text-xs font-mono text-muted-foreground">{r.so}</span> },
            { key:"customer", label:"Customer",   render:r=><span className="font-bold text-foreground">{r.customer}</span> },
            { key:"dest",     label:"Destination",render:r=><span className="text-xs text-muted-foreground">{r.dest}</span> },
            { key:"weight",   label:"Weight",     render:r=><span className="text-xs font-mono text-foreground">{r.weight}</span> },
            { key:"courier",  label:"Courier",    render:r=><span className="text-xs text-muted-foreground">{r.courier}</span> },
            { key:"tracking", label:"Tracking",   render:r=><span className="text-xs font-mono text-blue-600">{r.tracking}</span> },
            { key:"status",   label:"Status",     render:r=><Badge status={r.status}/> },
          ]}/>
      )}

      {drawer&&<DetailDrawer item={drawer} type="Warehouse Record" onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ─── Enhanced HRMS with tabs ──────────────────────────────────────────────────

const attendanceCalData = [
  { date:1,  status:"present" },{ date:2,  status:"present" },{ date:3,  status:"present" },
  { date:4,  status:"weekend" },{ date:5,  status:"weekend" },{ date:6,  status:"present" },
  { date:7,  status:"present" },{ date:8,  status:"absent"  },{ date:9,  status:"present" },
  { date:10, status:"present" },{ date:11, status:"present" },{ date:12, status:"weekend" },
  { date:13, status:"weekend" },{ date:14, status:"present" },{ date:15, status:"leave"   },
  { date:16, status:"leave"   },{ date:17, status:"present" },{ date:18, status:"present" },
  { date:19, status:"weekend" },{ date:20, status:"weekend" },{ date:21, status:"present" },
  { date:22, status:"present" },{ date:23, status:"present" },{ date:24, status:"present" },
  { date:25, status:"present" },{ date:26, status:"weekend" },{ date:27, status:"weekend" },
  { date:28, status:"present" },{ date:29, status:"present" },{ date:30, status:"present" },
];

const leaveRequests = [
  { id:"LV-001",emp:"Anita Joshi",    type:"Casual Leave",   from:"15 Jun",to:"16 Jun",days:2,reason:"Personal work",status:"Approved",approver:"Deepa N." },
  { id:"LV-002",emp:"Raj Kumar",      type:"Sick Leave",     from:"22 Jun",to:"22 Jun",days:1,reason:"Fever",        status:"Approved",approver:"Deepa N." },
  { id:"LV-003",emp:"Priya Sharma",   type:"Earned Leave",   from:"05 Jul",to:"07 Jul",days:3,reason:"Vacation",     status:"Pending", approver:"—" },
  { id:"LV-004",emp:"Meena Pillai",   type:"Maternity Leave",from:"01 Aug",to:"30 Sep",days:61,reason:"Maternity",  status:"Pending", approver:"—" },
  { id:"LV-005",emp:"Vikram Joshi",   type:"Casual Leave",   from:"02 Jul",to:"04 Jul",days:3,reason:"Family event",status:"Pending", approver:"—" },
];

function HRMSModuleNew() {
  const [tab,setTab]=useState<"employees"|"attendance"|"leave">("employees");
  const [drawer,setDrawer]=useState<any>(null);
  const [modal,setModal]=useState(false);
  const [selectedEmp,setSelectedEmp]=useState("Priya Sharma");
  const [approveLeave,setApproveLeave]=useState<any>(null);
  const [rejectLeave,setRejectLeave]=useState<any>(null);

  const { data: empRecords, create: createEmp, update: updateEmp, remove: removeEmp, refresh: refreshEmp } = useEmployees(erpServices.employees);


  const statusColor: Record<string,string> = {
    present:"bg-emerald-500",absent:"bg-red-500",leave:"bg-amber-500",weekend:"bg-muted"
  };
  const statusLabel: Record<string,string> = {
    present:"P",absent:"A",leave:"L",weekend:""
  };

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Employees",  value:"1,284",sub:"+12 this month",      gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Users },
        { label:"Attendance Today", value:"94.2%",sub:"1,208 present",       gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:CheckCircle2 },
        { label:"Open Positions",   value:"24",   sub:"8 in final stage",    gradient:"bg-gradient-to-br from-violet-600 to-violet-500",  icon:Target },
        { label:"Leave Requests",   value:"42",   sub:"18 pending approval", gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:Calendar },
      ]}/>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["employees","attendance","leave"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold capitalize transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="employees"?"Employee Directory":t==="attendance"?"Attendance Calendar":"Leave Management"}
          </button>
        ))}
      </div>

      {tab==="employees"&&(
        <InteractiveTable title="Employee Directory" data={empRecords}
          searchKeys={["name","dept","role","status"]} onRowClick={setDrawer}
          onAdd={()=>setModal(true)} addLabel="Add Employee"
          columns={[
            { key:"id",   label:"Emp ID",    render:r=><span className="text-xs font-mono text-muted-foreground">{r.id}</span> },
            { key:"name", label:"Name",      render:r=>(
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {r.name.split(" ").map((n:string)=>n[0]).join("")}
                  </div>
                  <span className="font-bold text-foreground text-sm">{r.name}</span>
                </div>)},
            { key:"dept",   label:"Dept",   render:r=><span className="text-xs text-muted-foreground">{r.dept}</span> },
            { key:"role",   label:"Role",   render:r=><span className="text-xs text-muted-foreground">{r.role}</span> },
            { key:"status", label:"Status", render:r=><Badge status={r.status}/> },
            { key:"salary", label:"Salary", render:r=><span className="text-xs font-mono font-extrabold text-foreground">{r.salary}</span> },
          ]}/>
      )}

      {tab==="attendance"&&(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Attendance Calendar — June 2024</h3>
                <div className="flex gap-1.5 mt-1">
                  {["present","absent","leave","weekend"].map(s=>(
                    <div key={s} className="flex items-center gap-1 text-xs">
                      <div className={`w-3 h-3 rounded-sm ${statusColor[s]}`}/>
                      <span className="text-muted-foreground capitalize">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <select value={selectedEmp} onChange={e=>setSelectedEmp(e.target.value)}
                className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 outline-none text-foreground">
                {empRecords.map(e=><option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
                <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            {/* First row — starts from Saturday (padding) */}
            <div className="grid grid-cols-7 gap-1">
              <div/>{/* padding for Saturday start */}
              {attendanceCalData.map((day,i)=>(
                <motion.div key={i} whileHover={{ scale:1.2 }} onClick={()=>toast(`Jun ${day.date}: ${day.status}`)}
                  className={`relative flex items-center justify-center rounded-lg aspect-square text-xs cursor-pointer transition-all ${statusColor[day.status]} ${day.status==="weekend"?"opacity-30":""}`}>
                  <span className={`font-bold ${day.status==="present"?"text-white":day.status==="absent"?"text-white":day.status==="leave"?"text-white":"text-muted-foreground"}`}>
                    {day.date}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Monthly Summary</h3>
            <div className="flex flex-col gap-3">
              {[
                { label:"Working Days", value:"26", icon:Calendar,  color:"text-blue-600" },
                { label:"Present",      value:"23", icon:CheckCircle2,color:"text-emerald-600" },
                { label:"Absent",       value:"1",  icon:X,          color:"text-red-600" },
                { label:"On Leave",     value:"2",  icon:Clock,      color:"text-amber-600" },
                { label:"Overtime Hrs", value:"14", icon:Activity,   color:"text-violet-600" },
              ].map((s,i)=>(
                <div key={i} className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-xl">
                  <s.icon size={14} className={s.color}/>
                  <span className="text-sm text-foreground flex-1">{s.label}</span>
                  <span className={`text-base font-extrabold ${s.color}`} style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <SecondaryBtn icon={Download} onClick={()=>toast.success("Attendance report downloaded")}>Export</SecondaryBtn>
              <PrimaryBtn size="sm" onClick={()=>toast.success("Mark attendance form opened")}>Mark Attendance</PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {tab==="leave"&&(
        <>
          <div className="flex justify-end">
            <PrimaryBtn icon={Plus} onClick={()=>setModal(true)}>Apply Leave</PrimaryBtn>
          </div>
          <InteractiveTable title="Leave Requests" data={leaveRequests}
            searchKeys={["emp","type","status"]} onRowClick={setDrawer}
            columns={[
              { key:"id",       label:"Leave ID",  render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
              { key:"emp",      label:"Employee",  render:r=><span className="font-bold text-foreground">{r.emp}</span> },
              { key:"type",     label:"Type",      render:r=><span className="text-xs text-muted-foreground">{r.type}</span> },
              { key:"from",     label:"From",      render:r=><span className="text-xs text-muted-foreground">{r.from}</span> },
              { key:"to",       label:"To",        render:r=><span className="text-xs text-muted-foreground">{r.to}</span> },
              { key:"days",     label:"Days",      render:r=><span className="text-xs font-bold font-mono text-foreground">{r.days}</span> },
              { key:"status",   label:"Status",    render:r=><Badge status={r.status}/> },
              { key:"approver", label:"Action", render:r=>(
                  r.status==="Pending"?(
                    <div className="flex gap-1">
                      <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={e=>{ e.stopPropagation(); setApproveLeave(r); }}
                        className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-0.5 rounded-lg font-bold transition-colors">Approve</motion.button>
                      <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={e=>{ e.stopPropagation(); setRejectLeave(r); }}
                        className="text-[10px] bg-red-100 text-red-700 hover:bg-red-200 px-2 py-0.5 rounded-lg font-bold transition-colors">Reject</motion.button>
                    </div>
                  ):<span className="text-xs text-muted-foreground">{r.approver}</span>
              )},
            ]}/>
          {modal&&<CreateEditModal title="Apply Leave" onClose={()=>setModal(false)} onSave={d=>toast.success(`Leave applied for ${d.from||"upcoming date"}`)}
            fields={[
              { key:"type",   label:"Leave Type", type:"select",options:["Casual Leave","Sick Leave","Earned Leave","Maternity Leave","Paternity Leave"] },
              { key:"from",   label:"From Date",  type:"date" },
              { key:"to",     label:"To Date",    type:"date" },
              { key:"reason", label:"Reason" },
            ]}/>}
        </>
      )}

      {drawer&&<DetailDrawer item={drawer} type="Employee" onClose={()=>setDrawer(null)}
        onSave={(data)=>{ updateEmp(drawer.id, data); refreshEmp(); setDrawer(null); toast.success("Employee updated"); }}
        onDelete={()=>{ removeEmp(drawer.id); refreshEmp(); setDrawer(null); toast.success("Employee deleted"); }}
      />}
      {approveLeave&&<ApproveModal title="Leave Request" recordId={approveLeave.id} onClose={()=>setApproveLeave(null)}/>}
      {rejectLeave&&<RejectModal title="Leave Request" recordId={rejectLeave.id} onClose={()=>setRejectLeave(null)}/>}
      {modal&&tab!=="leave"&&<CreateEditModal title="Add Employee" onClose={()=>setModal(false)} 
        onSave={(d)=>{
          createEmp({
            name: d.name, dept: d.dept || 'Engineering', role: d.role,
            email: d.email, phone: d.phone, salary: `₹${d.salary||0}`,
            status: 'Active', joinDate: new Date().toISOString().split('T')[0]
          });
          refreshEmp(); setModal(false); toast.success(`Employee ${d.name||""} added`);
        }}
        fields={[
          { key:"name",  label:"Full Name", required:true },{ key:"dept",label:"Department",type:"select",options:["Sales","Finance","HR","Manufacturing","IT","Procurement","Warehouse"] },
          { key:"role",  label:"Role", required:true },{ key:"email",label:"Email", required:true },
          { key:"phone", label:"Phone", required:true },{ key:"salary",label:"Salary (₹)",type:"number", required:true },
        ]}/>}
    </div>
  );
}

// ─── Enhanced Finance with tabs ───────────────────────────────────────────────

const invoiceList = [
  { id:"INV-4421",customer:"Tata Motors Ltd.",  amount:"₹12,40,000",due:"30 Jun",raised:"20 Jun",status:"Sent",    po:"PO-8821",items:4 },
  { id:"INV-4420",customer:"Mahindra Logistics",amount:"₹8,20,000", due:"28 Jun",raised:"18 Jun",status:"Paid",    po:"PO-8812",items:6 },
  { id:"INV-4419",customer:"Infosys BPO",       amount:"₹4,85,000", due:"25 Jun",raised:"15 Jun",status:"Paid",    po:"PO-8804",items:2 },
  { id:"INV-4418",customer:"Apollo Hospitals",  amount:"₹6,10,000", due:"20 Jul",raised:"20 Jun",status:"Draft",   po:"PO-8820",items:3 },
  { id:"INV-4417",customer:"Air India MRO",     amount:"₹18,40,000",due:"05 Jul",raised:"22 Jun",status:"Overdue", po:"PO-8815",items:8 },
  { id:"INV-4416",customer:"ONGC Ltd.",          amount:"₹22,10,000",due:"15 Jul",raised:"24 Jun",status:"Sent",    po:"PO-8819",items:12 },
];

const paymentHistory = [
  { id:"PMT-001",invoice:"INV-4420",from:"Mahindra Logistics",amount:"₹8,20,000", mode:"NEFT",  ref:"NEFT24062801",date:"27 Jun",status:"Cleared"  },
  { id:"PMT-002",invoice:"INV-4419",from:"Infosys BPO",       amount:"₹4,85,000", mode:"RTGS",  ref:"RTGS24062101",date:"22 Jun",status:"Cleared"  },
  { id:"PMT-003",invoice:"INV-4415",from:"Bajaj Auto",        amount:"₹14,20,000",mode:"Cheque",ref:"CHQ-441290",   date:"20 Jun",status:"Cleared"  },
  { id:"PMT-004",invoice:"INV-4417",from:"Air India MRO",     amount:"₹18,40,000",mode:"NEFT",  ref:"—",            date:"—",     status:"Pending"  },
];

function FinanceModuleNew() {
  const [tab,setTab]=useState<"ledger"|"invoices"|"payments"|"pl">("ledger");
  const [drawer,setDrawer]=useState<any>(null);
  const [drawerType,setDrawerType]=useState<"ledger"|"invoices"|"payments">("ledger");
  const [modal,setModal]=useState<"ledger"|"invoices"|"payments"|false>(false);

  const { data: glRecords, create: createGL, update: updateGL, remove: removeGL, refresh: refreshGL } = useGLAccounts(erpServices.glAccounts);
  const { data: invRecords, create: createInv, update: updateInv, remove: removeInv, refresh: refreshInv } = useInvoices(erpServices.invoices);
  const { data: pmtRecords, create: createPmt, update: updatePmt, remove: removePmt, refresh: refreshPmt } = usePayments(erpServices.payments);
  
  const mappedGL = glRecords.map(r => ({ ...r, debit: r.debit||"0", credit: r.credit||"0", balance: r.balance||"0" }));
  const mappedInv = invRecords.map(r => ({ ...r, amount: r.total||"0", raised: r.issueDate||r.date||"", due: r.dueDate, items: 1 }));
  const mappedPmt = pmtRecords.map(r => ({ ...r, invoice: r.invoiceId||"", from: r.notes||"N/A", amount: r.amount||"0", mode: r.mode||"Cash", ref: r.reference||"", date: r.date||"" }));

  return (
    <div className="flex flex-col gap-5">
      <ModuleGradientKpi items={[
        { label:"Total Assets",      value:"₹284.2 Cr",sub:"+2.8% QoQ",         gradient:"bg-gradient-to-br from-blue-600 to-blue-500",    icon:Building2 },
        { label:"Total Liabilities", value:"₹112.8 Cr",sub:"-1.2% QoQ",         gradient:"bg-gradient-to-br from-red-600 to-red-500",      icon:CreditCard },
        { label:"Net Revenue",       value:"₹128.4 Cr",sub:"FY 2024 YTD",       gradient:"bg-gradient-to-br from-emerald-600 to-emerald-500",icon:TrendingUp },
        { label:"Cash Position",     value:"₹42.6 Cr", sub:"Healthy liquidity",  gradient:"bg-gradient-to-br from-amber-500 to-orange-500",  icon:DollarSign },
      ]}/>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit flex-wrap">
        {(["ledger","invoices","payments","pl"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="ledger"?"General Ledger":t==="invoices"?"Invoices":t==="payments"?"Payments":"P&L Report"}
          </button>
        ))}
      </div>

      {tab==="ledger"&&(
        <>
          <InteractiveTable title="General Ledger" data={mappedGL} searchKeys={["code","name","type"]} onRowClick={(r)=>{ setDrawerType("ledger"); setDrawer(glRecords.find(x=>x.id===r.id)||r); }}
            onAdd={()=>setModal("ledger")} addLabel="New Entry"
            columns={[
              { key:"code",   label:"Code",   render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.code}</span> },
              { key:"name",   label:"Account",render:r=><span className="font-bold text-foreground">{r.name}</span> },
              { key:"type",   label:"Type",   render:r=><span className={`text-xs px-2 py-0.5 rounded-lg font-bold ring-1 ${r.type==="Asset"?"bg-blue-50 text-blue-700 ring-blue-200":r.type==="Liability"?"bg-red-50 text-red-700 ring-red-200":r.type==="Revenue"?"bg-emerald-50 text-emerald-700 ring-emerald-200":r.type==="Equity"?"bg-violet-50 text-violet-700 ring-violet-200":"bg-amber-50 text-amber-700 ring-amber-200"}`}>{r.type}</span> },
              { key:"debit",  label:"Debit",  render:r=><span className="text-xs font-mono">{r.debit}</span> },
              { key:"credit", label:"Credit", render:r=><span className="text-xs font-mono">{r.credit}</span> },
              { key:"balance",label:"Balance",render:r=><span className="text-xs font-mono font-extrabold text-foreground">{r.balance}</span> },
            ]}/>
          {modal==="ledger"&&<CreateEditModal title="New Journal Entry" onClose={()=>setModal(false)}
            onSave={(d)=>{
              createGL({ code: d.code, name: d.name, type: (d.type as any)||'Asset', debit: d.debit||"0", credit: d.credit||"0", balance: d.balance||"0", createdAt: new Date().toISOString() });
              refreshGL(); setModal(false); toast.success("Journal Entry saved");
            }}
            fields={[ { key:"code",label:"Account Code",required:true },{ key:"name",label:"Account Name",required:true }, { key:"type",label:"Account Type",type:"select",options:["Asset","Liability","Equity","Income","Expense"] }, { key:"debit",label:"Debit Amount (₹)",type:"number" }, { key:"credit",label:"Credit Amount (₹)",type:"number" }, { key:"balance",label:"Balance Amount (₹)",type:"number" } ]}/>}
        </>
      )}

      {tab==="invoices"&&(
        <>
          <InteractiveTable title="Invoice Register" data={mappedInv} searchKeys={["id","customer","status"]} onRowClick={(r)=>{ setDrawerType("invoices"); setDrawer(invRecords.find(x=>x.id===r.id)||r); }}
            onAdd={()=>setModal("invoices")} addLabel="New Invoice"
            columns={[
              { key:"id",       label:"Invoice No.", render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
              { key:"customer", label:"Customer",   render:r=><span className="font-bold text-foreground">{r.customer}</span> },
              { key:"amount",   label:"Amount",     render:r=><span className="text-xs font-mono font-extrabold text-foreground">{r.amount}</span> },
              { key:"raised",   label:"Raised",     render:r=><span className="text-xs text-muted-foreground">{r.raised}</span> },
              { key:"due",      label:"Due Date",   render:r=><span className={`text-xs font-semibold ${r.status==="Overdue"?"text-red-500":"text-muted-foreground"}`}>{r.due}</span> },
              { key:"status",   label:"Status",     render:r=><Badge status={r.status}/> },
              { key:"items",    label:"Items",      render:r=><span className="text-xs font-mono text-muted-foreground">{r.items}</span> },
            ]}/>
          {modal==="invoices"&&<CreateEditModal title="New Invoice" onClose={()=>setModal(false)}
            onSave={(d)=>{
              createInv({ customer: d.customer, total: `₹${d.amount||0}`, dueDate: d.due, issueDate: new Date().toISOString().split('T')[0], status: (d.status as any)||'Draft', subtotal: `₹${d.amount||0}`, tax: "0", items: [] });
              refreshInv(); setModal(false); toast.success("Invoice created");
            }}
            fields={[ { key:"customer",label:"Customer Name",required:true }, { key:"amount",label:"Total Amount (₹)",type:"number",required:true }, { key:"due",label:"Due Date",type:"date",required:true }, { key:"status",label:"Status",type:"select",options:["Draft","Sent","Paid","Overdue"] } ]}/>}
        </>
      )}

      {tab==="payments"&&(
        <>
          <InteractiveTable title="Payment History" data={mappedPmt} searchKeys={["invoice","from","status","mode"]} onRowClick={(r)=>{ setDrawerType("payments"); setDrawer(pmtRecords.find(x=>x.id===r.id)||r); }}
            onAdd={()=>setModal("payments")} addLabel="Record Payment"
            columns={[
              { key:"id",      label:"Payment ID",render:r=><span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span> },
              { key:"invoice", label:"Invoice",   render:r=><span className="text-xs font-mono text-muted-foreground">{r.invoice}</span> },
              { key:"from",    label:"From",      render:r=><span className="font-bold text-foreground">{r.from}</span> },
              { key:"amount",  label:"Amount",    render:r=><span className="text-xs font-mono font-extrabold text-emerald-600">{r.amount}</span> },
              { key:"mode",    label:"Mode",      render:r=><span className="text-xs text-muted-foreground">{r.mode}</span> },
              { key:"ref",     label:"Reference", render:r=><span className="text-xs font-mono text-muted-foreground">{r.ref}</span> },
              { key:"date",    label:"Date",      render:r=><span className="text-xs text-muted-foreground">{r.date}</span> },
              { key:"status",  label:"Status",    render:r=><Badge status={r.status}/> },
            ]}/>
          {modal==="payments"&&<CreateEditModal title="Record Payment" onClose={()=>setModal(false)}
            onSave={(d)=>{
              createPmt({ invoiceId: d.invoice, amount: `₹${d.amount||0}`, mode: (d.mode as any)||'NEFT', reference: d.ref, date: new Date().toISOString().split('T')[0], status: 'Cleared', notes: d.from, createdAt: new Date().toISOString() });
              refreshPmt(); setModal(false); toast.success("Payment recorded");
            }}
            fields={[ { key:"invoice",label:"Invoice No.",required:true }, { key:"from",label:"From (Customer)",required:true }, { key:"amount",label:"Amount (₹)",type:"number",required:true }, { key:"mode",label:"Payment Mode",type:"select",options:["NEFT","RTGS","Cheque","Cash","Credit Card"] }, { key:"ref",label:"Reference No." } ]}/>}
        </>
      )}

      {tab==="pl"&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Profit & Loss — FY 2024</h3>
              <div className="flex gap-2">
                <SecondaryBtn icon={Download} onClick={()=>toast.success("P&L exported to PDF")}>PDF</SecondaryBtn>
                <SecondaryBtn icon={Download} onClick={()=>toast.success("P&L exported to Excel")}>Excel</SecondaryBtn>
              </div>
            </div>
            {[
              { label:"Revenue",           value:"₹128.4 Cr",type:"revenue",  bold:false },
              { label:"Cost of Goods",     value:"₹72.2 Cr", type:"expense",  bold:false },
              { label:"Gross Profit",      value:"₹56.2 Cr", type:"profit",   bold:true  },
              { label:"Operating Expenses",value:"₹21.5 Cr", type:"expense",  bold:false },
              { label:"EBITDA",            value:"₹34.7 Cr", type:"profit",   bold:true  },
              { label:"Depreciation",      value:"₹4.2 Cr",  type:"expense",  bold:false },
              { label:"Interest",          value:"₹2.8 Cr",  type:"expense",  bold:false },
              { label:"Tax (25%)",         value:"₹6.9 Cr",  type:"expense",  bold:false },
              { label:"Net Profit",        value:"₹20.8 Cr", type:"highlight",bold:true  },
            ].map((row,i)=>(
              <div key={i} className={`flex items-center justify-between py-2.5 border-b border-border last:border-0 last:pt-3 ${row.type==="highlight"?"bg-blue-50 dark:bg-blue-900/20 px-3 rounded-xl":""}`}>
                <span className={`text-sm ${row.bold?"font-bold text-foreground":"text-muted-foreground"}`}>{row.label}</span>
                <span className={`text-sm font-mono ${row.bold?"font-extrabold":""} ${row.type==="revenue"?"text-emerald-600":row.type==="profit"?"text-blue-600":row.type==="highlight"?"text-blue-700 dark:text-blue-300 text-base":"text-foreground"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData.slice(-6)}>
                <defs>
                  <linearGradient id="rGf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                  <linearGradient id="eGf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="month" tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11,fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }}/>
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#rGf)"/>
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#eGf)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {drawer&&<DetailDrawer item={drawer} type={drawerType==="ledger"?"GL Record":drawerType==="invoices"?"Invoice":"Payment"} onClose={()=>setDrawer(null)}
        onSave={(data)=>{
          if(drawerType==="ledger"){ updateGL(drawer.id, data); refreshGL(); }
          else if(drawerType==="invoices"){ updateInv(drawer.id, data); refreshInv(); }
          else { updatePmt(drawer.id, data); refreshPmt(); }
          setDrawer(null); toast.success("Record updated");
        }}
        onDelete={()=>{
          if(drawerType==="ledger"){ removeGL(drawer.id); refreshGL(); }
          else if(drawerType==="invoices"){ removeInv(drawer.id); refreshInv(); }
          else { removePmt(drawer.id); refreshPmt(); }
          setDrawer(null); toast.success("Record deleted");
        }}
      />}
    </div>
  );
}

const placeholders: Partial<Record<ModuleId,{ title:string; description:string; features:string[] }>> = {
  "supply-chain":{ title:"Supply Chain Management",description:"Optimize supply chain with logistics, fleet, route optimization, and AI delivery predictions.",features:["Logistics","Fleet Tracking","Route Optimization","Supplier Network","Shipment Tracking","GPS Integration","Delivery Analytics","AI Suggestions","Demand Forecasting","Risk Management"] },
  maintenance:{ title:"Maintenance Management",description:"Preventive and reactive maintenance with IoT sensors, spare parts, and AI failure prediction.",features:["Preventive Maintenance","Breakdown Mgmt","Spare Parts","AMC Tracking","Machine Health","IoT Sensors","AI Prediction","Maintenance Calendar","Technician App","Cost Analysis"] },
  "it-assets":{ title:"IT Asset Management",description:"Track hardware, software, licenses, and devices with lifecycle, AMC, and warranty management.",features:["Hardware Inventory","Software Licenses","Network Devices","Asset Lifecycle","AMC Tracking","Warranty Mgmt","Help Desk","Depreciation","Reports","Audit"] },
  documents:{ title:"Document Management System",description:"Centralized DMS with version control, OCR, digital signatures, approval, and AI search.",features:["File Manager","Version History","OCR Processing","Approval Workflow","Digital Signature","PDF Viewer","AI Search","Access Control","Audit Trail","Integrations"] },
};

function ModuleContent({ module:mod,onNavigate }: { module:ModuleId; onNavigate:(m:ModuleId)=>void }) {
  switch(mod){
    case "dashboard":      return <Dashboard onNavigate={onNavigate}/>;
    case "sales":          return <SalesModule onNavigate={onNavigate}/>;
    case "crm":            return <CRMModule onNavigate={onNavigate}/>;
    case "procurement":    return <ProcurementModuleComplete/>;
    case "manufacturing":  return <ManufacturingModule/>;
    case "finance":        return <FinanceModuleNew/>;
    case "hrms":           return <HRMSModuleNew/>;
    case "inventory":      return <InventoryModule/>;
    case "quality":        return <QualityModule/>;
    case "ai-assistant":   return <AIAssistant/>;
    case "reports":        return <ReportsModuleFull onNavigate={onNavigate}/>;
    case "admin":          return <AdminPanel onNavigate={onNavigate}/>;
    case "customer-portal":return <CustomerPortal/>;
    case "vendor-portal":  return <VendorPortal/>;
    case "payroll":        return <PayrollModule/>;
    case "projects":       return <ProjectsModule/>;
    case "warehouse":      return <WarehouseModuleComplete/>;
    case "documents":      return <DocumentsModuleComplete/>;
    case "it-assets":      return <ITAssetsModuleComplete/>;
    case "maintenance":    return <MaintenanceModuleComplete/>;
    case "supply-chain":   return <SupplyChainModuleComplete/>;
    default:{ const ph=placeholders[mod]; return ph?<ModulePlaceholder {...ph}/>:null; }
  }
}

// ─── Floating Widgets ─────────────────────────────────────────────────────────

function AICopilotFAB({ onOpen }: { onOpen:()=>void }) {
  return (
    <div className="fixed bottom-24 right-5 z-40">
      <motion.div animate={{ scale:[1,1.45,1],opacity:[0.35,0,0.35] }} transition={{ repeat:Infinity,duration:2.2 }} className="absolute inset-0 rounded-full bg-blue-500"/>
      <motion.div animate={{ scale:[1,1.25,1],opacity:[0.25,0,0.25] }} transition={{ repeat:Infinity,duration:2.2,delay:0.5 }} className="absolute inset-0 rounded-full bg-indigo-500"/>
      <motion.button whileHover={{ scale:1.12,boxShadow:"0 0 32px rgba(37,99,235,0.7)" }} whileTap={{ scale:0.92 }} onClick={onOpen}
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 cursor-pointer">
        <Sparkles size={20} className="text-white"/>
      </motion.button>
    </div>
  );
}

function HelpChatWidget({ activeModule }: { activeModule:ModuleId }) {
  const [open,setOpen]=useState(false);
  const [msg,setMsg]=useState("");
  const [msgs,setMsgs]=useState([{ role:"bot",text:"Hi! How can I help you with NexusERP today?" }]);

  const HELP_CONTEXT: Partial<Record<ModuleId,string>> = {
    dashboard:"I can help you understand KPI cards, charts, and navigate to any module. Try clicking on a KPI card!",
    sales:"I can help with creating leads, sales orders, quotations, and understanding your pipeline.",
    manufacturing:"I can guide you through work orders, BOM creation, production planning, and OEE.",
    finance:"I can help with journal entries, invoices, reconciliation, and financial reports.",
    inventory:"I can assist with stock transfers, reorder points, barcode scanning, and cycle counts.",
    hrms:"I can help with employee onboarding, leave management, attendance, and recruitment.",
  };

  const send=()=>{
    if(!msg.trim())return;
    setMsgs(m=>[...m,{ role:"user",text:msg }]);
    setMsg("");
    setTimeout(()=>setMsgs(m=>[...m,{ role:"bot",text:HELP_CONTEXT[activeModule]||"Thanks! A support specialist will respond in ~2 min. Average response time: 90 seconds." }]),700);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open&&(
          <motion.div initial={{ opacity:0,scale:0.88,y:16 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.88,y:16 }}
            transition={{ duration:0.22 }} className="absolute bottom-16 right-0 w-[min(288px,calc(100vw-24px))] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-3 flex items-center gap-2" style={{ background:"linear-gradient(to right,#2563eb,#4f46e5)" }}>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"><Bot size={14} className="text-white"/></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">NexusERP Support</p>
                <p className="text-xs text-blue-100 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/>Online — {allNavItems.find(n=>n.id===activeModule)?.label||"ERP"} Help</p>
              </div>
              <button onClick={()=>setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X size={13} className="text-white"/></button>
            </div>
            <div className="flex flex-col gap-2 p-3 h-48 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
              {msgs.map((m,i)=>(
                <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${m.role==="user"?"bg-blue-600 text-white rounded-tr-sm":"bg-muted text-foreground rounded-tl-sm"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-border flex gap-1.5">
              <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                placeholder="Type a message…" className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-blue-400/40"/>
              <button onClick={send} className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"><Send size={12} className="text-white"/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileHover={{ scale:1.1,boxShadow:"0 8px 24px rgba(15,23,42,0.3)" }} whileTap={{ scale:0.93 }}
        onClick={()=>setOpen(o=>!o)} className="relative w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg cursor-pointer">
        <HelpCircle size={20} className="text-white"/>
        <motion.span animate={{ scale:[1,1.25,1] }} transition={{ repeat:Infinity,duration:2.5 }}
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-card flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">3</span>
        </motion.span>
      </motion.button>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeModule, onNavigate, collapsed, onToggle, user, mobileOpen, onMobileClose }: {
  activeModule:ModuleId; onNavigate:(m:ModuleId)=>void; collapsed:boolean; onToggle:()=>void;
  user:DemoUser; mobileOpen:boolean; onMobileClose:()=>void;
}) {
  const { isMobile, isTablet } = useBreakpoint();
  const [expandedGroups,setExpandedGroups]=useState<Set<string>>(new Set(["Core Business","Operations","Finance & People","Enterprise","Portals & Admin"]));
  const filteredGroups=navGroups.map(g=>({ ...g,items:g.items.filter(item=>user.allowedModules.includes(item.id)) })).filter(g=>g.items.length>0);

  // Effective collapsed state: icon-only on tablet (unless explicitly expanded), full on desktop
  const iconOnly = isMobile ? false : isTablet ? true : collapsed;
  const showLabels = isMobile ? true : !iconOnly;

  const handleNav = (id: ModuleId) => { onNavigate(id); if(isMobile) onMobileClose(); };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-sidebar-border flex-shrink-0 ${showLabels?"px-4 gap-3":"justify-center"}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
          <Zap size={16} className="text-white"/>
        </div>
        {showLabels&&(
          <>
            <span className="font-extrabold text-white text-sm tracking-tight">NexusERP</span>
            {!isMobile&&(
              <button onClick={onToggle} className="ml-auto p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors">
                <ChevronLeft size={14} className="text-sidebar-foreground/60"/>
              </button>
            )}
            {isMobile&&(
              <button onClick={onMobileClose} className="ml-auto p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors">
                <X size={14} className="text-sidebar-foreground/60"/>
              </button>
            )}
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 flex flex-col" style={{ scrollbarWidth:"none" }}>
        {filteredGroups.map(group=>(
          <div key={group.label} className={showLabels?"px-3":"px-2"}>
            {showLabels&&(
              <button onClick={()=>setExpandedGroups(p=>{ const n=new Set(p); n.has(group.label)?n.delete(group.label):n.add(group.label); return n; })}
                className="w-full flex items-center justify-between px-1 py-1.5 mt-1.5">
                <span className="text-[10px] font-black text-sidebar-foreground/35 uppercase tracking-widest">{group.label}</span>
                <ChevronDown size={9} className={`text-sidebar-foreground/25 transition-transform duration-200 ${expandedGroups.has(group.label)?"":"rotate-[-90deg]"}`}/>
              </button>
            )}
            {(iconOnly&&!isMobile || isMobile || expandedGroups.has(group.label))&&group.items.map(item=>{
              const active=activeModule===item.id;
              return (
                <motion.button key={item.id} onClick={()=>handleNav(item.id)} title={iconOnly&&!isMobile?item.label:undefined}
                  whileHover={!active?{ x:2 }:{}}
                  className={`relative w-full flex items-center gap-2.5 my-0.5 rounded-xl text-xs font-semibold transition-all duration-150
                    ${!showLabels?"justify-center h-11 w-11 mx-auto":"px-3 py-2.5"}
                    ${active?"bg-blue-600 text-white shadow-md shadow-blue-600/25":"text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                  {active&&showLabels&&<span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/50 rounded-r-full"/>}
                  <item.icon size={isMobile?17:15} className={`flex-shrink-0 ${active?"text-white":"text-sidebar-foreground/55"}`}/>
                  {showLabels&&<span className="truncate">{item.label}</span>}
                </motion.button>
              );
            })}
            {showLabels&&<div className="h-1"/>}
          </div>
        ))}
      </nav>

      {/* Expand toggle on tablet icon-only */}
      {iconOnly&&!isMobile&&(
        <div className="px-2 pb-2">
          <button onClick={onToggle} className="w-11 h-11 flex items-center justify-center hover:bg-sidebar-accent rounded-xl transition-colors mx-auto">
            <ChevronRight size={14} className="text-sidebar-foreground/50"/>
          </button>
        </div>
      )}

      {/* User */}
      <div className={`p-3 border-t border-sidebar-border flex items-center ${showLabels?"gap-2.5":"justify-center"}`}>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>{user.avatar}</div>
        {showLabels&&(
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.role}</p>
            </div>
            <button onClick={()=>toast("Use the profile menu to sign out")} className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors">
              <LogOut size={13} className="text-sidebar-foreground/45"/>
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Mobile: full-width drawer overlay
  if(isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen&&(
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose}/>
            <motion.div initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }} transition={{ type:"spring",damping:28,stiffness:260 }}
              className="fixed top-0 left-0 h-full w-72 z-50 shadow-2xl border-r border-sidebar-border overflow-hidden">
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Tablet: fixed icon-only sidebar; Desktop: animated collapsible
  return (
    <motion.aside
      animate={{ width: isTablet ? 64 : collapsed ? 64 : 232 }}
      transition={{ duration:0.25,ease:"easeInOut" }}
      className="flex flex-col border-r border-sidebar-border flex-shrink-0 overflow-hidden"
      style={{ width: isTablet ? 64 : collapsed ? 64 : 232 }}>
      {SidebarContent}
    </motion.aside>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ activeModule,dark,onToggleDark,onToggleSidebar,onSearchOpen,user,onLogout,onNavigate }: {
  activeModule:ModuleId; dark:boolean; onToggleDark:()=>void; onToggleSidebar:()=>void;
  onSearchOpen:()=>void; user:DemoUser; onLogout:()=>void; onNavigate:(m:ModuleId)=>void;
}) {
  const [notifOpen,setNotifOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [profileModalOpen,setProfileModalOpen]=useState(false);
  const [notifs,setNotifs]=useState(NOTIFICATIONS);
  const unread=notifs.filter(n=>!n.read).length;
  const moduleName=allNavItems.find(i=>i.id===activeModule)?.label??"Dashboard";

  const typeColor: Record<string,string> = { success:"bg-emerald-500",warning:"bg-amber-500",danger:"bg-red-500",info:"bg-blue-500" };

  return (
    <header className="h-14 flex items-center px-3 sm:px-4 gap-2 sm:gap-4 relative z-20 border-b border-border"
      style={{ background:dark?"rgba(2,6,23,0.85)":"rgba(255,255,255,0.85)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)" }}>
      {/* Hamburger — always visible on mobile, visible on tablet too */}
      <button onClick={onToggleSidebar} className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-xl transition-colors flex-shrink-0">
        <Menu size={18} className="text-muted-foreground"/>
      </button>
      {/* Breadcrumb — hide on mobile */}
      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs text-muted-foreground">NexusERP</span>
        <ChevronRight size={11} className="text-muted-foreground"/>
        <span className="text-xs font-bold text-foreground truncate max-w-[140px] lg:max-w-none">{moduleName}</span>
      </div>
      {/* Search — icon-only on mobile, full bar on sm+ */}
      <motion.button onClick={onSearchOpen} whileHover={{ scale:1.01 }}
        className="flex-1 sm:max-w-sm flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2 text-muted-foreground hover:border-blue-300 hover:bg-card transition-all min-h-[36px]">
        <Search size={13} className="flex-shrink-0"/>
        <span className="flex-1 text-left text-xs hidden sm:block">Search across all modules…</span>
        <kbd className="text-xs bg-background border border-border rounded px-1.5 py-0.5 hidden lg:block">⌘K</kbd>
      </motion.button>
      <div className="ml-auto flex items-center gap-1">
        <motion.button whileTap={{ rotate:180 }} onClick={onToggleDark} className="p-2 hover:bg-muted rounded-xl transition-colors">
          {dark?<Sun size={16} className="text-amber-400"/>:<Moon size={16} className="text-muted-foreground"/>}
        </motion.button>
        <motion.button whileTap={{ rotate:[-4,4,-4,0] }} transition={{ duration:0.3 }}
          onClick={()=>{ setNotifOpen(o=>!o); setProfileOpen(false); }}
          className="relative p-2 hover:bg-muted rounded-xl transition-colors">
          <Bell size={16} className="text-muted-foreground"/>
          {unread>0&&<motion.span animate={{ scale:[1,1.35,1] }} transition={{ repeat:Infinity,duration:2.5 }}
            className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 border border-card flex items-center justify-center">
            <span className="text-[8px] font-black text-white">{unread}</span>
          </motion.span>}
        </motion.button>
        <button onClick={()=>{ setProfileOpen(o=>!o); setNotifOpen(false); }}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 hover:bg-muted rounded-xl transition-colors">
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>{user.avatar}</div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-foreground leading-none">{user.name}</p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{user.role}</p>
          </div>
          <ChevronDown size={11} className="text-muted-foreground"/>
        </button>
      </div>

      <AnimatePresence>
        {notifOpen&&(
          <motion.div initial={{ opacity:0,y:-8,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:-8,scale:0.97 }} transition={{ duration:0.18 }}
            className="absolute top-full right-0 mt-2 w-[min(80vw,320px)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h4 className="font-bold text-foreground text-sm" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Notifications <span className="text-blue-600">({unread})</span></h4>
              <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} className="text-xs text-blue-600 font-semibold hover:underline">Mark all read</button>
            </div>
            <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
              {notifs.map(n=>(
                <motion.div key={n.id} whileHover={{ x:2 }}
                  onClick={()=>{ setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x)); onNavigate(n.module); setNotifOpen(false); }}
                  className={`flex items-start gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-0 cursor-pointer ${!n.read?"bg-blue-50/40 dark:bg-blue-900/10":""}`}>
                  <div className={`w-8 h-8 rounded-full ${typeColor[n.type]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {n.type==="success"?<Check size={12}/>:n.type==="danger"?<AlertCircle size={12}/>:n.type==="warning"?<AlertTriangle size={12}/>:<Bell size={12}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${!n.read?"text-foreground":"text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                  {!n.read&&<div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"/>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen&&(
          <motion.div initial={{ opacity:0,y:-8,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:-8,scale:0.97 }} transition={{ duration:0.18 }}
            className="absolute top-full right-2 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="p-4 border-b border-border">
              <p className="font-bold text-foreground text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-semibold mt-1 inline-block">{user.role}</span>
            </div>
            {[{icon:User,label:"My Profile",action:()=>{setProfileOpen(false);setProfileModalOpen(true);}},{icon:Settings,label:"Preferences",action:()=>{setProfileOpen(false);setProfileModalOpen(true);}},{icon:Shield,label:"Security",action:()=>{setProfileOpen(false);setProfileModalOpen(true);}},{icon:LifeBuoy,label:"Help Center",action:()=>toast.success("Opening Help Center…")}].map((item,i)=>(
              <motion.button key={i} whileHover={{ x:2 }} onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm text-foreground">
                <item.icon size={14} className="text-muted-foreground"/>{item.label}
              </motion.button>
            ))}
            <div className="border-t border-border">
              <motion.button whileHover={{ x:2 }} onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-500">
                <LogOut size={14}/> Sign Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {profileModalOpen&&<ProfileModal user={user} onClose={()=>setProfileModalOpen(false)} onLogout={onLogout}/>}
    </header>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────

function AppLayout({ user,onLogout }: { user:DemoUser; onLogout:()=>void }) {
  const { isMobile,isTablet } = useBreakpoint();
  const defaultModule=user.allowedModules[0]??"dashboard";
  const [activeModule,setActiveModule]=useState<ModuleId>(defaultModule as ModuleId);
  const [dark,setDark]=useState(false);
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [mobileSidebarOpen,setMobileSidebarOpen]=useState(false);
  const [loading,setLoading]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);

  useEffect(()=>{ document.documentElement.classList.toggle("dark",dark); },[dark]);

  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key==="k"){ e.preventDefault(); setSearchOpen(true); }};
    window.addEventListener("keydown",handler);
    return ()=>window.removeEventListener("keydown",handler);
  },[]);

  // Close mobile sidebar on resize to non-mobile
  useEffect(()=>{ if(!isMobile) setMobileSidebarOpen(false); },[isMobile]);

  const handleNavigate=useCallback((mod:ModuleId)=>{
    if(!user.allowedModules.includes(mod)){ toast.error("Access denied — insufficient permissions"); return; }
    if(mod===activeModule){ setMobileSidebarOpen(false); return; }
    setLoading(true);
    setMobileSidebarOpen(false);
    setTimeout(()=>{ setActiveModule(mod); setLoading(false); },380);
  },[activeModule,user.allowedModules]);

  const moduleName=allNavItems.find(i=>i.id===activeModule)?.label??"Dashboard";

  const handleSidebarToggle = () => {
    if(isMobile) setMobileSidebarOpen(o=>!o);
    else setSidebarCollapsed(c=>!c);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeModule={activeModule} onNavigate={handleNavigate}
        collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(c=>!c)}
        user={user} mobileOpen={mobileSidebarOpen} onMobileClose={()=>setMobileSidebarOpen(false)}/>

      <div className="flex-1 flex flex-col min-w-0">
        <Header activeModule={activeModule} dark={dark}
          onToggleDark={()=>{ setDark(d=>!d); toast(dark?"Switched to light mode":"Switched to dark mode",{ icon:dark?"☀️":"🌙",duration:1400 }); }}
          onToggleSidebar={handleSidebarToggle}
          onSearchOpen={()=>setSearchOpen(true)} user={user} onLogout={onLogout} onNavigate={handleNavigate}/>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5" style={{ scrollbarWidth:"none" }}>
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-foreground truncate" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{moduleName}</h1>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{new Date().toLocaleString("en-IN",{ dateStyle:"long",timeStyle:"short" })}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {activeModule==="dashboard"&&(
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={()=>toast.success("Dashboard refreshed")}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-xl hover:bg-muted transition-all min-h-[36px]">
                  <RefreshCw size={11}/> <span className="hidden sm:inline">Refresh</span>
                </motion.button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading?(
              <motion.div key="skeleton" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
                <SkeletonLoader/>
              </motion.div>
            ):(
              <motion.div key={activeModule} initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }} transition={{ duration:0.22 }}>
                <ModuleContent module={activeModule} onNavigate={handleNavigate}/>
                <div className="h-24"/>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AICopilotFAB onOpen={()=>handleNavigate("ai-assistant")}/>
      <HelpChatWidget activeModule={activeModule}/>
      {searchOpen&&<GlobalSearchModal onClose={()=>setSearchOpen(false)} onNavigate={handleNavigate}/>}
      <Toaster position="top-right" richColors toastOptions={{ style:{ borderRadius:12,fontSize:13 } }}/>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin:(user:DemoUser)=>void }) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handleLogin=()=>{
    const user=DEMO_USERS.find(u=>u.email===email&&u.password===password);
    if(!user){ setError("Invalid credentials. Try a demo account below."); return; }
    setError(""); setLoading(true);
    setTimeout(()=>{ setLoading(false); onLogin(user); },1000);
  };

  const selectUser=(u:DemoUser)=>{ setEmail(u.email); setPassword(u.password); setError(""); };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Hero */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background:"linear-gradient(145deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"/>
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-indigo-500/20 blur-3xl"/>
        </div>
        <motion.div initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.6 }} className="relative">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-white/10"><Zap size={20} className="text-white"/></div>
            <span className="text-white font-extrabold text-xl tracking-tight">NexusERP</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>The Enterprise<br/>Operating System</h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-md">Unified ERP for manufacturing, logistics, finance, and people — built for Fortune 500 scale with AI at its core.</p>
        </motion.div>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,delay:0.2 }} className="relative grid grid-cols-2 gap-3">
          {[{label:"Modules",value:"22+"},{label:"Integrations",value:"140+"},{label:"Uptime SLA",value:"99.9%"},{label:"Enterprise Clients",value:"2,800+"}].map((s,i)=>(
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <p className="text-2xl font-black text-white" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>{s.value}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Login panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4 }} className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30"><Zap size={17} className="text-white"/></div>
            <span className="font-black text-xl text-foreground" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>NexusERP</span>
          </div>
          <h2 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily:"Plus Jakarta Sans, Inter, sans-serif" }}>Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-5">Sign in or select a demo role below</p>

          {/* Demo user chips */}
          <div className="mb-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Demo Accounts — Click to login instantly</p>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              {DEMO_USERS.map((u,i)=>(
                <motion.button key={i} whileHover={{ scale:1.02,y:-1 }} whileTap={{ scale:0.97 }}
                  onClick={()=>selectUser(u)}
                  className={`flex items-center gap-2.5 p-2.5 border-2 rounded-xl text-left transition-all ${email===u.email?"border-blue-500 bg-blue-50 dark:bg-blue-900/20":"border-border hover:border-blue-300 hover:bg-muted"}`}>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${u.avatarColor} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm`}>{u.avatar}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.role}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-border"/><span className="text-xs text-muted-foreground font-medium">or enter credentials</span><div className="flex-1 h-px bg-border"/></div>

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
              <input value={email} onChange={e=>{ setEmail(e.target.value); setError(""); }}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400/60 transition-all"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                <button onClick={()=>toast("Password reset link sent (demo)")} className="text-xs text-blue-600 font-bold hover:underline">Forgot?</button>
              </div>
              <input value={password} onChange={e=>{ setPassword(e.target.value); setError(""); }} type="password"
                className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400/60 transition-all"/>
            </div>
          </div>

          {error&&(
            <motion.div initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }}
              className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
              <AlertCircle size={13}/>{error}
            </motion.div>
          )}

          <motion.button onClick={handleLogin} disabled={loading||!email||!password}
            whileHover={!loading?{ y:-2,boxShadow:"0 12px 28px -4px rgba(37,99,235,0.5)" }:{}} whileTap={{ scale:0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-blue-500/20">
            {loading?(<><motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:0.8,ease:"linear" }}><RefreshCw size={15}/></motion.div>Signing in…</>):(<>Sign In <ArrowRight size={15}/></>)}
          </motion.button>
          <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
            <Shield size={11}/> Enterprise-grade · ISO 27001 · SOC 2 Type II
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [user,setUser]=useState<DemoUser|null>(null);

  return (
    <>
      <AnimatePresence mode="wait">
        {!user?(
          <motion.div key="login" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <LoginPage onLogin={(u)=>{ setUser(u); toast.success(`Welcome back, ${u.name.split(" ")[0]}!`); }}/>
          </motion.div>
        ):(
          <motion.div key="app" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.25 }} className="h-screen">
            <AppLayout user={user} onLogout={()=>{ setUser(null); toast("Signed out successfully"); }}/>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
