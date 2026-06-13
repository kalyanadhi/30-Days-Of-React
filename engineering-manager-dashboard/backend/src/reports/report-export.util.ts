import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ReportData } from './reports.service';

export function buildCsv(report: ReportData): string {
  const header = report.columns.map((column) => escapeCsvValue(column.label)).join(',');

  const rows = report.rows.map((row) =>
    report.columns.map((column) => escapeCsvValue(row[column.key])).join(','),
  );

  return [header, ...rows].join('\n');
}

function escapeCsvValue(value: string | number | undefined): string {
  const stringValue = value === undefined || value === null ? '' : String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export async function buildExcel(report: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(report.title.slice(0, 31));

  worksheet.columns = report.columns.map((column) => ({
    header: column.label,
    key: column.key,
    width: Math.max(column.label.length + 2, 16),
  }));

  worksheet.getRow(1).font = { bold: true };
  report.rows.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function buildPdf(report: ReportData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });

  doc.fontSize(16).text(report.title, { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor('#666666').text(`Generated ${new Date().toLocaleString()}`);
  doc.moveDown(1);

  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columnWidth = usableWidth / report.columns.length;
  const rowHeight = 22;

  const drawRow = (values: (string | number)[], y: number, isHeader = false) => {
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#000000');

    values.forEach((value, index) => {
      doc.text(String(value ?? '-'), startX + index * columnWidth + 4, y + 6, {
        width: columnWidth - 8,
        height: rowHeight - 4,
        ellipsis: true,
      });
    });

    doc
      .moveTo(startX, y + rowHeight)
      .lineTo(startX + usableWidth, y + rowHeight)
      .strokeColor('#cccccc')
      .stroke();
  };

  let y = doc.y;
  drawRow(report.columns.map((column) => column.label), y, true);
  y += rowHeight;

  for (const row of report.rows) {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage({ margin: 36, size: 'A4', layout: 'landscape' });
      y = doc.page.margins.top;
      drawRow(report.columns.map((column) => column.label), y, true);
      y += rowHeight;
    }

    drawRow(report.columns.map((column) => row[column.key]), y);
    y += rowHeight;
  }

  doc.end();
  return doc;
}
