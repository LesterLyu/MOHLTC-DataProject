var parser = new formulaParser.Parser();
let lastParserState = {from: {row: null, col: null}, to: {row: null, col: null}};
/**
 * cellCoord: {
 *     label: '',
 *     row: {index: Number, label: '', isAbsolute: Boolean},
 *     column: {index: Number, label: '', isAbsolute: Boolean},
 *     sheet: 'sheetName'  // if available
 * }
 */
parser.on('callCellValue', function (cellCoord, done) {
    // console.log('get ' + cellCoord.label);
    lastParserState = {
        from: {row: cellCoord.row.index, col: cellCoord.column.index},
        to: {row: cellCoord.row.index, col: cellCoord.column.index}
    };
    let sheet;
    if (cellCoord.hasOwnProperty('sheet')) {
        if (!gui.sheetNames.includes(cellCoord.sheet)) {
            console.error('Sheet name does not exist: ' + cellCoord.sheet);
        }
        sheet = cellCoord.sheet;
    }
    else {
        sheet = gui.currSheet;
    }
    var data = gui.getDataAtSheetAndCell(cellCoord.row.index, cellCoord.column.index, null, sheet);
    if (data === null || data === undefined || data === '') {
        done(0)
    }
    else if (data.hasOwnProperty('result')) {
        done(data.result);
    }
    else {
        done(data);
    }
});


parser.on('callRangeValue', function (startCellCoord, endCellCoord, done) {
    // console.log('get range ' + startCellCoord.label + ' to ' + endCellCoord.label);
    lastParserState = {
        from: {row: startCellCoord.row.index, col: startCellCoord.column.index},
        to: {row: endCellCoord.row.index, col: endCellCoord.column.index}
    };
    var fragment = [];

    // find sheet
    let sheet;
    if (startCellCoord.hasOwnProperty('sheet')) {
        if (!gui.sheetNames.includes(startCellCoord.sheet)) {
            console.error('Sheet name does not exist: ' + startCellCoord.sheet);
        }
        sheet = startCellCoord.sheet;
    }
    else {
        sheet = gui.currSheet;
    }

    // find data
    for (var row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
        var colFragment = [];

        for (var col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
            var data =  gui.getDataAtSheetAndCell(row, col, null, sheet);
            //console.log(data);
            if (data === null || data === undefined || data === '') {
                colFragment.push(0)
            }
            else if (data.hasOwnProperty('result')) {
                colFragment.push(data.result);
            }
            else {
                colFragment.push(data);
            }
        }
        fragment.push(colFragment);
    }
    done(fragment)
});

parser.on('callVariable', function(name, done) {
    // speedup lookup
    if (name.toUpperCase() === 'TRUE') {
        return true;
    }
    else if (name.toUpperCase() === 'FALSE') {
        return false;
    }
    else if (name.toUpperCase() === 'NULL') {
        return null;
    }

    let variable = gui.getDefinedName(name);
    if (variable === undefined) {
        done();
    }
    if (variable.length === 1){
        variable = variable[0];
    }
    done(variable);
});

parser.setFunction('COLUMN' , (params) => {
    if (params.length === 0) {
        return {error: "#N/A!", result: null}
    }
    return lastParserState.from.col + 1;
});

parser.setFunction('ROW' , (params) => {
    if (params.length === 0) {
        return {error: "#N/A!", result: null}
    }
    return lastParserState.from.row + 1;
});

parser.setFunction('COLUMNS' , (params) => {
    if (params.length === 0) {
        return {error: "#N/A!", result: null}
    }
    return lastParserState.to.col - lastParserState.from.col + 1;
});

parser.setFunction('ROWS' , (params) => {
    if (params.length === 0) {
        return {error: "#N/A!", result: null}
    }
    return lastParserState.to.row - lastParserState.from.row + 1;
});

// parser.on('callFunction', (name, params, done) => {
//     console.log('call function: ',name , params);
//     done();
// });

