const Excel = require('../../node_modules/exceljs/dist/es5/index');
const color = require('./color');
const XLSX = require('xlsx');


// have to hard code
function translateIndexedColor(style) {
    if ('font' in style && 'color' in style.font && 'indexed' in style.font.color) {
        style.font.color = {argb: color[style.font.color.indexed]}
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

function translateThemeColor(style) {

}

function processFile(name) {
    processFileWithSheetJs(name);
// read from a file
    let wb = new Excel.Workbook();
    let wbData = {sheets: {}};
    return wb.xlsx.readFile('./uploads/' + name)
        .then(() => {

            // store defined names
            wbData.definedNames = {};
            wb.definedNames.forEach((name) => {
                const currName = wb.definedNames.getMatrix(name);
                wbData.definedNames[name] = [];
                currName.forEach((cell) => {
                    wbData.definedNames[name].push(cell);
                });
            });

            wb.eachSheet(function (worksheet, sheetId) {
                // tab color
                let tabColor = undefined;
                if (worksheet.properties.tabColor && 'indexed' in worksheet.properties.tabColor) {
                    tabColor = {argb: color[worksheet.properties.tabColor.indexed]}
                }
                else if (worksheet.properties.tabColor) {
                    tabColor = worksheet.properties.tabColor;
                }

                let wsData = wbData.sheets[worksheet.orderNo] = {
                    name: worksheet.name,
                    tabColor: tabColor,
                    state: worksheet.state,
                    data: [], // cell data
                    style: [], //cell style
                    merges: worksheet._merges,
                    row: {
                        hidden: [],
                        height: [],
                        style: [],
                    },
                    col: {
                        hidden: [],
                        width: [],
                        style: [],
                    },
                    // store data validation
                    dataValidation: worksheet.dataValidations.model
                };

                worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {
                    wsData.data.push([]);
                    wsData.row.height.push(row.height);
                    wsData.row.style.push(translateIndexedColor(row.style));
                    if (row.hidden) {
                        wsData.row.hidden.push(rowNumber - 1);
                    }

                    // Iterate over all cells in a row (including empty cells)
                    wsData.style.push([]);

                    row.eachCell({includeEmpty: true}, function (cell, colNumber) {
                        wsData.style[rowNumber - 1].push(translateIndexedColor(cell.style));

                        // transfer sharedFormula to formula
                        if (cell.formulaType === Excel.FormulaType.Shared) {
                            wsData.data[rowNumber - 1].push({
                                formula: cell.formula,
                                result: cell.value.result
                            });
                        }
                        else {
                            wsData.data[rowNumber - 1].push(cell.value);
                        }
                    });

                    // we want to store all columns in first row
                    if (row.cellCount !== worksheet.columnCount && rowNumber === 1) {
                        wsData.data[rowNumber - 1] = (Array(worksheet.columnCount).fill(null))
                    }

                });

                // add column info
                for (let i = 1; i <= worksheet.columnCount; i++) {
                    const col = worksheet.getColumn(i);
                    wsData.col.width.push(col.width);
                    wsData.col.style.push(translateIndexedColor(col.style));
                    if (col.hidden) {
                        wsData.col.hidden.push(i - 1);
                    }
                }

            });
        }).then(() => {
            return wbData;
        });

}

function processFileWithSheetJs(name) {
    let workbook = XLSX.readFile('./uploads/' + name);
    workbook.SheetNames[0];
}

//processFile('wb2.xlsx');

module.exports = {
    processFile: processFile,
};

