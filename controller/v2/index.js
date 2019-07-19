module.exports = {
    attributeController: require('./attribute'),
    categoryController: require('./category'),
    workbookController: require('./workbook'),
    ...require('./common'),
    ...require('./helpers')
};
