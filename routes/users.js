const express = require('express');
const user_controller = require('../controller/user');
const registration_local_controller = require('../controller/registration/local');
let router = express.Router();

router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    }
    res.render('login.ejs');
});

router.get('/signup', function (req, res) {
    res.render('signup.ejs');
});

router.get('/api/organization_details', user_controller.getOrganizationDetails);

// POST request for user sign up from ldap server
router.post('/api/signup', user_controller.user_sign_up);

// POST request for user sign up locally
router.post('/api/signup/local', registration_local_controller.user_sign_up_local);

router.get('/register-success-submit', function (req, res) {
    res.render('registerSuccessSubmit.ejs');
});

// POST request for user sign in
router.post('/api/login', user_controller.user_log_in);


// reset password by email
router.get('/enter-your-email', function (req, res) {
    res.render('ForgetPasswordReset.ejs');
});

router.post('/api/reset-password', user_controller.user_reset_password);

router.post('/api/send-reset-email', user_controller.user_send_reset_email);

router.get('/reset/:token', user_controller.password_reset_validate);

router.post('/api/reset-password-link', user_controller.reset_password_link);

router.get('/reset-password-link', function (req, res) {
    res.render('ForgetPasswordLink.ejs', {username: req.session.user.username});
});

// validate account from email link
router.get('/validate/:token', user_controller.user_validate);

// check authentication middleware
router.use((req, res, next) => {

    if (!req.isAuthenticated()) {
        req.session.originalUrl = req.originalUrl;
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

// update profile

router.post('/api/update-profile',user_controller.update_user_info);


router.get('/update-profile', function (req, res) {
    res.render('sidebar/updateProfile.ejs', {user: req.session.user});
});

// change password
router.post('/api/change-password', user_controller.change_password);

router.get('/change-password', function (req, res) {
    res.render('sidebar/changePassword.ejs');
});

module.exports = router;
