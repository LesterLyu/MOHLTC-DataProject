const {checkPermission, Permission, error} = require('./helpers');
const Package = require('../../models/package/package');
const Value = require('../../models/workbook/value');
const User = require('../../models/user');
const Workbook = require('../../models/workbook/workbook');

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
            const packages = await Package.find({groupNumber, users: currentUserId});
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
            name, published = false, userIds = [], workbookIds = [], startDate, endDate, adminNotes = '',
            adminFiles, userNotes = '', userFiles, histories
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
        const users = [], workbooks = [];
        try {
            const pkg = await Package.findOne({groupNumber, name});

            // check if package is already exists
            if (pkg) return next({status: 400, message: `Package (${name}) already exists.`});

            // filter users
            const userDocs = await User.find({'_id': {$in: userIds}});
            userDocs.forEach(user => users.push(user._id));

            // filter workbooks
            const workbookDocs = await Workbook.find({'_id': {$in: workbookIds}}).populate('sheets');
            workbookDocs.forEach(workbook => workbooks.push(workbook._id));

            // construct values
            const values = {};
            const dbValues = await Value.findOne({groupNumber});
            if (!dbValues) {
                return next({
                    status: 400,
                    message: 'The system requires at least one workbook and it should contain usable values.'
                });
            }
            workbookDocs.forEach(workbook => {
                workbook.sheets.forEach(({attIds, catIds}) => {
                    if (catIds.length === 0 || attIds.length === 0) return;
                    for (const catId in catIds) {
                        const dbCat = dbValues.data[catId];
                        if (!dbCat) continue;
                        const cat = values[catId] = {};
                        for (const attId in attIds) {
                            cat[attId] = dbCat[attId];
                        }
                    }
                });
            });

            const newPackage = new Package({
                name, published, users, workbooks, startDate, endDate, adminNotes, adminFiles, userNotes,
                userFiles, histories, groupNumber, values
            });
            await newPackage.save();
            return res.json({success: true, message: `package (${name}) saved.`});
        } catch (e) {
            next(e);
        }
    },
};
