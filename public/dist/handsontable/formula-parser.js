"use strict";

var parser = new formulaParser.Parser();
/**
 * cellCoord: {
 *     label: '',
 *     row: {index: Number, label: '', isAbsolute: Boolean},
 *     column: {index: Number, label: '', isAbsolute: Boolean},
 *     sheet: 'sheetName'  // if available
 * }
 */

parser.on('callCellValue', function (cellCoord, done) {
  //console.log('get ' + cellCoord.label);
  var sheet;

  if (cellCoord.hasOwnProperty('sheet')) {
    if (!gui.sheetNames.includes(cellCoord.sheet)) {
      console.error('Sheet name does not exist: ' + cellCoord.sheet);
    }

    sheet = cellCoord.sheet;
  } else {
    sheet = gui.currSheet;
  }

  var data = gui.getDataAtSheetAndCell(sheet, cellCoord.row.index, cellCoord.column.index);

  if (data === null) {
    done('');
  } else if (data.hasOwnProperty('result')) {
    done(data.result);
  } else {
    done(data);
  }
});
parser.on('callRangeValue', function (startCellCoord, endCellCoord, done) {
  console.log('get range ' + startCellCoord.label + ' to ' + endCellCoord.label);
  var fragment = []; // find sheet

  var sheet;

  if (startCellCoord.hasOwnProperty('sheet')) {
    if (!gui.sheetNames.includes(startCellCoord.sheet)) {
      console.error('Sheet name does not exist: ' + startCellCoord.sheet);
    }

    sheet = startCellCoord.sheet;
  } else {
    sheet = gui.currSheet;
  } // find data


  for (var row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
    var colFragment = [];

    for (var col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
      var data = gui.getDataAtSheetAndCell(sheet, row, col); //console.log(data);

      if (data === null) {
        colFragment.push('');
      } else if (data.hasOwnProperty('result')) {
        colFragment.push(data.result);
      } else {
        colFragment.push(data);
      }
    }

    fragment.push(colFragment);
  }

  done(fragment);
});
//# sourceMappingURL=formula-parser.js.map
