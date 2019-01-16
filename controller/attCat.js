const Attribute = require('../models/attribute');
const Category = require('../models/category');
const Workbook = require('../models/workbook');
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
        const existAttribute = [];
        var existAttribute_othergroup = false;
        Workbook.find({}, (err, workbooks) => {
            if (err) {
                return res.status(400).json({success: false, message: err});
            }
            for (var i = 0; i < workbooks.length; i++) {
                console.log(workbooks.length);
                var workbookData =  workbooks[i].data;
                console.log(workbookData.length);
                for (var workbookSheetName in workbookData) {
                    var workbookSheet = workbookData[workbookSheetName];
                    var workbookAttributes = workbookSheet[0];
                    console.log(workbookAttributes.length);
                    for (var h = 0; h < workbookAttributes.length; h++) {
                        console.log(workbookAttributes[h]);
                        if (attribute == workbookAttributes[h]) {
                            if (workbooks[i].groupNumber === groupNumber) {
                                existAttribute.push(workbooks[i].name + "/" + workbookSheetName);
                            } else {
                                existAttribute_othergroup = true;
                            }
                        }
                    }
                }
            }
            if (existAttribute.length === 0 && !existAttribute_othergroup) {
                Attribute.deleteOne({attribute: attribute, groupNumber: groupNumber}, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({success: false, message: err})
                    }
                    return res.json({success: true, message: 'Deleted attribute ' + attribute})
                });
            } else {
                if (existAttribute.length !== 0) {
                    var message = "The attribute " + '"' + attribute + '"' + " has been used in ";
                    for (var i = 0; i < existAttribute.length - 1; i++) {
                        message = message + existAttribute[i] + ", ";
                    }
                    message = message + existAttribute[existAttribute.length - 1] + ". ";
                }
                if (existAttribute_othergroup) {
                    message = message + "This attribute has been used in other groups!";
                }
                console.log(message);
                return res.json({success: false, message: message});
            }
        });
    },

    user_delete_cat: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const category = req.body.data;
        const groupNumber = req.session.user.groupNumber;
        const existCategory = [];
        var existCategory_othergroup = false;
        Workbook.find({}, (err, workbooks) => {
            if (err) {
                return res.status(400).json({success: false, message: err});
            }
            for (var i = 0; i < workbooks.length; i++) {
                console.log(workbooks.length);
                var workbookData =  workbooks[i].data;
                console.log(workbookData.length);
                for (var workbookSheetName in workbookData) {
                    var workbookSheet = workbookData[workbookSheetName];
                    for (var j = 0; j < workbookSheet.length; j++) {
                        if (category == workbookSheet[j][0]) {
                            if (workbooks[i].groupNumber === groupNumber) {
                                existCategory.push(workbooks[i].name + "/" + workbookSheetName);
                            } else {
                                existCategory_othergroup = true;
                            }
                        }
                    }
                }
            }
            if (existCategory.length === 0 && !existCategory_othergroup) {
                Category.deleteOne({category: category, groupNumber: groupNumber}, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({success: false, message: err})
                    }
                    return res.json({success: true, message: 'Deleted category ' + category})
                });
            } else {
                if (existCategory.length !== 0) {
                    var message = "The category " + '"' + category + '"' + " has been used in ";
                    for (var i = 0; i < existCategory.length - 1; i++) {
                        message = message + existCategory[i] + ", ";
                    }
                    message = message + existCategory[existCategory.length - 1] + ". ";
                }
                if (existCategory_othergroup) {
                    message = message + "This category has been used in other groups!";
                }
                console.log(message);
                return res.json({success: false, message: message});
            }
        });
    },

    user_delete_atts: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const groupNumber = req.session.user.groupNumber;
        const ids = req.body.ids;
        let fails = [],
            promiseArr = [];

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            // add to promise chain
            promiseArr.push(new Promise((resolve, reject) => {
                Attribute.deleteOne({id, groupNumber})
                    .then(result => resolve())
                    .catch(err => {
                        console.log(err);
                        fails.push(id);
                    })
            }));
        }

        Promise.all(promiseArr).then(() => {
            if (fails.length !== 0) {
                return res.json({
                    success: false,
                    message: 'Failed to remove attribute id: ' + fails
                })
            }
            return res.json({
                success: true,
                message: 'Success removed attribute id: ' + ids + '.'
            })
        })
    },

    user_delete_cats: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const groupNumber = req.session.user.groupNumber;
        const ids = req.body.ids;
        let fails = [],
            promiseArr = [];

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            // add to promise chain
            promiseArr.push(new Promise((resolve, reject) => {
                Category.deleteOne({id, groupNumber})
                    .then(result => resolve())
                    .catch(err => {
                        console.log(err);
                        fails.push(id);
                    })
            }));
        }

        Promise.all(promiseArr).then(() => {
            if (fails.length !== 0) {
                return res.json({
                    success: false,
                    message: 'Failed to remove category id: ' + fails
                })
            }
            return res.json({
                success: true,
                message: 'Success removed category id: ' + ids + '.'
            })
        })
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
        Attribute.find({groupNumber: groupNumber}, 'attribute id', (err, attributes) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, attributes: attributes});
        })
    },

    get_categories: (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        Category.find({groupNumber: groupNumber}, 'category id', (err, categories) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, categories: categories});
        })
    }
}
