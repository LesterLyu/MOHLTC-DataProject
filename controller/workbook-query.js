const async = require("async");

const User = require('../models/user');
const Workbook = require('../models/workbook');
const FilledWorkbook = require('../models/filledWorkbook');
const Attribute = require('../models/attribute');
const Category = require('../models/category');
const error = require('../config/error');
const config = require('../config/config');
const {gzip, ungzip} = require('node-gzip');
const pako = require('pako');
const ExcelWorkbook = require('./excel/workbook');
const {processQuery, processQueryS, splitQuery} = require('./workers/processQueries2');

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
        } else {
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
                        if (data !== null && typeof data === "object" && 'result' in data) {
                            data = data.result;
                        }
                    } else {
                        data = '';
                    }
                    if (includeAttCatId) {
                        currCatAtt.push({
                            username: filledWorkbooks[i].username,
                            catId: catId,
                            attId: attId,
                            data: data,
                        });
                    } else {
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
        const groupNumber = req.session.user.groupNumber;
        Workbook.find({groupNumber: groupNumber}, {name: 1}, (err, docs) => {
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
        Workbook.findOne({name: req.query.name}, {data: 1, attMap: 1, catMap: 1}, (err, doc) => {
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

    get_many_filledworkbooks_of_one_workbook_multi_threading: (req, res) => {
        const groupNumber = req.session.user.groupNumber;
        const queryWorkbookName = req.query.workbookName;
        const queryUsername = req.query.username ? req.query.username : undefined;
        //  filter the content of body
        const querySheetName = req.query.sheetName ? req.query.sheetName : '-1';
        const queryCategoryId = req.query.catId ? req.query.catId : '-1';
        const queryAttributeId = req.query.attId ? req.query.attId : '-1';

        // Firstly retrieve the category map and attribute map from a template (unfilled workbook)
        // Then based on these two map to get all value from sheets
        // that are filled by the same template
        Workbook.findOne({groupNumber: groupNumber, name: queryWorkbookName}, {
            attMap: 1,
            catMap: 1
        }, (err, workbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (!workbook) {
                return res.json({success: false, filledWorkbooks: null});
            }

            let attMap = workbook.attMap;
            let catMap = workbook.catMap;
            // const projects = {};

            let query = {groupNumber: groupNumber, name: queryWorkbookName};
            if (queryUsername != null) {
                query.username = queryUsername;
            }

            FilledWorkbook.aggregate([
                {$match: query},
                {
                    $project: {
                        name: 1,
                        username: 1,
                        data: 1
                    }
                }
            ]).exec((err, filledWorkbooks) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({success: false, message: err});
                }
                Promise.all(filledWorkbooks.map(filledWorkbook => {
                    // This might be slower but does not block the event loop. (multi-threading)
                    return processQuery(attMap, catMap, queryWorkbookName, filledWorkbook.username, querySheetName,
                        queryCategoryId, queryAttributeId, filledWorkbook.data);
                })).then(arrays => {
                    return res.json({success: true, filledWorkbooks: [].concat(...arrays)});
                }).catch(err => {
                    console.error(err);
                    return res.status(500).json({success: false, message: err});
                });
            });
        });
    },

    // GET Query user filled workbook data by the name of a workbook and the Id of attribute, category.
    get_many_filledworkbooks_of_one_workbook: (req, res) => {
        // validation
        if (req.query.workbookName == null || req.query.workbookName.trim().length <= 1) {
            const msgStr = 'workbook name can not be empty.';
            return res.status(400).json({success: true, message: msgStr, filledWorkbooks: null});
        }

        const groupNumber = req.session.user.groupNumber;
        const queryWorkbookName = req.query.workbookName;
        const queryUsername = req.query.username ? req.query.username : '';
        //  filter the content of body
        const querySheetName = req.query.sheetName ? req.query.sheetName : '-1';
        const queryCategoryId = req.query.catId ? req.query.catId : '-1';
        const queryAttributeId = req.query.attId ? req.query.attId : '-1';


        // Firstly retrieve the category map and attribute map from a template (unfilled workbook)
        // Then based on these two map to get all value from sheets
        // that are filled by the same template
        Workbook.findOne({groupNumber: groupNumber, name: queryWorkbookName}, {
            attMap: 1,
            catMap: 1
        }, (err, workbook) => {
            if (err) {
                return res.status(500).json({success: false, message: err});
            }
            if (!workbook) {
                const msgStr = queryWorkbookName + 'does not exist.';
                return res.status(200).json({success: true, message: msgStr, filledWorkbooks: null});
            }

            // retrieve data from all filledWordbooks
            let attMap = workbook.attMap;
            let catMap = workbook.catMap;
            const regex = new RegExp(queryWorkbookName.substring(0, queryWorkbookName.length - 5), "i");
            let query = {groupNumber: groupNumber, name: regex};  // name includes queryWorkbookName
            if (queryUsername !== '') {
                query.username = queryUsername;
            }

            let projection = {
                name: 1,
                username: 1,
                data: 1
            };
            FilledWorkbook.find(query, projection, (err, filledWorkbooks) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: false, message: err});
                }
                let result = [];
                for (let indexOfDoc = 0; indexOfDoc < filledWorkbooks.length; indexOfDoc++) {   // document
                    const file = filledWorkbooks[indexOfDoc];
                    const filename = file.name;
                    const username = file.username;
                    const data = file.data;

                    // FIXME: sheetname can not get from database

                    for (let sheetKey in catMap) {                                           // sheet
                        for (let catKey in catMap[sheetKey]) {                                               // row
                            if (queryCategoryId !== '-1' && queryCategoryId !== '' && queryCategoryId !== catKey) {
                                continue;
                            }
                            for (let attKey in attMap[sheetKey]) {                                      // col
                                if (queryAttributeId !== '-1' && queryAttributeId !== '' && queryAttributeId !== attKey) {
                                    continue;
                                }

                                const rowIndex = catMap[sheetKey][catKey];
                                const colIndex = attMap[sheetKey][attKey];
                                const value = data[sheetKey][rowIndex][colIndex];

                                result.push({
                                    username,
                                    // workbookname: filename,
                                    sheetKey,
                                    catKey,
                                    attKey,
                                    value
                                });
                            }
                        }
                    }
                }
                return res.json({success: true, filledWorkbooks: result});
            });
        });
    },
    // GET Query filled workbook data by the name of attribute and category.
    get_many_filledWorkbooks_by_attributeName_categoryName: async (req, res) => {
        try {
            if (!req.query.attribute && !req.query.category) {
                return res.status(400).json({success: false, message: 'category and attribute can not be empty.'});
            }

            const allCategories = await Category.find({});
            const allAttributes = await Attribute.find({});
            const categoryMap = new Map();
            for (let key in allCategories) {
                categoryMap.set(allCategories[key].id, allCategories[key].category);
            }
            const attributeMap = new Map();
            for (let key in allAttributes) {
                attributeMap.set(allAttributes[key].id, allAttributes[key].attribute);
            }
            var regex = new RegExp(req.query.attribute, "i");
            const attributes = allAttributes.filter(a =>
                regex.test(a.attribute));
            regex = new RegExp(req.query.category, "i");
            const categories = allCategories.filter(a =>
                regex.test(a.category));
            if (!attributes || !categories) {
                return res.status(404).json({success: false, message: 'no category or attribute found'});
            }

            let attIds = [];
            await attributes.forEach(a => attIds.push(a.id));
            let catIds = [];
            await categories.forEach(c => catIds.push(c.id));

            //
            const filledWorkbooks = await FilledWorkbook.find({});
            if (!filledWorkbooks) {
                return res.status(404).json({success: false, message: 'No filled workbook exists'});
            }

            // search filled workbook
            let result = [];
            for (let indexOfDoc = 0; indexOfDoc < filledWorkbooks.length; indexOfDoc++) {   // document
                const file = filledWorkbooks[indexOfDoc];
                const filename = file.name;
                const username = file.username;
                for (let sheetKey in file.data) {                            // sheet
                    const sheet = file.data[sheetKey];
                    const firstRow = sheet[0];
                    let colsIndex = [];

                    // 1. ? row 0
                    if (!firstRow) {
                        continue;       // to next sheet
                    }

                    // 2. ? the first line includes attIds
                    for (let colIndex in firstRow) {
                        for (let attIndex in attIds) {
                            if (/^\d+$/.test(firstRow[colIndex]) && firstRow[colIndex] === attIds[attIndex]) {
                                colsIndex.push(colIndex);
                            }
                        }
                    }
                    if (colsIndex.length <= 0) {
                        continue;       // to next sheet
                    }

                    // search one row by one row from 2 line
                    for (let rowIndex in sheet) {                             // Row
                        const rowLine = sheet[rowIndex];
                        if (rowIndex == 0) {
                            continue; // jump to the second line
                        }
                        // 3. ? col 0 has validated category id
                        const firstCellInRow = rowLine[0];
                        if (!firstCellInRow || !/^\d+$/.test(firstCellInRow)) {
                            continue; // jump to the second line
                        }

                        // 4. ? firstCol is within catIds
                        for (const catIndex in catIds) {
                            if (firstCellInRow === catIds[catIndex]) {
                                // Retrieve data
                                for (const c in colsIndex) {           // Column
                                    const categoryId = firstCellInRow;
                                    const categoryName = categoryMap.get(categoryId);
                                    const attributeId = firstRow[colsIndex[c]];
                                    const attributeName = attributeMap.get(attributeId);
                                    const cellDataValue = rowLine[colsIndex[c]];
                                    if (cellDataValue) {
                                        result.push({
                                            value: cellDataValue,
                                            // FIXME: REMOVE  -- TAG for debugging
                                            category: categoryId + '--' + rowIndex + " :: " + categoryName,
                                            attribute: attributeId + '--' + colsIndex[c] + " :: " + attributeName,
                                            username,
                                            workbookname: filename,
                                            sheetname: sheetKey,
                                        });
                                    }

                                } // end of column
                            }
                        } // end of for loop --CatIds
                    } // end of for loop -- row
                } // end of for loop -- sheet
            } // end of for loop -- document
            //
            if (result.length <= 0) {
                return res.status(404).json({success: false, message: 'No suitable record found'});
            }
            return res.status(200).json({
                success: true,
                message: result.length + ' records found.',
                data: result,
            });

        } catch (err) {
            return res.status(500).json({success: false, message: err});
        }
    },

};
