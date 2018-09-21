const express = require('express');
const passport = require('passport');
const user_controller = require('../controller/user');
const jwt = require("jsonwebtoken");
let router = express.Router();

const config = require('../config/config');


// =====================================
// LOGIN =============================
// =====================================
router.get('/login', function (req, res) {
    if (req.isAuthenticated() && req.session.user.validated) { // preserve sign in after validation
        if (config.enableNewInterface)
            return res.redirect('/new/profile');
        return res.redirect('/profile');
    }
    res.render('login.ejs');
});

router.get('/signup', function (req, res) {
    if (req.isAuthenticated()) {
        if (config.enableNewInterface)
            return res.redirect('/new/profile');
        return res.redirect('/profile');
    }
    res.render('signup.ejs');
});


// POST request for user sign up
router.post('/api/signup', user_controller.user_sign_up);

router.post('/api/login', user_controller.user_log_in);

// validate account
router.get('/validate/:token', user_controller.user_validate);

// check authentication middleware
router.use((req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    else {
        console.log('Authenticated');
        next();
    }
});

router.get('/api/logout', user_controller.user_log_out);

router.get('/api/send-validation-email', user_controller.user_send_validation_email);

router.get('/validate-now', function (req, res, next) {
    // check if the user is validated
    user_controller.get_user(req.session.user.username, (err, user) => {
        if (err) {
            return next(err);
        }
        if (user.validated) {
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

router.get('/add-att-cat', (req, res, next) => {
    res.render('addAttCat.ejs', {user: req.session.user});
});

// add attribute ang category
router.post('/api/add-att', user_controller.user_add_att);

router.post('/api/add-cat', user_controller.user_add_cat);

router.get('/api/attributes', user_controller.get_attributes);

router.get('/api/categories', user_controller.get_categories);


router.get('/profile', function (req, res) {
    res.render('profile.ejs', {user: req.session.user});
});

router.get('/dashboard', function (req, res) {
    res.render('new/dashboard.ejs', {user: req.session.user});
});

// new pages
router.get('/new/profile', function (req, res) {
    res.render('new/profile.ejs', {user: req.session.user});
});

router.get('/new/workbooks', function (req, res) {
    res.render('new/workbooks.ejs', {user: req.session.user});
});

router.get('/new/add-att-cat', (req, res, next) => {
    res.render('new/addAttCat.ejs', {user: req.session.user});
});


module.exports = router;
