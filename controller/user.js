const User = require('../models/user');
const passport = require('passport');

function is_email(email) {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailReg.test(email);
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
                return res.status(401).json({success: false, message: 'Username taken.'});
            }
            User.findOne({email: req.body.email}, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.json({success: false, message: err});
                }
                if (user) {
                    return res.status(401).json({success: false, message: 'Email taken.'});
                }
                if (!is_email(req.body.email)) {
                    return res.status(401).json({success: false, message: 'Email format error.'});
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
                        return res.json({success: false, message: err});
                    }
                    console.log('success sign up');
                    return res.json({success: true, redirect: '/'});

                });
            });

        });

    },

    user_log_out: (req, res) => {
        console.log('logout');
        req.logout();
        return res.json({success: true, redirect: '/'})
    },

    user_log_in:
        (req, res, next) => {
            console.log('sign in');
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.status(401).json({success: false, message: info})
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }

                    return res.json({success: true, username: user.username, redirect: '/profile'})
                });
            })(req, res, next);

            //res.json({success: true, username: req.username})

        },

    user_validate:
        (req, res, next) => {

        },

}
;