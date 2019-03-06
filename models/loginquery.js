var mysql = require('mysql');

var bcrypt = require('bcrypt-nodejs');

var db = require('./query');

const saltRounds = 10;

module.exports =
    {
        generateHash: function (password) {
            console.log("hashing your password");
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        },
        generateResetHash: function (password, callback) {
            console.log("hash function is called");
            var resetPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
            callback(resetPass);
        },
        //compares the plaintext password with the hashed password
        validPassword: function (email, password, data) {
            var bcryptcomparesync = bcrypt.compareSync(password, data[0].password);

            return bcryptcomparesync;
        },

        // This will create an object with THREE VALUES
// {token, userID, expiry}
    generateTokenObject: function (userID, countdownMinutes, callback) {
        var currentDate = new Date();

        var expiryMiliseconds = countdownMinutes * 60 * 1000;
        var expiryDate = new Date(currentDate.getTime() + expiryMiliseconds);
        console.log("Current Date: ");
        console.log(currentDate);
        console.log("Expiring Date: ");
        console.log(expiryDate);

        var hashToken = bcrypt.hashSync(userID + currentDate.getTime() + "some_string-lmao", bcrypt.genSaltSync(1), null);
        var tokenObject = {token: hashToken, ID: userID, expiry: expiryDate.getTime()};

        //DO A QUICK PURGE (DOES NOT WORK)
        /*
        module.exports.purgeTokens(function () {
          module.exports.purgeAccounts(function() {
            console.log("PURGE'D.");
            callback(tokenObject);
          });
        });
        */
        callback(tokenObject);
    },

    //This will go through the token table, deleting all expired tokens
    purgeTokens: function (callback) {
        rightNow = new Date();

        //Select every date where the expiry date is smaller (earlier) than right now
        db.newQuery("SELECT ID FROM token WHERE expiry < " + rightNow.getTime() + ";", function (err, data) {
            if (data.length == 0) {
                callback();
            }
            //Now, delete them all!
            for (var i = 0; i < data.length; i++) {
                (function (cntr) {
                    var deleteDIS = "DELETE FROM token WHERE ID = " + data[cntr].ID + ";";
                    db.newQuery(deleteDIS, function (err, data2) {
                        console.log("TOKEN DELETED!!!");
                        console.log(data2);
                        console.log(cntr);
                        console.log(data.length - 1);
                        if (cntr == data.length - 1) {
                            callback();
                        }
                    });
                })(i);
            }
        });

    },

    //This will go through and delete all accounts that neither have a token nor are validated.
    purgeAccounts: function (callback) {
        rightNow = new Date();

        //select every user who is not validated
        db.newQuery("SELECT ID FROM user WHERE Validated = 0;", function (err, data) {
            if (data.length == 0) {
                callback();
            }
            console.log(data.length);
            for (var i = 0; i < data.length; i++) {
                //Find out if each one has a token
                (function (cntr) {

                    db.newQuery("SELECT * FROM token WHERE UserID = " + data[cntr].ID, function (err, data2) {
                        console.log(data2);
                        if (data2 === undefined || data2.length < 1) {
                            //That means there's no token! DELETE DIS
                            console.log("second data object " + data[cntr].ID);
                            var deleteDIS = "DELETE FROM user WHERE ID = " + data[cntr].ID + ";";
                            db.newQuery(deleteDIS, function (err, data3) {
                                console.log("USER DELETED!!!");
                                console.log(data2);
                                if (cntr == data.length - 1) {
                                    callback();
                                }
                            });
                        }
                        else if (cntr == data.length - 1) {
                            callback();
                        }
                    });

                })(i);
            }
        });
    }

}
