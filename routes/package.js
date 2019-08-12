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

// regular user only retrieve the packages belonging to himself
router.get('/api/packages/:packagename?', async (req, res, next) => {
    let query = {groupNumber: req.session.user.groupNumber, users: req.session.user._id};
    if (req.params.packagename) {
        query.name = req.params.packagename;
    }
    try {
        const dbPackages = await Package.find(query);
        if (!dbPackages[0]) {
            return res.status(400).json({
                success: false,
                message: `Package(s) (${req.params.packagename}) Not Found.`
            });
        }
        return res.json({success: true, packages: dbPackages});
    } catch (e) {
        next(e);
    }
});

router.get('/api/admin/:username?/packages/:packagename?', async (req, res, next) => {
    if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }

    let query = {groupNumber: req.session.user.groupNumber};
    if (req.params.username) {
        const dbUser = await User.findOne({username: req.params.username});
        if (!dbUser) {
            return res.status(400).json({success: false, message: `User (${req.params.username}) does not exist.`});
        }
        query.users = dbUser._id;
    }
    if (req.params.packagename) {
        query.name = req.params.packagename;
    }

    try {
        const dbPackages = await Package.find(query);
        if (!dbPackages[0]) {
            return res.status(400).json({success: false, message: `Packages (${req.params.packagename}) Not Found.`});
        }
        return res.json({success: true, packages: dbPackages});
    } catch (e) {
        next(e);
    }
});

router.post('/api/admin/packages', async (req, res, next) => {
    if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
    const queryGroupNumber = req.session.user.groupNumber;
    const {name, published = false, userIds, workbookIds, startDate, endDate, adminNotes = '', adminFiles, userNotes = '', userFiles, histories} = req.body;
    // input items can not be empty
    if (!startDate || !endDate) {
        return res.status(400).json({success: false, message: 'startDate and endDate can not be empty.'});
    }
    if (startDate >= endDate) {
        return res.status(400).json({success: false, message: 'startDate must be less than endDate.'});
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
        const dbPackage = await Package.findOne({groupNumber: queryGroupNumber, name});
        if (dbPackage) {
            return res.status(400).json({
                success: false, message: `Package (${name}) already exists.`, document: dbPackage
            });
        }

        // FIXME: if one of userIds does not exist, it can not throw error.
        const users = await User.find({_id: {$in: userIds}});
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

    const dbValues = await Value.findOne({groupNumber: queryGroupNumber});
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
    const values = {groupNumber: queryGroupNumber, data};

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
            groupNumber: queryGroupNumber,
            values
        });
        await newPackage.save();
        return res.json({success: true, message: `package (${name}) saved.`});
    } catch (e) {
        next(e);
    }
});

router.put('/api/admin/packages/:packagename', async (req, res, next) => {
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

    const {published, userIds, workbookIds, startDate, endDate, adminNotes = '', adminFiles, userNotes = '', userFiles, histories} = req.body;
    if ((startDate && !endDate && startDate >= dbPackage.endDate)
        || (!startDate && endDate && dbPackage.startDate >= endDate)
        || (startDate && endDate && startDate >= endDate)) {
        return res.status(400).json({success: false, message: 'startDate must be less than endDate.'});
    }

    const dbUserIds = [];
    if (userIds) {
        // validate from database
        try {
            // FIXME: if one of userIds does not exist, it can not throw error.
            if (userIds) {
                const dbUsers = await User.find({_id: {$in: userIds}});
                if (!dbUsers[0]) {
                    return res.status(400).json({success: false, message: 'user do not exist'});
                } else {
                    for (let index in dbUsers) {
                        dbUserIds.push(dbUsers[index]._id);
                    }
                }
            }
        } catch (e) {
            next(e);
        }
    }

    let dbWorkbooks = [];
    let dbWorkbookIds = [];
    if (workbookIds) {
        // validate from database
        try {
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
    }

    const rowIds = [];
    let columnIds = {};
    let values = {};
    if (dbWorkbooks[0] && dbWorkbookIds[0]) {
        dbWorkbooks.forEach(workbook => {
            workbook.sheets.forEach(sheet => {
                sheet.catIds.forEach(id => {
                    rowIds.push(id);
                });
            });
        });
        dbWorkbooks.forEach(workbook => {
            workbook.sheets.forEach(sheet => {
                const columnIdsArr = [];
                sheet.attIds.forEach(id => {
                    columnIdsArr.push(id);
                });
                sheet.catIds.forEach(id => {
                    columnIds[id] = columnIdsArr;
                });
            });
        });

        const dbValues = await Value.findOne({groupNumber: queryGroupNumber});
        if (!dbValues) {
            return res.status(400).json({success: false, message: 'values do not exist'});
        }

        if (rowIds[0] && columnIds) {
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
            values = {groupNumber: queryGroupNumber, data};
        }
    }
    // update the package in database
    try {
        if (published !== undefined) {
            dbPackage.published = published;
        }
        dbPackage.users = dbUserIds[0] ? dbUserIds : dbPackage.users;
        dbPackage.workbooks = dbWorkbookIds[0] ? dbWorkbookIds : dbPackage.workbooks;
        dbPackage.startDate = startDate || dbPackage.startDate;
        dbPackage.endDate = endDate || dbPackage.endDate;
        dbPackage.adminNotes = adminNotes || dbPackage.adminNotes;
        dbPackage.adminFiles = adminFiles || dbPackage.adminFiles;
        dbPackage.userNotes = userNotes || dbPackage.userNotes;
        dbPackage.userFiles = userFiles || dbPackage.userFiles;
        dbPackage.histories = histories || dbPackage.histories;
        dbPackage.values = values.data ? values : dbPackage.values;
        await dbPackage.save();
        return res.json({success: true, message: `package (${dbPackage.name}) updated.`, package: dbPackage});
    } catch (e) {
        next(e);
    }
});

router.delete('/api/admin/packages/:packagename', async (req, res, next) => {
    if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
    const queryGroupNumber = req.session.user.groupNumber;
    const queryPackageName = req.params.packagename;
    if (!queryPackageName) {
        return res.status(400).json({success: false, message: 'package name can not be empty.'});
    }

    try {

        const dbPackage = await Package.findOne({name: queryPackageName, groupNumber: queryGroupNumber});
        if (!dbPackage) {
            return res.status(400).json({success: false, message: `Package (${queryPackageName}) does not exist.`});
        }

        await Package.findByIdAndDelete(dbPackage._id);
        return res.status(200).json({success: true, message: `package (${queryPackageName}) was deleted.`});
    } catch (e) {
        next(e);
    }
});

module.exports = router;
