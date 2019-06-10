const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

let attributeSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    attribute: {type: String},
    groupNumber: {type: Number, required: true}
});

// attributeSchema.plugin(AutoIncrement, {inc_field: 'id', id: 'attributeId'});

module.exports = mongoose.model('Attribute', attributeSchema);