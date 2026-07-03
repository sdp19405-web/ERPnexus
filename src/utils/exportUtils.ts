// ─── Export Utilities for Warehouse Module ────────────────────────────────────

export interface ExportOptions {
  filename: string;
  includeTimestamp?: boolean;
  headers?: boolean;
}

// ─── CSV Export ────────────────────────────────────────────────────────────────

export function exportToCSV(data: any[], options: ExportOptions): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) => 
      headers.map((header) => {
        const value = row[header] ?? "";
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma
        return stringValue.includes(",") 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const filename = `${options.filename}${options.includeTimestamp ? `_${new Date().toISOString().split("T")[0]}` : ""}.csv`;
  downloadFile(blob, filename);
}

// ─── JSON Export ───────────────────────────────────────────────────────────────

export function exportToJSON(data: any[], options: ExportOptions): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const filename = `${options.filename}${options.includeTimestamp ? `_${new Date().toISOString().split("T")[0]}` : ""}.json`;
  downloadFile(blob, filename);
}

// ─── Excel Export (using simple HTML table converted to Excel) ─────────────────

export function exportToExcel(data: any[], options: ExportOptions): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) =>
                  `<tr>${headers.map((h) => `<td>${escapeHtml(row[h] ?? "")}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const filename = `${options.filename}${options.includeTimestamp ? `_${new Date().toISOString().split("T")[0]}` : ""}.xls`;
  downloadFile(blob, filename);
}

// ─── PDF Export (using simple HTML to PDF) ────────────────────────────────────

export function exportToPDF(data: any[], options: ExportOptions): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${options.filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            page-break-inside: avoid;
          }
          th { 
            background-color: #2563EB; 
            color: white; 
            padding: 10px; 
            text-align: left;
            border: 1px solid #ddd;
          }
          td { 
            padding: 8px; 
            border: 1px solid #ddd;
            word-wrap: break-word;
          }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f0f0f0; }
          .footer { font-size: 10px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${options.filename}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) =>
                  `<tr>${headers.map((h) => `<td>${escapeHtml(row[h] ?? "")}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          <p>Total Records: ${data.length}</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "application/pdf;charset=utf-8;" });
  const filename = `${options.filename}${options.includeTimestamp ? `_${new Date().toISOString().split("T")[0]}` : ""}.pdf`;
  
  // For PDF, we need to use browser print dialog as a workaround
  const newWindow = window.open("", "", "width=800,height=600");
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.print();
  }
}

// ─── Print ────────────────────────────────────────────────────────────────────

export function printData(data: any[], title: string): void {
  if (data.length === 0) {
    console.warn("No data to print");
    return;
  }

  const headers = Object.keys(data[0]);
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page { margin: 15mm; }
          body { font-family: Arial, sans-serif; }
          h1 { color: #333; border-bottom: 2px solid #2563EB; padding-bottom: 10px; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th { 
            background-color: #2563EB; 
            color: white; 
            padding: 12px; 
            text-align: left;
            font-weight: bold;
          }
          td { 
            padding: 10px; 
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Records: ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) =>
                  `<tr>${headers.map((h) => `<td>${escapeHtml(row[h] ?? "")}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const newWindow = window.open("", "", "width=800,height=600");
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.print();
  }
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ─── Batch Export (export multiple formats at once) ───────────────────────────

export function exportMultiple(data: any[], baseFilename: string, formats: ("csv" | "json" | "excel" | "print")[]): void {
  formats.forEach((format) => {
    switch (format) {
      case "csv":
        exportToCSV(data, { filename: baseFilename, includeTimestamp: true });
        break;
      case "json":
        exportToJSON(data, { filename: baseFilename, includeTimestamp: true });
        break;
      case "excel":
        exportToExcel(data, { filename: baseFilename, includeTimestamp: true });
        break;
      case "print":
        printData(data, baseFilename);
        break;
    }
  });
}

// ─── Advanced Report Export ────────────────────────────────────────────────────

export interface ReportExportOptions extends ExportOptions {
  title?: string;
  summary?: Record<string, any>;
  metadata?: Record<string, any>;
  format: "csv" | "json" | "excel" | "pdf";
}

export function exportReport(data: any[], options: ReportExportOptions): void {
  const filename = `${options.filename}_${new Date().toISOString().split("T")[0]}`;

  switch (options.format) {
    case "csv":
      exportToCSV(data, { filename, includeTimestamp: false });
      break;
    case "json": {
      const payload = {
        title: options.title,
        metadata: options.metadata,
        generatedAt: new Date().toISOString(),
        recordCount: data.length,
        summary: options.summary,
        data,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      downloadFile(blob, `${filename}.json`);
      break;
    }
    case "excel":
      exportToExcel(data, { filename, includeTimestamp: false });
      break;
    case "pdf":
      printData(data, options.title || options.filename);
      break;
  }
}
