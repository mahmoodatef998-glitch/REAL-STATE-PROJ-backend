const express = require('express');
const Company = require('../models/Company');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all companies (admin only, or visible to all authenticated users)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const companies = await Company.getAll();
    res.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Get companies error:', error);
    next(error);
  }
});

// Get company by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Get company by ID error:', error);
    next(error);
  }
});

// Create new company (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // Check if company with same name exists
    const existingCompany = await Company.findByName(name);
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        error: 'Company with this name already exists'
      });
    }

    const company = await Company.create({
      name,
      email,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    next(error);
  }
});

// Update company (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const { name, email, phone, address } = req.body;
    const updateData = {};

    if (name !== undefined) {
      // Check if another company with same name exists
      const existingCompany = await Company.findByName(name);
      if (existingCompany && existingCompany.id !== company.id) {
        return res.status(400).json({
          success: false,
          error: 'Company with this name already exists'
        });
      }
      updateData.name = name;
    }
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    await company.update(updateData);

    const updatedCompany = await Company.findById(req.params.id);

    res.json({
      success: true,
      message: 'Company updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Update company error:', error);
    next(error);
  }
});

// Delete company (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    await company.delete();

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    next(error);
  }
});

module.exports = router;

