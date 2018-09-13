const nodeMailer = require('nodemailer');
const config = require('../config/config'); // get our config file

const smtpTransport = nodeMailer.createTransport(config.mailServer);

module.exports = {
    sendFromHaodasMail: function (email, subject, message, callback) {
        var mailConfig = {
            to: email,
            subject: subject,
            text: message
        };

        smtpTransport.sendMail(mailConfig, function (err, response) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Email sent: " + message);
                callback();
            }
        })
    },

    sendValidationEmail: function (to, token, callback) {

        let mailOptions = {
            from: '"Lester Lyu" <lvds2000@gmail.com>', // sender address
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
            callback(info);
        });


    }
};
