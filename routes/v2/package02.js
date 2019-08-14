const express = require('express');
let router = express.Router();
const User = require('../../models/user');
const Workbook = require('../../models/workbook/workbook');
const Value = require('../../models/workbook/value');
const Package = require('../../models/package/package');
const {checkPermission, Permission} = require('../../controller/v2/helpers');
const error = require('../../config/error');
const config = require('../../config/config');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

// regular user only retrieve the packages belonging to himself
router.get('/api/packages/:packagename?', async (req, res, next) => {
    let packageQuery = {groupNumber: req.session.user.groupNumber, users: req.session.user._id};
    if (req.params.packagename) {
        packageQuery.name = req.params.packagename;
    }

    try {
        const dbPackages = await Package.find(packageQuery);
        if (!dbPackages[0]) {
            return res.status(400).json({success: false, message: `Packages (${req.params.packagename}) Not Found.`});
        }

        const {attributeId, categoryId} = req.query;
        if (attributeId && categoryId) {
            dbPackages.forEach(package => {
                for (let rowKey in package.values.data) {
                    if (rowKey === categoryId) {
                        const rowValue = package.values.data[rowKey];
                        for (let columnKey in rowValue) {
                            if (columnKey === attributeId) {
                                const cellValue = rowValue[columnKey];
                                return res.json({
                                    success: true,
                                    category: categoryId,
                                    attribute: attributeId,
                                    value: cellValue
                                });
                            }
                        }
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: `no related attribute and category: (${attributeId}, ${categoryId})`
                })
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

    let packageQuery = {groupNumber: req.session.user.groupNumber};
    if (req.params.username) {
        const dbUser = await User.findOne({username: req.params.username});
        if (!dbUser) {
            return res.status(400).json({success: false, message: `User (${req.params.username}) does not exist.`});
        }
        packageQuery.users = dbUser._id;
    }
    if (req.params.packagename) {
        packageQuery.name = req.params.packagename;
    }


    try {
        const dbPackages = await Package.find(packageQuery);
        if (!dbPackages[0]) {
            return res.status(400).json({success: false, message: `Packages (${req.params.packagename}) Not Found.`});
        }

        const {attributeId, categoryId} = req.query;
        if (attributeId && categoryId) {
            dbPackages.forEach(package => {
                for (let rowKey in package.values.data) {
                    if (rowKey === categoryId) {
                        const rowValue = package.values.data[rowKey];
                        for (let columnKey in rowValue) {
                            if (columnKey === attributeId) {
                                const cellValue = rowValue[columnKey];
                                return res.json({
                                    success: true,
                                    category: categoryId,
                                    attribute: attributeId,
                                    value: cellValue
                                });
                            }
                        }
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: `no related attribute and category: (${attributeId}, ${categoryId})`
                })
            });
        } else {
            return res.json({success: true, packages: dbPackages});
        }
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
    const groupNumber = req.session.user.groupNumber;
    const queryPackageName = req.params.packagename;
    if (!queryPackageName) {
        return res.status(400).json({success: false, message: 'package name can not be empty.'});
    }
    const dbPackage = await Package.findOne({name: queryPackageName, groupNumber});
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
    let queryDbWorkbookIds = [];
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
                        queryDbWorkbookIds.push(dbWorkbooks[index]._id);
                    }
                }
            }
        } catch (e) {
            next(e);
        }
    }

    const dbWorkbookIds = dbPackage.workbooks;

    let newWorkbookIds = [];
    for (let queryWorkbookIdKey in queryDbWorkbookIds) {
        let isDuplicate = false;
        for (let dbWorkbookIdKey in dbWorkbookIds) {
            const newId = queryDbWorkbookIds[queryWorkbookIdKey].toString();
            const oldId = dbWorkbookIds[dbWorkbookIdKey].toString();
            if (newId === oldId) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            newWorkbookIds.push(queryDbWorkbookIds[queryWorkbookIdKey]);
        }
    }

    let deleteWorkbookIds = [];
    for (let dbWorkbookIdKey in dbWorkbookIds) {
        let isDuplicate = false;
        for (let queryWorkbookIdKey in queryDbWorkbookIds) {
            const newId = queryDbWorkbookIds[queryWorkbookIdKey].toString();
            const oldId = dbWorkbookIds[dbWorkbookIdKey].toString();
            if (newId === oldId) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            deleteWorkbookIds.push(dbWorkbookIds[dbWorkbookIdKey]);
        }
    }


    // Add data
    if (newWorkbookIds[0]) {
        const newDbWorkbooks = await Workbook.find({'_id': {$in: newWorkbookIds}}).populate('sheets').exec();
        const rowIds = [];
        let columnIds = {};

        if (newDbWorkbooks[0]) {
            newDbWorkbooks.forEach(workbook => {
                workbook.sheets.forEach(sheet => {
                    sheet.catIds.forEach(id => {
                        rowIds.push(id);
                    });
                });
            });
            newDbWorkbooks.forEach(workbook => {
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

            const newDbValues = await Value.findOne({groupNumber: groupNumber});
            if (!newDbValues) {
                return res.status(400).json({success: false, message: 'values do not exist'});
            }

            if (rowIds[0] && columnIds) {
                for (let rowKey in newDbValues.data) {
                    const rowValue = newDbValues.data[rowKey];
                    let newValues = {};
                    for (let i = 0; i < rowIds.length; i++) {
                        if (rowIds[i].toString() === rowKey) {
                            for (let columnKey in rowValue) {
                                for (let j = 0; j < columnIds[rowKey].length; j++) {
                                    if (columnIds[rowKey][j].toString() === columnKey) {
                                        newValues[columnKey] = rowValue[columnKey];
                                    }
                                }
                            }
                        }
                    }
                    dbPackage.values.data[rowKey] = newValues;
                }
            }
        }
    }

    // Delete data
    if (deleteWorkbookIds[0]) {
        const deleteDbWorkbooks = await Workbook.find({'_id': {$in: deleteWorkbookIds}}).populate('sheets').exec();
        const rowIds = [];
        let columnIds = {};

        if (deleteDbWorkbooks[0]) {
            deleteDbWorkbooks.forEach(workbook => {
                workbook.sheets.forEach(sheet => {
                    sheet.catIds.forEach(id => {
                        rowIds.push(id);
                    });
                });
            });
            deleteDbWorkbooks.forEach(workbook => {
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

            // remove the deleted item
            if (rowIds[0] && columnIds) {
                for (let rowKey in dbPackage.values.data) {
                    for (let i = 0; i < rowIds.length; i++) {
                        if (rowIds[i].toString() === rowKey.toString()) {
                            delete dbPackage.values.data[rowKey];
                        }
                    }
                }
            }
        }
    }


// update the package in database
    dbPackage.markModified('values.data');
    try {
        if (published !== undefined) {
            dbPackage.published = published;
        }
        dbPackage.users = dbUserIds[0] ? dbUserIds : dbPackage.users;
        dbPackage.workbooks = queryDbWorkbookIds[0] ? queryDbWorkbookIds : dbPackage.workbooks;
        dbPackage.startDate = startDate || dbPackage.startDate;
        dbPackage.endDate = endDate || dbPackage.endDate;
        dbPackage.adminNotes = adminNotes || dbPackage.adminNotes;
        dbPackage.adminFiles = adminFiles || dbPackage.adminFiles;
        dbPackage.userNotes = userNotes || dbPackage.userNotes;
        dbPackage.userFiles = userFiles || dbPackage.userFiles;
        dbPackage.histories = histories || dbPackage.histories;
        await dbPackage.save();
        return res.json({success: true, message: `package (${dbPackage.name}) updated.`, package: dbPackage});
    } catch (e) {
        next(e);
    }
});

router.put('/api/admin/packagevalues', async (req, res, next) => {

    if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
    const queryGroupNumber = req.session.user.groupNumber;
    const queryPackageName = req.body.packageName;
    const queryAttributeId = req.body.attributeId;
    const queryCategoryId = req.body.categoryId;
    const newValue = req.body.value;


    if (!queryPackageName) {
        return res.status(400).json({success: false, message: 'package name can not be empty.'});
    }
    const dbPackage = await Package.findOne({name: queryPackageName, groupNumber: queryGroupNumber});
    if (!dbPackage) {
        return res.status(400).json({success: false, message: `Package (${queryPackageName}) does not exist.`});
    }

    const PackageValues = dbPackage.values;
    if (!PackageValues) {
        return res.status(400).json({success: false, message: 'values do not exist'});
    }

    // update the package in database
    try {
        if (queryCategoryId && queryAttributeId) {
            for (let rowKey in PackageValues.data) {
                if (rowKey === queryCategoryId.toString()) {
                    for (let columnKey in PackageValues.data[rowKey]) {
                        if (columnKey === queryAttributeId.toString()) {
                            dbPackage.values.data[queryCategoryId][queryAttributeId] = newValue;
                            dbPackage.markModified('values.data');
                            await dbPackage.save();
                            return res.json({
                                success: true,
                                message: `package (${dbPackage.name}) updated.`,
                                value: dbPackage.values.data[queryCategoryId][queryAttributeId]
                            });
                        }
                    }
                }
            }
            return res.status(400).json({
                success: false,
                message: `no related attribute and category: (${queryCategoryId}, ${queryAttributeId})`
            });
        } else {
            return res.status(400).json({
                success: false,
                message: `attributeId and categoryId can not be empty`
            });
        }

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
