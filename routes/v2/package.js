const express = require('express');
const router = express.Router();
const {packageController} = require('../../controller/v2');
const {adminGetPackage, adminCreatePackage, adminGetAllPackages, userGetAllPackages, adminDeletePackage} = packageController;

router.get('/api/v2/admin/packages/:name', adminGetPackage);

router.get('/api/v2/admin/packages', adminGetAllPackages);

router.get('/api/v2/packages', userGetAllPackages);

router.post('/api/v2/admin/packages', adminCreatePackage);

router.delete('/api/v2/admin/packages/:name', adminDeletePackage);

module.exports = router;
