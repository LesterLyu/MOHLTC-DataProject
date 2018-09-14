const mongoose = require('mongoose');

let enteredFormSchema = new mongoose.Schema({
    title: String,
    data: [],
});
module.exports = mongoose.model('Attribute', enteredFormSchema);