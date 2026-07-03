/**
 * ERP Export Utilities
 * Multi-format export for all modules (CSV, JSON, Excel, PDF)
 */

export interface ExportOptions {
  filename?: string;
  format?: 'csv' | 'json' | 'excel' | 'pdf';
  columns?: string[];
  includeMetadata?: boolean;
  title?: string;
  sheetName?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// CSV EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export function exportToCSV(data: any[], options: ExportOptions = {}): void {
  const {
    filename = 'export',
    columns = Object.keys(data[0] || {})
  } = options;

  const csvContent = [
    // Headers
    columns.map(escapeCSV).join(','),
    // Data rows
    ...data.map(row =>
      columns.map(col => {
        const value = row[col];
        return escapeCSV(formatValue(value));
      }).join(',')
    )
  ].join('\n');

  downloadFile(
    new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
    `${filename}.csv`
  );
}

function escapeCSV(value: string): string {
  if (!value) return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ═════════════════════════════════════════════════════════════════════════════
// JSON EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export function exportToJSON(data: any[], options: ExportOptions = {}): void {
  const {
    filename = 'export',
    columns,
    includeMetadata = true
  } = options;

  const filteredData = columns
    ? data.map(row => {
      const filtered: any = {};
      columns.forEach(col => {
        filtered[col] = row[col];
      });
      return filtered;
    })
    : data;

  const exportData = includeMetadata
    ? {
      exportedAt: new Date().toISOString(),
      totalRecords: data.length,
      data: filteredData
    }
    : filteredData;

  const jsonContent = JSON.stringify(exportData, null, 2);

  downloadFile(
    new Blob([jsonContent], { type: 'application/json' }),
    `${filename}.json`
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXCEL EXPORT (HTML-based for compatibility)
// ═════════════════════════════════════════════════════════════════════════════

export function exportToExcel(data: any[], options: ExportOptions = {}): void {
  const {
    filename = 'export',
    columns = Object.keys(data[0] || {})
  } = options;

  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          tr:hover { background-color: #ddd; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `<td>${escapeHtml(formatValue(row[col]))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(
    new Blob([htmlContent], { type: 'application/vnd.ms-excel' }),
    `${filename}.xls`
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PDF EXPORT (Using browser print)
// ═════════════════════════════════════════════════════════════════════════════

export function exportToPDF(data: any[], options: ExportOptions = {}): void {
  const {
    filename = 'export',
    columns = Object.keys(data[0] || {})
  } = options;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #4CAF50; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .metadata { text-align: right; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(options.title || filename)}</h1>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `<td>${escapeHtml(formatValue(row[col]))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="metadata">
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Records: ${data.length}</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=400,width=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PRINT EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export function printData(data: any[], title: string = 'Report'): void {
  const columns = Object.keys(data[0] || {});

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .print-container { padding: 20px; }
          h1 { margin: 20px 0; color: #333; text-align: center; font-size: 24px; }
          .meta-info { text-align: right; margin-bottom: 20px; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #4CAF50; color: white; padding: 12px; text-align: left; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background-color: #f5f5f5; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-container { padding: 10px; }
            table { font-size: 12px; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <h1>${escapeHtml(title)}</h1>
          <div class="meta-info">
            <p>Printed on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${escapeHtml(String(col))}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${columns.map(col => `<td>${escapeHtml(formatValue(row[col]))}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 100);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ADVANCED REPORT EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export function exportReport(
  data: any[],
  title: string,
  options: {
    summary?: Record<string, any>;
    footer?: string;
    format?: 'pdf' | 'excel';
  } = {}
): void {
  const { summary = {}, footer = '', format = 'pdf' } = options;

  const columns = Object.keys(data[0] || {});

  let reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #4CAF50; }
          .date { font-size: 12px; color: #666; margin-top: 5px; }
          .summary { margin: 20px 0; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; }
          .summary-item { margin: 5px 0; }
          .summary-label { font-weight: bold; color: #333; }
          .summary-value { color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #4CAF50; color: white; padding: 12px; text-align: left; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${escapeHtml(title)}</div>
          <div class="date">Generated on ${new Date().toLocaleString()}</div>
        </div>
  `;

  if (Object.keys(summary).length > 0) {
    reportHTML += `<div class="summary">`;
    Object.entries(summary).forEach(([key, value]) => {
      reportHTML += `
        <div class="summary-item">
          <span class="summary-label">${escapeHtml(key)}:</span>
          <span class="summary-value">${escapeHtml(String(value))}</span>
        </div>
      `;
    });
    reportHTML += `</div>`;
  }

  reportHTML += `
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${escapeHtml(String(col))}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `<td>${escapeHtml(formatValue(row[col]))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
  `;

  if (footer) {
    reportHTML += `<div class="footer">${escapeHtml(footer)}</div>`;
  }

  reportHTML += `
        <div class="footer">Total Records: ${data.length}</div>
      </body>
    </html>
  `;

  if (format === 'pdf') {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 100);
    }
  } else {
    const blob = new Blob([reportHTML], { type: 'application/vnd.ms-excel' });
    downloadFile(blob, `${title.replace(/\s+/g, '_')}_report.xls`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BULK EXPORT MULTIPLE FORMATS
// ═════════════════════════════════════════════════════════════════════════════

export function exportMultipleFormats(
  data: any[],
  formats: ('csv' | 'json' | 'excel' | 'pdf')[],
  filename: string = 'export'
): void {
  formats.forEach(format => {
    switch (format) {
      case 'csv':
        exportToCSV(data, { filename });
        break;
      case 'json':
        exportToJSON(data, { filename });
        break;
      case 'excel':
        exportToExcel(data, { filename });
        break;
      case 'pdf':
        exportToPDF(data, { filename });
        break;
    }
    // Small delay between exports to avoid conflicts
    setTimeout(() => {}, 100);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function escapeHtml(text: any): string {
  if (text === null || text === undefined) {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

export function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join('; ');
    }
    return JSON.stringify(value);
  }

  return String(value);
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT PRESETS FOR COMMON MODULES
// ═════════════════════════════════════════════════════════════════════════════

export const exportPresets = {
  // Sales
  leads: (data: any[], filename: string = 'leads_export') => {
    exportToCSV(data, {
      filename,
      columns: ['id', 'company', 'contact', 'email', 'stage', 'value', 'owner']
    });
  },
  salesOrders: (data: any[], filename: string = 'sales_orders_export') => {
    exportToCSV(data, {
      filename,
      columns: ['id', 'customer', 'orderDate', 'total', 'status']
    });
  },

  // Procurement
  purchaseOrders: (data: any[], filename: string = 'purchase_orders_export') => {
    exportToCSV(data, {
      filename,
      columns: ['id', 'vendor', 'status', 'value', 'dueDate']
    });
  },

  // Inventory
  inventory: (data: any[], filename: string = 'inventory_export') => {
    exportToCSV(data, {
      filename,
      columns: ['sku', 'productName', 'currentStock', 'reorderLevel', 'unitPrice', 'warehouse']
    });
  },

  // HR
  employees: (data: any[], filename: string = 'employees_export') => {
    exportToCSV(data, {
      filename,
      columns: ['id', 'name', 'email', 'dept', 'role', 'salary', 'status']
    });
  },
  payroll: (data: any[], filename: string = 'payroll_export') => {
    exportToCSV(data, {
      filename,
      columns: ['id', 'employeeId', 'period', 'basicSalary', 'grossSalary', 'netSalary', 'status']
    });
  },

  // Finance
  invoices: (data: any[], filename: string = 'invoices_export') => {
    exportToCSV(data, {
      filename,
      columns: ['id', 'customer', 'amount', 'dueDate', 'status', 'raisedDate']
    });
  },

  // Projects
  tasks: (data: any[], filename: string = 'tasks_export') => {
    exportToCSV(data, {
      filename,
      columns: ['id', 'title', 'assignee', 'priority', 'status', 'dueDate']
    });
  }
};

export default {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToPDF,
  printData,
  exportReport,
  exportMultipleFormats,
  downloadFile,
  escapeHtml,
  formatValue,
  exportPresets
};
