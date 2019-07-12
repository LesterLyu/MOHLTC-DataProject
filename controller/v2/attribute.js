const Attribute = require('../../models/workbook/attribute');
const AttributeGroup = require('../../models/workbook/attributeGroup');
const {checkPermission, Permission} = require('./helpers');
const error = require('../../config/error');
const config = require('../../config/config');

module.exports = {
    generateAttributeId: async (req, res, next) => {
        let docs;
        try {
            docs = await Attribute.find({}, 'id')
        } catch (e) {
            next(e);
        }
        // if does not have attributes, generate id from 3,000,000
        let max = config.constants.attributeIdStartFrom;
        if (docs.length !== 0) {
            for (let i = 0; i < docs.length; i++) {
                const doc = docs[i];
                if (doc.id > max) max = doc.id;
            }
            max++;
        }
        return res.json({success: true, id: max});
    },

    getAttributes: async (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        try {
            const attributes = await Attribute.find({groupNumber});
            res.json({success: true, data: attributes})
        } catch (e) {
            next(e);
        }
    },

    addAttribute: async (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        /**
         * @type {string}
         */
        const {id, name, description} = req.body;
        const groupNumber = req.session.user.groupNumber;
        if (name.length === 0) {
            return res.status(400).json({
                success: false, message: 'Attribute name cannot be empty.'
            });
        }
        const attribute = await Attribute.findOne({id, groupNumber});
        if (attribute) {
            return res.status(400).json({
                success: false,
                message: `Attribute id ${id} (${attribute.name}) exists.`
            });
        } else {
            const newAttribute = new Attribute({id, name, description, groupNumber});
            await newAttribute.save();
            return res.json({success: true, message: `Attribute (${id}, ${name}) saved.`});
        }
    },

    deleteAttribute: async (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const ids = req.body.ids;

        const operations = [];
        for (let i = 0; i < ids.length; i++) {
            operations.push({
                deleteOne: {
                    filter: {id: ids[i], groupNumber},
                }
            });
        }
        try {
            let result = await Attribute.bulkWrite(operations);
            res.json({success: true, result, message: `Removed ${result.deletedCount} attribute(s).`})
        } catch (e) {
            next(e);
        }
    },

    attributeAssignGroups: async (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        const ids = req.body.ids;
        const groups = req.body.groups;
        const operations = [];
        ids.forEach(id => {
            operations.push({
                updateOne: {
                    filter: {groupNumber, id},
                    update: {groups},
                }
            })
        });
        try {
            let result = await Attribute.bulkWrite(operations);
            res.json({success: true, result, message: `Updated ${result.modifiedCount} attribute(s).`})
        } catch (e) {
            next(e);
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
            res.json({success: true, message: `Removed attribute group (${_id}, ${doc.name})`});
        } catch (e) {
            next(e);
        }
    },
};
