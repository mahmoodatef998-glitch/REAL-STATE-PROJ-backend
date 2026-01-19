const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { authenticateToken } = require('../middleware/auth');
const { getJWTSecret, generateAccessToken, generateRefreshToken } = require('../utils/jwtHelper');
const { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} = require('../validators/authValidator');

const router = express.Router();

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
// Deprecated: use generateAccessToken and refresh token flow
const generateToken = (user) => generateAccessToken(user);

// Helper to set refresh token cookie and persist token
async function issueRefreshToken(res, userId) {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await RefreshToken.create({ token, userId, expiresAt });
  
  // In development, secure must be false. In production, secure must be true
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction, // false in dev, true in production
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

// Register
router.post('/register', validateRegister, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, email, password, role, phone, whatsapp } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists with this email' 
      });
    }

    // Determine status
    const userRole = role || 'client';
    const userStatus = userRole === 'broker' ? 'pending' : 'approved';

    // Validate phone for brokers
    if (userRole === 'broker' && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required for broker registration'
      });
    }

    console.log(`📝 Registration attempt: ${name} (${email}) as ${userRole} - Status: ${userStatus}`);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      status: userStatus,
      phone,
      whatsapp
    });

    console.log(`✅ User created: ${user.name} (${user.email}) - Role: ${user.role}, Status: ${user.status}`);

    // If broker, don't return token - needs admin approval
    if (userRole === 'broker') {
      console.log(`⏳ Broker account created with pending status. Awaiting admin approval.`);
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Your account is pending admin approval. You will be notified once approved.',
        requiresApproval: true,
        user: user.toJSON()
      });
    }

    // Generate token for non-broker users and issue refresh token
    try {
      const token = generateToken(user);
      await issueRefreshToken(res, user.id);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        token,
        user: user.toJSON()
      });
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ 
        success: false,
        error: 'Registration successful but failed to generate token. Please check server configuration.' 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

// Login
router.post('/login', validateLogin, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email, 'Status:', user.status);

    // Check if user has a password hash
    if (!user.password) {
      console.error('❌ User has no password hash:', user.email);
      return res.status(500).json({ success: false, error: 'User account error. Please contact administrator.' });
    }

    // Validate password
    try {
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      console.log('✅ Password validated for:', email);
    } catch (passwordError) {
      console.error('❌ Password validation error:', passwordError);
      return res.status(500).json({ success: false, error: 'Password validation failed. Please try again.' });
    }

    // Check if user account is approved
    if (user.status === 'pending') {
      console.log('⏳ User account is pending approval:', user.email);
      return res.status(403).json({ 
        success: false,
        error: 'Your account is pending admin approval. Please wait for approval before logging in.',
        requiresApproval: true,
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      console.log('❌ User account is rejected:', user.email);
      return res.status(403).json({ 
        success: false,
        error: 'Your account has been rejected. Please contact the administrator.',
        rejected: true,
        status: 'rejected'
      });
    }

    // Generate token
    try {
      console.log('🔑 Generating token for user:', user.email);
      const token = generateToken(user);
      await issueRefreshToken(res, user.id);
      console.log('✅ Token generated successfully for:', user.email);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: user.toJSON()
      });
    } catch (tokenError) {
      console.error('❌ Token generation error:', tokenError);
      console.error('❌ Token error name:', tokenError.name);
      console.error('❌ Token error message:', tokenError.message);
      console.error('❌ Token error stack:', tokenError.stack);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to generate authentication token. Please check server configuration.';
      if (tokenError.message.includes('JWT_SECRET')) {
        errorMessage = 'Server configuration error. Please contact administrator.';
      }
      
      return res.status(500).json({ 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? tokenError.message : undefined
      });
    }
  } catch (error) {
    console.error('❌ Login route error:', error);
    console.error('❌ Error stack:', error.stack);
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    console.error('Profile error:', error);
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { name, phone, whatsapp, avatar } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (avatar !== undefined) updateData.avatar = avatar;

    await user.update(updateData);

    res.json({ success: true, message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Old password and new password are required' });
    }

    const isValidPassword = await user.validatePassword(oldPassword);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid old password' });
    }

    await user.updatePassword(newPassword);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
});

// Verify token (for frontend to check if token is still valid)
router.get('/verify', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        valid: false,
        error: 'User not found' 
      });
    }

    res.json({ 
      valid: true,
      user: user.toJSON() 
    });
  } catch (error) {
    console.error('Verify token error:', error);
    next(error);
  }
});

// Refresh access token
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: 'Refresh token not provided' });

    const stored = await RefreshToken.findByToken(token);
    if (!stored || stored.revoked) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    if (stored.expiresAt && new Date(stored.expiresAt) < new Date()) {
      return res.status(401).json({ success: false, error: 'Refresh token expired' });
    }

    // Issue new access token and rotate refresh token
    const user = await User.findById(stored.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const accessToken = generateAccessToken(user);
    // rotate
    const newRefresh = generateRefreshToken();
    const newExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.rotate(stored.id, newRefresh, newExpires);
    
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRefresh, { 
      httpOnly: true, 
      secure: isProduction,
      sameSite: 'lax', 
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({ success: true, token: accessToken, user: user.toJSON() });
  } catch (error) {
    console.error('Refresh token error:', error);
    next(error);
  }
});

// Logout (revoke refresh token)
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (token) {
      const stored = await RefreshToken.findByToken(token);
      if (stored) await RefreshToken.revokeById(stored.id);
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
});

module.exports = router;
