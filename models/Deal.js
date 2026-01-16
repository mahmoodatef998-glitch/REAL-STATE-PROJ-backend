const { prisma } = require('../database/db');

class Deal {
  constructor(data) {
    this.id = data.id;
    this.property_id = data.property_id || data.propertyId;
    this.broker_id = data.broker_id || data.brokerId;
    this.company_id = data.company_id || data.companyId;
    this.client_id = data.client_id || data.clientId;
    this.client_name = data.client_name || data.clientName;
    this.deal_type = data.deal_type || data.dealType || 'sale';
    this.deal_value = data.deal_value || data.dealValue || data.sale_price || data.salePrice;
    this.sale_price = data.sale_value || data.dealValue || data.sale_price || data.salePrice; // Backward compatibility
    this.commission_rate = data.commission_rate || data.commissionRate || null;
    this.commission_value = data.commission_value || data.commissionValue || null;
    this.broker_share = data.broker_share || data.brokerShare || null;
    this.company_share = data.company_share || data.companyShare || null;
    this.commission_approved = data.commission_approved || data.commissionApproved || false;
    this.date_closed = data.date_closed || data.dateClosed;
    this.status = data.status || 'open';
    this.created_at = data.created_at || data.createdAt;
    this.updated_at = data.updated_at || data.updatedAt;
  }

  static async create(dealData) {
    const {
      propertyId,
      brokerId,
      companyId,
      clientId,
      clientName,
      dealType = 'sale',
      dealValue, // Primary field
      salePrice, // Backward compatibility (will use dealValue if not provided)
      commissionRate,
      commissionApproved = false,
      status = 'open',
      dateClosed = null
    } = dealData;

    // Use dealValue if provided, otherwise use salePrice for backward compatibility
    const finalDealValue = dealValue || salePrice || 0;
    
    // Calculate commission only if commission rate is provided
    let commissionValue = null;
    let brokerShare = null;
    let companyShare = null;
    
    if (commissionRate && parseFloat(commissionRate) > 0) {
      commissionValue = finalDealValue * parseFloat(commissionRate);
      const brokerRate = 0.7; // 70% broker, 30% company
      brokerShare = commissionValue * brokerRate;
      companyShare = commissionValue * (1 - brokerRate);
    }

    // Auto-set dateClosed if status is 'closed'
    const finalDateClosed = status === 'closed' ? (dateClosed || new Date()) : null;

    const created = await prisma.deal.create({
      data: {
        propertyId,
        brokerId,
        companyId,
        clientId: clientId || null,
        clientName,
        dealType,
        dealValue: finalDealValue,
        salePrice: finalDealValue, // Sync with dealValue for backward compatibility
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        commissionValue,
        brokerShare,
        companyShare,
        commissionApproved,
        status,
        dateClosed: finalDateClosed
      },
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true
      }
    });

    return new Deal(created);
  }

  static async findById(id) {
    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(id) },
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true
      }
    });

    return deal ? new Deal(deal) : null;
  }

  static async findByBroker(brokerId, options = {}) {
    const { limit, offset } = options;
    const deals = await prisma.deal.findMany({
      where: { brokerId: parseInt(brokerId) },
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return deals.map(deal => new Deal(deal));
  }

  static async findByCompany(companyId, options = {}) {
    const { limit, offset } = options;
    const deals = await prisma.deal.findMany({
      where: { companyId: parseInt(companyId) },
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return deals.map(deal => new Deal(deal));
  }

  static async getAll(options = {}) {
    const { limit, offset, companyId = null } = options;
    const where = companyId ? { companyId: parseInt(companyId) } : {};
    
    const deals = await prisma.deal.findMany({
      where,
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return deals.map(deal => new Deal(deal));
  }

  // Find deals by client
  static async findByClient(clientId, options = {}) {
    const { limit, offset } = options;
    const deals = await prisma.deal.findMany({
      where: { clientId: parseInt(clientId) },
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return deals.map(deal => new Deal(deal));
  }

  async update(updateData) {
    // If dealValue or commissionRate changes, recalculate commission and shares
    let finalUpdateData = { ...updateData };
    
    const existingDeal = await prisma.deal.findUnique({ where: { id: this.id } });
    const finalDealValue = updateData.dealValue !== undefined 
      ? updateData.dealValue 
      : (updateData.salePrice !== undefined ? updateData.salePrice : existingDeal.dealValue || existingDeal.salePrice);
    const finalCommissionRate = updateData.commissionRate !== undefined 
      ? updateData.commissionRate 
      : existingDeal.commissionRate;

    // Recalculate commission and shares if dealValue or commissionRate changed
    if (finalCommissionRate && (updateData.dealValue !== undefined || updateData.salePrice !== undefined || updateData.commissionRate !== undefined)) {
      const commissionValue = finalDealValue * parseFloat(finalCommissionRate);
      const brokerRate = 0.7;
      finalUpdateData.commissionValue = commissionValue;
      finalUpdateData.brokerShare = commissionValue * brokerRate;
      finalUpdateData.companyShare = commissionValue * (1 - brokerRate);
      
      // Mark as approved if admin is setting/updating commission
      if (updateData.commissionRate !== undefined) {
        finalUpdateData.commissionApproved = true;
      }
      
      // Sync salePrice with dealValue for backward compatibility
      finalUpdateData.salePrice = finalDealValue;
      if (updateData.dealValue !== undefined) {
        finalUpdateData.dealValue = finalDealValue;
      }
    }

    // Auto-set dateClosed if status changes to 'closed'
    if (updateData.status === 'closed' && existingDeal.status !== 'closed') {
      finalUpdateData.dateClosed = updateData.dateClosed || new Date();
    }

    // Clear dateClosed if status changes from 'closed' to something else
    if (updateData.status && updateData.status !== 'closed' && existingDeal.status === 'closed') {
      finalUpdateData.dateClosed = null;
    }

    const updated = await prisma.deal.update({
      where: { id: this.id },
      data: finalUpdateData,
      include: {
        property: true,
        broker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    Object.assign(this, new Deal(updated));
    return this;
  }

  async delete() {
    await prisma.deal.delete({
      where: { id: this.id }
    });
  }

  // Helper method to calculate totals
  static async getTotals(brokerId = null, companyId = null, statusFilter = null) {
    const where = {};
    if (brokerId) where.brokerId = parseInt(brokerId);
    if (companyId) where.companyId = parseInt(companyId);
    if (statusFilter) where.status = statusFilter;

    const deals = await prisma.deal.findMany({ where });

    const totals = {
      totalDeals: deals.length,
      totalDealValue: 0, // Using dealValue as primary
      totalSalePrice: 0, // Backward compatibility
      totalCommission: 0,
      totalCommissionValue: 0, // Using commissionValue field
      totalBrokerShare: 0,
      totalCompanyShare: 0,
      byStatus: {
        open: 0,
        closed: 0,
        cancelled: 0
      },
      byType: {
        sale: 0,
        rent: 0
      }
    };

    deals.forEach(deal => {
      const dealValue = parseFloat(deal.dealValue || deal.salePrice || 0);
      const commissionValue = parseFloat(deal.commissionValue || (dealValue * parseFloat(deal.commissionRate)));
      
      totals.totalDealValue += dealValue;
      totals.totalSalePrice += dealValue; // Backward compatibility
      totals.totalCommission += commissionValue;
      totals.totalCommissionValue += commissionValue;
      totals.totalBrokerShare += parseFloat(deal.brokerShare || 0);
      totals.totalCompanyShare += parseFloat(deal.companyShare || 0);
      
      // Count by status
      if (deal.status === 'open') totals.byStatus.open++;
      else if (deal.status === 'closed') totals.byStatus.closed++;
      else if (deal.status === 'cancelled') totals.byStatus.cancelled++;
      
      // Count by type
      if (deal.dealType === 'sale') totals.byType.sale++;
      else if (deal.dealType === 'rent') totals.byType.rent++;
    });

    return totals;
  }
}

module.exports = Deal;

