const express = require('express');
const router = express.Router();
const si = require('systeminformation');
const {checkPermission, Permission} = require('../../controller/v2/helpers');
const error = require('../../config/error');

router.get('/api/v2/system', async (req, res, next) => {
    if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
    let info = {};
    try {
        info.mem = await si.mem();
        info.currentLoad = await si.currentLoad();
    } catch (e) {
        return next(e)
    }
    res.json({success: true, info})
});

router.get('/api/v2/system/static', async (req, res, next) => {
    if (!checkPermission(req, Permission.SYSTEM_MANAGEMENT)) {
        return next(error.api.NO_PERMISSION);
    }
    let info = {};
    try {
        info.system = await si.system();
        info.cpu = await si.cpu();
        info.osInfo = await si.osInfo();
        info.diskLayout = await si.diskLayout();
        info.inetLatency = await si.inetLatency();
    } catch (e) {
        return next(e)
    }
    res.json({success: true, info})
});

module.exports = router;
