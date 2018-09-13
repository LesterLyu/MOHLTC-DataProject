const express = require('express');
const passport = require('passport');
const user_controller = require('../controller/user');
const jwt = require("jsonwebtoken");
let router = express.Router();


// =====================================
// LOGIN =============================
// =====================================
router.get('/login', function (req, res) {
    res.render('login.ejs');
});

router.get('/signup', function (req, res) {
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
        return res.status(401).json({
            success: false,
            message: 'You need to be authenticated to access this page!'
        })
    }
    else {
        console.log('Authenticated');
        next();
    }
});

router.get('/validate-now', function (req, res) {
    if (req.session.user.validated) {
        return res.redirect('/profile');
    }
    res.render('tobevalidated.ejs');
});

// // check account validation middleware
router.use((req, res, next) => {

    if (!req.session.user.validated) {
        return res.redirect('/validate-now');
    }
    next();
});

router.post('/api/logout', user_controller.user_log_out);


// =====================================
// PROFILE =============================
// =====================================
router.get('/profile', function (req, res) {
    console.log("/GET PROFILE");
    //Check user
    console.log(req.user);
    var query = require('../models/query.js');
    var displayTables = require('../models/formRetriever.js');
    displayTables.getFormIndex(req.user, function (formData) {
        displayTables.getFilledForms(req.user, function (filledFormTitle) {
            console.log(filledFormTitle);
            console.log("hola");
            console.log("filledFormTitle");
            res.render('profile.ejs',
                {
                    user: req.user,
                    unfilledForms: formData,
                    filledForms: filledFormTitle
                });
        });
    });
});


module.exports = router;
