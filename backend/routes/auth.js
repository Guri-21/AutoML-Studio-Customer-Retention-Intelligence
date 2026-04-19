const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'automl_secret_key_2024';

// Seed an admin user automatically on first start
(async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@automl.studio' });
    if (!adminExists) {
      const user = new User({
        name: 'Admin',
        email: 'admin@automl.studio',
        password: 'admin123', // Will be hashed by pre-save hook
        company: 'AutoML Studio',
        role: 'admin',
        orgId: 'org_default'
      });
      await user.save();
      console.log('✅ Default admin user seeded (admin@automl.studio)');
    }
  } catch (err) {
    if (err.name !== 'MongooseServerSelectionError') {
      console.warn('⚠️ Could not seed admin user:', err.message);
    }
  }
})();

// ─── REGISTER ───
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = new User({
      name,
      email,
      password, // Hashed automatically by Mongoose pre-save hook
      company: company || '',
      role: 'user',
      orgId: 'org_default'
    });
    
    await user.save();

    const token = jwt.sign(
      { id: user._id, email, role: user.role, orgId: user.orgId },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name, email, company, role: user.role, orgId: user.orgId }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ─── LOGIN ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user._id, email, role: user.role, orgId: user.orgId },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email, company: user.company, role: user.role, orgId: user.orgId }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ─── GET CURRENT USER ───
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    res.json({ user: { id: user._id, name: user.name, email: user.email, company: user.company, role: user.role, orgId: user.orgId } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// ─── DELETE CURRENT USER ───
router.delete('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    
    await User.findByIdAndDelete(decoded.id);
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// ─── ADMIN: List all users ───
router.get('/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const formattedUsers = users.map(u => ({
      id: u._id, name: u.name, email: u.email, company: u.company,
      role: u.role, orgId: u.orgId, createdAt: u.createdAt
    }));
    
    res.json({ users: formattedUsers, total: formattedUsers.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ─── ADMIN: List all orgs (Mocked based on users for now) ───
router.get('/admin/orgs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    // Aggregate users by orgId
    const orgStats = await User.aggregate([
      { $group: { _id: '$orgId', memberCount: { $sum: 1 } } }
    ]);

    const orgs = orgStats.map(o => ({
      _id: o._id,
      id: o._id,
      name: o._id === 'org_default' ? 'Default Organization' : o._id,
      plan: 'free',
      memberCount: o.memberCount,
      createdAt: new Date()
    }));
    
    res.json({ orgs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizations.' });
  }
});

// ─── ADMIN: Update user role ───
router.patch('/admin/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const updates = {};
    if (req.body.role) updates.role = req.body.role;
    if (req.body.orgId) updates.orgId = req.body.orgId;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, orgId: user.orgId } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

module.exports = router;

