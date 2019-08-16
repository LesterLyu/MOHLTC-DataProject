const express = require('express');
const user_management_controller = require('../controller/userManagement');
let router = express.Router();

const User = require('../models/user');

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

router.get('/api/user/registerInfo', user_management_controller.user_register_details);

router.get('/api/permissions', user_management_controller.admin_get_all_permissions);

router.post('/api/user/register_management', user_management_controller.register_management);

router.put('/api/users/validated/:username', user_management_controller.set_validated_is_true);

module.exports = router;

