const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const packageSchema = new mongoose.Schema({
    groupNumber: {type: Number, required: true},

    // Package name
    name: {type: String, required: true},

    // If this package is published to the users.
    published: {type: Boolean, required: true, default: false},

    /**
     * The values that included in this package.
     * As long as a cell contains both category id and attribute id,
     * the cell value will be saved here.
     * {
     *     catId: {
     *         attId: value
     *     }
     * }
     */
    values: {},

    // Users this package is assigned to, could be many users.
    // reference to User._id
    users: [{type: ObjectId, ref: 'User'}],

    // Workbooks this package includes.
    // reference to Workbook._id
    workbooks: [{type: ObjectId, ref: 'Workbook'}],

    startDate: Date,

    endDate: Date,

    // description for the workbook
    adminNotes: String,

    // Admins may provide some files, this does not include excel workbooks.
    adminFiles: [{buffer: Buffer, name: String}],

    // User submitted with some notes
    userNotes: String,

    // Users may submit some files, this does not include excel workbooks.
    userFiles: [{buffer: Buffer, name: String}],

    // Submit history
    histories: [{
        userNotes: String,
        userFiles: [{buffer: Buffer, name: String}],
        workbooks: [{type: ObjectId, ref: 'Workbook'}],
        values: {},
        submittedBy: {type: ObjectId, ref: 'User'},
        date: Date, // submit date
    }],
});

packageSchema.methods.submitted = function () {
    return this.histories.length > 0;
};

packageSchema.methods.latestSubmission = function () {
    return this.histories[this.histories.length - 1];
};

module.exports = mongoose.model('Package', packageSchema);
