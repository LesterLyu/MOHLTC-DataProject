const {checkPermission, Permission, error} = require('./helpers');
const Package = require('../../models/package/package');
const PackageValue = require('../../models/package/packageValue');
const Value = require('../../models/workbook/value');
const User = require('../../models/user');
const {Organization} = require('../../models/organization');
const Workbook = require('../../models/workbook/workbook');
const mongoose = require('mongoose');

module.exports = {
    /**
     * Admin gets a single package.
     */
    adminGetPackage: async (req, res, next) => {
        if (!checkPermission(req, Permission.PACKAGE_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const name = req.params.name; // package name
        try {
            const pack = await Package.findOne({groupNumber, name}).populate('workbooks');
            if (!pack) return next({status: 400, message: `Package (${name}) does not exist.`});
            res.json({success: true, package: pack})
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
            const packages = await Package.find({groupNumber});
            res.json({success: true, packages})
        } catch (e) {
            next(e);
        }
    },

    userGetAllPackages: async (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        const currentUserId = req.session.user._id;
        try {
            let organizations = await Organization.find({users: currentUserId}, '_id');
            organizations = organizations.map(org => org._id);
            const packages = await Package.find({groupNumber, organizations: {$in: organizations}});
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
            const valueDocs = await Value.find({groupNumber, organizations: {$in: organizations}});
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
};
