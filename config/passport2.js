// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var query = require('../models/query');
var loginquery = require('../models/loginquery');
const User = require('../models/user'); // Mongoose model



module.exports = function (passport) {
// =========================================================================
// passport session setup ==================================================
// =========================================================================






// REQUIRED for persistent login sessions

// Passport needs ability to serialize and unserialize users out of session
    passport.serializeUser(function (user, done) {
        console.log("SERIALIZE USER INVOKED.");
        console.log("user then user.id...");
        console.log(user);
        console.log(user.ID);
        done(null, user.ID);
    });

    passport.deserializeUser(function (id, done) {
        /*
        User.findById(id, function(err, user) {
          done(err, user);
        });
        */
        query.newQuery("SELECT * FROM user u WHERE u.id = '" + id + "';", function (err, data) {
            console.log("DESERIALIZE USER INVOKED.");
            var user = data[0];
            console.log(user);
            done(err, user);
        });
    });
// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy(
        {
            //by default, local strategy uses username and password, we will override with email
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, userName, password, done) {
            console.log(" ---------------- PASSPORT REQUEST ---------------------");
            //console.log(req);
            console.log(" -------------------------------------------------------");

            //asynchronuous :P
            //User.findOne won't fire unless data is sent back
            process.nextTick(function () {
                //find u user whose email is the same as the forms email
                //we are checking to see if the user is trying to login already exists
                /* OLD MONGOOSE FUNCTION
                User.findOne({ 'local.email' : email}, function(err, user) {
                  if (err) return done(err);
                  //Checks if the user already exists
                  if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already in use'));
                  }
                  else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.local.email = email;
                    newUser.local.password  = newUser.generateHash(password);

                    // save the user
                    newUser.save(function(err) {
                      if (err) throw err;
                      return done(null, newUser);
                    });
                  }
                });
                */
                query.newQuery("SELECT UserName FROM user u WHERE u.UserName LIKE '" + userName + "';", function (error, data) {
                    if (error) return done(error);

                    //Checks if the user already exists
                    console.log("Data: ");
                    console.log(data);
                    var statement = (data.length > 0);
                    console.log(statement);
                    if (statement) {
                        console.log("hi");
                        return done(null, false, req.flash('signupMessage', 'That username is already in use'));
                    }
                    else {
                        query.newQuery("SELECT Email FROM user u WHERE u.Email = '" + req.body.contactEmail + "'; ", function (error, data1) {
                            if (error) return done(error);
                            if (data1.length > 0) {
                                return done(null, false, req.flash('signupMessage1', 'That email is already in use'));
                            }
                            else {
                                var queryUser;
                                var hashedPassword = loginquery.generateHash(password);

                                queryUser = "INSERT INTO user (userName, password, createDate, validated, email, phonenumber, admin, GroupNumber) "
                                    + " VALUES ('" + userName + "', '" + hashedPassword + "', NOW(), 0,  + '" + req.body.contactEmail
                                    + "', '" + req.body.contactPhone + "', 0 , '" + req.body.groupNumber + "');";

                                query.newQuery(queryUser, function (err, data) {
                                    console.log("Insert function completed.");
                                    console.log("data variable contains: ");
                                    console.log(data);
                                    if (err) throw err;

                                    //To make it identical to a login...
                                    query.newQuery("SELECT * FROM user u WHERE u.UserName LIKE '" + userName + "';", function (err, data) {
                                        //data should contain the password
                                        console.log("Data: ");
                                        console.log(data);
                                        console.log(data[0].password);
                                        console.log("Your password: " + password);

                                        console.log("Correct password. Data: ");
                                        return done(null, data[0]);
                                    });
                                });
                            }
                        });
                    }

                });
            });
        }));


// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, userName, password, done) { // callback with email and password from our form

            // find u user whose email is the same as the form's email
            // we are checking to see if the user trying to login exists
            /* OLD MONGOOSE FUNCTION
            User.findOne({'local.email' : email}, function(err, user) {
              // if there are any errors, return the error before anything else:
              if (err) return done(err);

              // if no user is  found...
              if (!user) return done(null, false, req.flash('loginMessage', 'User not found'));
                // ^ req.flash is the way to set flashdata using connect-flash

              //if the user is found but the password is wrong
              if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Incorrect password'));

              //If all is well...
              return done(null, user);
            });
            */
            console.log("LOGIN FUNCTION INVOKED!");

            query.newQuery("SELECT userName FROM user u WHERE u.UserName LIKE '" + userName + "';", function (error, data) {
                // if there are any errors, return the error before anything else:
                if (error) return done(error);
                console.log("Data: ");
                console.log(data);
                //Checks if the user already exists
                if (data.length === 0) {
                    return done(null, false, req.flash('loginMessage', 'User not found'));
                    // ^ req.flash is the way to set flashdata using connect-flash
                }


                var valid;
                query.newQuery("SELECT * FROM user u WHERE u.UserName LIKE '" + userName + "';", function (err, data) {
                    //data should contain the password
                    console.log("Data: ");
                    console.log(data);
                    console.log(data[0].password);
                    console.log("Your password: " + password);

                    if (loginquery.validPassword(userName, password, data)) {
                        console.log("Correct password. Data: ");
                        console.log(data);

                        //But if the account is not validated...
                        if (data[0].validated != 1) {
                            console.log("THIS ACCOUNT IS NOT VALID!");
                            //deletes invalid/expired tokens now
                            var darkLogin = require('../models/loginquery.js');
                            darkLogin.purgeTokens(function () {
                                console.log("The tokens have been purged!");
                                darkLogin.purgeAccounts(function () {
                                    console.log("The users have been purged!");
                                });
                            });
                            return done(null, false, req.flash('loginMessage', 'Your account is not yet valid! Please validate at: '));
                        }

                        //If all is well...
                        return done(null, data[0]);
                    }
                    else {
                        //console.log(loginquery.validPassword(userName, password));
                        console.log("Password incorrect.");
                        return done(null, false, req.flash('loginMessage', 'Incorrect Password.'));
                    }
                });

                //if (!loginquery.validPassword(email, password)) {
                //  console.log(loginquery.validPassword(email, password));
                //  console.log("Password incorrect.");
                //  return done(null, false, req.flash('loginMessage', 'Incorrect Password.'));
                //}

            });

        }));

}
