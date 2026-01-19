const { prisma } = require('../database/db');

class Plan {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.displayName = data.displayName || data.display_name;
    this.description = data.description;
    this.price = data.price;
    this.currency = data.currency || 'AED';
    this.propertiesLimit = data.propertiesLimit ?? data.properties_limit;
    this.brokersLimit = data.brokersLimit ?? data.brokers_limit;
    this.leadsLimit = data.leadsLimit ?? data.leads_limit;
    this.dealsLimit = data.dealsLimit ?? data.deals_limit;
    this.features = data.features ? (typeof data.features === 'string' ? JSON.parse(data.features) : data.features) : [];
    this.isActive = data.isActive ?? data.is_active ?? true;
    this.sortOrder = data.sortOrder ?? data.sort_order ?? 0;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  static async create(planData) {
    const {
      name,
      displayName,
      description,
      price,
      currency,
      propertiesLimit,
      brokersLimit,
      leadsLimit,
      dealsLimit,
      features,
      isActive,
      sortOrder
    } = planData;

    const created = await prisma.plan.create({
      data: {
        name,
        displayName,
        description,
        price: parseFloat(price) || 0,
        currency: currency || 'AED',
        propertiesLimit,
        brokersLimit,
        leadsLimit,
        dealsLimit,
        features: features ? JSON.stringify(features) : null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0
      }
    });

    return new Plan(created);
  }

  static async findById(id) {
    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(id) }
    });

    return plan ? new Plan(plan) : null;
  }

  static async findByName(name) {
    const plan = await prisma.plan.findUnique({
      where: { name }
    });

    return plan ? new Plan(plan) : null;
  }

  static async getAll(activeOnly = false) {
    const where = activeOnly ? { isActive: true } : {};
    
    const plans = await prisma.plan.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return plans.map(plan => new Plan(plan));
  }

  async update(updateData) {
    const dataToUpdate = {};
    
    if (updateData.displayName !== undefined) dataToUpdate.displayName = updateData.displayName;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.price !== undefined) dataToUpdate.price = parseFloat(updateData.price);
    if (updateData.currency !== undefined) dataToUpdate.currency = updateData.currency;
    if (updateData.propertiesLimit !== undefined) dataToUpdate.propertiesLimit = updateData.propertiesLimit;
    if (updateData.brokersLimit !== undefined) dataToUpdate.brokersLimit = updateData.brokersLimit;
    if (updateData.leadsLimit !== undefined) dataToUpdate.leadsLimit = updateData.leadsLimit;
    if (updateData.dealsLimit !== undefined) dataToUpdate.dealsLimit = updateData.dealsLimit;
    if (updateData.features !== undefined) dataToUpdate.features = Array.isArray(updateData.features) ? JSON.stringify(updateData.features) : updateData.features;
    if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;
    if (updateData.sortOrder !== undefined) dataToUpdate.sortOrder = updateData.sortOrder;

    const updated = await prisma.plan.update({
      where: { id: this.id },
      data: dataToUpdate
    });

    Object.assign(this, updated);
    return this;
  }

  async delete() {
    await prisma.plan.delete({
      where: { id: this.id }
    });
  }
}

module.exports = Plan;
