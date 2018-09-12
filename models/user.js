const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
    username: {type: String, unique: true}, //key
    password: {type: String, required: true},
    firstName: String,
    lastName: String,
    createDate: {type: Date, default: Date.now },
    phoneNumber: String,
    validated: Boolean,
    type: {type: Number, required: true}, // system admin=0, form manager=1, user=2
    email: {type: String, unique: true},
    groupNumber: Number,
    active: Boolean, // you can disable a user

});
// embed passport functions
userSchema.plugin(passportLocalMongoose, {
    // filter disabled user
    findByUsername: function(model, queryParameters) {
        // Add additional query parameter - AND condition - active: true
        queryParameters.active = true;
        return model.findOne(queryParameters);
    }
});

module.exports = mongoose.model('User', userSchema);