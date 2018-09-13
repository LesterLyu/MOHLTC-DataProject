const User = require('../models/user');
const passport = require('passport');
const config = require('../config/config'); // get our config file
const sendMail = require('./sendmail');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// helper functions
function isEmail(email) {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailReg.test(email);
}

/**
 *
 * @param username
 * @param expireTime in minutes
 */
function generateToken(username, expireTime) {
    let payload = {
        username: username
    };
    return jwt.sign(payload, config.superSecret, {
        expiresIn: expireTime * 60
    });
}

module.exports = {
    user_sign_up: (req, res, next) => {
        // check if email is taken (passport will check other errors, i.e. username taken)
        User.findOne({username: req.body.username}, (err, user) => {
            if (err) {
                console.log(err);
                return res.json({success: false, message: err});
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
                        console.log(err);
                        return res.json({success: false, message: err});
                    }
                    console.log('success sign up');
                    // sign in right after
                    passport.authenticate('local')(req, res, () => {
                        // set user info in the session
                        req.session.user = user;
                        // create token and sent by email
                        const token = generateToken(req.body.username, 60);
                        sendMail.sendValidationEmail(req.body.email, token, (info) => {
                            return res.json({success: true, redirect: '/validate-now'});
                        });
                    });

                });
            });

        });

    },

    user_log_in:
        (req, res, next) => {
            console.log('sign in');
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.status(401).json({success: false, message: info.message})
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    // set user info in the session
                    req.session.user = user;

                    return res.json({success: true, username: user.username, redirect: '/profile'})
                });
            })(req, res, next);

            //res.json({success: true, username: req.username})

        },

    user_log_out: (req, res) => {
        console.log('logout');
        req.logout();
        // clear user info in the session
        req.session.user = {};
        return res.json({success: true, redirect: '/'})
    },

    user_send_validation_email: (req, res, next) => {
        // create token and sent by email
        const token = generateToken(req.session.user.username, 60);
        sendMail.sendValidationEmail(req.session.user.email, token, (info) => {
            return res.redirect('/validate-now');
        });
    },

    user_validate:
        (req, res, next) => {
            jwt.verify(req.params.token, config.superSecret, function (err, decoded) {
                if (err) {
                    return res.json({success: false, message: 'Failed to authenticate token.'});
                } else {
                    User.findOne({username: decoded.username}, (err, user) => {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }
                        else {
                            user.validated = true;
                            user.save((err, updatedUser) => {
                                if (err) {
                                    console.log(err);
                                    return next(err);
                                }
                                // good
                                return res.redirect('/login');
                            });

                        }
                    })
                }
            });
        },

}
;