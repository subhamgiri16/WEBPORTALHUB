const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = '1f78cd1d52ce44d476767d133f8de1587404c80cfa4e7f54dd38454236d87390e5fc838a2a9948727818e297689eb68862a554ce13df36df7da9b338e5628f90';

// Middleware to check if the user is authenticated
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Protected routes
router.get('/dashboard', authenticateJWT, (req, res) => {
    res.json({ message: 'This is the dashboard' });
});

router.get('/reports', authenticateJWT, (req, res) => {
    res.json({ message: 'This is the reports page' });
});

router.get('/forms', authenticateJWT, (req, res) => {
    res.json({ message: 'This is the forms page' });
});

module.exports = router;
