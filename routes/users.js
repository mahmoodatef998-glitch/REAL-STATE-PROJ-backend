const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only) or filtered by role
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;
    
    // Only admins can see all users
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    let users;
    if (role) {
      // Filter by role
      const allUsers = await User.getAll();
      users = allUsers.filter(user => user.role === role);
    } else {
      users = await User.getAll();
    }
    
    res.json({ users: users.map(user => user.toJSON()) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending brokers (admin only) - MUST BE BEFORE /:id
router.get('/pending/brokers', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('📋 Fetching pending brokers...');
    const allUsers = await User.getAll();
    console.log(`📊 Total users: ${allUsers.length}`);
    
    const pendingBrokers = allUsers.filter(user => {
      const isPending = user.role === 'broker' && user.status === 'pending';
      if (isPending) {
        console.log(`  ✓ Found pending broker: ${user.name} (${user.email})`);
      }
      return isPending;
    });
    
    console.log(`✅ Found ${pendingBrokers.length} pending brokers`);
    res.json({ users: pendingBrokers.map(user => user.toJSON()) });
  } catch (error) {
    console.error('❌ Get pending brokers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics (admin only) - MUST BE BEFORE /:id
router.get('/stats/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const allUsers = await User.getAll();
    
    const stats = {
      total: allUsers.length,
      admins: allUsers.filter(user => user.role === 'admin').length,
      brokers: allUsers.filter(user => user.role === 'broker').length,
      clients: allUsers.filter(user => user.role === 'client').length,
      pending: allUsers.filter(user => user.status === 'pending').length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID (admin only) - MUST BE AFTER specific routes
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, role, phone, whatsapp, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (phone) updateData.phone = phone;
    if (whatsapp) updateData.whatsapp = whatsapp;
    if (avatar) updateData.avatar = avatar;

    await user.update(updateData);

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting own account
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await user.delete();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve broker (admin only)
router.post('/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status === 'approved') {
      return res.status(400).json({ error: 'User is already approved' });
    }

    await user.update({ status: 'approved' });

    res.json({
      message: 'User approved successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject broker (admin only)
router.post('/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ status: 'rejected' });

    res.json({
      message: 'User rejected successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
