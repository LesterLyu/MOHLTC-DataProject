const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('AttributeGroup',
    new mongoose.Schema({
        // _id auto generated
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true},
        parent: ObjectId, // AttributeGroup._id
        children: [ObjectId], // AttributeGroup._id
    }));
