const config = require('../../config/config');
const error = require('../../config/error');

module.exports = {
    Permission: config.permissions,
    error,
    checkPermission: (req, permission) => {
        return req.session.user.permissions.includes(permission);
    },
    isEmail: (email) => {
        const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailReg.test(email);
    },
    removeNil: obj => {
        const res = {};
        for (let key in obj) {
            if (obj[key] != null) res[key] = obj[key];
        }
        return res;
    },

};
