import {FormulaParser} from './helpers';
class Parser {

  constructor(excelInstance) {
    this.excelInstance = excelInstance;
    let lastParserState = {from: {row: null, col: null}, to: {row: null, col: null}};
    this.parser = new FormulaParser();

    this.parser.on('callCellValue', function (cellCoord, done) {
      // console.log('get ' + cellCoord.label);
      lastParserState = {
        from: {row: cellCoord.row.index, col: cellCoord.column.index},
        to: {row: cellCoord.row.index, col: cellCoord.column.index}
      };
      let sheet;
      if (cellCoord.hasOwnProperty('sheet')) {
        if (!excelInstance.state.global.sheetNames.includes(cellCoord.sheet)) {
          console.error('Sheet name does not exist: ' + cellCoord.sheet);
        }
        sheet = cellCoord.sheet;
      }
      else {
        sheet = excelInstance.currentSheetName;
      }
      var data = excelInstance.getDataAtSheetAndCell(cellCoord.row.index, cellCoord.column.index, null, sheet);
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


    this.parser.on('callRangeValue', function (startCellCoord, endCellCoord, done) {
      // console.log('get range ' + startCellCoord.label + ' to ' + endCellCoord.label);
      lastParserState = {
        from: {row: startCellCoord.row.index, col: startCellCoord.column.index},
        to: {row: endCellCoord.row.index, col: endCellCoord.column.index}
      };
      const fragment = [];

      // find sheet
      let sheet;
      if (startCellCoord.hasOwnProperty('sheet')) {
        if (!excelInstance.state.global.sheetNames.includes(startCellCoord.sheet)) {
          console.error('Sheet name does not exist: ' + startCellCoord.sheet);
        }
        sheet = startCellCoord.sheet;
      }
      else {
        sheet = excelInstance.currentSheetName;
      }

      // find data
      for (let row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
        const colFragment = [];

        for (let col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
          const data = excelInstance.getDataAtSheetAndCell(row, col, null, sheet);
          // console.log(data);
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
      // console.log(fragment);
      done(fragment)
    });

    this.parser.on('callVariable', function (name, done) {
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

      let variable = excelInstance.getDefinedName(name);
      if (variable === undefined) {
        done();
      }
      if (variable.length === 1) {
        variable = variable[0];
      }
      done(variable);
    });

    this.parser.setFunction('COLUMN', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return lastParserState.from.col + 1;
    });

    this.parser.setFunction('ROW', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return lastParserState.from.row + 1;
    });

    this.parser.setFunction('COLUMNS', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return lastParserState.to.col - lastParserState.from.col + 1;
    });

    this.parser.setFunction('ROWS', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return lastParserState.to.row - lastParserState.from.row + 1;
    });
  }


  parse(formula) {
    return this.parser.parse(formula);
  }

  parseNewFormula(newValue, hasEqualPrefix) {
    const value = {
      formula: newValue.slice(hasEqualPrefix ? 1 : 0),
      result: ''
    };
    // fix '=+' bug
    let calculated;
    if (value.formula.charAt(0) === '+')
      calculated = this.parse(value.formula.slice(1));
    else
      calculated = this.parse(value.formula);
    if (calculated.error) {
      value.result = calculated;
    }
    else {
      value.result = calculated.result;
    }
    return value;
  }
}

export default Parser;
