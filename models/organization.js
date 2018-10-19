const mongoose = require('mongoose');

let organizationSchema = new mongoose.Schema({
    name: String,
});

module.exports = mongoose.model('Organization', organizationSchema);