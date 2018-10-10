const Excel = require('exceljs');
const color = require('./color');


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
// read from a file
    let wb = new Excel.Workbook();
    let wbData = {};
    return wb.xlsx.readFile('./uploads/' + name)
        .then(() => {
            wb.eachSheet(function (worksheet, sheetId) {
                let wsData = wbData[worksheet.orderNo] = {
                    name: worksheet.name,
                    tabColor: worksheet.properties.tabColor,
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
                    }
                };

                worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {
                    wsData.data.push([]);
                    wsData.row.height.push(row.height);
                    wsData.row.style.push(translateIndexedColor(row.style));

                    wsData.row.hidden.push(row.hidden);
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

                    // empty row
                    if (row.cellCount === 0) {
                        wsData.data[rowNumber - 1] = (Array(worksheet.columnCount).fill(null))

                    }
                    // we want the row have all columns
                    else if (row.cellCount < worksheet.columnCount) {
                        wsData.data[rowNumber - 1] = wsData.data[rowNumber - 1].concat(Array(worksheet.columnCount - row.cellCount).fill(null))
                    }




                });

                // add column info
                for (let i = 1; i <= worksheet.columnCount; i++) {
                    const col = worksheet.getColumn(i);
                    wsData.col.width.push(col.width);
                    wsData.col.style.push(translateIndexedColor(col.style));
                    wsData.col.hidden.push(col.hidden);
                }

            });
        }).then(() => {
            return wbData;
        });

}

//processFile('wb2.xlsx');

module.exports = {
    processFile: processFile,
};

