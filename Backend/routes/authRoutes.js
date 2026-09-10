const express = require('express');
const router = express.Router();
const { register, login, logout, customerLogin, adminLogin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/customer-login', customerLogin);
router.post('/admin-login', adminLogin);
router.post('/logout', logout);

module.exports = router;
