const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = '1f78cd1d52ce44d476767d133f8de1587404c80cfa4e7f54dd38454236d87390e5fc838a2a9948727818e297689eb68862a554ce13df36df7da9b338e5628f90';

exports.signup = (req, res) => {
    const { username, email, phone, password, dt, role } = req.body;
    User.create({ username, email, phone, password, dt, role }, (err, results) => {
        if (err) return res.status(400).json({ message: err.message });
        res.status(201).json({ message: 'User registered successfully' });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    User.findByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
            
            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
};
