const User = require('../models/user');
const config = require('../config/config'); // get our config file
const error = require('../config/error');


function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.USER_MANAGEMENT);
}

let allPermissions = Object.keys(config.permissions).map(function (key) {
    return config.permissions[key];
});

module.exports = {
    checkPermission: checkPermission,

    admin_update_user_permission: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const data = req.body.data;
        let fails = [],
            promiseArr = [];

        for (let i = 0; i < data.length; i++) {
            const username = data[i].username;
            const permissions = data[i].permissions;
            let filteredPermissions = [];
            // validate permission Array
            for (let i = 0; i < permissions.length; i++) {
                if (allPermissions.includes(permissions[i]))
                    filteredPermissions.push(permissions[i])
            }
            if (req.session.user.username === username) {
                req.session.user.permissions = filteredPermissions;
            }

            // add to promise chain
            promiseArr.push(new Promise((resolve, reject) => {
                User.findOneAndUpdate({username: username}, {permissions: filteredPermissions})
                    .then(result => resolve())
                    .catch(err => {
                        console.log(err);
                        fails.push(username);
                    })
            }));
        }
        Promise.all(promiseArr).then(() => {
            if (fails.length !== 0) {
                return res.json({
                    success: false,
                    message: fails.length + '/' + data.length + 'failed.'
                })
            }
            return res.json({
                success: true,
                message: 'Success.'
            })
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
    },

    admin_get_all_permissions: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        return res.json({success: true, permissions: allPermissions});
    }


};