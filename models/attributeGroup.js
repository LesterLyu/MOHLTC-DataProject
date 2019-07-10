const mongoose = require('mongoose');

let attributeGroupSchema = new mongoose.Schema({
    name: {type: String, required: true},
    groupNumber: {type: Number, required: true},
    attributeIds: {type: Array}
});

module.exports = mongoose.model('AttributeGroup2', attributeGroupSchema);
