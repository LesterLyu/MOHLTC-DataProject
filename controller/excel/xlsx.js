const Excel = require('../../node_modules/exceljs/dist/es5/index');
const fs = require('fs');
const XlsxPopulate = require('xlsx-populate');


/**
 *
 * @param fileName with extension
 * @param workbookData decompressed workbook data
 * @returns {Promise<void | never>}
 */
function exportExcel(fileName, workbookData, username) {
    const path = './uploads/' + fileName;
    if (fs.existsSync(path)) {
        return XlsxPopulate.fromFileAsync(path)
            .then((workbook) => {
                for (let orderNo in workbookData) {
                    const sheetDataToStore = workbookData[orderNo];
                    const sheetName = workbookData[orderNo].name;
                    const sheet = workbook.sheet(sheetName);
                    for (let row in sheetDataToStore) {
                        if (row !== 'name' && row !== 'dimension') {
                            for (let col in sheetDataToStore[row]) {
                                let value = sheetDataToStore[row][col];
                                if (value && typeof value === 'object') {
                                    // ignore type other than a formula
                                    if ('formula' in value) {
                                        value = value.formula;
                                        sheet.cell(parseInt(row) + 1, parseInt(col) + 1).formula(value);
                                    }
                                }
                                else {
                                    if (value !== '')
                                        sheet.cell(parseInt(row) + 1, parseInt(col) + 1).value(value);
                                }

                            }
                        }
                    }
                }
                const path = './temp/export_' + username + '_' + fileName;
                return workbook.toFileAsync(path);
            });
    }
    else {
        return Promise.resolve(exportExcelWithoutTemplate(fileName, workbookData, username))
    }
}

function exportExcelWithoutTemplate(fileName, workbookData, username) {
    let wb = new Excel.Workbook();
    for (let orderNo in workbookData) {
        const worksheet = wb.addWorksheet(workbookData[orderNo].name);
        const sheetToStore = workbookData[orderNo];
        for (let row in sheetToStore) {
            if (row !== 'name' && row !== 'dimension') {
                for (let col in sheetToStore[row]) {
                    console.log('store ' + sheetToStore[row][col])
                    worksheet.getCell(parseInt(row) + 1, parseInt(col) + 1).value = sheetToStore[row][col];
                }
            }
        }
    }
    const path = './temp/export_' + username + '_' + fileName;
    return wb.xlsx.writeFile(path);
}


module.exports = {
    exportExcel
};

