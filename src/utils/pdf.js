import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // ── Header Background ──
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // ── Company Name ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(99, 102, 241);
  doc.text('BizManager', margin, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Business Management Suite', margin, 30);
  doc.text('support@bizmanager.com', margin, 36);

  // ── INVOICE label ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(226, 232, 240);
  doc.text('INVOICE', pageWidth - margin, 28, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`#${order.orderNumber}`, pageWidth - margin, 36, { align: 'right' });

  // ── Divider ──
  let y = 58;
  doc.setDrawColor(45, 49, 72);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // ── Order & Customer Info ──
  y = 68;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(99, 102, 241);
  doc.text('BILL TO', margin, y);
  doc.text('ORDER DETAILS', pageWidth / 2 + 10, y);

  y = 76;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const customer = order.customer;
  doc.setTextColor(50, 50, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.name || 'N/A', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 90);
  if (customer.email) { doc.text(customer.email, margin, y); y += 5; }
  if (customer.phone) { doc.text(customer.phone, margin, y); y += 5; }
  if (customer.address) { doc.text(customer.address, margin, y); y += 5; }

  // Right column
  const rx = pageWidth / 2 + 10;
  let ry = 76;
  doc.setTextColor(80, 80, 90);
  doc.text(`Order Number: ${order.orderNumber}`, rx, ry); ry += 6;
  doc.text(`Date: ${formatDate(order.createdAt)}`, rx, ry); ry += 6;
  doc.text(`Status: ${order.status}`, rx, ry); ry += 6;

  // ── Items Table ──
  y = Math.max(y, ry) + 10;

  const tableBody = order.items.map((item) => [
    item.product?.name || 'Unknown Product',
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.unitPrice * item.quantity),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Product', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: [40, 40, 50],
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 246, 250] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
    },
  });

  // ── Totals ──
  const finalY = doc.lastAutoTable.finalY + 8;
  const rightX = pageWidth - margin;

  doc.setFillColor(245, 246, 252);
  doc.roundedRect(pageWidth / 2, finalY - 4, pageWidth / 2 - margin, 22, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 50);
  doc.text('Total Amount:', pageWidth / 2 + 8, finalY + 6);
  doc.setTextColor(99, 102, 241);
  doc.text(formatCurrency(order.totalAmount), rightX, finalY + 6, { align: 'right' });

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your business! For inquiries, contact support@bizmanager.com', pageWidth / 2, footerY, { align: 'center' });
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  // ── Save ──
  doc.save(`invoice-${order.orderNumber}.pdf`);
};
