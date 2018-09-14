const mongoose = require('mongoose');

let fillerWorkbookSchema = new mongoose.Schema({
    name: String,
    username: String,
    date: {type: Date, default: Date.now},
    groupNumber: {type: Number, required: true},
    data: {},
});
module.exports = mongoose.model('FillerWorkbook', fillerWorkbookSchema);