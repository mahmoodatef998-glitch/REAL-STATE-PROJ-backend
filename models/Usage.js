const { prisma } = require('../database/db');

class Usage {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId || data.company_id;
    this.resourceType = data.resourceType || data.resource_type;
    this.count = data.count || 0;
    this.month = data.month;
    this.year = data.year;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  /**
   * Get current usage for a resource type
   */
  static async getCurrentUsage(companyId, resourceType, month, year) {
    try {
      const usage = await prisma.usage.findUnique({
        where: {
          companyId_resourceType_month_year: {
            companyId: parseInt(companyId),
            resourceType,
            month,
            year
          }
        }
      });

      return usage ? usage.count : 0;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return 0;
    }
  }

  /**
   * Increment usage count
   */
  static async increment(companyId, resourceType, month, year) {
    try {
      const usage = await prisma.usage.upsert({
        where: {
          companyId_resourceType_month_year: {
            companyId: parseInt(companyId),
            resourceType,
            month,
            year
          }
        },
        update: {
          count: { increment: 1 }
        },
        create: {
          companyId: parseInt(companyId),
          resourceType,
          count: 1,
          month,
          year
        }
      });

      return new Usage(usage);
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }

  /**
   * Decrement usage count
   */
  static async decrement(companyId, resourceType, month, year) {
    try {
      const usage = await prisma.usage.findUnique({
        where: {
          companyId_resourceType_month_year: {
            companyId: parseInt(companyId),
            resourceType,
            month,
            year
          }
        }
      });

      if (usage && usage.count > 0) {
        const updated = await prisma.usage.update({
          where: { id: usage.id },
          data: { count: { decrement: 1 } }
        });
        return new Usage(updated);
      }

      return null;
    } catch (error) {
      console.error('Error decrementing usage:', error);
      throw error;
    }
  }

  /**
   * Get usage history for a company
   */
  static async getHistory(companyId, months = 12) {
    try {
      const currentDate = new Date();
      const results = [];

      for (let i = 0; i < months; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const usageRecords = await prisma.usage.findMany({
          where: {
            companyId: parseInt(companyId),
            month,
            year
          }
        });

        const usage = {
          month,
          year,
          property: 0,
          broker: 0,
          lead: 0,
          deal: 0
        };

        usageRecords.forEach(record => {
          if (usage[record.resourceType] !== undefined) {
            usage[record.resourceType] = record.count;
          }
        });

        results.push(usage);
      }

      return results.reverse(); // Oldest first
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }
}

module.exports = Usage;
