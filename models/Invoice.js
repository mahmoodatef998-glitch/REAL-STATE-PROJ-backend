const { prisma } = require('../database/db');

class Invoice {
  constructor(data) {
    this.id = data.id;
    this.subscriptionId = data.subscriptionId || data.subscription_id;
    this.companyId = data.companyId || data.company_id;
    this.invoiceNumber = data.invoiceNumber || data.invoice_number;
    this.amount = data.amount;
    this.currency = data.currency || 'AED';
    this.status = data.status || 'pending';
    this.paymentMethod = data.paymentMethod || data.payment_method;
    this.paymentReference = data.paymentReference || data.payment_reference;
    this.paidAt = data.paidAt || data.paid_at;
    this.dueDate = data.dueDate || data.due_date;
    this.pdfUrl = data.pdfUrl || data.pdf_url;
    this.notes = data.notes;
    this.createdBy = data.createdBy || data.created_by;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  /**
   * Generate invoice number
   */
  static generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${month}-${random}`;
  }

  static async create(invoiceData) {
    const {
      subscriptionId,
      companyId,
      amount,
      currency,
      dueDate,
      notes,
      createdBy
    } = invoiceData;

    // Get companyId from subscription if not provided
    let finalCompanyId = companyId;
    if (!finalCompanyId && subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: parseInt(subscriptionId) },
        select: { companyId: true }
      });
      if (subscription) {
        finalCompanyId = subscription.companyId;
      }
    }

    if (!finalCompanyId) {
      throw new Error('companyId is required');
    }

    // Generate unique invoice number
    let invoiceNumber;
    let isUnique = false;
    while (!isUnique) {
      invoiceNumber = Invoice.generateInvoiceNumber();
      const existing = await prisma.invoice.findUnique({
        where: { invoiceNumber }
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const created = await prisma.invoice.create({
      data: {
        subscriptionId: parseInt(subscriptionId),
        companyId: parseInt(finalCompanyId),
        invoiceNumber,
        amount: parseFloat(amount),
        currency: currency || 'AED',
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        notes,
        createdBy: createdBy ? parseInt(createdBy) : null
      },
      include: {
        subscription: {
          include: {
            plan: true,
            company: true
          }
        }
      }
    });

    return new Invoice(created);
  }

  static async findById(id) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        subscription: {
          include: {
            plan: true,
            company: true
          }
        }
      }
    });

    return invoice ? new Invoice(invoice) : null;
  }

  static async findByInvoiceNumber(invoiceNumber) {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        subscription: {
          include: {
            plan: true,
            company: true
          }
        }
      }
    });

    return invoice ? new Invoice(invoice) : null;
  }

  static async findByCompanyId(companyId) {
    // Get company's subscription first
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: parseInt(companyId) }
    });

    if (!subscription) {
      return [];
    }

    const invoices = await prisma.invoice.findMany({
      where: { subscriptionId: subscription.id },
      include: {
        subscription: {
          include: {
            plan: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return invoices.map(inv => new Invoice(inv));
  }

  static async getAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.subscriptionId) {
      where.subscriptionId = parseInt(filters.subscriptionId);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        subscription: {
          include: {
            plan: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return invoices.map(inv => new Invoice(inv));
  }

  async update(updateData) {
    const dataToUpdate = {};
    
    if (updateData.amount !== undefined) dataToUpdate.amount = parseFloat(updateData.amount);
    if (updateData.currency !== undefined) dataToUpdate.currency = updateData.currency;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.paymentMethod !== undefined) dataToUpdate.paymentMethod = updateData.paymentMethod;
    if (updateData.paymentReference !== undefined) dataToUpdate.paymentReference = updateData.paymentReference;
    if (updateData.paidAt !== undefined) dataToUpdate.paidAt = updateData.paidAt ? new Date(updateData.paidAt) : null;
    if (updateData.dueDate !== undefined) dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    if (updateData.pdfUrl !== undefined) dataToUpdate.pdfUrl = updateData.pdfUrl;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

    const updated = await prisma.invoice.update({
      where: { id: this.id },
      data: dataToUpdate,
      include: {
        subscription: {
          include: {
            plan: true,
            company: true
          }
        }
      }
    });

    Object.assign(this, updated);
    return this;
  }

  /**
   * Mark invoice as paid (Manual by Admin)
   */
  async markAsPaid(paymentData) {
    const { paymentMethod, paymentReference, notes } = paymentData;
    
    return this.update({
      status: 'paid',
      paymentMethod,
      paymentReference,
      paidAt: new Date(),
      notes: notes || this.notes
    });
  }

  /**
   * Check if invoice is overdue
   */
  isOverdue() {
    if (this.status === 'paid' || this.status === 'cancelled') {
      return false;
    }
    
    return new Date() > new Date(this.dueDate);
  }

  async delete() {
    await prisma.invoice.delete({
      where: { id: this.id }
    });
  }
}

module.exports = Invoice;
