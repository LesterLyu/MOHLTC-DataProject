const mongoose = require('mongoose');

let enteredFormSchema = new mongoose.Schema({
    title: String,
    username: String,
    data: [],
    date: {default: Date.now}
});
module.exports = mongoose.model('Attribute', enteredFormSchema);