const express = require('express');
const router = express.Router();
const Attribute = require('../models/workbook/attrubute');
const error = require('../config/error');

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

router.post('/api/v2/attribute/assign/group', async (req, res, next) => {

});

router.post('/api/v2/group/attribute', async (req, res, next) => {

});


module.exports = router;
