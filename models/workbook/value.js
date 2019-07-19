const mongoose = require('mongoose');



module.exports = mongoose.model('Value',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true, unique: true},

        /**
         * {
         *     catId: {
         *         attId: value
         *     }
         * }
         */
        data: {}
    }));
