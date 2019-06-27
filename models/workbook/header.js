const mongoose = require('mongoose');

module.exports = mongoose.model('Header',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true},
        options: []
    }));
