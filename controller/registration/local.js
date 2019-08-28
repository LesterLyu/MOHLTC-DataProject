const User = require('../../models/user');
const passport = require('passport');
const config = require('../../config/config'); // get our config file
const sendMail = require('./../sendmail');
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
    user_sign_up_local: (req, res, next) => {
        if (parseInt(req.body.groupNumber) === 0) {
            return res.status(400).json({success: false, message: 'Group number 0 is reserved for special usage.'});
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
                // all good
                let newUser = new User({
                    username: req.body.username,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    groupNumber: req.body.groupNumber,
                    phoneNumber: req.body.phoneNumber,
                    organization: req.body.organization,
                    validated: false,
                    email: req.body.email,
                });
                // if (config.disableEmailValidation) {
                //     newUser.validated = true;
                // }
                User.register(newUser, req.body.password, (err, user) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({success: false, message: err});
                    }
                    console.log('success sign up');
                    // sign in right after
                    passport.authenticate('local')(req, res, () => {
                        // set user info in the session
                        req.session.user = user;
                        if (config.disableEmailValidation) {
                            return res.json({success: true, redirect: '/profile'});
                        }
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

};
