const Attribute = require('../../models/workbook/attribute');
const AttributeGroup = require('../../models/workbook/attributeGroup');
const {checkPermission, Permission} = require('./helpers');
const error = require('../../config/error');

module.exports = {
    addAttribute: async (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        /**
         * @type {string}
         */
        const name = req.body.name;
        const _id = req.body.id;
        const groupNumber = req.session.user.groupNumber;
        if (name.length === 0) {
            return res.status(400).json({
                success: false, message: 'Attribute name cannot be empty.'
            });
        }
        const attribute = await Attribute.findOne({_id, groupNumber});
        if (attribute) {
            return res.status(400).json({
                success: false,
                message: 'Attribute ' + attribute.name + ' exists.'
            });
        } else {
            const newAttribute = new Attribute({_id, name, groupNumber});
            await newAttribute.save();
            return res.json({success: true, message: `Attribute (${_id}, name) saved.`});
        }
    },

    getAttributeGroup: (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        AttributeGroup.find({groupNumber}, 'name children parent', (err, documents) => {
            if (err) return next(err);
            res.json({success: true, documents});
        })
    },

    modifyAttributeGroup: (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        /** @type {Array} */
        const documents = req.body.documents;
        const operations = [];
        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            document.groupNumber = groupNumber;
            operations.push({
                replaceOne: {
                    filter: {_id: document._id}, // cast string to mongoose.Types.ObjectId ?
                    replacement: document,
                    upsert: true
                }
            });
        }

        AttributeGroup.bulkWrite(operations)
            .then(result => {
                res.json({success: true, result})
            })
            .catch(err => next(err));

    },

    deleteAttributeGroup: async (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const _id = req.params._id;
        const groupNumber = req.session.user.groupNumber;
        try {
            const doc = await AttributeGroup.findOneAndRemove({_id, groupNumber});
            res.json({success: true, message: `Removed attribute group ${doc.name} (${_id})`});
        } catch (e) {
            next(e);
        }
    }
};
