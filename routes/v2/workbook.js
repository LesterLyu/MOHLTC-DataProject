const express = require('express');
const router = express.Router();
const {workbookController} = require('../../controller/v2');
const {saveWorkbookAdmin, getWorkbook} = workbookController;

router.post('/api/v2/test/admin/workbook', saveWorkbookAdmin);

router.get('/api/v2/workbook/:name', getWorkbook);

module.exports = router;
