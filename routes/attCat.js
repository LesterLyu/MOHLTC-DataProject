const express = require('express');
const att_cat_controller = require('../controller/attCat');
let router = express.Router();

const error = require('../config/error');


// add attribute and category api
router.post('/api/add-att', att_cat_controller.user_add_att);

router.post('/api/add-cat', att_cat_controller.user_add_cat);

router.delete('/api/delete-cat', att_cat_controller.user_delete_cat);

router.delete('/api/delete-att', att_cat_controller.user_delete_att);

router.delete('/api/cats/delete', att_cat_controller.user_delete_cats);

router.delete('/api/atts/delete', att_cat_controller.user_delete_atts);

router.get('/api/attributes', att_cat_controller.get_attributes);

router.get('/api/categories', att_cat_controller.get_categories);


// web pages
router.get('/add-att-cat', (req, res, next) => {
    if (att_cat_controller.checkPermission(req)) {
        res.render('sidebar/addAttCat.ejs', {user: req.session.user});
    }
    else {
        res.status(403).render('error.ejs', error.NO_PERMISSION)
    }
});

router.get('/delete-att-cat', (req, res, next) => {
    if (att_cat_controller.checkPermission(req)) {
        res.render('sidebar/deleteAttCat.ejs', {user: req.session.user});
    }
    else {
        res.status(403).render('error.ejs', error.NO_PERMISSION)
    }
});



module.exports = router;
