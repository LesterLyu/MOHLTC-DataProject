const express = require('express');
let router = express.Router();
const config = require('../config/config'); // get our config file
const setupController = require('../controller/setup');

router.post('/api/setup', setupController.firstTimeSetup);

router.get('/', function (req, res) {
    if (config.firstTimeRun) {
        if (process.env.NODE_ENV === 'production') {
            return res.redirect('/react/#/setup');
        } else {
            return res.redirect('http://localhost:3003/#/setup');
        }
    }
    if (process.env.NODE_ENV === 'production') {
        return res.redirect('/react');
    } else {
        return res.redirect('http://localhost:3003/');
    }
});

module.exports = router;
