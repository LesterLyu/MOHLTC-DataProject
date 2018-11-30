const Excel = require('../../node_modules/exceljs/dist/es5/index');
const Attribute = require('../../models/attribute');
const Category = require('../../models/category');
const color = require('./color');
const tinycolor = require("tinycolor2");
const xmlparser = require('fast-xml-parser');
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
        this.themeColor = {};
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
                    }, {});
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
                    }, {});
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
                    self.storedData[orderNo] = {
                        name: worksheet.name,
                        dimension: [worksheet.rowCount, worksheet.columnCount]
                    };
                    self.attMap[orderNo] = {};
                    self.catMap[orderNo] = {};
                    // Note: index start with 1
                    worksheet.eachRow(function (row, rowNumber) {
                        self.storedData[orderNo][rowNumber - 1] = {};
                        row.eachCell((cell, colNumber) => {
                            // create attribute map
                            if (rowNumber === 1 && (!ENABLE_CHECK || self._isAttribute(cell.value)) && typeof cell.value !== "object") {
                                self.attMap[orderNo][cell.value] = colNumber - 1;
                            }
                            // create category map
                            if (colNumber === 1 && (!ENABLE_CHECK || self._isCategory(cell.value)) && typeof cell.value !== "object") {
                                self.catMap[orderNo][cell.value] = rowNumber - 1;
                            }
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
                        });

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
                self.themeColor = processThemes(wb._themes);

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
                        name: worksheet.name,
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
                        hyperlinks: worksheet.hyperlinks.model,
                        views: worksheet.views,
                    };

                    // Note: index start with 1
                    worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {
                        self.storedData[orderNo][rowNumber - 1] = {};
                        wsData.style[rowNumber - 1] = {};
                        // row style
                        wsData.row.height[rowNumber - 1] = row.height;
                        if (row.style) {
                            wsData.row.style[rowNumber - 1] = translateColor(row.style, self.themeColor);
                        }
                        if (row.hidden) {
                            wsData.row.hidden.push(rowNumber - 1);
                        }

                        row.eachCell({includeEmpty: true}, (cell, colNumber) => {
                            // create attribute map
                            if (rowNumber === 1 && (!ENABLE_CHECK || self._isAttribute(cell.value)) && typeof cell.value !== "object") {
                                self.attMap[orderNo][cell.value] = colNumber - 1;
                            }
                            // create category map
                            if (colNumber === 1 && (!ENABLE_CHECK || self._isCategory(cell.value)) && typeof cell.value !== "object") {
                                self.catMap[orderNo][cell.value] = rowNumber - 1;
                            }
                            // style
                            if (cell.style) {
                                wsData.style[rowNumber - 1][colNumber - 1] = translateColor(cell.style, self.themeColor)
                            }
                            if ('value' in cell) {
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

                        }); // end each cell

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
                            wsData.col.style[i - 1] = translateColor(col.style, self.themeColor);
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

function processThemes(themes) {
    // excel.js current support only one theme, which is the current theme that applied to this excel file.
    const theme = xmlparser.parse(themes[Object.keys(themes)[0]], {
        ignoreAttributes: false
    });
    const colors = theme['a:theme']['a:themeElements']['a:clrScheme'];
    const result = {};
    // them color indexed from 0 to 11
    const colorKeys = ['a:lt1', 'a:dk1', 'a:lt2', 'a:dk2', 'a:accent1', 'a:accent2', 'a:accent3', 'a:accent4', 'a:accent5', 'a:accent6', 'a:hlink', 'a:folHlink'];

    for (let i = 0; i < 2; i++) {
        // to argb colors
        let inner = colors[colorKeys[i]];
        inner = inner[Object.keys(inner)[0]];
        // add prefix 'FF' as alpha
        result[i] = 'FF' + inner[Object.keys(inner)[1]];
    }
    for (let i = 2; i < 12; i++) {
        // to argb colors
        let inner = colors[colorKeys[i]];
        inner = inner[Object.keys(inner)[0]];
        result[i] = 'FF' + inner[Object.keys(inner)[0]];
    }
    return result;
}

// have to hard code
function translateColor(style, themeColor) {
    // translate excel indexed color
    // https://github.com/ClosedXML/ClosedXML/wiki/Excel-Indexed-Colors
    if ('font' in style && 'color' in style.font && 'indexed' in style.font.color) {
        style.font.color = {argb: color[style.font.color.indexed]}
    }
    if ('font' in style && 'color' in style.font && 'theme' in style.font.color) {
        const color = style.font.color;
        if (!('tint' in color)) {
            style.font.color = {argb: themeColor[color.theme]}
        }
        else {
            // has tint value, the following link tells how to calculate given a tint value.
            // https://msdn.microsoft.com/en-us/library/documentformat.openxml.spreadsheet.tabcolor.aspx
            const tint = parseFloat(color.tint);
            const hsl = tinycolor(themeColor[color.theme].substring(2)).toHsl();
            if (tint < 0) {
                hsl.l = hsl.l * (1 + tint);
                style.font.color = {argb: 'ff' + tinycolor(hsl).toHex()}
            }
            else if (tint > 0){
                hsl.l = hsl.l * (1 - tint) + tint;
                style.font.color = {argb: 'ff' + tinycolor(hsl).toHex()}
            }
            else {
                // no change
                style.font.color = {argb: themeColor[color.theme]}
            }

        }

    }
    if (style.hasOwnProperty('border')) {
        if ('top' in style.border && 'color' in style.border.top && 'indexed' in style.border.top.color) {
            style.border.top.color = {argb: color[style.border.top.color.indexed]}
        }
        if ('left' in style.border && 'color' in style.border.left && 'indexed' in style.border.left.color) {
            style.border.left.color = {argb: color[style.border.left.color.indexed]}
        }
        if ('bottom' in style.border && 'color' in style.border.bottom && 'indexed' in style.border.bottom.color) {
            style.border.bottom.color = {argb: color[style.border.bottom.color.indexed]}
        }
        if ('right' in style.border && 'color' in style.border.right && 'indexed' in style.border.right.color) {
            style.border.right.color = {argb: color[style.border.right.color.indexed]}
        }
    }
    if (style.hasOwnProperty('fill')) {
        if (style.fill.hasOwnProperty('fgColor') && style.fill.fgColor.hasOwnProperty('indexed')) {
            style.fill.fgColor = {argb: color[style.fill.fgColor.indexed]}
        }
        if (style.fill.hasOwnProperty('bgColor') && style.fill.bgColor.hasOwnProperty('indexed')) {
            style.fill.bgColor = {argb: color[style.fill.bgColor.indexed]}
        }
    }
    return style;
}

module.exports = Workbook;
