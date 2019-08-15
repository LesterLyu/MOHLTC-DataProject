const express = require('express');
const router = express.Router();
const {groupController} = require('../../controller/v2');
const {setGroupName, getGroupName} = groupController;

router.get('/api/v2/group', getGroupName);

router.post('/api/v2/group', setGroupName);

module.exports = router;
