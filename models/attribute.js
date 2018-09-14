const mongoose = require('mongoose');

let attributeSchema = new mongoose.Schema({
    attribute: {type: String},
    groupNumber: {type: Number, required: true}
});
module.exports = mongoose.model('Attribute', attributeSchema);