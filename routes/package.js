const express = require('express');
let router = express.Router();
const User = require('../models/user');
const Workbook = require('../models/workbook/workbook');
const Value = require('../models/workbook/value');
const Package = require('../models/package/package');
const {checkPermission, Permission} = require('../controller/v2/helpers');
const error = require('../config/error');
const config = require('../config/config');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

router.get('/:username?/packages/:packagename?', async (req, res, next) => {
    if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
    const queryGroupNumber = req.session.user.groupNumber;

    let queryUser = req.session.user;
    if (req.params.username) {
        queryUser = await User.findOne({username: req.params.username});
        if (!queryUser) {
            return res.status(400).json({success: false, message: `User (${req.params.username}) does not exist.`});
        }
    }

    let query = {groupNumber: queryGroupNumber, users: queryUser._id};
    try {
        if (req.params.packagename) {
            query.name = req.params.packagename;
        }
        const dbPackages = await Package.find(query);
        if (!dbPackages[0]) {
            return res.status(400).json({success: false, message: `Packages do not exist.`});
        }
        return res.json({success: true, packages: dbPackages});
    } catch (e) {
        next(e);
    }
});

router.post('/packages', async (req, res, next) => {
    if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
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
    let dbWorkbooks = [];
    let dbWorkbookIds = [];
    let dbUserIds = [];
    try {
        const dbPackage = await Package.findOne({groupNumber, name});
        if (dbPackage) {
            return res.status(400).json({
                success: false, message: `Package (${name}) already exists.`, document: dbPackage
            });
        }

        // FIXME: if one of userIds does not exist, it can not throw error.
        const users = await User.find({'_id': {$in: userIds}});
        if (!users) {
            return res.status(400).json({success: false, message: 'user do not exist'});
        } else {
            for (let index in users) {
                dbUserIds.push(users[index]._id);
            }
        }

        // FIXME: if one of workbookIds does not exist, it can not throw error.
        dbWorkbooks = await Workbook.find({'_id': {$in: workbookIds}}).populate('sheets').exec();
        if (!dbWorkbooks) {
            return res.status(400).json({success: false, message: 'dbWorkbooks do not exist'});
        } else {
            for (let index in dbWorkbooks) {
                dbWorkbookIds.push(dbWorkbooks[index]._id);
            }
        }
    } catch (e) {
        next(e);
    }

    const rowIds = [];
    dbWorkbooks.forEach((workbook) => {
        workbook.sheets.forEach((sheet) => {
            sheet.catIds.forEach(id => {
                rowIds.push(id);
            });
        });
    });
    const columnIds = {};
    dbWorkbooks.forEach((workbook) => {
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
            users: dbUserIds,
            workbooks: dbWorkbookIds,
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

router.put('/packages/:packagename', async (req, res, next) => {
    if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
    const queryGroupNumber = req.session.user.groupNumber;
    const queryPackageName = req.params.packagename;
    if (!queryPackageName) {
        return res.status(400).json({success: false, message: 'package name can not be empty.'});
    }
    const dbPackage = await Package.findOne({name: queryPackageName, groupNumber: queryGroupNumber});
    if (!dbPackage) {
        return res.status(400).json({success: false, message: `Package (${queryPackageName}) does not exist.`});
    }
    const {published = false, userIds, workbookIds, startDate, endDate, adminNotes = '', adminFiles, userNotes = '', userFiles, histories} = req.body;

    // validate from database
    let dbWorkbooks = [];
    let dbWorkbookIds = [];
    let dbUserIds = [];
    try {
        // FIXME: if one of userIds does not exist, it can not throw error.
        if (userIds) {
            const dbUsers = await User.find({'_id': {$in: userIds}});
            if (!dbUsers[0]) {
                return res.status(400).json({success: false, message: 'user do not exist'});
            } else {
                for (let index in dbUsers) {
                    dbUserIds.push(dbUsers[index]._id);
                }
            }
        }

        // FIXME: if one of workbookIds does not exist, it can not throw error.
        if (workbookIds) {
            dbWorkbooks = await Workbook.find({'_id': {$in: workbookIds}}).populate('sheets').exec();
            if (!dbWorkbooks) {
                return res.status(400).json({success: false, message: 'dbWorkbooks do not exist'});
            } else {
                for (let index in dbWorkbooks) {
                    dbWorkbookIds.push(dbWorkbooks[index]._id);
                }
            }
        }
    } catch (e) {
        next(e);
    }

    const rowIds = [];
    dbWorkbooks.forEach((workbook) => {
        workbook.sheets.forEach((sheet) => {
            sheet.catIds.forEach(id => {
                rowIds.push(id);
            });
        });
    });
    const columnIds = {};
    dbWorkbooks.forEach((workbook) => {
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

    // update the package in database
    try {
        dbPackage.published = published ? published : dbPackage.published;
        dbPackage.users = dbUserIds ? dbUserIds : dbPackage.users;
        dbPackage.workbooks = dbWorkbookIds ? dbWorkbookIds : dbPackage.workbooks;
        dbPackage.startDate = startDate ? startDate : dbPackage.startDate;
        dbPackage.endDate = endDate ? endDate : dbPackage.endDate;
        dbPackage.adminNotes = adminNotes ? adminNotes : dbPackage.adminNotes;
        dbPackage.adminFiles = adminFiles ? adminFiles : dbPackage.adminFiles;
        dbPackage.userNotes = userNotes ? userNotes : dbPackage.userNotes;
        dbPackage.userFiles = userFiles ? userFiles : dbPackage.userFiles;
        dbPackage.histories = histories ? histories : dbPackage.histories;
        dbPackage.values = values ? values : dbPackage.values;
        await dbPackage.save();
        return res.json({success: true, message: `package (${dbPackage.name}) updated.`});
    } catch (e) {
        next(e);
    }

});

module.exports = router;
