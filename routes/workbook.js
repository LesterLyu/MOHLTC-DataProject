const express = require('express');
const workbookController = require('../controller/workbook');
const workbookControllerV2 = require('../controller/workbookV2');
let router = express.Router();

const error = require('../config/error');

// GET Find a workbook in current group
router.get('/api/workbook/:name', workbookController.get_workbook);

// POST Create workbook
router.post('/api/admin/workbook', workbookController.admin_create_workbook);

// GET Find a filled workbook in current group
router.get('/api/filled-workbook/:name', workbookController.get_filled_workbook);

// POST Create or Update filled workbook
router.post('/api/filled-workbook', workbookController.update_filled_workbook);

// POST Create a new filled workbook that is a union from two exist filled workbook
router.post('/api/union-filled-workbook', workbookController.union_filled_workbook);

// DELETE Delete filled workbook
router.delete('/api/filled-workbook', workbookController.delete_filled_workbook);

// GET Find all unfilled workbooks in current group
router.get('/api/workbooks', workbookController.get_unfilled_workbooks);

// GET Find all filled workbooks in current group for a user
router.get('/api/filled-workbooks', workbookController.get_filled_workbooks);
// FIXME: please restore after debugging
// router.get('/api/filled-workbooks', workbookController.retrieveAllData_workbook);

// GET retrieve standard data from all filled workbooks in current group for a user
router.get('/api/filled-workbook/retrieveAllData', workbookController.retrieveAllData_filled_workbook);

// GET retrieve standard data from all workbooks
router.get('/api/workbook/retrieveAllData', workbookController.retrieveAllData_workbook);

// GET Find all filled workbooks in current group for a user
router.get('/api/admin/workbooks', workbookController.admin_get_workbooks);

// PUT Edit a workbook
router.put('/api/admin/workbook', workbookController.admin_edit_workbooks);

// DELETE Delete workbook
router.delete('/api/admin/workbook', workbookController.admin_delete_workbook);

//V2
// POST Create/Edit workbook
router.post('/api/v2/admin/workbook', workbookControllerV2.admin_create_edit_workbook);

// get user filled workbook
router.get('/api/v2/user/filled/:name', workbookControllerV2.get_filled_workbook);

// POST Create/Edit filledWorkbook
router.post('/api/v2/user/workbook', workbookControllerV2.user_create_edit_workbook);

// web pages

router.get('/create-workbook-template', (req, res, next) => {
    if (workbookController.checkPermission(req)) {
        res.render('sidebar/createWorkbookTemplate.ejs', {
            user: req.session.user, workbook: null, mode: 'create', title: 'Create Workbook Template'
        });
    }
    else {
        res.status(403).render('error.ejs', error.NO_PERMISSION)
    }

});

router.get('/edit-workbook-template/:name', (req, res, next) => {
    if (workbookController.checkPermission(req)) {
        res.render('sidebar/createWorkbookTemplate.ejs', {
            user: req.session.user, workbook: req.params.name, mode: 'edit', title: 'Edit Workbook Template'
        });
    }
    else {
        res.status(403).render('error.ejs', error.NO_PERMISSION)
    }

});

router.get('/manage-workbook-templates', (req, res, next) => {
    if (workbookController.checkPermission(req)) {
        res.render('sidebar/manageWorkbookTemplate.ejs', {user: req.session.user});
    }
    else {
        res.status(403).render('error.ejs', error.NO_PERMISSION)
    }
});
// fill an empty workbook
router.get('/fill-workbook/:name', (req, res, next) => {
    return res.render('sidebar/fillWorkbook.ejs', {user: req.session.user, workbook: req.params.name});

});

router.get('/workbooks', function (req, res) {
    res.render('sidebar/workbooks.ejs', {user: req.session.user});
});

router.get('/temp1', function (req, res) {
    res.render('sidebar/temp1.ejs', {user: req.session.user});
});

// for user
router.post('/api/upload/workbook/:workbookName/:fileName', workbookController.user_import_workbook);

router.get('/api/workbook/:workbookName/download', workbookController.user_export_workbook);

// for admin
router.post('/api/upload/style/:workbookName/:fileName', workbookController.admin_upload_style);

router.get('/api/admin/workbook/:workbookName/download', workbookController.admin_export_workbook);


module.exports = router;
