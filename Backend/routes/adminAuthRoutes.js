const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const ADMIN_SECRET_KEY = '2002'; // Admin Register වීමට අවශ්‍ය Secret Key එක
const JWT_SECRET = 'galaxy_admin_secret_key_2026';

// 1. ADMIN REGISTER
router.post('/register', async (req, res) => {
  const { username, email, password, adminKey } = req.body;

  if (!username || !email || !password || !adminKey) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Secret Key එක 2002 ද කියා පරීක්ෂා කිරීම
  if (adminKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Invalid Admin Security Key! Access denied.' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Admin email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `INSERT INTO admin (username, email, password) VALUES (?, ?, ?)`;
    await db.query(sql, [username, email, hashedPassword]);

    return res.status(201).json({ message: 'Admin account created successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during admin registration.' });
  }
});

// 2. ADMIN LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Admin account not found.' });
    }

    const admin = rows[0];
    
    // Bcrypt comparison + Plain text fallback check
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, admin.password);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch && admin.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Admin Credentials.' });
    }

    const token = jwt.sign(
      { adminId: admin.admin_id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Welcome Admin!',
      token,
      admin: {
        id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during admin login.' });
  }
});

// 3. ADMIN LOGOUT
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin logged out successfully'
  });
});

module.exports = router;