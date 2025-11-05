import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return Response.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Fetch invoice
    const invoices = await base44.entities.Invoice.filter({ id: invoiceId });
    
    if (invoices.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = invoices[0];

    // Create PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(139, 92, 246); // Purple
    doc.text('INVOICE', 20, 20);

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 35);
    doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 20, 42);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 49);

    // Status badge
    doc.setFontSize(12);
    const statusColors = {
      draft: [156, 163, 175],
      sent: [59, 130, 246],
      paid: [16, 185, 129],
      overdue: [239, 68, 68],
    };
    const statusColor = statusColors[invoice.status] || [156, 163, 175];
    doc.setTextColor(...statusColor);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 150, 35);

    // From (User)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('From:', 20, 65);
    doc.setFontSize(11);
    doc.text(user.full_name || 'Your Business', 20, 72);
    if (user.email) doc.text(user.email, 20, 79);

    // To (Client)
    doc.setFontSize(10);
    doc.text('Bill To:', 120, 65);
    doc.setFontSize(11);
    doc.text(invoice.client_name, 120, 72);
    if (invoice.client_email) doc.text(invoice.client_email, 120, 79);
    if (invoice.client_phone) doc.text(invoice.client_phone, 120, 86);
    if (invoice.client_address) {
      const addressLines = doc.splitTextToSize(invoice.client_address, 70);
      doc.text(addressLines, 120, 93);
    }

    // Line items table
    let yPos = 120;
    doc.setFontSize(10);
    doc.setFillColor(139, 92, 246);
    doc.rect(20, yPos, 170, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.text('Description', 22, yPos + 5);
    doc.text('Qty', 110, yPos + 5);
    doc.text('Rate', 135, yPos + 5);
    doc.text('Amount', 165, yPos + 5);

    yPos += 10;
    doc.setTextColor(0, 0, 0);

    let subtotal = 0;
    (invoice.items || []).forEach((item) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const amount = (item.quantity || 0) * (item.rate || 0);
      subtotal += amount;

      doc.text(item.description || '', 22, yPos);
      doc.text(String(item.quantity || 0), 110, yPos);
      doc.text(`$${(item.rate || 0).toFixed(2)}`, 135, yPos);
      doc.text(`$${amount.toFixed(2)}`, 165, yPos);
      yPos += 7;
    });

    // Totals
    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    const tax = invoice.tax_rate ? (subtotal * invoice.tax_rate) / 100 : 0;
    const total = subtotal + tax;

    doc.text('Subtotal:', 140, yPos);
    doc.text(`$${subtotal.toFixed(2)}`, 165, yPos);

    if (tax > 0) {
      yPos += 7;
      doc.text(`Tax (${invoice.tax_rate}%):`, 140, yPos);
      doc.text(`$${tax.toFixed(2)}`, 165, yPos);
    }

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 140, yPos);
    doc.text(`$${total.toFixed(2)}`, 165, yPos);

    // Notes
    if (invoice.notes) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Notes:', 20, yPos);
      yPos += 7;
      const notesLines = doc.splitTextToSize(invoice.notes, 170);
      doc.text(notesLines, 20, yPos);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    // Generate PDF as ArrayBuffer
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});