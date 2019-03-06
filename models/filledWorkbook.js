const mongoose = require('mongoose');

let fillerWorkbookSchema = new mongoose.Schema({
    name: String,
    username: String,
    date: {type: Date, default: Date.now},
    groupNumber: {type: Number, required: true},
    data: {},
});
fillerWorkbookSchema.index({name: 1, username: 1}, {unique: true});
module.exports = mongoose.model('FillerWorkbook', fillerWorkbookSchema);
