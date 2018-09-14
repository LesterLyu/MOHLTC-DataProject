const mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    category: {type: String, unique: true},
});
module.exports = mongoose.model('Attribute', categorySchema);