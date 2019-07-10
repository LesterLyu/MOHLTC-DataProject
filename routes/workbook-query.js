const express = require('express');
const workbookQueryController = require('../controller/workbook-query');
const batch = require('../controller/batch');
let router = express.Router();

const error = require('../config/error');

// GET Find a workbook in current group
router.post('/api/query/workbook', workbookQueryController.workbook_query);

router.get('/query/workbook', (req, res, next) => {
    res.render('sidebar/workbookQuery.ejs', {user: req.session.user});
});

router.get('/api/query/workbook/names', workbookQueryController.get_workbook_names);

router.get('/api/query/workbook/detail', workbookQueryController.get_workbook_query_detail);

router.get('/api/query/workbook', workbookQueryController.get_many_filledworkbooks_of_one_workbook);

// only internal use!!!
router.post('/api/batch/signup', batch.multiSignUp);

router.post('/api/batch/save/workbook', batch.saveWorkbookToAllUsers);


// GET Query user filled workbook data by the name of a workbook and the Id of attribute, category.
router.get('/api/query/workbook', workbookQueryController.get_many_filledworkbooks_of_one_workbook);
// GET Query filled workbook data by the name of attribute and category.
router.get('/api/query/workbooks', workbookQueryController.get_many_filledWorkbooks_by_attributeName_categoryName);

// multi-threading testing
router.get('/api/query2/workbook', workbookQueryController.get_many_filledworkbooks_of_one_workbook_multi_threading);

module.exports = router;
