const express = require('express');
const user_controller = require('../controller/user');
let router = express.Router();

router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/sidebar/profile');
    }
    res.render('login.ejs');
});

router.get('/signup', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/sidebar/profile');
    }
    res.render('signup.ejs');
});


// POST request for user sign up
router.post('/api/signup', user_controller.user_sign_up);

// POST request for user sign in
router.post('/api/login', user_controller.user_log_in);

// validate account from email link
router.get('/validate/:token', user_controller.user_validate);

// check authentication middleware
router.use((req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    else {
        next();
    }
});

// GET log out current account
router.get('/api/logout', user_controller.user_log_out);

// GET send account verification email
router.get('/api/send-validation-email', user_controller.user_send_validation_email);

// validate page (ask you to check your email)
router.get('/validate-now', function (req, res, next) {
    // check if the user is validated
    user_controller.get_user(req.session.user.username, (err, user) => {
        if (err) {
            return next(err);
        }
        if (user.validated) {
            user_controller.logout(req);
            return res.redirect('/login');
        }
        res.render('tobevalidated.ejs', {user: req.session.user});
    })
});

// check account validation middleware
router.use((req, res, next) => {
    if (!req.session.user.validated) {
        return res.redirect('/validate-now');
    }
    next();
});


// profile page
router.get('/profile', function (req, res) {
    res.render('sidebar/profile.ejs', {user: req.session.user});
});



module.exports = router;
