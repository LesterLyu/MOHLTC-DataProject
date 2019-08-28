const express = require('express');
const router = express.Router();
const {packageController} = require('../../controller/v2');
const {
    userGetWorkbook, userGetPackage, adminGetPackage, adminCreatePackage, adminGetAllPackages, userGetAllPackages,
    adminDeletePackage, userSaveWorkbook, userSubmitPackage, adminGetPackageOrganizations, adminGetUserWorkbook,
    adminEditPackage
} = packageController;

router.get('/api/v2/admin/packages/:name/:organization', adminGetPackage);

router.get('/api/v2/admin/packages/:name/organizations', adminGetPackageOrganizations);

router.put('/api/v2/admin/packages/:name', adminEditPackage);

router.get('/api/v2/packages/:name/:organization', userGetPackage);

router.get('/api/v2/packages/:packageName/:organization/:name', userGetWorkbook);

router.get('/api/v2/admin/packages/:packageName/:organizationName/:workbookName', adminGetUserWorkbook);

router.put('/api/v2/packages/:packageName/:organization/:name', userSaveWorkbook);

router.get('/api/v2/admin/packages', adminGetAllPackages);

router.get('/api/v2/packages/:organization', userGetAllPackages);

router.post('/api/v2/admin/packages', adminCreatePackage);

router.delete('/api/v2/admin/packages/:name', adminDeletePackage);

router.post('/api/v2/packages/:packageName/:organization', userSubmitPackage);

module.exports = router;
