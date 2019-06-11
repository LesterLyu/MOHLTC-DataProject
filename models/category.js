const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

let categorySchema = new mongoose.Schema({
    category: {type: String},
    groupNumber: {type: Number, required: true}
});

// categorySchema.plugin(AutoIncrement, {inc_field: 'id', id: 'categoryId'});

module.exports = mongoose.model('Category', categorySchema);