const express = require('express');
const workbookController = require('../controller/workbook');
let router = express.Router();

// GET Find a workbook in current group
router.get('/api/workbook/:name', workbookController.get_workbook);

// POST Create workbook
router.post('/api/workbook', workbookController.create_workbook);

// DELETE Delete workbook
router.delete('/api/workbook', workbookController.delete_workbook);

// GET Find a workbook in current group
router.get('/api/filled-workbook/:name', workbookController.get_filled_workbook);

// POST Create or Update filled workbook
router.post('/api/filled-workbook', workbookController.update_filled_workbook);

// DELETE Delete filled workbook
router.delete('/api/filled-workbook', workbookController.delete_filled_workbook);

// GET Find all workbooks in current group
router.get('/api/workbooks', workbookController.get_workbooks);

// GET Find all filled workbooks in current group for a user
router.get('/api/filled-workbooks', workbookController.get_filled_workbooks);

// web pages
router.get('/create-workbook', (req, res, next) => {
    res.render('createWorkbookTemplate.ejs', {user: req.session.user});
});

router.get('/fill-workbook/:name', (req, res, next) => {
    res.render('fillWorkbook.ejs', {user: req.session.user, workbook: req.params.name, mode: 'fill'});
});

router.get('/edit-workbook/:name', (req, res, next) => {
    res.render('fillWorkbook.ejs', {user: req.session.user, workbook: req.params.name, mode: 'edit'});
});

// new
router.get('/new/create-workbook-template', (req, res, next) => {
    res.render('new/createWorkbookTemplate.ejs', {user: req.session.user});
});

router.get('/new/manage-workbook-templates', (req, res, next) => {
    res.render('new/manageWorkbookTemplate.ejs', {user: req.session.user});
});

router.get('/new/fill-workbook/:name', (req, res, next) => {
    res.render('new/fillWorkbook.ejs', {user: req.session.user, workbook: req.params.name, mode: 'fill'});
});

router.get('/new/edit-workbook/:name', (req, res, next) => {
    res.render('new/fillWorkbook.ejs', {user: req.session.user, workbook: req.params.name, mode: 'edit'});
});



module.exports = router;
