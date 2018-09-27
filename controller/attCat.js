const Attribute = require('../models/attribute');
const Category = require('../models/category');
const error = require('../config/error');
const config = require('../config/config');

function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.ATTRIBUTE_CATEGORY_MANAGEMENT);
}

module.exports = {
    checkPermission: checkPermission,

    user_add_att: (req, res, next) => {

        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }

        const attribute = req.body.attribute;
        const groupNumber = req.session.user.groupNumber;
        if (attribute === '') {
            return res.status(400).json({success: false, message: 'Attribute cannot be empty.'});
        }
        Attribute.findOne({attribute: attribute, groupNumber: groupNumber}, (err, attribute) => {

            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }

            if (attribute) {
                return res.status(400).json({success: false, message: 'Attribute ' + attribute.attribute + ' exists.'});
            } else {

                let newAttribute = new Attribute({

                    attribute: req.body.attribute,
                    groupNumber: groupNumber,
                });
                newAttribute.save((err, updatedAttribute) => {
                    if (err) {
                        console.log(err);
                        return next(err);
                    }

                    return res.json({success: true, message: 'Attribute ' + updatedAttribute.attribute + ' added.'})
                });
            }
        });
    },

    user_delete_att: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }

        const attribute = req.body.data;
        const groupNumber = req.session.user.groupNumber;
        Attribute.deleteOne({attribute: attribute, groupNumber: groupNumber}, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err})
            }
            return res.json({success: true, message: 'Deleted attribute ' + attribute})
        });
    },

    user_delete_cat: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }

        const category = req.body.data;
        const groupNumber = req.session.user.groupNumber;

        Category.deleteOne({category: category, groupNumber: groupNumber}, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err})
            }
            return res.json({success: true, message: 'Deleted category ' + category})
        });
    },


    user_add_cat: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }

        const category = req.body.category;
        const groupNumber = req.session.user.groupNumber;
        if (category === '') {
            return res.status(400).json({success: false, message: 'Category cannot be empty.'});
        }
        Category.findOne({category: category, groupNumber: groupNumber}, (err, category) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }

            if (category) {
                return res.status(400).json({success: false, message: 'Category ' + category.category + ' exists.'});
            } else {
                let newCategory = new Category({
                    category: req.body.category,
                    groupNumber: groupNumber,
                });
                newCategory.save((err, updatedCategory) => {
                    if (err) {
                        console.log(err);
                        return next(err);
                    }
                    return res.json({success: true, message: 'Category ' + updatedCategory.category + ' added.'})
                });

            }
        });

    },


    get_attributes: (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        Attribute.find({groupNumber: groupNumber}, 'attribute', (err, attributes) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, attributes: attributes});
        })
    },

    get_categories: (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        Category.find({groupNumber: groupNumber}, 'category', (err, categories) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, categories: categories});
        })
    }
}