const Excel = require('../../node_modules/exceljs/dist/es5/index');
const fs = require('fs');


/**
 *
 * @param fileName with extension
 * @param workbookData decompressed workbook data
 * @returns {Promise<Workbook | never>}
 */
function exportExcel(fileName, workbookData, username) {
    let wb = new Excel.Workbook();
    const path = './uploads/' + fileName;
    if (fs.existsSync(path)) {
        return wb.xlsx.readFile('./uploads/' + fileName)
            .then(() => {
                wb.eachSheet(function (worksheet, sheetId) {
                    const sheetToStore = workbookData[worksheet.orderNo];
                    for (let row in sheetToStore) {
                        if (row !== 'name' && row !== 'dimension') {
                            for (let col in sheetToStore[row]) {
                                worksheet.getCell(parseInt(row) + 1, parseInt(col) + 1).value = sheetToStore[row][col];
                            }
                        }
                    }
                });
                const path = './temp/export_' + username + '_' + fileName;
                return wb.xlsx.writeFile(path);
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

