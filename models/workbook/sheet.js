const mongoose = require('mongoose');

module.exports = mongoose.model('Sheet',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true},
        attIds: [Number], // Attribute._id
        catIds: [Number], // Category._id

        /*
            {
                id: option,
                id: option,
            }
         */
        headers: {}

    }));
