const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Attribute',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true},
        id: {type: Number, required: true, unique: true},
        description: String,
        groups: [ObjectId],
    }));
