const mongoose = require('mongoose');

module.exports = {
    generateId: (req, res, next) => {
        const number = req.params.number;
        const ids = [];
        for (let i = 0; i < number; i++) {
            ids.push(mongoose.Types.ObjectId());
        }
        res.json({success: true, ids})
    }
};
