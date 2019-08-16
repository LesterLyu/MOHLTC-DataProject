const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @typedef {object} Workbook
 * @property {number} groupNumber
 * @property {string} name
 * @property {Array} sheets
 * @property {number} groupNumber
 * @property {string} file
 */
module.exports = mongoose.model('Workbook',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true, unique: true},
        sheets: [{type: ObjectId, ref: 'Sheet'}], // Sheet._id
        file: {type: String, required: true}, // base64 encoding
        values: {}, // {cat: {att: value}}, does not save readonly fields
        roAtts: [], // readonly attributes
        roCats: [], // readonly categories
    }));
