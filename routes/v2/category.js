const express = require('express');
const router = express.Router();
const {categoryController} = require('../../controller/v2');
const {
    addCategory, getCategories, generateCategoryId, deleteCategory, deleteCategoryGroup, getCategoryGroup,
    modifyCategoryGroup, categoryAssignGroups, addManyCategories
} = categoryController;

router.get('/api/v2/category', getCategories);

router.post('/api/v2/category', addCategory);

router.post('/api/v2/batch/category', addManyCategories);

router.delete('/api/v2/category', deleteCategory);

router.get('/api/v2/category/generate/id', generateCategoryId);

// Assign category to the given groups
router.post('/api/v2/category/assign/group', categoryAssignGroups);

// Modify category groups
router.post('/api/v2/category/group', modifyCategoryGroup);

// delete category group
router.delete('/api/v2/category/group/:_id', deleteCategoryGroup);

// Get category groups
router.get('/api/v2/category/group', getCategoryGroup);

module.exports = router;
