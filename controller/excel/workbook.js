const Excel = require('../../node_modules/exceljs/dist/es5/index');
const Attribute = require('../../models/attribute');
const Category = require('../../models/category');
const color = require('./color');
const xlsx = require('./xlsx');
const ENABLE_CHECK = false;

class Workbook {
    // caches attributes and categories

    constructor(filePath, groupNumber, workbookModel = undefined) {
        this.filePath = filePath;
        this.workbook = undefined;
        this.workbookModel = workbookModel; // /model/workbook
        this.groupNumber = groupNumber;
        this.attMap = {};
        this.catMap = {};
        this.storedData = {};
        this.storedExtra = {};
        Workbook.attributes = {};
        Workbook.categories = {};
    }

    /**
     * Destroy the instance, but not delete Workbook.attributes and Workbook.attributes.
     * Destroy the instance will free the memory.
     */
    destroyInstance() {
        delete this.filePath;
        delete this.workbook;
        delete this.workbookModel;
        delete this.groupNumber;
        delete this.attMap;
        delete this.catMap;
        delete this.storedData;
        delete this.storedExtra;
    }

    /**
     * Read a workbook file, file path is provided in the constructor.
     * @param force {boolean} if force to reload
     * @returns {Promise<Workbook | never>} A promise with parameter workbook
     * @private
     */
    async _read(force = false) {
        if (force) {
            delete this.workbook;
        }

        await this._loadAttributesAndCategories();
        if (this.workbook === undefined) {
            let wb = new Excel.Workbook();
            await wb.xlsx.readFile(this.filePath)
                .then(() => {
                    this.workbook = wb;
                });
        }
    }

    /**
     * Read attributes and categories from database,
     * @param force {boolean} if force to reload
     * @returns {Promise<void>} A promise with nothing
     * @private
     */
    async _loadAttributesAndCategories(force = false) {
        if (force) {
            delete Workbook.categories[this.groupNumber];
            delete Workbook.attributes[this.groupNumber];
        }
        if (Workbook.categories[this.groupNumber] === undefined || Workbook.attributes[this.groupNumber] === undefined) {
            const promise1 = new Promise((resolve) => {
                Attribute.find({groupNumber: this.groupNumber}, 'attribute id', (err, attributes) => {
                    if (err) {
                        console.log(err);
                    }
                    Workbook.attributes[this.groupNumber] = attributes.reduce((map, obj) => {
                        map[obj.id] = obj.attribute;
                        return map;
                    });
                    resolve()
                });
            });

            const promise2 = new Promise((resolve) => {
                Category.find({groupNumber: this.groupNumber}, 'category id', (err, categories) => {
                    if (err) {
                        console.log(err);
                    }
                    Workbook.categories[this.groupNumber] = categories.reduce((map, obj) => {
                        map[obj.id] = obj.category;
                        return map;
                    });
                    resolve();
                });
            });
            // parallel processing
            await Promise.all([promise1, promise2]);
        }
    }

    /**
     * return if the given attributeId is valid
     * @param attributeId
     * @returns {boolean}
     * @private
     */
    _isAttribute(attributeId) {
        return attributeId in Workbook.attributes[this.groupNumber]
    }

    /**
     * return if the given categoryId is valid
     * @param categoryId
     * @returns {boolean}
     * @private
     */
    _isCategory(categoryId) {
        return categoryId in Workbook.categories[this.groupNumber]
    }

    /**
     * get all cell data
     * @returns {Promise<Workbook | never | never>}
     */
    getData() {
        const self = this;
        return this._read()
            .then(() => {
                self.workbook.eachSheet(function (worksheet, sheetId) {
                    const orderNo = worksheet.orderNo;
                    self.storedData[orderNo] = {};
                    self.attMap[orderNo] = {};
                    self.catMap[orderNo] = {};
                    // Note: index start with 1
                    worksheet.eachRow(function (row, rowNumber) {
                        self.storedData[orderNo][rowNumber - 1] = {};
                        // if the value is in Attribute table
                        if (rowNumber === 1) {
                            row.eachCell((cell, colNumber) => {
                                if (!ENABLE_CHECK || self._isAttribute(cell.value)) {
                                    self.attMap[orderNo][cell.value] = colNumber - 1;
                                }
                            });
                        }
                        else {
                            row.eachCell((cell, colNumber) => {
                                // if the value is in Category table
                                if (colNumber === 1 && (!ENABLE_CHECK || self._isCategory(cell.value))) {
                                    self.catMap[orderNo][cell.value] = rowNumber - 1;
                                }
                                else if (colNumber !== 1) {
                                    self.storedData[orderNo][rowNumber - 1][colNumber - 1] = cell.value;
                                }
                            })
                        }
                        console.log('finish row ' + rowNumber)
                    });
                });
                return self.storedData;
            });
    }

    /**
     * get all data, includes cell data anc all styles
     * @returns {Promise<({}|*)[] | never>}
     */
    getAll() {
        const self = this;
        let wbData = this.storedExtra = {definedNames: {}, sheets: {}};
        return this._read()
            .then(() => {
                const wb = this.workbook;
                // store defined names
                wb.definedNames.forEach((name) => {
                    const currName = wb.definedNames.getMatrix(name);
                    wbData.definedNames[name] = [];
                    currName.forEach((cell) => {
                        wbData.definedNames[name].push(cell);
                    });
                });

                wb.eachSheet(function (worksheet, sheetId) {
                    const orderNo = worksheet.orderNo;
                    self.storedData[orderNo] = {
                        name: worksheet.name,
                        dimension: [worksheet.rowCount, worksheet.columnCount]
                    };
                    self.attMap[orderNo] = {};
                    self.catMap[orderNo] = {};
                    // tab color
                    let tabColor = undefined;
                    if (worksheet.properties.tabColor && 'indexed' in worksheet.properties.tabColor) {
                        tabColor = {argb: color[worksheet.properties.tabColor.indexed]}
                    }
                    else if (worksheet.properties.tabColor) {
                        tabColor = worksheet.properties.tabColor;
                    }
                    // init data structure
                    let wsData = wbData.sheets[worksheet.orderNo] = {
                        tabColor: tabColor,
                        defaultRowHeight: worksheet.properties.defaultRowHeight,
                        state: worksheet.state,
                        style: {}, //cell style
                        merges: worksheet._merges,
                        row: {
                            hidden: [],
                            height: {},
                            style: {},
                        },
                        col: {
                            hidden: [],
                            width: {},
                            style: {},
                        },
                        // store data validation
                        dataValidations: worksheet.dataValidations.model,
                    };

                    // Note: index start with 1
                    worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {
                        self.storedData[orderNo][rowNumber - 1] = {};
                        wsData.style[rowNumber - 1] = {};
                        // row style
                        wsData.row.height[rowNumber - 1] = row.height;
                        if (row.style) {
                            wsData.row.style[rowNumber - 1] = xlsx.translateIndexedColor(row.style);
                        }
                        if (row.hidden) {
                            wsData.row.hidden.push(rowNumber - 1);
                        }

                        // if the value is in Attribute table
                        if (rowNumber === 1) {
                            row.eachCell((cell, colNumber) => {
                                if (!ENABLE_CHECK || self._isAttribute(cell.value)) {
                                    self.attMap[orderNo][cell.value] = colNumber - 1;
                                }
                            });
                        }
                        else {
                            row.eachCell({includeEmpty: true}, (cell, colNumber) => {
                                // if the value is in Category table
                                if (colNumber === 1 && (!ENABLE_CHECK || self._isCategory(cell.value))) {
                                    self.catMap[orderNo][cell.value] = rowNumber - 1;
                                }
                                else if (colNumber !== 1) {
                                    // style
                                    if (cell.style) {
                                        wsData.style[rowNumber - 1][colNumber - 1] = xlsx.translateIndexedColor(cell.style)
                                    }
                                    if (cell.value) {
                                        // transfer sharedFormula to formula
                                        if (cell.formulaType === Excel.FormulaType.Shared) {
                                            self.storedData[orderNo][rowNumber - 1][colNumber - 1] = {
                                                formula: cell.formula,
                                                result: cell.value.result
                                            };
                                        }
                                        else {
                                            self.storedData[orderNo][rowNumber - 1][colNumber - 1] = cell.value;
                                        }
                                    }
                                }
                            }); // end each cell
                        }
                        if (Object.keys(wsData.style[rowNumber - 1]).length === 0) {
                            delete wsData.style[rowNumber - 1];
                        }
                        if (Object.keys(self.storedData[orderNo][rowNumber - 1]).length === 0) {
                            delete self.storedData[orderNo][rowNumber - 1]
                        }
                    }); // end each row

                    // add column info
                    for (let i = 1; i <= worksheet.columnCount; i++) {
                        const col = worksheet.getColumn(i);
                        wsData.col.width[i - 1] = col.width;
                        if (col.style) {
                            wsData.col.style[i - 1] = xlsx.translateIndexedColor(col.style);
                        }
                        if (col.hidden) {
                            wsData.col.hidden.push(i - 1);
                        }
                    }

                });
                return [self.storedData, self.storedExtra, self.attMap, self.catMap];
            });
    }
}

module.exports = Workbook;
