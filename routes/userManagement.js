const express = require('express');
const user_management_controller = require('../controller/userManagement');
let router = express.Router();

const error = require('../config/error');

// Add permission
/**
 * Request:
 * {data: [{
 *      username: <String>,
 *      permissions: [
 *          'CRUD-workbook-template',
 *          'create-delete-attribute-category',
 *          'user-management',
 *          ...
 *      ]
 * }]}
 */
router.post('/api/user/permission', user_management_controller.admin_update_user_permission);

// Get all users details
/** Response:
 * {
    "success": true,
    "users": [
        {
            "active": true,
            "permissions": [
                "fill-workbook"
            ],
            "_id": "5b9ac11f29ecca39f01b54b8",
            "username": "lester2",
            "firstName": "121",
            "lastName": "121",
            "groupNumber": 1,
            "phoneNumber": "23123123",
            "validated": true,
            "type": 2,
            "email": "lester.lyu@ontario.ca",
            "createDate": "2018-09-13T19:57:19.301Z",
            "__v": 0
        },...
    ]}
 */
router.get('/api/user/details', user_management_controller.admin_get_all_users_with_details);

router.get('/api/permissions', user_management_controller.admin_get_all_permissions);

router.get('/user/management', (req, res, next) => {
    if (user_management_controller.checkPermission(req)) {
        res.render('sidebar/userManagement.ejs', {user: req.session.user});
    }
    else {
        res.status(403).render('error.ejs', error.NO_PERMISSION)
    }
});



module.exports = router;
