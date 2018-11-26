const async = require("async");

const User = require('../models/user');
const Workbook = require('../models/workbook');
const FilledWorkbook = require('../models/filledWorkbook');
const error = require('../config/error');
const config = require('../config/config');
const excel = require('./excel/xlsx');
const {gzip, ungzip} = require('node-gzip');
const pako = require('pako');
const ExcelWorkbook = require('./excel/workbook');

function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.WORKBOOK_QUERY);
}

async function getAllUsersAtGroup(groupNumber) {
    let query = {groupNumber: groupNumber};
    if (parseInt(groupNumber) === 0) {
        query = {}
    }
    let users = [];
    await User.find(query, {username: 1}, (err, docs) => {
        if (err) {
            console.log(err);
        }
        users = docs;
    }).exec();
    return users; // [{username: '...'}, ...]
}

async function getDataAtLocation(onlyFilled, groupNumber, wbName, sheetName, catId, attId) {
    let attMap, catMap, wbData, wsNames;
    let result = [];
    await Workbook.findOne({name: wbName, groupNumber: groupNumber},
        {name: 1, data: 1, attMap: 1, catMap: 1}).then((workbook) => {
        if (!workbook) {
            console.log('workbook not found.');
        }
        else {
            attMap = workbook.attMap;
            catMap = workbook.catMap;
            wbData = workbook.data;
            wsNames = Object.entries(workbook.data).reduce((map, obj) => {
                map[obj[1].name] = obj[0];
                return map;
            }, {});
        }
    });

    const sheetNo = wsNames[sheetName];
    const row = catMap[sheetNo][catId], col = attMap[sheetNo][attId];
    const dataKey = ['data', sheetNo, row, col].join('.');
    const projector = {username: 1, [dataKey]: 1};

    await FilledWorkbook.find({name: wbName, groupNumber: groupNumber}, projector).then((filledWorkbooks) => {

        // add users who does not fill the workbook
        if (!onlyFilled) {
            let users = getAllUsersAtGroup(groupNumber);
            for (let i = 0; i < users.length; i++) {
                // TO-DO
            }
        }
        for (let i = 0; i < filledWorkbooks.length; i++) {
            let data;
            if (filledWorkbooks[i].data[sheetNo][row] && filledWorkbooks[i].data[sheetNo][row][col] !== undefined) {
                data = filledWorkbooks[i].data[sheetNo][row][col]
            }
            else {
                data = '';
            }
            result.push({
                username: filledWorkbooks[i].username,
                catId: catId,
                attId: attId,
                data: data,
            });

        }

    });
    return result; // Array of objects
}

module.exports = {
    checkPermission: checkPermission,

    workbook_query: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const groupNumber = req.session.user.groupNumber;
        const wbName = req.body.wbName;
        const onlyFilled = req.body.onlyFilled || false;
        const queryData = req.body.queryData;
        const tasks = [];
        const result = {};
        for (let wsName in queryData) {
            const currSheet = queryData[wsName];
            result[wsName] = [];
            for (let i = 0; i < currSheet.length; i++) {
                tasks.push(async () => {
                    const data = await getDataAtLocation(onlyFilled, groupNumber, wbName, wsName, currSheet[i][0], currSheet[i][1]);
                    result[wsName].push(data);
                    console.log(data)
                });
            }
        }

        async.parallel(tasks, (err) => {
            if (err) {
                console.log(err)
            }
            res.json({success: true, result: result})
        })
    },

};
