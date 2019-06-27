const mongoose = require('mongoose');

module.exports = mongoose.model('Value',
    new mongoose.Schema({
        value: {},
        groupNumber: {type: Number, required: true},
        attId: {type: Number, required: true}, // Attribute._id
        catId: {type: Number, required: true}, // Category._id
    }));
