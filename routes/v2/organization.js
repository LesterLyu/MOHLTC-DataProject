const express = require('express');
const router = express.Router();
const {organizationController} = require('../../controller/v2');
const {deleteOrganization, updateOrganization, deleteOrganizationType, updateOrganizationType} = organizationController;

router.post('/api/v2/organization', updateOrganization);

router.delete('/api/v2/organization/:name', deleteOrganization);

router.post('/api/v2/orgtype', updateOrganizationType);

router.delete('/api/v2/orgtype/:name', deleteOrganizationType);

module.exports = router;
