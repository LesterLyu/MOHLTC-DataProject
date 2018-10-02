const si = require('systeminformation');
const config = require('../config/config'); // get our config file
const error = require('../config/error');
const express = require('express');
const reload = require('reload');
let app = express();



function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.SYSTEM_MANAGEMENT);
}

module.exports = {
    checkPermission: checkPermission,

    get_static_system_info: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        let info = {
            time: si.time(),
        };

        si.cpu()
            .then((data) => {
                info.cpu = data;
                return si.system()
            })
            .then((data) => {
                info.system = data;
                return si.graphics()
            })
            .then((data) => {
                info.graphics = data;
                return si.osInfo()
            })
            .then((data) => {
                info.osInfo = data;
                res.json({success: true, info: info})
            })
            .catch( err => {
                res.json({success: false, message: err})
            })

    },
    get_dynamic_system_info: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        let info = {};

        si.mem()
            .then((data) => {
                info.mem = data;
                return si.fsSize()
            })
            .then((data) => {
                info.fsSize = data;
                return si.cpuCurrentspeed()
            })
            .then((data) => {
                info.cpuCurrentspeed = data;
                return si.currentLoad();
            })
            .then((data) => {
                info.currentLoad = data;
                res.json({success: true, info: info})
            })
            .catch( err => {
                res.json({success: false, message: err})
            })
    },
    get_config: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        res.json({
            success: true,
            config: {
                database: config.database,
                mailServer: config.mailServer, //smtp
                serverHostname: config.serverHostname,
                disableEmailValidation: config.disableEmailValidation
            }
        })

    },
     update_config: (req, res, next) => {
         if (!checkPermission(req)) {
             return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
         }

         // reload app


     }

};