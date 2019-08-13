const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const organizationSchema = new mongoose.Schema({
    groupNumber: {type: Number, required: true},
    name: {type: String, required: true},
    users: [{type: ObjectId, ref: 'User'}],
    managers: [{type: ObjectId, ref: 'User'}],
    types: [{type: ObjectId, ref: 'OrganizationType'}],
});

module.exports = mongoose.model('Organization', organizationSchema);
