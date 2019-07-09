const Category = require('../../models/workbook/category');
const CategoryGroup = require('../../models/workbook/categoryGroup');
const {checkPermission, Permission} = require('./helpers');
const error = require('../../config/error');
const config = require('../../config/config');

module.exports = {
    generateCategoryId: async (req, res, next) => {
        let docs;
        try {
            docs = await Category.find({}, 'id')
        } catch (e) {
            next(e);
        }
        // if does not have categories, generate id from 1,000,000
        let max = config.constants.categoryIdStartFrom;
        if (docs.length !== 0) {
            for (let i = 0; i < docs.length; i++) {
                const doc = docs[i];
                if (doc.id > max) max = doc.id;
            }
            max++;
        }
        return res.json({success: true, id: max});
    },

    getCategories: async (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        try {
            const categories = await Category.find({groupNumber});
            res.json({success: true, data: categories})
        } catch (e) {
            next(e);
        }
    },

    addCategory: async (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        /**
         * @type {string}
         */
        const name = req.body.name;
        const id = req.body.id;
        const groupNumber = req.session.user.groupNumber;
        if (name.length === 0) {
            return res.status(400).json({
                success: false, message: 'Category name cannot be empty.'
            });
        }
        const category = await Category.findOne({id, groupNumber});
        if (category) {
            return res.status(400).json({
                success: false,
                message: `Category id ${id} (${category.name}) exists.`
            });
        } else {
            const newCategory = new Category({id, name, groupNumber});
            await newCategory.save();
            return res.json({success: true, message: `Category (${id}, ${name}) saved.`});
        }
    },

    deleteCategory: async (req, res, next) => {
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
            let result = await Category.bulkWrite(operations);
            res.json({success: true, result, message: `Removed ${result.deletedCount} category(s).`})
        } catch (e) {
            next(e);
        }
    },

    getCategoryGroup: (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const groupNumber = req.session.user.groupNumber;
        CategoryGroup.find({groupNumber}, 'name children parent', (err, documents) => {
            if (err) return next(err);
            res.json({success: true, documents});
        })
    },

    modifyCategoryGroup: (req, res, next) => {
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

        CategoryGroup.bulkWrite(operations)
            .then(result => {
                res.json({success: true, result})
            })
            .catch(err => next(err));

    },

    deleteCategoryGroup: async (req, res, next) => {
        if (!checkPermission(req, Permission.ATTRIBUTE_CATEGORY_MANAGEMENT)) {
            return next(error.api.NO_PERMISSION);
        }
        const _id = req.params._id;
        const groupNumber = req.session.user.groupNumber;
        try {
            const doc = await CategoryGroup.findOneAndRemove({_id, groupNumber});
            res.json({success: true, message: `Removed category group ${doc.name} (${_id})`});
        } catch (e) {
            next(e);
        }
    }
};
