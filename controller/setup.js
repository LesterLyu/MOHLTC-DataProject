const User = require('../models/user');
const passport = require('passport');
const config = require('../config/config'); // get our config file
const error = require('../config/error');
const sendMail = require('./sendmail');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// helper functions
function isEmail(email) {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailReg.test(email);
}

module.exports = {
    // set up
    setup: () => {
        User.find({}, 'name', function (err, docs) {
            if (err) {
                console.log(err);
            }
            config.firstTimeRun = docs.length === 0;
        })
    },

    signup_admin: (req, res, next) => {
        if (!config.firstTimeRun) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }

        // check if email is taken (passport will check other errors, i.e. username taken)
        User.findOne({username: req.body.username}, (err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (user) {
                return res.status(400).json({success: false, message: 'Username taken.'});
            }
            User.findOne({email: req.body.email}, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.json({success: false, message: err});
                }
                if (user) {
                    return res.status(400).json({success: false, message: 'Email taken.'});
                }
                if (!isEmail(req.body.email)) {
                    return res.status(400).json({success: false, message: 'Email format error.'});
                }
                // gather all permissions
                const permissions = [];
                for (let permissionKey in config.permissions) {
                    permissions.push(config.permissions[permissionKey]);
                }
                // all good
                let newUser = new User({
                    username: req.body.username,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    groupNumber: 0,
                    phoneNumber: req.body.phoneNumber,
                    validated: true,
                    email: req.body.email,
                    permissions: permissions,
                });
                User.register(newUser, req.body.password, (err, user) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({success: false, message: err});
                    }
                    // sign in right after
                    passport.authenticate('local')(req, res, () => {
                        // set user info in the session
                        req.session.user = user;
                        config.firstTimeRun = false;
                        return res.json({success: true, redirect: '/profile'});
                    });

                });
            });

        });

    },

};
