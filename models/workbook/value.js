const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Value',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        organization: {type: ObjectId, ref: 'Organization'},
        values: {} // {catId: {attId: value}}
    }));
