// ─── Warehouse Forms Component ────────────────────────────────────────────────

import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Plus, Trash2 } from "lucide-react";

interface FormProps {
  title: string;
  fields: FormField[];
  onCancel: () => void;
  onSubmit: (data: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

interface FormField {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "email" | "tel";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export function GenericForm({ title, fields, onCancel, onSubmit, initialValues = {} }: FormProps) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                {errors[field.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e: any) => handleSubmit(e)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Specific Form Components ──────────────────────────────────────────────────

export function ReceivingForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Create Goods Receiving Record"
      fields={[
        { name: "grnNo", label: "GRN Number", required: true, placeholder: "GRN-2024-..." },
        { name: "poNumber", label: "PO Number", required: true, placeholder: "PO-XXXX" },
        { name: "vendor", label: "Vendor", required: true, placeholder: "Vendor name" },
        { name: "items", label: "Items Description", required: true, type: "textarea" },
        { name: "quantity", label: "Quantity", required: true, placeholder: "e.g., 100 MT" },
        { name: "warehouse", label: "Warehouse", required: true, type: "select", options: ["WH-01 Mumbai", "WH-02 Pune", "WH-03 Delhi"] },
        { name: "inspector", label: "Inspector", required: true, placeholder: "Inspector name" },
        { name: "date", label: "Date", required: true, type: "date" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function PickingForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Create Picking Order"
      fields={[
        { name: "pickId", label: "Pick ID", required: true, placeholder: "PCK-..." },
        { name: "salesOrder", label: "Sales Order", required: true, placeholder: "SO-XXXX" },
        { name: "customer", label: "Customer", required: true, placeholder: "Customer name" },
        { name: "zone", label: "Zone", required: true, type: "select", options: ["Zone A", "Zone B", "Zone C"] },
        { name: "picker", label: "Picker", required: true, placeholder: "Employee name" },
        { name: "items", label: "Number of Items", required: true, type: "number", min: 1 },
        { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
        { name: "dueDate", label: "Due Date", required: true, type: "date" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function DispatchForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Create Dispatch Record"
      fields={[
        { name: "dispatchId", label: "Dispatch ID", required: true, placeholder: "DSP-..." },
        { name: "salesOrder", label: "Sales Order", required: true, placeholder: "SO-XXXX" },
        { name: "customer", label: "Customer", required: true, placeholder: "Customer name" },
        { name: "destination", label: "Destination", required: true, placeholder: "Destination location" },
        { name: "weight", label: "Weight", required: true, placeholder: "e.g., 10 MT" },
        { name: "courier", label: "Courier", required: true, type: "select", options: ["BlueDart", "DHL", "FedEx", "TCI Freight"] },
        { name: "trackingNumber", label: "Tracking Number", placeholder: "Courier tracking #" },
        { name: "dispatchDate", label: "Dispatch Date", required: true, type: "date" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function DockForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Create Dock Record"
      fields={[
        { name: "dockNumber", label: "Dock Number", required: true, placeholder: "DOCK-01" },
        { name: "truckNumber", label: "Truck Number", required: true, placeholder: "Registration number" },
        { name: "arrivalTime", label: "Arrival Time", required: true, type: "date" },
        { name: "operator", label: "Dock Operator", required: true, placeholder: "Operator name" },
        { name: "status", label: "Status", required: true, type: "select", options: ["Empty", "Loading", "Unloading", "Full"] },
        { name: "notes", label: "Notes", type: "textarea", placeholder: "Any additional notes" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function ZoneForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Create Zone"
      fields={[
        { name: "zoneName", label: "Zone Name", required: true, placeholder: "Zone A" },
        { name: "warehouse", label: "Warehouse", required: true, type: "select", options: ["WH-01 Mumbai", "WH-02 Pune", "WH-03 Delhi"] },
        { name: "capacity", label: "Capacity (sqft)", required: true, type: "number", min: 1 },
        { name: "manager", label: "Zone Manager", required: true, placeholder: "Manager name" },
        { name: "temperature", label: "Temperature Control", type: "select", options: ["None", "Ambient", "Cold Storage", "Climate Controlled"] },
        { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Maintenance"] },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function TaskForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Assign Task"
      fields={[
        { name: "taskId", label: "Task ID", required: true, placeholder: "TSK-..." },
        { name: "employee", label: "Assign To", required: true, placeholder: "Employee name" },
        { name: "taskType", label: "Task Type", required: true, type: "select", options: ["Receiving", "Picking", "Packing", "Dispatch", "Inventory Count", "Other"] },
        { name: "description", label: "Description", required: true, type: "textarea", placeholder: "Task details" },
        { name: "priority", label: "Priority", required: true, type: "select", options: ["High", "Medium", "Low"] },
        { name: "dueDate", label: "Due Date", required: true, type: "date" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function BarcodeForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Scan Barcode"
      fields={[
        { name: "barcode", label: "Barcode", required: true, placeholder: "Scan or enter barcode" },
        { name: "sku", label: "SKU", placeholder: "Auto-populated" },
        { name: "productName", label: "Product Name", placeholder: "Auto-populated" },
        { name: "quantity", label: "Quantity", required: true, type: "number", min: 1 },
        { name: "warehouse", label: "Warehouse", required: true, type: "select", options: ["WH-01 Mumbai", "WH-02 Pune", "WH-03 Delhi"] },
        { name: "zone", label: "Zone", required: true, type: "select", options: ["Zone A", "Zone B", "Zone C"] },
        { name: "bin", label: "Bin Location", placeholder: "Bin number" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function ShipmentForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Track Shipment"
      fields={[
        { name: "shipmentId", label: "Shipment ID", placeholder: "Auto-generated" },
        { name: "dispatchId", label: "Dispatch ID", required: true, placeholder: "DSP-..." },
        { name: "customer", label: "Customer", placeholder: "Auto-populated" },
        { name: "status", label: "Status", type: "select", options: ["Pending", "In Transit", "Out for Delivery", "Delivered"] },
        { name: "currentLocation", label: "Current Location", placeholder: "Latest location update" },
        { name: "eta", label: "ETA", placeholder: "Expected delivery time" },
        { name: "courier", label: "Courier", placeholder: "Courier name" },
        { name: "trackingUrl", label: "Tracking URL", placeholder: "Public tracking link" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function GPSForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Vehicle GPS Tracking"
      fields={[
        { name: "vehicleId", label: "Vehicle ID", required: true, placeholder: "VH-..." },
        { name: "driver", label: "Driver", required: true, placeholder: "Driver name" },
        { name: "dispatchId", label: "Dispatch ID", placeholder: "DSP-..." },
        { name: "latitude", label: "Latitude", required: true, type: "number", placeholder: "e.g., 19.0760" },
        { name: "longitude", label: "Longitude", required: true, type: "number", placeholder: "e.g., 72.8777" },
        { name: "currentStatus", label: "Status", required: true, type: "select", options: ["Active", "Idle", "Maintenance", "Parked"] },
        { name: "speed", label: "Speed (km/h)", type: "number", min: 0 },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function PutAwayForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: any) => void }) {
  return (
    <GenericForm
      title="Create Put Away Rule"
      fields={[
        { name: "ruleId", label: "Rule ID", required: true, placeholder: "PAR-..." },
        { name: "sku", label: "SKU", required: true, placeholder: "SKU-..." },
        { name: "productName", label: "Product Name", required: true, placeholder: "Product name" },
        { name: "zone", label: "Zone", required: true, type: "select", options: ["Zone A", "Zone B", "Zone C"] },
        { name: "rack", label: "Rack Number", placeholder: "Rack ID" },
        { name: "bin", label: "Bin Number", placeholder: "Bin ID" },
        { name: "ruleType", label: "Rule Type", required: true, type: "select", options: ["FIFO", "LIFO", "Random", "Location-Based"] },
        { name: "priority", label: "Priority", type: "number", min: 1, placeholder: "Lower = Higher priority" },
      ]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}
