const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'automl_secret_key_2024';

// ─── In-Memory Stores (works without MongoDB) ───
const memoryUsers = [];
const memoryOrgs = [
  { _id: 'org_default', id: 'org_default', name: 'Default Organization', plan: 'free', createdAt: new Date() }
];

// Seed an admin user
(async () => {
  const hashed = await bcrypt.hash('admin123', 12);
  memoryUsers.push({
    _id: 'admin_001', id: 'admin_001',
    name: 'Admin', email: 'admin@automl.studio',
    password: hashed, company: 'AutoML Studio',
    role: 'admin', orgId: 'org_default', createdAt: new Date()
  });
})();

async function findUser(email) {
  return memoryUsers.find(u => u.email === email) || null;
}

async function createUser({ name, email, password, company, role, orgId }) {
  const hashed = await bcrypt.hash(password, 12);
  const user = {
    _id: Date.now().toString(), id: Date.now().toString(),
    name, email, password: hashed, company: company || '',
    role: role || 'user', orgId: orgId || 'org_default',
    createdAt: new Date()
  };
  memoryUsers.push(user);
  return user;
}

// ─── REGISTER ───
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (await findUser(email)) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = await createUser({ name, email, password, company });
    const token = jwt.sign(
      { id: user.id, email, role: user.role, orgId: user.orgId },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name, email, company, role: user.role, orgId: user.orgId }
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

    const user = await findUser(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email, role: user.role, orgId: user.orgId },
      JWT_SECRET, { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email, company: user.company, role: user.role, orgId: user.orgId }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ─── GET CURRENT USER ───
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = memoryUsers.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, company: user.company, role: user.role, orgId: user.orgId } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// ─── ADMIN: List all users ───
router.get('/admin/users', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const users = memoryUsers.map(u => ({
      id: u.id, name: u.name, email: u.email, company: u.company,
      role: u.role, orgId: u.orgId, createdAt: u.createdAt
    }));
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// ─── ADMIN: List all orgs ───
router.get('/admin/orgs', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const orgs = memoryOrgs.map(o => ({
      ...o,
      memberCount: memoryUsers.filter(u => u.orgId === o.id).length
    }));
    res.json({ orgs });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// ─── ADMIN: Create org ───
router.post('/admin/orgs', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const { name, plan } = req.body;
    const org = { _id: 'org_' + Date.now(), id: 'org_' + Date.now(), name, plan: plan || 'free', createdAt: new Date() };
    memoryOrgs.push(org);
    res.status(201).json({ org });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create organization.' });
  }
});

// ─── ADMIN: Update user role ───
router.patch('/admin/users/:id', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const user = memoryUsers.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (req.body.role) user.role = req.body.role;
    if (req.body.orgId) user.orgId = req.body.orgId;
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, orgId: user.orgId } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Export stores for usage tracking
router._memoryUsers = memoryUsers;
router._memoryOrgs = memoryOrgs;

module.exports = router;
