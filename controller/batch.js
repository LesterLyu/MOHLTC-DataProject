const User = require('../models/user');
const Organization = require('../models/organization');
const RegisterRequest = require('../models/registerRequest');
const passport = require('passport');
const config = require('../config/config'); // get our config file
const sendMail = require('./sendmail');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Attribute = require('../models/attribute');
const Category = require('../models/category');
const Workbook = require('../models/workbook');
const FilledWorkbook = require('../models/filledWorkbook');


function checkPermission(req) {
    return req.session.user.permissions.includes(config.permissions.SYSTEM_MANAGEMENT);
}

function multiSignUp(numberUsers, groupNumber) {
    for (let i = 0; i < numberUsers; i++) {
        let newUser = new User({
            username: 'test' + i,
            groupNumber: groupNumber,
            validated: true,
            type: 2, // system admin=0, form manager=1, user=2
            email: i + '@email.com',
        });
        User.register(newUser, 'test', (err, user) => {
            if (err) {
                console.log(err);
            }
            console.log('success sign up test' + i);
        });
    }
}

async function saveWorkbookToAllUsers(workbookName, groupNumber) {

    const workbook = await Workbook.findOne({name: workbookName, groupNumber: groupNumber});
    if (!workbook) {
        console.log('Workbook does not exist.');
        return
    }
    const users = await User.find({groupNumber: groupNumber}, {username: 1}).exec();
    for (let i = 0; i < users.length; i++) {

        let newFilledWorkbook = new FilledWorkbook({
            name: workbookName,
            username: users[i].username,
            groupNumber: groupNumber,
            data: workbook.data
        });
        await newFilledWorkbook.save();
        console.log('save for ' + i);
    }

}


module.exports = {
    multiSignUp: (req, res) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        multiSignUp(200, 1);
    },
    saveWorkbookToAllUsers: async (req, res) => {
        if (!checkPermission(req)) {
            return res.status(403).json({success: false, message: error.api.NO_PERMISSION})
        }
        await saveWorkbookToAllUsers('2018-19 CAPS LHIN Managed BLANK V1', 1);
        res.json({success: true, message: 'save '})
    }
};
