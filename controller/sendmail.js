const nodeMailer = require('nodemailer');
const config = require('../config/config'); // get our config file

const smtpTransport = nodeMailer.createTransport(config.mailServer);

module.exports = {



    sendValidationEmail: function (to, token, callback) {
        let mailOptions = {
            from: config.mailServer.sender, // sender address
            to: to, // list of receivers
            subject: 'Please Validate Your Account', // Subject line
            text: '', // plain text body
            html: '<html>Please click on the following link: to validate yourself:<br>'
                + config.serverHostname +'/validate/' + token + ' <html>'
        };

        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            callback('Email sent.');
        });


    },

    sendResetEmail: function (to, token, callback) {
        let mailOptions = {
            from: config.mailServer.sender, // sender address
            to: to, // list of receivers
            subject: 'Please Reset your Password', // Subject line
            text: '', // plain text body
            html: '<html>Please click on the following link to reset password:<br>'
                + config.serverHostname +'/reset/' + token + ' <html>'
        };

        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            callback('Email sent.');
        });
    },

    sendRegisterSubmitEmail: function(to, username, callback) {
        let mailOptions = {
            from: config.mailServer.sender, // sender address
            to: to, // list of receivers
            subject: 'Register Submit Successfully!', // Subject line
            text: '', // plain text body
            html: '<html>' + 'Dear ' + username + ', your registration request has been submitted! Please wait for the response from your manager. <html>'
        };

        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            callback('Email sent.');
        });
    },

    sendRegisterSuccessEmail: function(to, password, callback) {
        let mailOptions = {
            from: config.mailServer.sender, // sender address
            to: to, // list of receivers
            subject: 'Register Successfully!', // Subject line
            text: '', // plain text body
            html: '<html>' + 'Your Registration has been approved! Your temporary password is ' + password + '. Please log in to your account and change your password as soon as possible! <html>'
        };

        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            callback('Email sent.');
        });
    },


    sendRegisterFailEmail: function(to, callback) {
        let mailOptions = {
            from: config.mailServer.sender, // sender address
            to: to, // list of receivers
            subject: 'Register Fail', // Subject line
            text: '', // plain text body
            html: '<html>' + 'Your Registration has been rejected.<html>'
        };

        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            callback('Email sent.');
        });
    },

    sendRequestRemindEmail: function (to, username, callback) {
        let mailOptions = {
            from: config.mailServer.sender, // sender address
            to: to, // list of receivers
            subject: 'Registration Request', // Subject line
            text: '', // plain text body
            html: '<html>' + username + ' has submitted his registration request. Please log in your account and approve/disapprove his request.' + '<br>'
                + config.serverHostname +'/login' + ' <html>'
        };

        smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            callback('Email sent.');
        });
    },


};
