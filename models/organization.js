const mongoose = require('mongoose');

let organizationSchema = new mongoose.Schema({
    name: String,
    groupNumber : Number
});

module.exports = mongoose.model('Organization', organizationSchema);