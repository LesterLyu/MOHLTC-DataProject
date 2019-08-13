module.exports = {
    attributeController: require('./attribute'),
    categoryController: require('./category'),
    workbookController: require('./workbook'),
    packageController: require('./package'),
    groupController: require('./group'),
    ...require('./common'),
    ...require('./helpers')
};
