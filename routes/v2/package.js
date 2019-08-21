const express = require('express');
const router = express.Router();
const {packageController} = require('../../controller/v2');
const {
    userGetWorkbook, userGetPackage, adminGetPackage, adminCreatePackage, adminGetAllPackages, userGetAllPackages,
    adminDeletePackage, userSaveWorkbook, userSubmitPackage
} = packageController;

router.get('/api/v2/admin/packages/:name', adminGetPackage);

router.get('/api/v2/packages/:name', userGetPackage);

router.get('/api/v2/packages/:packageName/:name', userGetWorkbook);

router.put('/api/v2/packages/:packageName/:name', userSaveWorkbook);

router.get('/api/v2/admin/packages', adminGetAllPackages);

router.get('/api/v2/packages', userGetAllPackages);

router.post('/api/v2/admin/packages', adminCreatePackage);

router.delete('/api/v2/admin/packages/:name', adminDeletePackage);

router.post('/api/v2/packages/:name', userSubmitPackage);

module.exports = router;
