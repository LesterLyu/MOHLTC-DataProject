const User = require('../models/user');
const config = require('../config/config'); // get our config file
const error = require('../config/error');


function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.USER_MANAGEMENT);
}
let allPermissions = Object.keys(config.permissions).map(function(key){
    return config.permissions[key];
});

module.exports = {
    checkPermission: checkPermission,

    admin_update_user_permission: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const username = req.body.username;
        const groupNumber = req.session.user.groupNumber;
        const permissions = req.body.permissions;
        let filteredPermissions = [];
        // validate permission Array
        for (let i = 0; i < permissions.length; i++) {
            if (allPermissions.includes(permissions[i]))
                filteredPermissions.push(permissions[i])
        }

        User.findOne({username: username, groupNumber: groupNumber}, (err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (!user) {
                return res.status(500).json({success: false, message: 'Cannot find user.'});
            }
            user.permission = filteredPermissions;
            user.save((err, updatedUser) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: false, message: err})
                }
                return res.status(500).json({success: true, message: 'Saved permissions: ' + filteredPermissions.join(', ')})
            });

        })
    },

    admin_get_all_users_with_details: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }

        const groupNumber = req.session.user.groupNumber;
        User.find({groupNumber: groupNumber}, (err, users) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, users: users});
        })
    }


};