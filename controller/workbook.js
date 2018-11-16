const Workbook = require('../models/workbook');
const FilledWorkbook = require('../models/filledWorkbook');
const error = require('../config/error');
const config = require('../config/config');
const excel = require('./excel/xlsx');
const {gzip, ungzip} = require('node-gzip');
const pako = require('pako');
const ExcelWorkbook = require('./excel/workbook');

function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.WORKBOOK_TEMPLATE_MANAGEMENT);
}

module.exports = {
    checkPermission: checkPermission,

    // get an empty workbook templet
    get_workbook: (req, res, next) => {
        const name = req.params.name;
        const groupNumber = req.session.user.groupNumber;
        Workbook.findOne({name: name, groupNumber: groupNumber}, (err, workbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (!workbook) {
                return res.status(400).json({success: false, message: 'Workbook does not exist.'});
            }
            return res.json({success: true, workbook: workbook});
        })
    },

    // get a filled workbook, if not exists, send an empty workbook
    get_filled_workbook: (req, res, next) => {
        const name = req.params.name;
        const username = req.session.user.username;
        const groupNumber = req.session.user.groupNumber;
        FilledWorkbook.findOne({name: name, username: username, groupNumber: groupNumber}, (err, filledWorkbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            Workbook.findOne({name: name, groupNumber: groupNumber}, (err, workbook) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: false, message: err});
                }
                if (!workbook) {
                    return res.status(400).json({success: false, message: 'Workbook does not exist.'});
                }
                if (!filledWorkbook) {
                    return res.json({success: true, workbook: workbook});
                }
                else {
                    workbook.data = filledWorkbook.data;
                    return res.json({success: true, workbook: workbook});
                }
            });

        })
    },

    // Create or Update filled workbook
    update_filled_workbook: (req, res, next) => {
        const name = req.body.name;
        const username = req.session.user.username;
        const date = Date.now();
        const groupNumber = req.session.user.groupNumber;
        let data = req.body.data;
        FilledWorkbook.findOne({name: name, username: username, groupNumber: groupNumber}, (err, filledWorkbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (filledWorkbook) {
                // update it
                filledWorkbook.date = date;
                filledWorkbook.data = data;
                filledWorkbook.save((err, updated) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({success: false, message: err});
                    }
                    return res.json({success: true, message: 'Successfully updated filled workbook ' + name + '.'})
                });
            }
            else {
                // create a filled workbook
                let newFilledWorkbook = new FilledWorkbook({
                    name: name,
                    username: username,
                    groupNumber: groupNumber,
                    data: data
                });
                newFilledWorkbook.save((err, updatedFilledWorkbook) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({success: false, message: err});
                    }
                    return res.json({success: true, message: 'Successfully added filled workbook ' + name + '.'});
                })
            }
        });
    },

    delete_filled_workbook: (req, res, next) => {
        const name = req.body.name;
        const username = req.session.user.username;
        const groupNumber = req.session.user.groupNumber;
        FilledWorkbook.deleteOne({name: name, username: username, groupNumber: groupNumber}, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err})
            }
            return res.json({success: true, message: 'Deleted filled workbook ' + name})
        })
    },

    get_unfilled_workbooks: (req, res, next) => {
        const username = req.session.user.username;
        const groupNumber = req.session.user.groupNumber;
        Workbook.find({groupNumber: groupNumber}, 'name', (err, workbooks) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            // remove filled workbooks
            FilledWorkbook.find({username: username, groupNumber: groupNumber}, 'name', (err, filledWorkbooks) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: false, message: err});
                }
                const namesToRemove = new Set(filledWorkbooks.map(x => x.name));
                workbooks = workbooks.filter(workbook => !namesToRemove.has(workbook.name));

                return res.json({success: true, workbooks: workbooks});
            });
        })
    },

    get_filled_workbooks: (req, res, next) => {
        const username = req.session.user.username;
        const groupNumber = req.session.user.groupNumber;
        FilledWorkbook.find({username: username, groupNumber: groupNumber}, 'name', (err, filledWorkbooks) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, filledWorkbooks: filledWorkbooks});
        })
    },

    // admin
    admin_create_workbook: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const name = req.body.name;
        const groupNumber = req.session.user.groupNumber;
        let data = req.body.data;
        if (name === '') {
            return res.status(500).json({success: false, message: 'Name cannot be empty.'});
        }

        Workbook.findOne({name: name, groupNumber: groupNumber}, (err, workbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (workbook) {
                return res.status(400).json({success: false, message: 'Workbook exists.'})
            }
            let newWorkbook = new Workbook({
                name: name,
                groupNumber: groupNumber,
                data: data
            });
            newWorkbook.save((err, updatedWorkbook) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: false, message: err});
                }
                return res.json({success: true, message: 'Successfully added workbook ' + name + '.'});
            })

        });
    },

    admin_delete_workbook: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const name = req.body.name;
        const groupNumber = req.session.user.groupNumber;
        Workbook.deleteOne({name: name, groupNumber: groupNumber}, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err})
            }
            FilledWorkbook.deleteMany({name: name, groupNumber: groupNumber}, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: false, message: err})
                }
                return res.json({success: true, message: 'Deleted workbook ' + name + '.'})
            });
        })
    },

    admin_get_workbooks: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const groupNumber = req.session.user.groupNumber;
        Workbook.find({groupNumber: groupNumber}, 'name', (err, workbooks) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            return res.json({success: true, workbooks: workbooks});
        })
    },

    admin_edit_workbooks: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        const name = req.body.name;
        const oldName = req.body.oldName;
        const groupNumber = req.session.user.groupNumber;
        let data = req.body.data;
        Workbook.findOne({name: oldName, groupNumber: groupNumber}, (err, workbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (!workbook) {
                return res.status(500).json({success: false, message: 'Workbook not found.'});
            }
            else {
                // update it
                workbook.name = name;
                workbook.data = data;
                workbook.save((err, updated) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({success: false, message: err});
                    }
                    return res.json({success: true, message: 'Successfully updated workbook ' + name + '.'})
                });
            }
        });
    },

    user_import_workbook: (req, res, next) => {
        if (!req.files)
            return res.status(400).json({success: false, message: 'No files were uploaded.'});

        const workbookName = req.params.workbookName;
        const fileName = req.params.fileName;
        const username = req.session.user.username;
        const groupNumber = req.session.user.groupNumber;

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let excelFile = req.files.excel;
        const path = './uploads/' + username + '_' + fileName;

        // Use the mv() method to place the file somewhere on your server
        excelFile.mv(path, function (err) {
            if (err)
                return res.status(500).json({success: false, message: err});

            const wb = new ExcelWorkbook(path, groupNumber);
            wb.getData()
                .then(data => {
                    FilledWorkbook.findOne({name: workbookName, groupNumber: groupNumber}, (err, workbook) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({success: false, message: err});
                        }

                        if (!workbook) {
                            let newFilledWorkbook = new FilledWorkbook({
                                name: workbookName,
                                username: username,
                                groupNumber: groupNumber,
                                data: data
                            });
                            newFilledWorkbook.save((err, updated) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({success: false, message: err});
                                }
                                return res.json({
                                    success: true,
                                    workbook: updated,
                                    message: 'Successfully added filled workbook ' + workbookName + '.'
                                });
                            })
                        }
                        else {
                            // TO-DO check integrity
                            workbook.data = data;
                            workbook.save((err, updated) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({success: false, message: err});
                                }
                                return res.json({
                                    success: true,
                                    workbook: updated,
                                    message: 'Successfully updated workbook' + req.params.name + '.',
                                })
                            });
                        }
                    });
                });


        });
    },

    // import workbook
    // TO-DO validate col/rows
    admin_upload_style: (req, res, next) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        let start = new Date();
        if (!req.files)
            return res.status(400).json({success: false, message: 'No files were uploaded.'});

        const workbookName = req.params.workbookName;
        const fileName = req.params.fileName;
        const path = './uploads/' + fileName;
        const groupNumber = req.session.user.groupNumber;

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let excelFile = req.files.excel;

        // Use the mv() method to place the file somewhere on your server
        excelFile.mv(path, function (err) {
            if (err)
                return res.status(500).json({success: false, message: err});
            console.log('upload takes: ' + (new Date() - start) + 'ms');
            start = new Date();
            const wb = new ExcelWorkbook(path, groupNumber);
            wb.getAll()
                .then(([data, extra, attMap, catMap]) => {
                    console.log('processFile takes: ' + (new Date() - start) + 'ms');
                    start = new Date();
                    Workbook.findOne({name: workbookName, groupNumber: groupNumber}, (err, workbook) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({success: false, message: err});
                        }
                        if (!workbook) {
                            return res.status(400).json({success: false, message: 'Workbook does not exist.'});
                        }
                        workbook.fileName = fileName;
                        // compress the string
                        const extraString = JSON.stringify(extra);
                        console.log('stringify takes: ' + (new Date() - start) + 'ms');
                        start = new Date();
                        const compressedExtra = pako.deflate(extraString, {to: 'string'});
                        console.log('gzip takes: ' + (new Date() - start) + 'ms');
                        start = new Date();
                        // calculate compression rate
                        const buf = Buffer.from(extraString);
                        console.info('gzip compression saved ' + (1 - (compressedExtra.length / buf.length)) * 100 + '% spaces!');
                        workbook.extra = compressedExtra;
                        workbook.data = data;
                        workbook.attMap = attMap;
                        workbook.catMap = catMap;
                        workbook.save((err, updated) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({success: false, message: err});
                            }
                            console.log('workbook.save takes: ' + (new Date() - start) + 'ms');

                            return res.json({
                                success: true,
                                workbook: updated,
                                message: 'Successfully updated workbook style' + req.params.name + '.',
                            })
                        });
                    });

                });
        });
    },

    admin_export_workbook: (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        const username = req.session.user.username;
        const workbookName = req.params.workbookName;
        Workbook.findOne({name: workbookName, groupNumber: groupNumber}, 'fileName data', (err, workbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (!workbook) {
                return res.status(400).json({success: false, message: 'Workbook does not exist.'});
            }
            // found workbook
            const fileName = workbook.fileName ? workbook.fileName : workbookName + '_new.xlsx';

            excel.exportExcel(fileName, workbook.data, username)
                .then(() => {
                    const path = './temp/export_' + username + '_' + fileName;
                    res.download(path, fileName);
                })
        });

    },

    user_export_workbook: (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
        const username = req.session.user.username;
        const workbookName = req.params.workbookName;
        Workbook.findOne({name: workbookName, groupNumber: groupNumber}, 'fileName data', (err, workbook) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({success: false, message: err});
                }
                if (!workbook) {
                    return res.status(400).json({success: false, message: 'Workbook does not exist.'});
                }
                const fileName = workbook.fileName ? workbook.fileName : workbookName + '_new.xlsx';

                let workbookData;
                FilledWorkbook.findOne({name: workbookName, groupNumber: groupNumber, username: username},
                    (err, filledWorkbook) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({success: false, message: err});
                        }
                        if (!filledWorkbook) {
                            workbookData = workbook.data;
                        }
                        else {
                            // found filled workbook
                            workbookData = filledWorkbook.data;
                        }
                        excel.exportExcel(fileName, workbookData, username)
                            .then(() => {
                                const path = './temp/export_' + username + '_' + fileName;
                                res.download(path, fileName);
                            })
                    })


            }
        );

    }


}
;
