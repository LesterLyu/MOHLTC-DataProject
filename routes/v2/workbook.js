const express = require('express');
const router = express.Router();
const {workbookController} = require('../../controller/v2');
const {saveWorkbookAdmin} = workbookController;

router.post('/api/v2/test/admin/workbook', saveWorkbookAdmin);

module.exports = router;
