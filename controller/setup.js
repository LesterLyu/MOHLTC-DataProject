const User = require('../models/user');
const passport = require('passport');
const config = require('../config/config'); // get our config file
const error = require('../config/error');

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

    firstTimeSetup: (req, res, next) => {
        if (!config.firstTimeRun) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        if (!isEmail(req.body.email)) {
            return res.status(400).json({success: false, message: 'Email format error.'});
        }
        let newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            groupNumber: 1,
            phoneNumber: req.body.phoneNumber,
            validated: true,
            email: req.body.email,
            permissions: Object.values(config.permissions),   // all permissions
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
    },
};
