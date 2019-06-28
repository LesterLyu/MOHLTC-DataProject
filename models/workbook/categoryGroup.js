const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('CategoryGroup',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true},
        parents: [ObjectId], // CategoryGroup._id
        children: [ObjectId], // CategoryGroup._id
    }));
