const mongoose = require('mongoose');

let attributeSchema = new mongoose.Schema({
    attribute: {type: String, unique: true},
});
module.exports = mongoose.model('Attribute', attributeSchema);