const express = require('express');
const att_cat_controller = require('../controller/attCat');
let router = express.Router();
const Attribute = require('../models/attribute');
const Category = require('../models/category');
const Workbook = require('../models/workbook');
const error = require('../config/error');
const config = require('../config/config');

function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.ATTRIBUTE_CATEGORY_MANAGEMENT);
}

const error = require('../config/error');

