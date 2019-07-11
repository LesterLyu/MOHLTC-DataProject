const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const arrayUniquePlugin = require('mongoose-unique-array');

module.exports = mongoose.model('CategoryGroup',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true, unique: true },
        parent: { type: ObjectId, unique: true }, // CategoryGroup._id
        children: [{ type: ObjectId, unique: true }]// CategoryGroup._id
    }).plugin(arrayUniquePlugin)
);
