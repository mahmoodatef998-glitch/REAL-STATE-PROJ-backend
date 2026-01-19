const { prisma } = require('../database/db');
const Plan = require('./Plan');

class Subscription {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId || data.company_id;
    this.planId = data.planId || data.plan_id;
    this.status = data.status || 'trial';
    this.startDate = data.startDate || data.start_date;
    this.endDate = data.endDate || data.end_date;
    this.trialEndDate = data.trialEndDate || data.trial_end_date;
    this.notes = data.notes;
    this.activatedBy = data.activatedBy || data.activated_by;
    this.activatedAt = data.activatedAt || data.activated_at;
    this.cancelledAt = data.cancelledAt || data.cancelled_at;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  static async create(subscriptionData) {
    const {
      companyId,
      planId,
      status,
      startDate,
      trialEndDate,
      notes
    } = subscriptionData;

    const created = await prisma.subscription.create({
      data: {
        companyId: parseInt(companyId),
        planId: parseInt(planId),
        status: status || 'trial',
        startDate: startDate ? new Date(startDate) : new Date(),
        trialEndDate: trialEndDate ? new Date(trialEndDate) : null,
        notes
      },
      include: {
        plan: true
      }
    });

    return new Subscription(created);
  }

  static async findByCompanyId(companyId) {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: parseInt(companyId) },
      include: {
        plan: true
      }
    });

    return subscription ? new Subscription(subscription) : null;
  }

  static async findById(id) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(id) },
      include: {
        plan: true,
        company: true
      }
    });

    return subscription ? new Subscription(subscription) : null;
  }

  static async getAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.planId) {
      where.planId = parseInt(filters.planId);
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        plan: true,
        company: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return subscriptions.map(sub => new Subscription(sub));
  }

  async getPlan() {
    if (this.plan) {
      return new Plan(this.plan);
    }
    
    const plan = await Plan.findById(this.planId);
    return plan;
  }

  async update(updateData) {
    const dataToUpdate = {};
    
    if (updateData.planId !== undefined) dataToUpdate.planId = parseInt(updateData.planId);
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.startDate !== undefined) dataToUpdate.startDate = new Date(updateData.startDate);
    if (updateData.endDate !== undefined) dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    if (updateData.trialEndDate !== undefined) dataToUpdate.trialEndDate = updateData.trialEndDate ? new Date(updateData.trialEndDate) : null;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.activatedBy !== undefined) dataToUpdate.activatedBy = updateData.activatedBy;
    if (updateData.activatedAt !== undefined) dataToUpdate.activatedAt = updateData.activatedAt ? new Date(updateData.activatedAt) : null;
    if (updateData.cancelledAt !== undefined) dataToUpdate.cancelledAt = updateData.cancelledAt ? new Date(updateData.cancelledAt) : null;

    const updated = await prisma.subscription.update({
      where: { id: this.id },
      data: dataToUpdate,
      include: {
        plan: true
      }
    });

    Object.assign(this, updated);
    return this;
  }

  /**
   * Activate subscription (Manual by Admin)
   */
  async activate(adminId) {
    return this.update({
      status: 'active',
      activatedBy: adminId,
      activatedAt: new Date()
    });
  }

  /**
   * Cancel subscription (Manual by Admin)
   */
  async cancel(adminId) {
    return this.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      activatedBy: adminId
    });
  }

  /**
   * Update plan (Manual by Admin)
   */
  async updatePlan(planId, adminId, notes) {
    return this.update({
      planId,
      activatedBy: adminId,
      notes,
      activatedAt: new Date()
    });
  }

  /**
   * Check if subscription is active
   */
  isActive() {
    return this.status === 'active' || this.status === 'trial';
  }

  /**
   * Check if trial is expired
   */
  isTrialExpired() {
    if (this.status !== 'trial' || !this.trialEndDate) {
      return false;
    }
    
    return new Date() > new Date(this.trialEndDate);
  }

  async delete() {
    await prisma.subscription.delete({
      where: { id: this.id }
    });
  }
}

module.exports = Subscription;
