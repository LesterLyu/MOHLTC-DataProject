module.exports = {
    attributeController: require('./attribute'),
    categoryController: require('./category'),
    workbookController: require('./workbook'),
    packageController: require('./package'),
    ...require('./common'),
    ...require('./helpers')
};
