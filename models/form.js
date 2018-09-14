const mongoose = require('mongoose');

let formSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    category: [String],
    attribute: [String],
    data: [], // reserved for table with populated data
});
module.exports = mongoose.model('Attribute', formSchema);