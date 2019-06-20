const workerpool = require('workerpool');
const {isMainThread} = require('worker_threads');

function processQuery(attMap, catMap, queryWorkbookName, queryUsername, querySheetName, queryCategoryId, queryAttributeId, data) {
    const result = [];
    for (let sheetIdx in catMap) {
        const sheet = data[sheetIdx];
        if (!sheet) continue;
        const cat2Row = catMap[sheetIdx];
        const att2Col = attMap[sheetIdx];
        if (Object.entries(cat2Row).length === 0 || Object.entries(att2Col).length === 0)
            continue;
        for (let catId in cat2Row) {
            const rowIndex = cat2Row[catId];
            const row = sheet[rowIndex];
            if (!row) continue;
            for (let attId in att2Col) {
                const colIndex = att2Col[attId];
                const value = row[colIndex];
                if (value === undefined) continue;
                result.push([queryUsername, catId, attId, value])
            }
        }
    }
    return result;
}

const worker = workerpool.worker({processQuery});

// module.exports.processQuery = (...args) => {
//     return worker.exec('processQuery', args);
// };
//
