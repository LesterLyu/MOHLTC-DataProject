const Workbook = require('../models/workbook');
const FilledWorkbook = require('../models/filledWorkbook');
const error = require('../config/error');
const config = require('../config/config');
const excel = require('./excel/xlsx');
const {gzip, ungzip} = require('node-gzip');
const pako = require('pako');

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
            if (!filledWorkbook) {
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
            }
            else {
                return res.json({success: true, workbook: filledWorkbook});
            }
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

        const name = req.params.name;
        const username = req.session.user.username;
        const groupNumber = req.session.user.groupNumber;

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let excelFile = req.files.excel;

        // Use the mv() method to place the file somewhere on your server
        excelFile.mv('./uploads/temp.xlsx', function (err) {
            if (err)
                return res.status(500).json({success: false, message: err});

            excel.processFile('temp.xlsx')
                .then(data => {
                    FilledWorkbook.findOne({name: req.params.name, groupNumber: groupNumber}, (err, workbook) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({success: false, message: err});
                        }
                        // compress the string
                        const dataString = JSON.stringify(data);
                        const compressedData = pako.deflate(dataString, {to: 'string'});

                        if (!workbook) {
                            let newFilledWorkbook = new FilledWorkbook({
                                name: name,
                                username: username,
                                groupNumber: groupNumber,
                                data: compressedData
                            });
                            newFilledWorkbook.save((err, updated) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({success: false, message: err});
                                }
                                return res.json({success: true, workbook: updated, message: 'Successfully added filled workbook ' + name + '.'});
                            })
                        }
                        else {
                            // TO-DO check integrity
                            workbook.data = compressedData;
                            workbook.save((err, updated) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({success: false, message: err});
                                }
                                return res.json({
                                    success: true,
                                    workbook: updated,
                                    message: 'Successfully updated workbook style' + req.params.name + '.',
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

        const groupNumber = req.session.user.groupNumber;

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let excelFile = req.files.excel;

        // Use the mv() method to place the file somewhere on your server
        excelFile.mv('./uploads/' + req.params.name + '.xlsx', function (err) {
            if (err)
                return res.status(500).json({success: false, message: err});
            console.log('upload takes: ' + (new Date() - start) + 'ms');
            start = new Date();

            excel.processFile(req.params.name + '.xlsx')
                .then(data => {
                    console.log('processFile takes: ' + (new Date() - start) + 'ms');
                    start = new Date();
                    Workbook.findOne({name: req.params.name, groupNumber: groupNumber}, (err, workbook) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({success: false, message: err});
                        }
                        if (!workbook) {
                            return res.status(400).json({success: false, message: 'Workbook does not exist.'});
                        }
                        // TO-DO check integrity
                        // compress the string
                        const dataString = JSON.stringify(data);
                        console.log('stringify takes: ' + (new Date() - start) + 'ms');
                        start = new Date();
                        const compressedData = pako.deflate(dataString, {to: 'string'});
                        console.log('gzip takes: ' + (new Date() - start) + 'ms');
                        start = new Date();
                        // calculate compression rate
                        const buf = Buffer.from(dataString);
                        console.info('gzip compression saved ' + (1 - (compressedData.length / buf.length)) * 100 + '% spaces!');
                        workbook.data = compressedData;
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

    workbook_export: (req, res, next) => {
        const groupNumber = req.session.user.groupNumber;
    }


}
;