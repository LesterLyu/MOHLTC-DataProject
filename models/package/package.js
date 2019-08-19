const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const packageSchema = new mongoose.Schema({
    groupNumber: {type: Number, required: true},

    // Package name
    name: {type: String, required: true},

    // If this package is published to the users.
    published: {type: Boolean, required: true, default: false},

    // Organizations this package is assigned to, could be many.
    // reference to User._id
    organizations: [{type: ObjectId, ref: 'Organization'}],

    // Workbooks this package includes.
    // reference to Workbook._id
    workbooks: [{type: ObjectId, ref: 'Workbook'}],

    startDate: Date,

    endDate: Date,

    // description for the workbook
    adminNotes: String,

    // Admins may provide some files, this does not include excel workbooks.
    adminFiles: [{buffer: Buffer, name: String}],
});

module.exports = mongoose.model('Package', packageSchema);
