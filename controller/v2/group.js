const Group = require('../../models/group');
const {Organization} = require('../../models/organization');
const {checkPermission, Permission, error} = require('./helpers');

module.exports = {
    setGroupName: async (req, res, next) => {
        if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const name = req.body.name;
        try {
            await Group.replaceOne({groupNumber}, {groupNumber, name}, {upsert: true});
            return res.json({message: 'Group name is updated.'})
        } catch (e) {
            next(e);
        }
    },

    // no login required
    getGroups: async (req, res, next) => {
        try {
            const groups = await Group.find({});
            return res.json({groups})
        } catch (e) {
            next(e);
        }
    },

    getOrganizationsInGroup: async (req, res, next) => {
        const groupNumber = req.params.number;
        try {
            const organizations = await Organization.find({groupNumber}, 'name managers types');
            return res.json({organizations});
        } catch (e) {
            next(e);
        }
    },
};
