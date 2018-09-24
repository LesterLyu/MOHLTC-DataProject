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


    }
};
