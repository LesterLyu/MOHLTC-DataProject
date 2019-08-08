const express = require('express');
let router = express.Router();
const AttributeGroup = require('../models/workbook/attributeGroup');
const CategoryGroup = require('../models/workbook/categoryGroup');
const User = require('../models/user');
const Workbook = require('../models/workbook/workbook');
const Sheet = require('../models/workbook/sheet');
const Value = require('../models/workbook/value');
const Package = require('../models/package/package');
const {checkPermission, Permission} = require('../controller/v2/helpers');
const error = require('../config/error');
const config = require('../config/config');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

router.get('/packages/test', (req, res) => {
    return res.json({success: true, message: 'Hi, there!'});
});

router.get('/packages/groupNumber', (req, res) => {
    const groupNumber = req.session.user.groupNumber;
    const user = req.session.user;
    return res.json({success: true, user, groupNumber});
});

router.post('/packages', async (req, res, next) => {
    const groupNumber = req.session.user.groupNumber;
    const {name, published = false, userIds, workbookIds, startDate, endDate, adminNotes = '', adminFiles, userNotes = '', userFiles, histories} = req.body;
    // input items can not be empty
    if (!startDate || !endDate) {
        return res.status(400).json({success: false, message: 'startDate and endDate can not be empty.'});
    }
    if (!name) {
        return res.status(400).json({success: false, message: 'package must have a name.'});
    }
    if (!userIds) {
        return res.status(400).json({success: false, message: 'user is empty'});
    }
    if (!workbookIds) {
        return res.status(400).json({success: false, message: 'workbook is empty'});
    }

    // validate from database
    let workbooks = [];
    try {
        const dbPackage = await Package.findOne({groupNumber, name});
        if (dbPackage) {
            return res.status(400).json({
                success: false, message: `Package (${name}) already exists.`, document: dbPackage
            });
        }

        const users = await User.find({'_id': {$in: userIds}});
        if (!users) {
            return res.status(400).json({success: false, message: 'user do not exist'});
        }

        workbooks = await Workbook.find({'_id': {$in: workbookIds}}).populate('sheets').exec();
        if (!workbooks) {
            return res.status(400).json({success: false, message: 'workbooks do not exist'});
        }
    } catch (e) {
        next(e);
    }

    const rowIds = [];
    workbooks.forEach((workbook) => {
        workbook.sheets.forEach((sheet) => {
            sheet.catIds.forEach(id => {
                rowIds.push(id);
            });
        });
    });
    const columnIds = {};
    workbooks.forEach((workbook) => {
        workbook.sheets.forEach((sheet) => {
            const columnIdsArr = [];
            sheet.attIds.forEach(id => {
                columnIdsArr.push(id);
            });
            sheet.catIds.forEach(id => {
                columnIds[id] = columnIdsArr;
            });
        });
    });

    const dbValues = await Value.findOne({groupNumber: 1});
    if (!dbValues) {
        return res.status(400).json({success: false, message: 'values do not exist'});
    }
    const data = {};
    for (let rowKey in dbValues.data) {
        const rowValue = dbValues.data[rowKey];
        for (let i = 0; i < rowIds.length; i++) {
            if (rowIds[i].toString() === rowKey) {
                let newValue = {};
                for (let columnKey in rowValue) {
                    for (let j = 0; j < columnIds[rowKey].length; j++) {
                        if (columnIds[rowKey][j].toString() === columnKey) {
                            newValue[columnKey] = rowValue[columnKey];
                        }
                    }
                }
                data[rowKey] = newValue;
            }
        }
    }
    const values = {groupNumber, data};

    // Create new package
    try {
        const newPackage = new Package({
            name,
            published,
            users: userIds,
            workbooks: workbookIds,
            startDate,
            endDate,
            adminNotes,
            adminFiles,
            userNotes,
            userFiles,
            histories,
            groupNumber,
            values
        });
        await newPackage.save();
        return res.json({success: true, message: `package (${name}) saved.`});
    } catch (e) {
        next(e);
    }

});

module.exports = router;
