const express = require('express');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkTenantAccess } = require('../middleware/tenantIsolation');

const router = express.Router();

/**
 * Get all subscriptions (Admin only)
 * GET /api/subscriptions
 */
router.get('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { status, planId } = req.query;
    
    const subscriptions = await Subscription.getAll({ status, planId });
    
    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    next(error);
  }
});

/**
 * Get subscription by company ID
 * GET /api/subscriptions/company/:companyId
 */
router.get('/company/:companyId', authenticateToken, async (req, res, next) => {
  try {
    const { companyId } = req.params;
    
    // Check access: Super Admin can see all, others can only see their own company
    if (req.user.role !== 'admin' || req.user.companyId) {
      if (req.user.companyId !== parseInt(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
    
    const subscription = await Subscription.findByCompanyId(companyId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    next(error);
  }
});

/**
 * Get subscription by ID
 * GET /api/subscriptions/:id
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    // Check access
    if (req.user.role !== 'admin' || req.user.companyId) {
      if (req.user.companyId !== subscription.companyId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    next(error);
  }
});

/**
 * Create subscription (Admin only)
 * POST /api/subscriptions
 */
router.post('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { companyId, planId, status, trialEndDate, notes } = req.body;
    
    // Validate required fields
    if (!companyId || !planId) {
      return res.status(400).json({
        success: false,
        error: 'companyId and planId are required'
      });
    }
    
    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    // Check if company already has a subscription
    const existingSubscription = await Subscription.findByCompanyId(companyId);
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: 'Company already has a subscription'
      });
    }
    
    // Calculate trial end date if not provided (default: 14 days)
    let trialEnd = trialEndDate;
    if (!trialEnd && status === 'trial') {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);
      trialEnd = endDate;
    }
    
    const subscription = await Subscription.create({
      companyId,
      planId,
      status: status || 'trial',
      trialEndDate: trialEnd,
      notes
    });
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    next(error);
  }
});

/**
 * Activate subscription (Admin only - Manual)
 * POST /api/subscriptions/:id/activate
 */
router.post('/:id/activate', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    await subscription.activate(req.user.id);
    
    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription
    });
  } catch (error) {
    console.error('Activate subscription error:', error);
    next(error);
  }
});

/**
 * Cancel subscription (Admin only - Manual)
 * POST /api/subscriptions/:id/cancel
 */
router.post('/:id/cancel', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    await subscription.cancel(req.user.id);
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    next(error);
  }
});

/**
 * Update subscription plan (Admin only - Manual)
 * PUT /api/subscriptions/:id/plan
 */
router.put('/:id/plan', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { planId, notes } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'planId is required'
      });
    }
    
    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    await subscription.updatePlan(planId, req.user.id, notes);
    
    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    next(error);
  }
});

/**
 * Update subscription (Admin only)
 * PUT /api/subscriptions/:id
 */
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    await subscription.update(req.body);
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    next(error);
  }
});

module.exports = router;
