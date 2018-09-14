const mongoose = require('mongoose');

let workbookSchema = new mongoose.Schema({
    name: {type: String},
    // category: [String],
    // attribute: [String],
    groupNumber: {type: Number, required: true},
    data: {}, // reserved for table with populated data
});
module.exports = mongoose.model('Workbook', workbookSchema);