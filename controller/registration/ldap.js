const express = require('express');
const passport = require('passport');
const ldap = require('ldapjs');
const LdapStrategy = require('passport-ldapauth');
const user_controller = require('../../controller/user');
const config = require('../../config/config'); // get our config file

passport.use(new LdapStrategy(config.OPTS));

let client;
if (!config.disableLdap) {
    client = ldap.createClient({
        url: config.OPTS.server.url,
    });
    client.bind(config.OPTS.server.bindDN, config.OPTS.server.bindCredentials, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = {
    user_auth_login: (req, res, next) => {
        passport.authenticate('ldapauth', function (err, user, info) {
            if (err) {
                console.log(err);
            }
            if (!user){
                return res.json(404, {message: 'Your Username or Password is not valid, please contact your manager!'});
            }
            user_controller.user_log_in(req, res, next);
        })(req, res, next)
    },

    user_ldap_register: (req, res, user, next) => {
        var username = user.username;
        var password = user.password;
        var firstName = user.firstName;
        var lastName = user.lastName;
        var groupNumber = user.groupNumber;
        var phoneNumber = user.phoneNumber;
        var email = user.email;
        var opts = {
            filter: '(uid=' + username +')',
            scope: 'sub',
            attributes: ['dn', 'sn', 'cn']
        };
        client.search(config.OPTS.server.searchBase, opts, function(err, res) {
            var found = false;

            res.on('searchEntry', function(entry) {
                found = true;
                var changeMail = new ldap.Change({
                    operation: 'replace',
                    modification: {
                        mail: email,
                    }
                });
                var changeGivenname = new ldap.Change({
                    operation: 'replace',
                    modification: {
                        givenname: lastName,
                    }
                });
                var changeTelephonenumber = new ldap.Change({
                    operation: 'replace',
                    modification: {
                        telephonenumber: phoneNumber
                    }
                });
                var changes = [changeMail, changeGivenname, changeTelephonenumber]
                client.modify('uid=' + username + ' ,cn=users, DC=HEALTHINFO,DC=MOH.GOV.ON.CA', changes, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
            res.on('searchReference', function(referral) {
                console.log('referral: ' + referral.uris.join());
            });
            res.on('error', function(err) {
                console.error('error: ' + err.message);
            });
            res.on('end', function(result) {
                if (!found) {
                    var entry = {
                        objectclass: ['inetOrgPerson', 'organizationalPerson', 'person', 'top'],
                        cn: username,
                        sn: firstName,
                        mail: email,
                        uid: username,
                        userpassword: password,
                        givenname: lastName,
                        telephonenumber: phoneNumber
                    };
                    client.add('uid=' + username + ' ,cn=users, DC=HEALTHINFO,DC=MOH.GOV.ON.CA', entry, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                console.log('status: ' + result.status);
            });
        });
    },

    user_ldap_signup: (req, res, next) => {

        passport.authenticate('ldapauth', function (err, user, info) {
            if (err) {
                console.log(err);
            }
            if (!user){
                var username = req.body.username;
                // console.log(username);
                var opts = {
                    filter: '(uid=' + username +')',
                    scope: 'sub',
                    attributes: ['dn', 'sn', 'cn']
                };
                client.search('DC=HEALTHINFO,DC=MOH.GOV.ON.CA', opts, function(err, re) {
                    var found = false;
                    re.on('searchEntry', function(entry) {
                        found = true;
                        return res.status(404).json({message: "Incorrect Password!"});
                    });
                    re.on('searchReference', function(referral) {
                        console.log('referral: ' + referral.uris.join());
                    });
                    re.on('error', function(err) {
                        console.error('error: ' + err.message);
                    });
                    re.on('end', function(result) {
                        if (!found) {
                            user_controller.user_sign_up(req, res, next);
                        }
                        console.log('status: ' + result.status);
                    });
                });
            } else {
                user_controller.user_sign_up(req, res, next);
            }
        })(req, res, next)

    }
};
