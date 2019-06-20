const {
    Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

if (isMainThread) {
    /**
     * Query for separate filled workbook.
     * @param attMap
     * @param catMap
     * @param queryWorkbookName
     * @param queryUsername
     * @param querySheetName
     * @param queryCategoryId
     * @param queryAttributeId
     * @return {Promise<any>}
     */
    module.exports = function processQuery(attMap, catMap, queryWorkbookName, queryUsername, querySheetName, queryCategoryId, queryAttributeId, data) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: {
                    attMap,
                    catMap,
                    queryWorkbookName,
                    queryUsername,
                    querySheetName,
                    queryCategoryId,
                    queryAttributeId,
                    data
                }
            });
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
            });
        });
    };
} else {
    const {
        attMap,
        catMap,
        queryWorkbookName,
        queryUsername,
        querySheetName,
        queryCategoryId,
        queryAttributeId,
        data
    } = workerData;
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

    parentPort.postMessage(result);
}
