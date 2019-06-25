const express = require('express');
let router = express.Router();
const Attribute = require('../models/attribute');
const Category = require('../models/category');


router.get('/debug/deleteattributeandcategory', async (req, res) =>
{
    await Attribute.deleteMany({}, );
    await Category.deleteMany({}, );
    return res.json({success: false, message: 'success'});
}
)
;
module.exports = router;
