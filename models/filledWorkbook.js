const mongoose = require('mongoose');

let fillerWorkbookSchema = new mongoose.Schema({
    name: String,
    username: String,
    date: {default: Date.now},
    groupNumber: {type: Number, required: true},
    data: {},
});
module.exports = mongoose.model('Attribute', fillerWorkbookSchema);