const express = require('express');
const workbookController = require('../controller/workbook');
const workbookControllerV2 = require('../controller/workbookV2');
const Attribute = require('../models/attribute');
const Category = require('../models/category');
const FilledWorkbook = require('../models/filledWorkbook');
const Workbook = require('../models/workbook');
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

// DELETE Delete filled workbook
router.delete('/api/filled-workbook', workbookController.delete_filled_workbook);

// GET Find all unfilled workbooks in current group
router.get('/api/workbooks', workbookController.get_unfilled_workbooks);
// GET Find all filled workbooks in current group for a user
router.get('/api/filled-workbooks', workbookController.get_filled_workbooks);

// GET Query user entered workbook data for your group.
router.get('/api/query/workbook', workbookController.get_many_filledworkbooks_of_one_workbook);
router.get('/api/query/workbooks', async (req, res) => {
    try {
        if (!req.query.attribute && !req.query.category) {
            return res.status(400).json({success: false, message: 'category and attribute can not be empty.'});
        }

        const attributes = await Attribute.find({attribute: req.query.attribute});
        const categories = await Category.find({category: req.query.category});
        if (!attributes || !categories) {
            return res.status(404).json({success: false, message: 'no category or attribute found'});
        }

        let attIds = [];
        await attributes.forEach(a => attIds.push(a.id));
        let catIds = [];
        await categories.forEach(c => catIds.push(c.id));

        //
        const filledWorkbooks = await FilledWorkbook.find({});
        if (!filledWorkbooks) {
            return res.status(404).json({success: false, message: 'No filled workbook exists'});
        }

        // search filled workbook
        let result = [];
        for (let indexOfDoc = 0; indexOfDoc < filledWorkbooks.length; indexOfDoc++) {   // document
            const file = filledWorkbooks[indexOfDoc];
            const filename = file.name;
            const username = file.username;
            for (let sheetKey in file.data) {                            // sheet
                const sheet = file.data[sheetKey];
                const firstRow = sheet[0];
                let colsIndex = [];

                // 1. ? row 0
                if (!firstRow) {
                    continue;       // to next sheet
                }

                // 2. ? the first line includes attIds
                for (let colIndex in firstRow) {
                    for (let attIndex in attIds) {
                        if (/^\d+$/.test(firstRow[colIndex]) && firstRow[colIndex] === attIds[attIndex]) {
                            colsIndex.push(colIndex);
                        }
                    }
                }
                if (colsIndex.length <= 0) {
                    continue;       // to next sheet
                }

                // search one row by one row from 2 line
                for (let rowIndex in sheet) {                             // Row
                    const rowLine = sheet[rowIndex];
                    if (rowIndex == 0) {
                        continue; // jump to the second line
                    }
                    // 3. ? col 0 has validated category id
                    const firstCellInRow = rowLine[0];
                    if (!firstCellInRow || !/^\d+$/.test(firstCellInRow)) {
                        continue; // jump to the second line
                    }

                    // 4. ? firstCol is within catIds
                    for (const catIndex in catIds) {
                        if (firstCellInRow === catIds[catIndex]) {
                            // Retrieve data
                            for (const c in colsIndex) {           // Column
                                const categoryId = firstCellInRow;
                                const attributeId = firstRow[colsIndex[c]];
                                result.push({
                                    username,
                                    workbookname: filename,
                                    sheetname: sheetKey,
                                    // FIXME: REMOVE  -- TAG for debugging
                                    category: categoryId + '--' + rowIndex,
                                    attribute: attributeId + '--' + colsIndex[c],
                                    value: rowLine[colsIndex[c]]
                                });
                            } // end of column
                        }
                    } // end of for loop --CatIds
                } // end of for loop -- row
            } // end of for loop -- sheet
        } // end of for loop -- document
        //
        if (result.length <= 0) {
            return res.status(404).json({success: false, message: 'No suitable record found'});
        }
        return res.status(200).json({
            success: true,
            data: result,
            message: 'data found.'
        });

    } catch (err) {
        return res.status(500).json({success: false, message: err});
    }
});

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
