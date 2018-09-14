const mongoose = require('mongoose');

let enteredWorkbookSchema = new mongoose.Schema({
    title: String,
    username: String,
    date: {default: Date.now},
    data: {},
});
module.exports = mongoose.model('Attribute', enteredWorkbookSchema);