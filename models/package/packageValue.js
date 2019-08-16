const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const packageValueSchema = new mongoose.Schema({
    groupNumber: {type: Number, required: true},
    package: {type: ObjectId, ref: 'Package', required: true}, // may be not useful
    organization: {type: ObjectId, ref: 'Organization', required: true},
    values: {}, // {catId: {attId: value}}

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


packageValueSchema.methods.submitted = function () {
    return this.histories.length > 0;
};

packageValueSchema.methods.latestSubmission = function () {
    return this.histories[this.histories.length - 1];
};


module.exports = mongoose.model('PackageValue', packageValueSchema);
