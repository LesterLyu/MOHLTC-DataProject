const express = require('express');
let router = express.Router();
const config = require('../config/config'); // get our config file
const setupController = require('../controller/setup');


router.get('/', function (req, res) {
    if (config.firstTimeRun) {
        return res.redirect('/setup')
    }
    if (req.isAuthenticated()) {
        return res.render('index.ejs', {user: req.session.user});
    }
    res.render('index.ejs');
});

router.get('/setup', function (req, res) {
    res.render('setup.ejs')
});

router.post('/api/setup', setupController.signup_admin);

module.exports = router;
