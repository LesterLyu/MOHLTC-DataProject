const express = require('express');
const router = express.Router();
const {workbookController} = require('../../controller/v2');
const {saveWorkbookAdmin, getWorkbook, adminGetAllWorkbooks, adminDeleteWorkbook, adminGetWorkbook} = workbookController;

router.get('/api/v2/admin/workbook/:name', adminGetWorkbook);

router.post('/api/v2/admin/workbook', saveWorkbookAdmin);

router.get('/api/v2/workbook/:name', getWorkbook);

router.get('/api/v2/admin/workbooks', adminGetAllWorkbooks);

router.delete('/api/v2/admin/workbooks/:name', adminDeleteWorkbook);

module.exports = router;
