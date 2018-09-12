const User = require('../models/user');
const passport = require('passport');

function is_email(email) {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailReg.test(email);
}

module.exports = {
    user_sign_up: (req, res, next) => {
        // check if email is taken (passport will check other errors, i.e. username taken)
        User.findOne({email: req.body.email}, (err, email) => {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            }
            if (email) {
                res.json({success: false, message: 'Email taken.'});
            }
            else {
                if (is_email(req.body.email)) {
                    res.json({success: false, message: 'Email format error.'});
                }
                // all good
                let newUser = new User({
                    username: req.body.username,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    groupNumber: req.body.groupNumber,
                    phoneNumber: req.body.phoneNumber,
                    validated: false,
                    type: 2, // system admin=0, form manager=1, user=2
                    email: req.body.email,
                });
                User.register(newUser, req.body.password, (err, user) => {
                    if (err) {
                        res.json({success: false, message: err});
                    }
                    console.log('success sign up');
                    // authenticate the user right after registration
                    passport.authenticate('local')(req, res, function () {
                        res.json({success: true, redirect: '/profile'});
                    });
                })
            }
        })

    },

    user_log_out: (req, res) => {
        req.logout();
        req.json({success: true, redirect: '/'})
    },

    user_sign_in: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                res.json({success: false, message: err + info});
            }

        });
        req.session.save((err) => {
            if (err) {
                res.json({success: false, message: err});
            }
            res.json({success: true, redirect: '/profile'});
        })
    },

    user_validate: (req, res, next) => {

    },

};