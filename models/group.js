const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupNumber: {type: Number, required: true},

    // group name
    name: {type: String, required: true, unique: true},
});

module.exports = mongoose.model('Group', groupSchema);
