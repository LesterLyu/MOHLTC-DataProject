//https://stackoverflow.com/questions/2923809/many-to-many-relationships-examples
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
module.exports = function (app, passport) {
    console.log("Server ready...");
    app.get("/", function (req, res) {
        res.render('index.ejs');
    });
    app.get("/table", function (req, res) {
        res.render('tablegrid.ejs');
    })
    app.get("/dynamic", function (req, res) {
        res.render('dynamictable.ejs');
    })

    app.get("/custom", isLoggedIn, isAdmin, function (req, res) {
        var dataConv = require('../models/dataconversion.js');
        var query = require("../models/query.js");
        query.newQuery("SELECT * FROM categories", function (err, categories) {
            query.newQuery("SELECT * FROM attributes", function (err, attributes) {
                console.log(categories);
                res.render('customtable.ejs',
                    {
                        chooseAttri: attributes,
                        chooseCat: categories,
                        messages: "undefined"
                    });
            })
        })
    });
    app.post("/custom", function (req, res) {
        console.log(req.body);
        var dataConv = require('../models/dataconversion.js');
        if (req.user.admin == 1 || req.user.admin == 0)
            dataConv.makeForm(req.body, req.user, res, req, function () {
                console.log("made the table!")
                return res.redirect('/profile');
            });

    });
    //not actual profile yet

//passport stuff
    app.get("/login", function (req, res) {
        console.log("app get '/login'");
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    app.post("/login", passport.authenticate('local-login',
        {
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true //flash messages are allowed
        }));
    // =====================================
    // SIGNUP ==============================
    // =====================================
    app.get('/signup', function (req, res) {
        //DEBUGGING
        console.log("app get /signup");
        //console.log(req.body);
        console.log("ABOVE IS APP.GET SIGNUP ^^^^^!!!");
        res.render('signup.ejs', {message: req.flash('signupMessage'), message1: req.flash('signupMessage1')});
    });
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup',
        {
            successRedirect: '/validate',
            failureRedirect: '/signup',
            failureFlash: true //allows flash messages
        }));

    app.get('/validate', isLoggedIn, function (req, res) {
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
    app.get('/validate-now', function (req, res) {
        console.log(req.query.tok);
        var query = require('../models/query');
        var tokenAuthen = require('../models/tokenauth');
        tokenAuthen.checkToken(res, req);
    });
    // =====================================
    // LOGIN =============================
    // =====================================
    app.get('/login', function (req, res) {
        console.log("app get '/login'");
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    app.post('/login', passport.authenticate('local-login',
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
                console.log("filledFormTitle")
                res.render('profile.ejs',
                    {
                        user: req.user,
                        unfilledForms: formData,
                        filledForms: filledFormTitle
                    });
            });
        });
    });
    // ======================================
    // FILL FORM ============================
    // ======================================
    app.get('/fillForm', isLoggedIn, function (req, res) {
        var query = require('../models/query.js');
        var retriever = require('../models/formRetriever.js');
        retriever.displayForm(req.user, req.query, function (categoryArray, attributeArray) {
            query.newQuery("SELECT Title FROM form WHERE Id= " + req.query.formId, function (error, formTitle) {
                res.render('form.ejs',
                    {
                        title: formTitle,
                        category: categoryArray,
                        attribute: attributeArray
                    });
            });
        });
    });
    app.post('/fillForm', isLoggedIn, function (req, res) {
        var convert = require('../models/dataconversion.js');
        var retriever = require('../models/formRetriever.js');
        retriever.displayForm(req.user, req.query, function (categoryArray1, attributeArray1) {
            convert.processData(req.body, req.user, req.query, categoryArray1, attributeArray1, function () {
                console.log("all done baby!");
                res.redirect('/profile')
            })

        });
    });
    // =====================================
    // VIEW FILLED FORM ====================
    // =====================================
    app.get('/viewForm', isLoggedIn, function (req, res) {
        var retriever = require('../models/formRetriever.js');

        retriever.viewForm(req.user, req.query, function (arrayOfData) {
            console.log("wtf?")
            console.log(arrayOfData);
            res.render('viewForm.ejs',
                {
                    data: arrayOfData,
                    title: req.query.Title
                });

        });

    });
    app.post('/viewForm', isLoggedIn, function (req, res) {
        var retriever = require('../models/formRetriever.js');
        retriever.viewForm(req.user, req.query, function (arrayOfData) {
            console.log("?????????");
            retriever.submitFormEdit(req.body, req.user, arrayOfData, req.query, function () {
                res.redirect('/profile');
            })
        });
    })
    // =====================================
    // PASSWORD RESET ======================
    // =====================================
    app.get('/enter-your-email', function (req, res) {
        console.log("enter email address initiated");
        res.render('emailResetLink.ejs');
    });
    app.post('/emailResetLink', function (req, res) {
        //declare all the requires
        var query = require('../models/query');
        var loginquery = require('../models/loginquery.js');
        var mail = require('../models/sendMail.js');
        var userEmail = req.body.userEmail;
        query.newQuery("SELECT * FROM user WHERE user.email = '" + userEmail + "'  ;", function (err, emailLength) {
            if (emailLength.length < 1) {
                console.log("email address not found!");
                res.render('invalidEmail.ejs');
            }
            else {
                console.log("lets send the user a password reset link!");
                //selects the userID with the email entered in by the user
                query.newQuery("SELECT user.ID FROM user WHERE user.Email = '" + userEmail + "' ;", function (err, queriedID) {
                    console.log(queriedID);
                    //generates token object and then uses it as a parameter in the anonymous function below
                    loginquery.generateTokenObject(queriedID, 10, function (tokenObject) {
                        console.log(tokenObject);
                        console.log(tokenObject.ID[0].ID);
                        //inserts the token into the tokens database
                        query.newQuery("INSERT INTO token (UserId, TokenContent, Expiry) VALUES (" + tokenObject.ID[0].ID + ", '" + tokenObject.token + "', '" + tokenObject.expiry + "');", function (err, data) {
                            console.log("SUCCESS!");
                            console.log(data);
                        });
                        console.log("Let's asynchronously also send the email");
                        //sends the email message out with the link with the unique token address
                        mail.sendFromHaodasMail(userEmail, "First Nations Online Income Reports: Password Reset Link!",
                            "Please click on the following link: \n https://genericdataappexp.azurewebsites.net/forgotten-password?token=" + tokenObject.token + "&ID=RESETPASSWORD to validate yourself: "
                        );
                    });
                })
                //creates a new token for the user so he or she can reset the password

                res.render('linksent.ejs');

            }
        });
    });
    app.get('/forgotten-password', function (req, res) {
        console.log("app reset password starts");
        console.log(req.query.token);
        var query = require('../models/query');
        query.newQuery("SELECT * FROM token WHERE token.TokenContent = '" + req.query.token + "';", function (err, tokenData) {
            if (tokenData.length != 1) {
                //The user's token does not exist or has expired
                console.log("TOKEN NOT FOUND!");
                res.render('ResetFailure.ejs');
            }
            else {
                //check to see if the user's token is still valid or not (expiry date will be used for this)
                var currentDate = new Date();
                console.log("CURRENT TIME: ");
                console.log(currentDate);
                console.log("EXPIRY TIME: ");
                console.log(tokenData[0].Expiry);
                if (currentDate.getTime() > tokenData[0].Expiry) {
                    console.log("TOKEN EXPIRED!");
                    res.render('ResetFailure.ejs', {});
                }
                else {
                    res.render("resetPassword.ejs");
                }
            }
            //apparently everything looks good so the program proceeds to reset your password
        })
    });
    app.post('/forgotten-password', function (req, res) {
        var resetPass = require('../models/resetPassword.js');
        //rests the password
        console.log("password reset starts!");
        resetPass.resetThePassword(req, res);
    });

    app.get('/upload', isLoggedIn, function (req, res) {
        res.sendFile(path.join(__dirname, '../views/excelToHtml.html'));
    });
    app.post('/upload', function (req, res) {


        // create an incoming form object
        var form = new formidable.IncomingForm();

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;

        // store all uploads in the /uploads directory
        form.uploadDir = path.join(__dirname, '../uploads');

        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', function (field, file) {
            fs.rename(file.path, path.join(form.uploadDir, file.name));
        });

        // log any errors that occur
        form.on('error', function (err) {
            console.log('An error has occured: \n' + err);
        });

        // once all the files have been uploaded, send a response to the client
        form.on('end', function () {
            res.end('success');
        });

        // parse the incoming request containing the form data
        form.parse(req);

    });
    app.get('/createNew', isLoggedIn, isAdmin, function (req, res) {
        res.render('createRows.ejs',
            {
                attriMessage: "",
                catMessage: "",
                successMessage: ""
            });
    })
    app.post("/submitCategory", isLoggedIn, isAdmin, function (req, res) {
        var category = require('../models/dataconversion');
        category.makeCategory(req.body, req.user, res, req);
    })
    app.post("/submitAttribute", isLoggedIn, isAdmin, function (req, res) {
        var attribute = require('../models/dataconversion');
        attribute.makeAttribute(req.body, req.user, res, req);
    })

    app.get('/purge', function (req, res) {
        console.log("I-I-It's the Purge, Morty! We're in The Purge!!");

        //This will delete all expired tokens and unvalidated users without valid tokens!
        var darkLogin = require('../models/loginquery.js');
        darkLogin.purgeTokens(function () {
            console.log("The tokens have been purged!");
            darkLogin.purgeAccounts(function () {
                console.log("The users have been purged!");
                res.redirect('/');
            });
        });
    });


    // ============================
    //helper funtions =============
    // ============================
    function isLoggedIn(req, res, next) {

        // if the user is authenticated in the session, carry on
        if (req.isAuthenticated()) return next();
        res.redirect('/');
    }

    function isAdmin(req, res, next) {
        if (req.user.admin == 1) return next();
        res.redirect('/');
    }

}
