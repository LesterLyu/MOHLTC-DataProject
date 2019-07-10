const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Workbook',
    new mongoose.Schema({
        groupNumber: {type: Number, required: true},
        name: {type: String, required: true, unique: true},
        sheetIds: [ObjectId], // Sheet._id
        file: {type: Buffer, required: true}, // base64 encoding
    }));
