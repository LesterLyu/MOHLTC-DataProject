const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
    username: {type: String, unique: true}, //key
    password: {type: String, required: true},
    createDate: {type: Date, default: Date.now },
    phoneNumber: String,
    validated: Boolean,
    type: {type: Number, required: true}, // system admin=0, form manager=1, user=2
    email: String,

});
// embed passport functions
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);