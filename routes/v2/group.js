const express = require('express');
const router = express.Router();
const {groupController} = require('../../controller/v2');
const {setGroupName} = groupController;

router.post('/api/v2/group', setGroupName);

module.exports = router;
