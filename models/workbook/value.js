const {Schema, model} = require('mongoose');

module.exports = model('Value',
    new Schema({
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
