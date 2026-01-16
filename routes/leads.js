const express = require('express');
const Lead = require('../models/Lead');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all leads (admin/broker only)
router.get('/', authenticateToken, requireRole(['admin', 'broker']), async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      property_id: req.query.property_id,
      broker_id: req.query.broker_id,
      company_id: req.query.company_id,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    // If user is broker, only show their leads
    if (req.user.role === 'broker') {
      filters.broker_id = req.user.id;
    }
    // If user is admin with company, filter by company
    else if (req.user.role === 'admin' && req.user.companyId) {
      filters.company_id = req.user.companyId;
    }

    const leads = await Lead.getAll(filters);
    res.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification count for logged-in broker
router.get('/notifications/count', authenticateToken, requireRole(['admin', 'broker']), async (req, res) => {
  try {
    let count = 0;
    
    if (req.user.role === 'broker') {
      count = await Lead.countNewLeadsByBroker(req.user.id);
    } else if (req.user.role === 'admin') {
      // For admin, count all new leads in their company
      const filters = { 
        status: 'new',
        company_id: req.user.companyId
      };
      const newLeads = await Lead.getAll(filters);
      count = newLeads.length;
    }

    res.json({ count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lead by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'broker']), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check authorization: broker can only see their own leads
    if (req.user.role === 'broker' && lead.broker_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this lead' });
    }

    res.json({ lead });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new lead (public endpoint)
router.post('/', async (req, res) => {
  try {
    const { name, phone, property_id } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Validate property exists and get broker info
    if (!property_id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    const Property = require('../models/Property');
    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get broker (owner) info - must have an owner who is broker or admin
    if (!property.owner || !['broker', 'admin'].includes(property.owner.role)) {
      return res.status(400).json({ error: 'Property must have a valid broker' });
    }

    const leadData = {
      name,
      phone,
      email: '', // Optional for this flow
      message: `Interested in property: ${property.title}`,
      property_id,
      broker_id: property.owner.id,
      company_id: property.owner.companyId || null,
      status: 'new'
    };

    const lead = await Lead.create(leadData);
    
    res.status(201).json({
      success: true,
      message: 'Your interest has been recorded successfully! The broker will contact you soon.',
      lead: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        property: lead.property,
        broker: lead.broker
      }
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lead status (admin/broker only)
router.put('/:id', authenticateToken, requireRole(['admin', 'broker']), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check authorization: broker can only update their own leads
    if (req.user.role === 'broker' && lead.broker_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this lead' });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['new', 'contacted', 'negotiating', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: new, contacted, negotiating, or closed' });
    }

    await lead.update({ status });

    res.json({
      success: true,
      message: 'Lead status updated successfully',
      lead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete lead (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await lead.delete();

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leads by property
router.get('/property/:propertyId', authenticateToken, requireRole(['admin', 'broker']), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const leads = await Lead.getByProperty(propertyId);
    
    // Filter by broker if not admin
    let filteredLeads = leads;
    if (req.user.role === 'broker') {
      filteredLeads = leads.filter(lead => lead.broker_id === req.user.id);
    }
    
    res.json({ leads: filteredLeads });
  } catch (error) {
    console.error('Get property leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lead statistics (admin/broker)
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'broker']), async (req, res) => {
  try {
    const filters = {};
    
    // If user is broker, only show their leads
    if (req.user.role === 'broker') {
      filters.broker_id = req.user.id;
    }
    // If user is admin with company, filter by company
    else if (req.user.role === 'admin' && req.user.companyId) {
      filters.company_id = req.user.companyId;
    }

    const allLeads = await Lead.getAll(filters);
    
    const stats = {
      total: allLeads.length,
      new: allLeads.filter(lead => lead.status === 'new').length,
      contacted: allLeads.filter(lead => lead.status === 'contacted').length,
      negotiating: allLeads.filter(lead => lead.status === 'negotiating').length,
      closed: allLeads.filter(lead => lead.status === 'closed').length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
