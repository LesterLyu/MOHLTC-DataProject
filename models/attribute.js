const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

let attributeSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    attribute: {type: String},
    groupNumber: {type: Number, required: true},
    description: {type: String},
});

// attributeSchema.plugin(AutoIncrement, {inc_field: 'id', id: 'attributeId'});

module.exports = mongoose.model('Attribute', attributeSchema);