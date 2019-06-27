const mongoose = require('mongoose');

let categoryGroupSchema = new mongoose.Schema({
    name: {type: String, required: true},
    groupNumber: {type: Number, required: true},
    categoryIds: {type: Array}
});

module.exports = mongoose.model('CategoryGroup', categoryGroupSchema);