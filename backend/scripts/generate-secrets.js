const crypto = require('crypto');

const generateSecret = (length = 64) => {
    return crypto.randomBytes(length / 2).toString('hex');
};

console.log('JWT_ACCESS_SECRET=' + generateSecret(64));
console.log('JWT_REFRESH_SECRET=' + generateSecret(64));
console.log('COOKIE_SECRET=' + generateSecret(64));
console.log('ARGON2_PEPPER=' + generateSecret(32));
