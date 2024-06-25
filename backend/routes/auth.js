const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;

