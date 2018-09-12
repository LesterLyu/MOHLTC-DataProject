const express = require('express');
const passport = require('passport');
const user_controller = require('../controller/user');
let router = express.Router();


router.get("/login", function (req, res) {
    console.log("app get '/login'");
    res.render('login.ejs', {message: req.flash('loginMessage')});
});

router.post("/login", passport.authenticate('local-login',
    {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true //flash messages are allowed
    }));
// =====================================
// SIGNUP ==============================
// =====================================
router.get('/signup', function (req, res) {
    //DEBUGGING
    console.log("app get /signup");
    //console.log(req.body);
    console.log("ABOVE IS APP.GET SIGNUP ^^^^^!!!");
    res.render('signup.ejs', {message: req.flash('signupMessage'), message1: req.flash('signupMessage1')});
});


router.get('/validate', isLoggedIn, function (req, res) {
    console.log("app get /validation-required");
    var query = require('../models/query');
    var loginquery = require('../models/loginquery.js');
    var mail = require('../models/sendMail.js');

    //Now, let's generate a token
    loginquery.generateTokenObject(req.user.ID, 10, function (tokenObject) {
        console.log(tokenObject);
        query.newQuery("INSERT INTO token (UserId, TokenContent, Expiry) VALUES (" + tokenObject.ID + ", '" + tokenObject.token + "', '" + tokenObject.expiry + "');", function (err, data) {
            console.log("SUCCESS!");
            console.log(data);
        });
        console.log("Let's asynchronously also send the email");
        console.log(req.user.email);
        mail.sendFromHaodasMail(req.user.email, "First Nations Online Income Reports: User Validation Required!",
            "Please click on the following link: \n https://genericdataappexp.azurewebsites.net/validate-now?tok=" + tokenObject.token + " to validate yourself: "
        );
    });
    res.render('tobevalidated.ejs');
});
// =====================================
// Validation ==========================
// =====================================
router.get('/validate-now', function (req, res) {
    console.log(req.query.tok);
    var query = require('../models/query');
    var tokenAuthen = require('../models/tokenauth');
    tokenAuthen.checkToken(res, req);
});
// =====================================
// LOGIN =============================
// =====================================
router.get('/login', function (req, res) {
    console.log("app get '/login'");
    res.render('login.ejs', {message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login',
    {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true //allow flash messages
    }));

// =====================================
// PROFILE =============================
// =====================================
app.get('/profile', isLoggedIn, function (req, res) {
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

// New code by Lester
// POST request for user sign up
router.post('/signup', user_controller.user_sign_up);


