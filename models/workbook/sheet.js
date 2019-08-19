const mongoose = require('mongoose');

module.exports = mongoose.model('Sheet',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true},
        attIds: [Number], // Attribute.id
        catIds: [Number], // Category.id

        /**
         * {
         *     attId: column number, // attribute ID to column number
         *     ...
         * }
         */
        attMap: {},
        catMap: {}, // same as attMap
        row2Cat: {},
        col2Att: {}

    }));
