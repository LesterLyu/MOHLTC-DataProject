const express = require('express');
const router = express.Router();
const {categoryController} = require('../../controller/v2');
const {addCategory, deleteCategoryGroup, getCategoryGroup, modifyCategoryGroup} = categoryController;

router.post('/api/v2/category', addCategory);

// Modify category groups
router.post('/api/v2/category/group', modifyCategoryGroup);

// delete category group
router.delete('/api/v2/category/group/:_id', deleteCategoryGroup);

// Get category groups
router.get('/api/v2/category/group', getCategoryGroup);

module.exports = router;
