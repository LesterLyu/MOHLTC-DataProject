const express = require('express');
const system_management_controller = require('../controller/systemManagement');
let router = express.Router();


router.get('/api/system/info/static', system_management_controller.get_static_system_info);

router.get('/api/system/info/dynamic', system_management_controller.get_dynamic_system_info);

router.get('/api/system/config', system_management_controller.get_config);

router.post('/api/system/config', system_management_controller.update_config);


//web pages
router.get('/system/info', (req, res, next) => {
    res.render('sidebar/systemManagement.ejs', {user: req.session.user})
});

router.get('/system/config', (req, res, next) => {
    res.render('sidebar/systemConfig.ejs', {user: req.session.user})
});

module.exports = router;
