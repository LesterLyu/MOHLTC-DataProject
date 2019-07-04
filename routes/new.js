const express = require('express');
const router = express.Router();
const Attribute = require('../models/workbook/attribute');
const AttributeGroup = require('../models/workbook/attributeGroup');
const Value = require('../models/workbook/value');
const config = require('../config/config');
const error = require('../config/error');

const mongoose = require('mongoose');

function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.ATTRIBUTE_CATEGORY_MANAGEMENT);
}

// add attribute
router.post('/api/v2/attribute', async (req, res, next) => {
    if (!checkPermission(req)) {
        return res.status(403).json({success: false, message: error.api.NO_PERMISSION});
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
});

// Modify attribute groups
router.post('/api/v2/attribute/group', (req, res, next) => {
    if (!checkPermission(req)) {
        return res.status(403).json({success: false, message: error.api.NO_PERMISSION});
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

});

// delete attribute group
router.delete('/api/v2/attribute/group/:_id', async (req, res, next) => {
    const _id = req.params._id;
    const groupNumber = req.session.user.groupNumber;
    try {
        const doc = await AttributeGroup.findOneAndRemove({_id, groupNumber});
        res.json({success: true, message: `Removed attribute group ${doc.name} (${_id})`});
    } catch (e) {
        next(e);
    }
});

// Get attribute groups
router.get('/api/v2/attribute/group', (req, res, next) => {
    if (!checkPermission(req)) {
        return res.status(403).json({success: false, message: error.api.NO_PERMISSION});
    }
    const groupNumber = req.session.user.groupNumber;
    AttributeGroup.find({groupNumber}, 'name children parent', (err, documents) => {
        if (err) return next(err);
        res.json({success: true, documents});
    })
});

router.get('/api/v2/generate/id/:number', (req, res, next) => {
    const number = req.params.number;
    const ids = [];
    for (let i = 0; i < number; i++) {
        ids.push(mongoose.Types.ObjectId());
    }
    res.json({success: true, ids})
});

router.post('/api/v2/test', (req, res, next) => {
    const data = {};
    for (let i = 0; i < 1000; i++) {
        const inner = {};
        for (let j = 0; j < 1000; j++) {
            inner[j] = i + j;
        }
        data[i] = inner;
    }
    const newValue = new Value({
        groupNumber: Math.random(),
        data
    });

    newValue.save(err => {
        if (err) return next(err);
        res.json({success: true});
    })
});


module.exports = router;
