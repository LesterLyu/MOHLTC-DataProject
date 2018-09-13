const express = require('express');
const passport = require('passport');
const user_controller = require('../controller/user');
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


// New code by Lester
// POST request for user sign up
router.post('/api/signup', user_controller.user_sign_up);

router.post('/api/login', user_controller.user_log_in);

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

router.get('/validate', function (req, res) {
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


module.exports = router;
