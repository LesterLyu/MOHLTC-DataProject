const express = require('express');
const router = express.Router();
const {generateId} = require('../../controller/v2');

router.get('/api/v2/generate/id/:number', generateId);

module.exports = router;
