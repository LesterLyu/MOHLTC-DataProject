const User = require('../models/user');
const RegisterRequest = require('../models/registerRequest');
const sendMail = require('./sendmail');
const jwt = require('jsonwebtoken');
const registration_ldap_controller = require('./registration/ldap');
const config = require('../config/config'); // get our config file
const error = require('../config/error');

function isEmail(email) {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailReg.test(email);
}

function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.USER_MANAGEMENT);
}

let allPermissions = Object.keys(config.permissions).map(function (key) {
    return config.permissions[key];
});

function generateToken(username, expireTime) {
    let payload = {
        username: username
    };
    return jwt.sign(payload, config.superSecret, {
        expiresIn: expireTime * 60
    });
}

module.exports = {
    checkPermission: checkPermission,

    admin_update_user_permission: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const permission = req.body.permissions;
        let fails = [],
            promiseArr = [],
            activesArr = [];

        for (let i = 0; i < permission.length; i++) {
            const username = permission[i].username;
            const permissions = permission[i].permissions;
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
                User.findOneAndUpdate({username: username}, {permissions: filteredPermissions,
                    active: permission[i].active})
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

    user_register_details: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        RegisterRequest.find({}, (err, requests) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, registerrequests: requests});
        });
    },

    register_management: (req, res, next) => {
        var username = req.body.data.username;
        var registerResponse = req.body.data.value;
        if (registerResponse == "approve") {
            RegisterRequest.findOne({username: username}, (err, user) => {
                if (err) {
                    return res.status(501).json({success: false, message: err});
                }

                registration_ldap_controller.user_ldap_register(req, res, user, next);

                var permissions = [];
                if (req.body.data.role === "user") {
                    permissions.push("CRUD-workbook-template");
                } else if (req.body.data.role === "workbookAdmin") {
                    permissions.push("CRUD-workbook-template");
                    permissions.push("create-delete-attribute-category");
                } else {
                    permissions.push("CRUD-workbook-template");
                    permissions.push("create-delete-attribute-category");
                    permissions.push("user-management");
                }
                let newUser = new User({
                    username: username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    groupNumber: user.groupNumber,
                    organization: user.organization,
                    phoneNumber: user.phoneNumber,
                    validated: req.body.validated || false,
                    type: 2, // system admin=0, form manager=1, user=2
                    email: user.email,
                    permissions: permissions
                });
             //   var temporaryPassword = Math.random().toString(36).slice(-8);
                User.register(newUser, user.password, (err, user) => {
                    if (err) {
                        console.log(err);
                        return res.json({success: false, message: err});
                    }
                    console.log('success register');
                    sendMail.sendRegisterSuccessEmail(user.email, user.password, (info) => {
                        RegisterRequest.findOneAndDelete({username: username}, function(err) {
                            if (err) {
                                return res.status(501).json({success: false, message: err});
                            }
                            return res.json({success: true});
                        });
                    });
                });
            });
        } else {
            RegisterRequest.findOne({username: username}, (err, user) => {
                sendMail.sendRegisterFailEmail(user.email, (info) => {
                    RegisterRequest.findOneAndDelete({username: username}, function(err) {
                        if (err) {
                            return res.status(501).json({success: false, message: err});
                        }
                        return res.json({success: true});
                    });
                });
            });
        }
    },

    admin_get_all_users_with_details: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const groupNumber = req.session.user.groupNumber;
        let query = {groupNumber: groupNumber};
        if (parseInt(groupNumber) === 0) {
            query = {}
        }
        User.find(query, (err, users) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            console.log(users);
            return res.json({success: true, users: users});
        });
    },


    admin_get_all_permissions: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        return res.json({success: true, permissions: allPermissions});
    },

    delete_user: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        User.deleteOne({username:req.body.username}, (err) => {
            if (err) {
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, message: "The user " + req.body.username + " has been deleted!"});
        });
},

};
