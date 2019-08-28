const {Organization} = require('../../models/organization');

const {checkPermission, Permission, error, removeNil} = require('./helpers');

module.exports = {
    getUserOrganizations: async (req, res, next) => {
        const currentUserId = req.session.user._id;
        try {
            let organizations = await Organization.find({users: currentUserId}, 'name');
            organizations = organizations.map(org => org.name);
            return res.json({organizations});
        } catch (e) {
            next(e);
        }
    },
};
