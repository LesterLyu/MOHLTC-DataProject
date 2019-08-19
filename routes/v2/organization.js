const express = require('express');
const router = express.Router();
const {organizationController} = require('../../controller/v2');
const {
    deleteOrganization, updateOrganization, OrgAddOneUser, deleteOrganizationType, updateOrganizationType, getOrganizations,
    getOrganizationTypes
} = organizationController;

router.get('/api/v2/organizations/:mode?', getOrganizations);

router.post('/api/v2/organization/:name/:userId', OrgAddOneUser);

router.post('/api/v2/organizations', updateOrganization);

router.delete('/api/v2/organizations/:name', deleteOrganization);

router.get('/api/v2/orgtypes', getOrganizationTypes);

router.post('/api/v2/orgtypes', updateOrganizationType);

router.delete('/api/v2/orgtypes/:name', deleteOrganizationType);

module.exports = router;
