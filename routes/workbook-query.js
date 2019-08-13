const express = require('express');
const workbookQueryController = require('../controller/workbook-query');
const batch = require('../controller/batch');
let router = express.Router();

const error = require('../config/error');


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
