const config = require('../../config/config');

module.exports = {
    Permission: config.permissions,
    checkPermission: (req, permission) => {
        return req.session.user.permissions.includes(permission);
    },
    isEmail: (email) => {
        const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailReg.test(email);
    }
};
