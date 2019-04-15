// import {FormulaParser} from '../helpers';
import FormulaParser from 'fast-formula-parser';

const MAX_ROW = 1048576, MAX_COLUMN = 16384;

class Parser {
  constructor(excelInstance) {
    this.currSheetName = excelInstance.currentSheetName;
    this.excelInstance = excelInstance;
    const {sheetNames} = excelInstance.global;
    const {getDefinedName} = excelInstance;

    this.parser = new FormulaParser({
      onCell: ref => {
        let sheetName = ref.sheet;
        if (!sheetNames.includes(sheetName)) {
          console.error('Sheet name does not exist: ' + ref.sheet);
        }
        let val;
        const sheet = excelInstance.workbook.sheet(ref.sheet);
        if (sheet.hasCell(ref.row, ref.col)) {
          val = sheet.getCell(ref.row, ref.col).getValue();
        }
        return val == null ? 0 : val; // TODO: fix this
      },
      onRange: ref => {
        let sheetName = ref.sheet;
        if (!sheetNames.includes(ref.sheet)) {
          console.error('Sheet name does not exist: ' + ref.sheet);
        }

        const arr = [];
        const sheet = excelInstance.workbook.sheet(sheetName);
        // whole column
        if (ref.to.row === MAX_ROW) {
          sheet._rows.forEach((row, rowNumber) => {
            const cellValue = row.cell(ref.from.row)._value;
            arr[rowNumber] = [cellValue == null ? null : cellValue];
          })
        }
        // whole row
        else if (ref.to.col === MAX_COLUMN) {
          arr.push([]);
          sheet._rows.get(ref.from.row).forEach(cell => {
            arr[0].push(cell._value == null ? null : cell._value)
          })

        } else {
          for (let row = ref.from.row; row <= ref.to.row; row++) {
            const innerArr = [];
            // row exists
            if (sheet._rows[row] != null) {
              for (let col = ref.from.col; col <= ref.to.col; col++) {
                const cell = sheet._rows[row]._cells[col];
                if (cell != null) {
                  innerArr[col - 1] = cell._value;
                }
              }
            }
            arr.push(innerArr);
          }
        }
        return arr;
      },
    });
    // this._init();
  }

  changeCurrSheetName(sheetName) {
    this.currSheetName = sheetName;
  }

  parse(formula, position) {
    let result = '';
    try {
      result = this.parser.parse(formula, position);
      if (typeof result === 'object')
        result = result.result;
    } catch (e) {
      console.error(e);
    }
    return result;
  }

  parseNewFormula(newValue, position) {
    const value = {
      formula: newValue.charAt(0) === '=' ? newValue.slice(1) : newValue,
      result: ''
    };
    if (position.sheetNo != null)
      position.sheet = this.excelInstance.workbook.sheet(position.sheetNo).name();

    let calculated;
    calculated = this.parse(value.formula, {sheet: position.sheet});
    value.result = calculated;

    return value;
  }
}

export default Parser;
