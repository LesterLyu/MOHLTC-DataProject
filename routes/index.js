const express = require('express');
let router = express.Router();

router.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        return res.render('index.ejs', {user: req.session.user});
    }
    res.render('index.ejs');
});

module.exports = router;
