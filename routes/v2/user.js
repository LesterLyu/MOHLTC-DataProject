const express = require('express');
const router = express.Router();
const {userController} = require('../../controller/v2');

router.get('/api/v2/users/current/organizations', userController.getUserOrganizations);

module.exports = router;
