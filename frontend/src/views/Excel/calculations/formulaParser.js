import {FormulaParser} from '../helpers';

class Parser {
  constructor(excelInstance) {
    this.currSheetName = excelInstance.currentSheetName;
    this.excelInstance = excelInstance;
    this.lastParserState = {from: {row: null, col: null}, to: {row: null, col: null}};
    this.parser = new FormulaParser();
    this._init();
  }

  changeCurrSheetName(sheetName) {
    this.currSheetName = sheetName;
  }

  parse(formula) {
    return this.parser.parse(formula);
  }

  parseNewFormula(newValue) {
    const value = {
      formula: newValue.charAt(0) === '=' ? newValue.slice(1) : newValue,
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

  // internals
  _init = () => {
    const {excelInstance} = this;
    const {sheetNames} = excelInstance.global;
    const {getDefinedName} = excelInstance;

    this.parser.on('callCellValue', (cellCoord, done) => {
      // console.log('get ' + cellCoord.label);
      this.lastParserState = {
        from: {row: cellCoord.row.index, col: cellCoord.column.index},
        to: {row: cellCoord.row.index, col: cellCoord.column.index}
      };
      let sheet;
      if (cellCoord.hasOwnProperty('sheet')) {
        if (!sheetNames.includes(cellCoord.sheet)) {
          console.error('Sheet name does not exist: ' + cellCoord.sheet);
        }
        sheet = cellCoord.sheet;
      }
      else {
        sheet = this.currSheetName;
      }
      const data = excelInstance.getDataAtSheetAndCell(cellCoord.row.index, cellCoord.column.index, null, sheet);
      if (data === null || data === undefined || data === '') {
        done(0)
      }
      else {
        done(data);
      }
    });

    this.parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
      // console.log('get range ' + startCellCoord.label + ' to ' + endCellCoord.label);
      this.lastParserState = {
        from: {row: startCellCoord.row.index, col: startCellCoord.column.index},
        to: {row: endCellCoord.row.index, col: endCellCoord.column.index}
      };
      const fragment = [];

      // find sheet
      let sheet;
      if (startCellCoord.hasOwnProperty('sheet')) {
        if (!sheetNames.includes(startCellCoord.sheet)) {
          console.error('Sheet name does not exist: ' + startCellCoord.sheet);
        }
        sheet = startCellCoord.sheet;
      }
      else {
        sheet = this.currSheetName;
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

      let variable = getDefinedName(name);
      if (variable === undefined) {
        done();
      }
      else if (variable.length === 1) {
        variable = variable[0];
      }
      done();
    });

    this.parser.setFunction('COLUMN', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return this.lastParserState.from.col + 1;
    });

    this.parser.setFunction('ROW', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return this.lastParserState.from.row + 1;
    });

    this.parser.setFunction('COLUMNS', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return this.lastParserState.to.col - this.lastParserState.from.col + 1;
    });

    this.parser.setFunction('ROWS', (params) => {
      if (params.length === 0) {
        return {error: "#N/A!", result: null}
      }
      return this.lastParserState.to.row - this.lastParserState.from.row + 1;
    });
  }

}

export default Parser;
