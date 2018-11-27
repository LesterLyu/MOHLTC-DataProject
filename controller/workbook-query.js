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

async function getDataAtLocation(includeAttCatId, onlyFilled, groupNumber, wbName, queryData) {
    let attMap, catMap, wbData, wsName2SheetNo;
    let result = {};
    await Workbook.findOne({name: wbName, groupNumber: groupNumber},
        {name: 1, data: 1, attMap: 1, catMap: 1}).then((workbook) => {
        if (!workbook) {
            console.log('workbook not found.');
        }
        else {
            attMap = workbook.attMap;
            catMap = workbook.catMap;
            wbData = workbook.data;
            wsName2SheetNo = Object.entries(workbook.data).reduce((map, obj) => {
                map[obj[1].name] = obj[0];
                return map;
            }, {});
        }
    });

    const projector = {username: 1, name: 1};
    for (let wsName in queryData) {
        const currSheet = queryData[wsName];
        for (let i = 0; i < currSheet.length; i++) {
            const sheetNo = wsName2SheetNo[wsName];
            const catId = currSheet[i][0];
            const attId = currSheet[i][1];
            const row = catMap[sheetNo][catId], col = attMap[sheetNo][attId];
            const dataKey = ['data', sheetNo, row, col].join('.');
            projector[dataKey] = 1;
        }
    }

    await FilledWorkbook.find({name: wbName, groupNumber: groupNumber}, projector).then((filledWorkbooks) => {

        // add users who does not fill the workbook
        if (!onlyFilled) {
            let users = getAllUsersAtGroup(groupNumber);
            for (let i = 0; i < users.length; i++) {
                // TO-DO
            }
        }

        for (let wsName in queryData) {
            const currSheet = queryData[wsName];
            result[wsName] = [];
            for (let i = 0; i < currSheet.length; i++) {
                const sheetNo = wsName2SheetNo[wsName];
                const catId = currSheet[i][0], attId = currSheet[i][1];
                const row = catMap[sheetNo][catId], col = attMap[sheetNo][attId];
                const currCatAtt = [];
                for (let i = 0; i < filledWorkbooks.length; i++) {
                    let data;
                    if (filledWorkbooks[i].data[sheetNo][row] && filledWorkbooks[i].data[sheetNo][row][col] !== undefined) {
                        data = filledWorkbooks[i].data[sheetNo][row][col];
                        if (typeof data === "object" && 'result' in data) {
                            data = data.result;
                        }
                    }
                    else {
                        data = '';
                    }
                    if (includeAttCatId) {
                        currCatAtt.push({
                            username: filledWorkbooks[i].username,
                            catId: catId,
                            attId: attId,
                            data: data,
                        });
                    }
                    else {
                        currCatAtt.push({
                            username: filledWorkbooks[i].username,
                            data: data,
                        });
                    }

                }
                result[wsName].push(currCatAtt);
            }
        }
    });
    return result;
}

module.exports = {
    checkPermission: checkPermission,

    workbook_query: async (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const groupNumber = req.session.user.groupNumber;
        const wbName = req.body.wbName;
        const onlyFilled = req.body.onlyFilled === undefined; // default true
        const queryData = req.body.queryData;
        const includeAttCatId = req.body.includeAttCatId || false; // default false

        const data = await getDataAtLocation(includeAttCatId, onlyFilled, groupNumber, wbName, queryData);
        res.json({success: true, result: data});
    },

    get_workbook_names: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        Workbook.find({}, {name: 1}, (err, docs) => {
            if (err) {
                console.log(err);
                return res.status(400).json({success: false, message: err});
            }
            docs = docs.reduce((arr, obj) => {arr.push(obj.name); return arr;}, []);
            res.json({success: true, names: docs})
        })
    },

    get_workbook_query_detail: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        Workbook.findOne({name: req.query.name}, {data: 1, attMap: 1, catMap:1}, (err, doc) => {
            if (err) {
                console.log(err);
                return res.status(400).json({success: false, message: err});
            }
            const names = [], att = {}, cat = {};
            if (!doc) {
                return res.json({success: false, message: 'workbook name: ' + req.query.name + ' does not exist.'})
            }
            for (let sheetNo in doc.data) {
                names.push(doc.data[sheetNo].name)
            }
            for (let sheetNo in doc.catMap) {
                cat[sheetNo] = Object.keys(doc.catMap[sheetNo]);
            }
            for (let sheetNo in doc.attMap) {
                att[sheetNo] = Object.keys(doc.attMap[sheetNo]);
            }
            res.json({success: true, worksheetNames: names, cat: cat, att: att})
        })
    },

};
