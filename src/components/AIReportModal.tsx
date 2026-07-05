import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { PrimaryBtn } from '../app/App';

export function AIReportModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Sparkles size={18} className="text-blue-500" />
            AI Report Generator
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-muted-foreground animate-pulse">Analyzing ERP Data and generating insights...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-sm text-foreground">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16}/> Execution Summary
                </h3>
                <p className="leading-relaxed">Overall ERP performance is highly optimal. Sales have grown by 14% this quarter, while manufacturing defects have reduced by 2.1%. Inventory turnover ratio has improved, and cash flow remains robust with ₹42.6 Cr liquidity.</p>
              </div>

              <h4 className="font-bold mt-2">Key Findings:</h4>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-muted-foreground">
                <li><strong className="text-foreground">Sales:</strong> Region North exceeded targets by 18%. Pending orders stand at 145, requiring attention.</li>
                <li><strong className="text-foreground">Inventory:</strong> Raw Material levels are stable (28.4 Cr). Spares stock is low, recommend raising POs for critical components.</li>
                <li><strong className="text-foreground">Finance:</strong> Receivables collection period has reduced to 34 days. Payables are managed efficiently.</li>
                <li><strong className="text-foreground">HR & Quality:</strong> Attendance is high (94.2%). Quality Control reports a 98% pass rate across all active batches.</li>
              </ul>
              
              <div className="mt-4 flex gap-2 justify-end">
                <PrimaryBtn icon={Download} onClick={() => {
                  const blob = new Blob(["AI Report Summary\n\nSales grew 14%. Inventory stable. Quality 98%."], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "ai_report_summary.txt";
                  a.click();
                }}>Download PDF</PrimaryBtn>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
