const express = require('express');
const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');
const config = require('../config/config');
const user_controller = require('../controller/user');
const registration_local_controller = require('../controller/registration/local');
const registration_ldap_controller = require('../controller/registration/ldap');
let router = express.Router();

passport.use(new LdapStrategy(config.OPTS));

router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    }
    res.render('login.ejs');
});

router.get('/signup', function (req, res) {
    res.render('signup.ejs');
});

router.get('/api/isloggedin', function (req, res) {
    if (req.isAuthenticated()) {
        return res.json({isLoggedIn: true})
    }
    return res.json({isLoggedIn: false})
});

router.get('/api/organization_details', user_controller.getOrganizationDetails);

router.get('/api/check/email/:email', user_controller.check_email);
router.get('/api/check/username/:username', user_controller.check_username);

// POST request for user sign up from ldap server
router.post('/api/signup', registration_ldap_controller.user_ldap_signup);
// POST request for user sign up locally
router.post('/api/signup/local', registration_local_controller.user_sign_up_local);

router.get('/register-success-submit', function (req, res) {
    res.render('registerSuccessSubmit.ejs');
});

// POST request for user sign in
router.post('/api/login/local', user_controller.user_log_in);

router.post('/api/login/ldap', registration_ldap_controller.user_auth_login);
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
        if (req.method === 'GET' && !req.originalUrl.includes('api'))
            req.session.originalUrl = req.originalUrl;
        return res.redirect('/login');
    } else {
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

router.get('/api/profile', user_controller.get_profile);

// Query the current user logged in.
router.get('/api/users/current', user_controller.get_current_logged_in_user);

// Update a user's status. Used to disable or enable an account.
router.get('/api/users/:username/check-active/', user_controller.check_user_active);
// Update a user's status. Used to disable or enable an account.
router.put('/api/users/:username/active/', user_controller.update_user_active);

// profile page
router.get('/profile', function (req, res) {
    res.render('sidebar/profile.ejs', {user: req.session.user});
});

// update profile
router.post('/api/update-profile', user_controller.update_user_info);


router.get('/update-profile', function (req, res) {
    res.render('sidebar/updateProfile.ejs', {user: req.session.user});
});

// change password
router.post('/api/change-password', user_controller.change_password);

router.get('/change-password', function (req, res) {
    res.render('sidebar/changePassword.ejs');
});

module.exports = router;
