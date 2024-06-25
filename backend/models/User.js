const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    findByEmail: (email, callback) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    create: (user, callback) => {
        bcrypt.hash(user.password, 10, (err, hash) => {
            if (err) return callback(err);
            db.query('INSERT INTO users (username, email, phone, password, dt, role) VALUES (?, ?, ?, ?, ?, ?)', 
            [user.username, user.email, user.phone, hash, user.dt, user.role], (err, results) => {
                if (err) return callback(err);
                callback(null, results);
            });
        });
    }
};

module.exports = User;
