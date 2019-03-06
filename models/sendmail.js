var nodeMailer = require('nodemailer');

var express = require('express'); //idk how useful this is. DELETE if unnecessary

var smtpTransport = nodeMailer.createTransport({
    service: "gmail", //hostname
    host: "smtp.gmail.com",
    auth: {
        user: "haodasdemo@gmail.com",
        pass: "godisdeadgodremainsdeadandwehavekilledhim"
    }
})
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

    sendDemoMail: function (callback) {
        var email = "haoda.fan@outlook.com";
        var subject = "THIS CASTLE IS IN UNACCEPTABLE CONDITION!";
        var message = "UNACCEPTABLE!!!!!!!!!!!!!!!!!!!";

        sendFromHaodasMail(email, subject, message, function () {
            callback();
        });
    }
}
