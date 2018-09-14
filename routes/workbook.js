const express = require('express');
const workbookController = require('../controller/workbook');
let router = express.Router();

// POST Create workbook
router.post('/api/workbook', workbookController.create_workbook);

// DELETE Delete workbook
router.delete('/api/workbook', workbookController.delete_workbook);

// POST Create or Update filled workbook
router.post('/api/filled-workbook', workbookController.update_filled_workbook);

// DELETE Delete filled workbook
router.delete('/api/filled-workbook', workbookController.delete_filled_workbook);

// GET Find all workbooks in current group
router.get('/api/workbooks', workbookController.get_workbooks);

// GET Find all filled workbooks in current group for a user
router.get('/api/filled-workbooks', workbookController.get_filled_workbooks);

module.exports = router;
