/**
 * CrowdGuard AI - Export Utilities (CSV & PDF)
 * Generates official Rajamahendravaram Municipal Corporation Pushkaralu Event Reports
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Zone, Alert } from '../types';

export function exportToCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePushkaraluReportPDF(zones: Zone[], alerts: Alert[], aiBriefing?: string) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFillColor(15, 23, 42); // Navy 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CROWDGUARD AI - OPERATIONAL SITUATION REPORT', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Rajamahendravaram Municipal Corporation (RMC) & Ratan Tata Innovation Hub (RTIH)', 14, 21);
  doc.text(`Generated: ${timestamp} | Pushkaralu 2027 Command Grid`, 14, 27);

  // Executive Overview Block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Situation Summary', 14, 42);

  const totalDevotees = zones.reduce((a, b) => a + b.currentCount, 0);
  const criticalCount = zones.filter((z) => z.densityStatus === 'critical').length;
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved').length;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const summaryParagraph = aiBriefing ||
    `Across 8 monitored sectors, total active congregation is ${totalDevotees.toLocaleString()} pilgrims. ` +
    `${criticalCount} sector(s) currently exceed safe density limits, requiring continuous crowd dispersal and queue management. ` +
    `${activeAlerts} active alerts are currently assigned to municipal and law enforcement response units.`;

  const splitSummary = doc.splitTextToSize(summaryParagraph, 182);
  doc.text(splitSummary, 14, 48);

  const startYTable = 48 + splitSummary.length * 5 + 6;

  // Sector Status Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Monitored Bathing Ghats & Transit Hub Status', 14, startYTable);

  const tableData = zones.map((z) => [
    z.id,
    z.name,
    z.currentCount.toLocaleString(),
    `${z.density} /m²`,
    z.densityStatus.toUpperCase(),
    `${z.trendRate > 0 ? '+' : ''}${z.trendRate}/min`
  ]);

  autoTable(doc, {
    startY: startYTable + 4,
    head: [['Zone ID', 'Sector Name', 'Crowd Count', 'Density', 'Status', 'Rate']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  // Recent Incident Logs
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < 230) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. Active Safety Alerts & Enforcement Dispatches', 14, finalY);

    const alertRows = alerts.slice(0, 5).map((a) => [
      a.id,
      a.zoneName,
      a.severity.toUpperCase(),
      a.title,
      a.status.toUpperCase(),
      a.assignedDepartment
    ]);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Alert ID', 'Location', 'Severity', 'Condition', 'Status', 'Assigned Dept']],
      body: alertRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 }
    });
  }

  // Footer stamp
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential - For Official Godavari Pushkaralu Command Room Use Only', 14, pageHeight - 8);

  doc.save(`CrowdGuard_AI_Pushkaralu_Report_${Date.now()}.pdf`);
}
