const crypto = require('crypto');

const generateJwtSecret = () => {
    return crypto.randomBytes(64).toString('hex');
};

console.log(generateJwtSecret());
