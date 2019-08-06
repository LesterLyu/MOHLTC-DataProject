const express = require('express');
let router = express.Router();
AttributeGroup = require('../models/workbook/attributeGroup');
CategoryGroup = require('../models/workbook/categoryGroup');


router.get('/package/test', (req, res) => {
    return res.json({success: true, message: 'Hi, there!'});
});

module.exports = router;
