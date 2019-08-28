const {checkPermission, Permission, error} = require('./helpers');
const Package = require('../../models/package/package');
const PackageValue = require('../../models/package/packageValue');
const Value = require('../../models/workbook/value');
const User = require('../../models/user');
const {Organization, OrganizationType} = require('../../models/organization');
const Workbook = require('../../models/workbook/workbook');
const mongoose = require('mongoose');

/**
 *
 * @param next
 * @param {string|mongoose.Schema.Types.ObjectId} currentUserId
 * @param {string} organization
 * @param {number} groupNumber
 * @param {string} packageName
 * @param {string} [name] - workbook name
 * @return {Promise<{workbook: *, organizations: *, pack: *}|*>}
 */
async function userGetPackageAndWorkbook(next, currentUserId, organization, groupNumber, packageName, name) {
    let organizations = await Organization.find({users: currentUserId}, 'name');
    organizations = organizations.filter(org => org.name === organization);
    organizations = organizations.map(org => org._id);

    const pack = await Package.findOne({
        groupNumber, name: packageName, organizations: {$in: organizations},
    }).populate({path: 'workbooks', select: 'name'});
    if (!pack) return next({status: 400, message: `Package (${packageName}) does not exist.`});
    let workbook;
    if (name) {
        // find workbook that matches the name
        workbook = pack.workbooks.find(wb => wb.name === name);
        if (!workbook) return next({status: 400, message: 'Workbook does not exist.'});
    }
    return {workbook, pack, organizations};
}

module.exports = {
    /**
     * Admin gets a single package.
     */
    adminGetPackage: async (req, res, next) => {
        if (!checkPermission(req, Permission.PACKAGE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {name, organization} = req.params; // package name, organization name
        try {
            const pack = await Package.findOne({groupNumber, name}).populate({
                path: 'workbooks',
                select: 'name'
            });
            if (!pack) return next({status: 400, message: `Package (${name}) does not exist.`});

            const orgDoc = await Organization.findOne({groupNumber, name: organization});
            if (!orgDoc) return next({status: 400, message: `Organizations (${organization}) does not exist.`});

            // if the package is submitted, then the admin will get the package value.
            const packageValue = await PackageValue.findOne({groupNumber, package: pack._id, organization: orgDoc._id});
            if (packageValue.histories.length > 0) {
                const {userNotes, submittedBy, date} = packageValue.histories[packageValue.histories.length - 1];
                const {workbooks, startDate, endDate, adminNotes, adminFiles, name} = pack;
                const submittedUser = await User.findById(submittedBy, 'username firstName lastName email');
                return res.json({
                    success: true,
                    package: {
                        userNotes, submittedUser, date, workbooks, startDate, endDate, adminNotes, organization,
                        adminFiles, name
                    }
                })
            } else {
                return next({
                    status: 400,
                    message: `The organization (${organization}) has not submitted this package (${name}).`
                });
            }
        } catch (e) {
            next(e);
        }
    },

    adminGetPackageOrganizations: async (req, res, next) => {
        if (!checkPermission(req, Permission.PACKAGE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const name = req.params.name; // package name
        try {
            const pack = await Package.findOne({groupNumber, name}, 'organizations').populate({
                path: 'organizations',
                select: 'name'
            });
            if (!pack) return next({status: 400, message: `Package (${name}) does not exist.`});
            res.json({success: true, organizations: pack.organizations})
        } catch (e) {
            next(e);
        }
    },

    userGetPackage: async (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        const currentUserId = req.session.user._id;
        const organization = req.params.organization;
        const name = req.params.name; // package name
        try {
            const result = await userGetPackageAndWorkbook(next, currentUserId, organization, groupNumber, name);
            if (!result) return;
            res.json({success: true, package: result.pack})
        } catch (e) {
            next(e);
        }
    },

    adminGetAllPackages: async (req, res, next) => {
        if (!checkPermission(req, Permission.PACKAGE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        try {
            const packages = await Package.find({groupNumber}).populate({path: 'organizations', select: 'name'});
            res.json({success: true, packages})
        } catch (e) {
            next(e);
        }
    },

    userGetAllPackages: async (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        const organization = req.params.organization;
        const currentUserId = req.session.user._id;
        try {
            let organizations = await Organization.find({users: currentUserId}, 'name');
            organizations = organizations.filter(org => org.name === organization);
            organizations = organizations.map(org => org._id);
            const packages = await Package.find({groupNumber, organizations: {$in: organizations}, published: true});
            return res.json({success: true, packages});
        } catch (e) {
            next(e);
        }
    },

    adminDeletePackage: async (req, res, next) => {
        if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const name = req.params.name;
        if (!name) {
            return next({status: 400, message: 'package name can not be empty.'});
        }
        try {
            const dbPackage = await Package.findOneAndDelete({name, groupNumber});
            if (!dbPackage) {
                return res.json({success: true, message: `Package (${name}) does not exist.`});
            }
            await PackageValue.deleteMany({package: dbPackage._id, organization: {$in: dbPackage.organizations}});
            return res.json({success: true, message: `Package (${name}) deleted.`});
        } catch (e) {
            next(e);
        }
    },

    adminCreatePackage: async (req, res, next) => {
        if (!checkPermission(req, Permission.PACKAGE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {
            name, published = false, orgIds = [], workbookIds = [], startDate, endDate, adminNotes = '',
            adminFiles
        } = req.body;
        if (!startDate || !endDate) {
            return next({status: 400, message: 'startDate and endDate can not be empty.'});
        }
        if (startDate > endDate) {
            return next({status: 400, message: 'startDate must be less or equal to endDate.'});
        }
        if (!name) {
            return next({status: 400, message: 'package must have a name.'});
        }
        const organizations = [], workbooks = []; // filtered
        try {
            const pkg = await Package.findOne({groupNumber, name});

            // check if package is already exists
            if (pkg) return next({status: 400, message: `Package (${name}) already exists.`});

            const packageId = mongoose.Types.ObjectId();

            // filter organizations
            const orgDocs = await Organization.find({'_id': {$in: orgIds}}, '_id users').populate('users');
            orgDocs.forEach(user => organizations.push(user._id));

            // filter workbooks
            const workbookDocs = await Workbook.find({'_id': {$in: workbookIds}});
            workbookDocs.forEach(workbook => workbooks.push(workbook._id));

            // collect values from all workbooks
            const valuesInAllWorkbook = {};
            workbookDocs.forEach(({values}) => {
                // the values should not contain readonly values.
                for (const catId in values) {
                    let atts = valuesInAllWorkbook[catId];
                    if (!atts) atts = valuesInAllWorkbook[catId] = {};
                    const originalAtts = values[catId];
                    for (const attId in originalAtts) {
                        atts[attId] = originalAtts[attId];
                    }
                }
            });

            // find organization values
            const valueDocs = await Value.find({groupNumber, organization: {$in: organizations}});
            for (const valueDoc of valueDocs) {
                const {organization, values} = valueDoc;
                // remove this organization in orgs
                organizations.filter(item => !organization.equals(item));
                // fill in the non-existed values
                for (const catId in valuesInAllWorkbook) {
                    let atts = values[catId];
                    if (!atts) atts = values[catId] = {};
                    const attsInWorkbook = valuesInAllWorkbook[catId];
                    for (const attId in attsInWorkbook) {
                        if (atts[attId] == null) atts[attId] = attsInWorkbook[attId];
                    }
                }
                // create PackageValue
                const packageValue = new PackageValue({groupNumber, package: packageId, organization, values});
                await packageValue.save();
            }

            for (const organization of organizations) {
                // create PackageValue for the remaining organizations
                const packageValue = new PackageValue({
                    groupNumber, package: packageId, organization, values: valuesInAllWorkbook
                });
                await packageValue.save();
            }

            const newPackage = new Package({
                name, published, organizations, workbooks, startDate, endDate, adminNotes, adminFiles,
                groupNumber, _id: packageId
            });
            await newPackage.save();
            return res.json({success: true, message: `package (${name}) saved.`});
        } catch (e) {
            next(e);
        }
    },

    // TODO: Finish this!
    adminEditPackage: async (req, res, next) => {
        if (!checkPermission(req, Permission.WORKBOOK_TEMPLATE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {
            name, published, organizationTypes, orgIds, workbookIds, startDate, endDate, adminNotes, adminFiles
        } = req.body;

        // Find the package to update from database
        const queryPackageName = req.params.name; // old name
        if (!queryPackageName) {
            return next({status: 400, message: 'package must have a name.'});
        }
        if (!queryPackageName) {
            return res.status(400).json({success: false, message: 'package name can not be empty.'});
        }
        const dbPackage = await Package.findOne({name: queryPackageName, groupNumber});
        if (!dbPackage) {
            return res.status(400).json({success: false, message: `Package (${queryPackageName}) does not exist.`});
        }

        // Validate parameters
        if ((name + '').length === 0) {
            return next({success: false, status: 400, message: `Package name cannot be empty`})
        }
        if ((await Package.countDocuments({name})) !== 0) {
            return next({success: false, status: 400, message: `Package name (${name}) exists.`})
        }
        dbPackage.name = name;

        if ((startDate && !endDate && startDate >= dbPackage.endDate)
            || (!startDate && endDate && dbPackage.startDate >= endDate)
            || (startDate && endDate && startDate >= endDate)) {
            return res.status(400).json({success: false, message: 'startDate must be less than endDate.'});
        }
        if (organizationTypes) {
            const results = await OrganizationType.find({'_id': {$in: organizationTypes}});
            organizationTypes.lenght = 0;
            if (results) {
                results.forEach(r => organizationTypes.push(r._id));
            }
        }
        if (orgIds) {
            const results = await Organization.find({'_id': {$in: orgIds}});
            orgIds.lenght = 0;
            if (results) {
                results.forEach(r => orgIds.push(r._id));
            }
        }
        if (workbookIds) {
            const results = await Workbook.find({'_id': {$in: workbookIds}});
            workbookIds.lenght = 0;
            if (results) {
                results.forEach(r => workbookIds.push(r._id));
            }
        }

        //FIXME: change the package values

        let dbWorkbooks = [];
        let queryDbWorkbookIds = [];
        // validate from database
        try {
            // FIXME: if one of workbookIds does not exist, it can not throw error.
            if (workbookIds[0]) {
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


        const organizations = [], workbooks = []; // filtered
        try {
            // filter organizations
            const orgDocs = await Organization.find({'_id': {$in: orgIds}}, '_id users').populate('users');
            orgDocs.forEach(user => organizations.push(user._id));

            // filter workbooks
            const workbookDocs = await Workbook.find({'_id': {$in: workbookIds}});
            workbookDocs.forEach(workbook => workbooks.push(workbook._id));
        } catch (e) {
            next(e);
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
            dbPackage.organizations = orgIds || dbPackage.organizations;
            dbPackage.organizationTypes = organizationTypes || dbPackage.organizationTypes;
            dbPackage.workbooks = workbookIds || dbPackage.workbooks;
            dbPackage.startDate = startDate || dbPackage.startDate;
            dbPackage.endDate = endDate || dbPackage.endDate;
            dbPackage.adminNotes = adminNotes || dbPackage.adminNotes;
            dbPackage.adminFiles = adminFiles || dbPackage.adminFiles;

            await dbPackage.save();
            return res.json({success: true, message: `package (${dbPackage.name}) updated.`, package: dbPackage});
        } catch (e) {
            next(e);
        }
    },

    userGetWorkbook: async (req, res, next) => {
        const {packageName, name, organization} = req.params;
        const groupNumber = req.session.user.groupNumber;
        const currentUserId = req.session.user._id;
        try {
            let result = await userGetPackageAndWorkbook(next, currentUserId, organization, groupNumber, packageName, name);
            if (!result) return;
            let {workbook, organizations, pack} = result;
            workbook = await Workbook.findById(workbook._id, 'file name roAtts roCats').populate('sheets');

            const populate = [];
            let values = await PackageValue.findOne({package: pack._id, groupNumber, organization: organizations[0]});
            values = values ? values.values : {};
            workbook.sheets.forEach((sheet, idx) => {
                if (!sheet.row2Cat || !sheet.col2Att) return;
                const rows = populate[idx] = {};
                for (let row in sheet.row2Cat) {
                    const catId = sheet.row2Cat[row];
                    if (!values[catId]) continue;
                    if (!rows[row]) rows[row] = {};
                    for (let col in sheet.col2Att) {
                        const attId = sheet.col2Att[col];
                        if (values[catId][attId] == null) continue;
                        rows[row][col] = values[catId][attId];
                    }
                }
            });
            workbook.sheets = undefined;
            return res.json({success: true, workbook, populate});
        } catch (e) {
            next(e);
        }
    },

    adminGetUserWorkbook: async (req, res, next) => {
        const {packageName, organizationName, workbookName} = req.params;
        const groupNumber = req.session.user.groupNumber;
        try {
            const organization = await Organization.findOne({name: organizationName}, '_id');
            if (!organization) return next({
                status: 400,
                message: `Organization (${organizationName}) does not exist.`
            });
            const orgId = organization._id;

            const pack = await Package.findOne({
                groupNumber, name: packageName, organizations: orgId,
            }).populate({path: 'workbooks', select: 'name'});
            if (!pack) return next({status: 400, message: `Package (${packageName}) does not exist.`});

            if (!pack.workbooks.find(wb => wb.name === workbookName))
                return next({status: 400, message: `Workbook (${workbookName}) does not exist.`});

            const workbook = await Workbook.findOne({name: workbookName}, 'file name roAtts roCats').populate('sheets');

            const populate = [];
            let values = await Value.findOne({groupNumber, organization: orgId});
            values = values ? values.values : {};
            workbook.sheets.forEach((sheet, idx) => {
                if (!sheet.row2Cat || !sheet.col2Att) return;
                const rows = populate[idx] = {};
                for (let row in sheet.row2Cat) {
                    const catId = sheet.row2Cat[row];
                    if (!values[catId]) continue;
                    if (!rows[row]) rows[row] = {};
                    for (let col in sheet.col2Att) {
                        const attId = sheet.col2Att[col];
                        if (values[catId][attId] == null) continue;
                        rows[row][col] = values[catId][attId];
                    }
                }
            });
            workbook.sheets = undefined;
            return res.json({success: true, workbook, populate});
        } catch (e) {
            next(e);
        }
    },

    userSaveWorkbook: async (req, res, next) => {
        const {packageName, name, organization} = req.params;
        const groupNumber = req.session.user.groupNumber;
        const currentUserId = req.session.user._id;
        const {values} = req.body;
        try {
            const result = await userGetPackageAndWorkbook(next, currentUserId, organization, groupNumber, packageName, name);
            if (!result) return;
            let {workbook, pack, organizations} = result;
            workbook = await Workbook.findById(workbook._id).populate('sheets');
            let doc = await PackageValue.findOne({groupNumber, package: pack._id, organization: organizations[0]});
            if (!doc)
                doc = new PackageValue({
                    groupNumber, package: pack._id, organization: organizations[0], values: {}
                });
            const data = doc.values;
            for (let catId in values) {
                const atts = values[catId];
                if (Object.keys(atts).length === 0) continue;
                if (!data[catId]) data[catId] = {};
                for (let attId in atts) {
                    data[catId][attId] = atts[attId];
                }
            }
            doc.markModified('values');
            await doc.save();
            return res.json({success: true, message: `Workbook (${workbook.name}) updated.`});
        } catch (e) {
            next(e);
        }
    },

    userSubmitPackage: async (req, res, next) => {
        const currentUserId = req.session.user._id;
        const groupNumber = req.session.user.groupNumber;
        let {packageName, organization} = req.params;
        const {userNotes} = req.body;
        const result = await userGetPackageAndWorkbook(next, currentUserId, organization, groupNumber, packageName);
        if (!result) return;
        const {pack, organizations} = result;
        organization = organizations[0];
        const packageValue = await PackageValue.findOne({groupNumber, organization});
        const packageValues = packageValue.values;
        let valueDoc = await Value.findOne({groupNumber, organization});
        const values = valueDoc && valueDoc.values ? valueDoc.values : {};
        if (!valueDoc) {
            valueDoc = new Value({groupNumber, organization, values});
        }
        for (let catId in packageValues) {
            const atts = packageValues[catId];
            if (Object.keys(atts).length === 0) continue;
            if (!values[catId]) values[catId] = {};
            for (let attId in atts) {
                values[catId][attId] = atts[attId];
            }
        }
        valueDoc.markModified('values');
        await valueDoc.save();
        packageValue.histories.push({
            userNotes: userNotes,
            // userFiles: packageValue.userFiles,
            workbooks: pack.workbooks,
            // values: packageValue.values,
            submittedBy: currentUserId,
            date: Date.now(),
        });
        await packageValue.save();
        return res.json({success: true, message: `Package (${packageName}) submitted.`})
    },
};
