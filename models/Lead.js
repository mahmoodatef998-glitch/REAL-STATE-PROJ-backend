const { prisma } = require('../database/db');

class Lead {
  constructor(data) {
    this.id = data.id;
    this.name = data.name || data.lead_name;
    this.email = data.email || '';
    this.phone = data.phone || data.lead_phone;
    this.message = data.message;
    this.property_id = data.property_id || data.propertyId;
    this.broker_id = data.broker_id || data.brokerId;
    this.company_id = data.company_id || data.companyId;
    this.status = data.status || 'new';
    this.created_at = data.created_at || data.createdAt;
    this.updated_at = data.updated_at || data.updatedAt;
    
    // Include related data if loaded
    if (data.property) this.property = data.property;
    if (data.broker) this.broker = data.broker;
    if (data.company) this.company = data.company;
  }

  static async create(leadData) {
    const created = await prisma.lead.create({
      data: {
        name: leadData.name || leadData.lead_name,
        email: leadData.email || '',
        phone: leadData.phone || leadData.lead_phone,
        message: leadData.message || null,
        propertyId: leadData.property_id != null ? Number(leadData.property_id) : null,
        brokerId: leadData.broker_id != null ? Number(leadData.broker_id) : null,
        companyId: leadData.company_id != null ? Number(leadData.company_id) : null,
        status: leadData.status || 'new',
      },
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true
          }
        }
      }
    });
    return new Lead(created);
  }

  static async findById(id) {
    const row = await prisma.lead.findUnique({ 
      where: { id: Number(id) },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            purpose: true,
            price: true,
            emirate: true,
            location: true,
            images: true
          }
        },
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true
          }
        }
      }
    });
    return row ? new Lead(row) : null;
  }

  static async getAll(filters = {}) {
    const where = {};
    if (filters.status && filters.status !== 'all') where.status = filters.status;
    if (filters.property_id) where.propertyId = Number(filters.property_id);
    if (filters.broker_id) where.brokerId = Number(filters.broker_id);
    if (filters.company_id) where.companyId = Number(filters.company_id);

    const rows = await prisma.lead.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' }, 
      take: filters.limit ? Number(filters.limit) : undefined,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            purpose: true,
            price: true,
            emirate: true,
            location: true,
            images: true
          }
        },
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true
          }
        }
      }
    });
    return rows.map(r => new Lead(r));
  }

  static async getByProperty(propertyId) {
    const rows = await prisma.lead.findMany({ 
      where: { propertyId: Number(propertyId) }, 
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true
          }
        }
      }
    });
    return rows.map(r => new Lead(r));
  }

  static async countNewLeadsByBroker(brokerId) {
    return await prisma.lead.count({
      where: {
        brokerId: Number(brokerId),
        status: 'new'
      }
    });
  }

  static async getByBroker(brokerId, filters = {}) {
    const where = { brokerId: Number(brokerId) };
    if (filters.status && filters.status !== 'all') where.status = filters.status;

    const rows = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            purpose: true,
            price: true,
            emirate: true,
            location: true,
            images: true
          }
        }
      }
    });
    return rows.map(r => new Lead(r));
  }

  async update(updateData) {
    const updated = await prisma.lead.update({
      where: { id: Number(this.id) },
      data: {
        name: updateData.name !== undefined ? updateData.name : undefined,
        email: updateData.email !== undefined ? updateData.email : undefined,
        phone: updateData.phone !== undefined ? updateData.phone : undefined,
        message: updateData.message !== undefined ? updateData.message : undefined,
        status: updateData.status !== undefined ? updateData.status : undefined,
        propertyId: updateData.property_id !== undefined ? Number(updateData.property_id) : undefined,
      },
    });
    Object.assign(this, new Lead(updated));
    return this;
  }

  async delete() {
    await prisma.lead.delete({ where: { id: Number(this.id) } });
    return true;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Lead;
