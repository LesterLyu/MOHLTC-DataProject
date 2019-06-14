const mongoose = require('mongoose');

let attributeSchema = new mongoose.Schema({
    id: { type: Number, required: true, index: true, unique: true},
    attribute: {type: String, required: true},
    groupNumber: {type: Number, required: true},
    description: {type: String},
});

module.exports = mongoose.model('Attribute', attributeSchema);