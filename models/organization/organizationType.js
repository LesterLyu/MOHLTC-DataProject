const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const organizationTypeSchema = new mongoose.Schema({
    groupNumber: {type: Number, required: true},
    name: {type: String, required: true},
    organizations: [{type: ObjectId, ref: 'Organization'}],
});

module.exports = mongoose.model('OrganizationType', organizationTypeSchema);
