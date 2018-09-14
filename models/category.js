const mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    category: {type: String},
    groupNumber: {type: Number, required: true}
});
module.exports = mongoose.model('Attribute', categorySchema);