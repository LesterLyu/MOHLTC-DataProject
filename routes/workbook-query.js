const express = require('express');
const workbookQueryController = require('../controller/workbook-query');
let router = express.Router();

const error = require('../config/error');

// GET Find a workbook in current group
router.post('/api/query/workbook', workbookQueryController.workbook_query);

module.exports = router;
