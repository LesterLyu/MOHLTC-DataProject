const mongoose = require('mongoose');

let workbookSchema = new mongoose.Schema({
    name: {type: String, required: true},
    // category: [String],
    // attribute: [String],
    groupNumber: {type: Number, required: true},
    fileName: String,
    extra: {}, //store styles and other properties, compressed
    base64: {}, // store data
    attMap: {},
    catMap: {},
});
module.exports = mongoose.model('Workbook', workbookSchema);
