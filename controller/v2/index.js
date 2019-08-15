module.exports = {
    attributeController: require('./attribute'),
    categoryController: require('./category'),
    workbookController: require('./workbook'),
    packageController: require('./package'),
    groupController: require('./group'),
    organizationController: require('./organization'),
    ...require('./common'),
    ...require('./helpers')
};
