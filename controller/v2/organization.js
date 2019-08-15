const {Organization, OrganizationType} = require('../../models/organization');

const {checkPermission, Permission, error, removeNil} = require('./helpers');


module.exports = {
    getOrganizations: async (req, res, next) => {
        if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        try {
            const organizations = await Organization.find({groupNumber}).populate('users managers types');
            return res.json({organizations});
        } catch (e) {
            next(e);
        }
    },

    // Add or update an organization for current group
    updateOrganization: async (req, res, next) => {
        if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;

        const {name, users, managers, types} = req.body;
        if (!name || name.length === 0) return next({status: 400, message: 'Package name is required.'});

        const data = removeNil({users, managers, types});
        try {
            // TODO: validate the given data (users, managers, types)
            const oldDoc = await Organization.findOne({groupNumber, name});
            const newDoc = await Organization.findOneAndUpdate({groupNumber, name}, data, {upsert: true, new: true});
            const message = `${oldDoc ? 'Updated' : 'Added'} organization ${name}.`;
            const ops = [];
            if (oldDoc) {
                // the operation is update, update organizationType collection.
                oldDoc.types.forEach(type => {
                    ops.push({
                        updateOne: {
                            filter: {_id: type},
                            update: {$pull: {organizations: oldDoc._id}}
                        }
                    })
                });
            }
            // update organizationType collection, add the added collection.
            newDoc.types.forEach(type => {
                ops.push({
                    updateOne: {
                        filter: {_id: type},
                        update: {$push: {organizations: newDoc._id}}
                    }
                })
            });
            if (ops.length > 0) await OrganizationType.bulkWrite(ops);
            return res.json({message});
        } catch (e) {
            next(e);
        }
    },

    // Delete an organization for current group
    deleteOrganization: async (req, res, next) => {
        if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {name} = req.params;
        try {
            const doc = await Organization.findOneAndDelete({name, groupNumber});
            const ops = [];
            if (doc) {
                doc.types.forEach(type => {
                    ops.push({
                        updateOne: {
                            filter: {_id: type},
                            update: {$pull: {organizations: doc._id}}
                        }
                    })
                });
            }
            if (ops.length > 0) await OrganizationType.bulkWrite(ops);
            return res.json({message: `Organization ${name} is deleted.`});
        } catch (e) {
            next(e);
        }
    },

    getOrganizationTypes: async (req, res, next) => {
        if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        try {
            const types = await OrganizationType.find({groupNumber}).populate('organizations');
            return res.json({types});
        } catch (e) {
            next(e);
        }
    },

    // add or update
    updateOrganizationType: async (req, res, next) => {
        if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {name, organizations} = req.body;
        const data = removeNil({organizations});
        try {
            const oldDoc = await OrganizationType.findOne({groupNumber, name});
            const newDoc = await OrganizationType.findOneAndUpdate({groupNumber, name}, data, {
                upsert: true,
                new: true
            });
            const message = `${oldDoc ? 'Updated' : 'Added'} organization type ${name}.`;
            const ops = [];
            if (oldDoc) {
                // the operation is update, update organization collection.
                oldDoc.organizations.forEach(organizationId => {
                    ops.push({
                        updateOne: {
                            filter: {_id: organizationId},
                            update: {$pull: {types: oldDoc._id}}
                        }
                    })
                });
            }
            newDoc.organizations.forEach(organizationId => {
                ops.push({
                    updateOne: {
                        filter: {_id: organizationId},
                        update: {$push: {types: newDoc._id}}
                    }
                })
            });
            if (ops.length > 0) await Organization.bulkWrite(ops);
            return res.json({message});
        } catch (e) {
            next(e);
        }
    },

    deleteOrganizationType: async (req, res, next) => {
        if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const {name} = req.params;
        try {
            const doc = await OrganizationType.findOneAndDelete({name, groupNumber});
            const ops = [];
            if (doc) {
                doc.organizations.forEach(type => {
                    ops.push({
                        updateOne: {
                            filter: {_id: type},
                            update: {$pull: {types: doc._id}}
                        }
                    })
                });
            }
            if (ops.length > 0) await Organization.bulkWrite(ops);
            return res.json({message: `Organization type ${name} is deleted.`});
        } catch (e) {
            next(e);
        }
    },
};
