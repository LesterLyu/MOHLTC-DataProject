const express = require('express');
const workbookController = require('../controller/workbook');
let router = express.Router();

// POST Create workbook
router.post('/workbook', workbookController.create_workbook);

// DELETE Delete workbook
router.delete('/workbook', workbookController.create_workbook);

// POST Create or Update filled workbook
router.post('/filled-workbook', workbookController.create_workbook);

// DELETE Delete filled workbook
router.delete('/filled-workbook', workbookController.create_workbook);

// GET Find all workbooks in current group
router.get('/workbooks', workbookController.get_workbooks);

// GET Find all filled workbooks in current group for a user
router.get('/filled-workbooks', workbookController.get_filled_workbooks);

module.exports = router;
