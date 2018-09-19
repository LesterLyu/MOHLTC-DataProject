const Workbook = require('../models/workbook');
const FilledWorkbook = require('../models/filledWorkbook');

module.exports = {

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

    create_workbook: (req, res, next) => {
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

    delete_workbook: (req, res, next) => {
        const name = req.body.name;
        const groupNumber = req.session.user.groupNumber;
        Workbook.deleteOne({name: name, groupNumber: groupNumber}, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err})
            }
            return res.json({success: true, message: 'Deleted workbook ' + name})
        })
    },

    // get a filled workbook
    get_filled_workbook: (req, res, next) => {
        const name = req.params.name;
        const groupNumber = req.session.user.groupNumber;
        FilledWorkbook.findOne({name: name, groupNumber: groupNumber}, (err, workbook) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: err});
            }
            if (!workbook) {
                return res.status(400).json({success: false, message: 'filled Workbook does not exist.'});
            }
            return res.json({success: true, workbook: workbook});
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

    get_workbooks: (req, res, next) => {
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
    }


}
;