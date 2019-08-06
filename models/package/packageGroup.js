const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const packageGroupSchema = new mongoose.Schema({
    groupNumber: {type: Number, required: true},

    // Package name
    name: {type: String, required: true},

    packages: [{type: ObjectId, ref: 'Package'}],
});

module.exports = mongoose.model('PackageGroup', packageGroupSchema);
