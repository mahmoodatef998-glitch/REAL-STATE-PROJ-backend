const Usage = require('../models/Usage');

/**
 * Usage Service
 * Handles usage tracking and limit checking
 */
class UsageService {
  /**
   * Increment usage count for a resource
   */
  static async increment(companyId, resourceType) {
    if (!companyId) {
      return null;
    }
    
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      return await Usage.increment(companyId, resourceType, month, year);
    } catch (error) {
      console.error(`Error incrementing usage for ${resourceType}:`, error);
      throw error;
    }
  }
  
  /**
   * Decrement usage count for a resource
   */
  static async decrement(companyId, resourceType) {
    if (!companyId) {
      return null;
    }
    
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      return await Usage.decrement(companyId, resourceType, month, year);
    } catch (error) {
      console.error(`Error decrementing usage for ${resourceType}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if company has reached usage limit for a resource
   * Returns { allowed: boolean, limit: number, current: number }
   */
  static async checkLimit(companyId, resourceType, plan) {
    if (!companyId || !plan) {
      return { allowed: true, limit: null, current: 0 };
    }
    
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const usage = await Usage.getCurrentUsage(companyId, resourceType, month, year);
      
      // Map resource type to plan limit field
      const limitFieldMap = {
        property: 'propertiesLimit',
        broker: 'brokersLimit',
        lead: 'leadsLimit',
        deal: 'dealsLimit'
      };
      
      const limitField = limitFieldMap[resourceType];
      if (!limitField) {
        return { allowed: true, limit: null, current: usage };
      }
      
      const limit = plan[limitField];
      
      // null or -1 means unlimited
      if (limit === null || limit === -1) {
        return { allowed: true, limit: -1, current: usage };
      }
      
      if (usage >= limit) {
        return {
          allowed: false,
          limit,
          current: usage,
          resourceType
        };
      }
      
      return {
        allowed: true,
        limit,
        current: usage,
        resourceType
      };
    } catch (error) {
      console.error(`Error checking usage limit for ${resourceType}:`, error);
      // On error, allow the operation (fail open)
      return { allowed: true, limit: null, current: 0, error: error.message };
    }
  }
  
  /**
   * Get current usage for all resource types
   */
  static async getCurrentUsage(companyId) {
    if (!companyId) {
      return {
        property: 0,
        broker: 0,
        lead: 0,
        deal: 0
      };
    }
    
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const [properties, brokers, leads, deals] = await Promise.all([
        Usage.getCurrentUsage(companyId, 'property', month, year),
        Usage.getCurrentUsage(companyId, 'broker', month, year),
        Usage.getCurrentUsage(companyId, 'lead', month, year),
        Usage.getCurrentUsage(companyId, 'deal', month, year)
      ]);
      
      return {
        property: properties,
        broker: brokers,
        lead: leads,
        deal: deals
      };
    } catch (error) {
      console.error('Error getting current usage:', error);
      return {
        property: 0,
        broker: 0,
        lead: 0,
        deal: 0
      };
    }
  }
}

module.exports = UsageService;
