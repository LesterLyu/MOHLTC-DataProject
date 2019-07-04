const workerpool = require('workerpool');
const os = require('os');
let poolSize = os.cpus().length - 1;
if (!poolSize) poolSize = 2;

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
    // for(let i = 0; i < 3999999999; i++){} // 5 seconds
    return result;
}

const pool = workerpool.pool({nodeWorker: 'auto', maxWorkers: poolSize});

module.exports = {
    processQuery: (...args) => {
        return pool.exec(processQuery, args);
    },
    processQueryS: processQuery,
};
