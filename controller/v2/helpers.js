const config = require('../../config/config');

module.exports = {
    Permission: config.permissions,
    checkPermission: (req, permission) => {
        return req.session.user.permissions.includes(permission);
    }
};
