const User = require('../models/user');
const passport = require('passport');

function is_email(email) {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailReg.test(email);
}

module.exports = {
    user_sign_up: (req, res, next) => {
        // check if username and email are not taken
        User.findOne({username: req.body.username}, (err, user) => {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
            }
            if (user) {
                res.json({success: false, message: 'Username taken.'});
            } else {
                user.findOne({email: req.body.email}, (err, email) => {
                    if (err) {
                        console.log(err);
                        res.json({success: false, message: err});
                    }
                    if (email) {
                        res.json({success: false, message: 'Email taken.'});
                    }
                    else {
                        // all good
                        let newUser = new User({
                            username: req.body.username,
                            phoneNumber: req.body.phoneNumber,
                            validated: false,
                            type: 2, // system admin=0, form manager=1, user=2
                            email: req.body.email,
                        });
                        User.register(newUser, req.body.password, (err, account) => {
                            if (err) {
                                res.json({success: false, message: err});
                            }

                            passport.authenticate('local')(req, res, function () {
                                res.redirect('/');
                            });

                        })
                    }
                })
            }
        })

    },
    user_sign_in: () => {

    },


};