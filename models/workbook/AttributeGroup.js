const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('AttributeGroup',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true},
        parents: [ObjectId], // AttributeGroup._id
        children: [ObjectId], // AttributeGroup._id
    }));
