const mongoose = require('mongoose');

let registerRequestSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    groupNumber: Number,
    password: String,
    phoneNumber: String,
    organization: String,
    email: String,
    role: String
});

module.exports = mongoose.model('RegisterRequest', registerRequestSchema);