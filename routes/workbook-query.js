const express = require('express');
const workbookQueryController = require('../controller/workbook-query');
let router = express.Router();

const error = require('../config/error');

// GET Find a workbook in current group
router.post('/api/query/workbook', workbookQueryController.workbook_query);

router.get('/query/workbook', (req, res, next) => {
    res.render('sidebar/workbookQuery.ejs', {user: req.session.user});
});

router.get('/api/query/workbook/names', workbookQueryController.get_workbook_names);

router.get('/api/query/workbook/detail', workbookQueryController.get_workbook_query_detail);



module.exports = router;
