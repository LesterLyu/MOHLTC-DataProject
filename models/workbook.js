const mongoose = require('mongoose');

let workbookSchema = new mongoose.Schema({
    name: {type: String, required: true},
    // category: [String],
    // attribute: [String],
    groupNumber: {type: Number, required: true},
    fileName: String,
    data: {}, // reserved for table with populated data
});
module.exports = mongoose.model('Workbook', workbookSchema);
