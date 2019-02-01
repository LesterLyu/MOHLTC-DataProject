import {Parser as FormulaParser} from 'hot-formula-parser/src';
import {colCache} from '../helpers'

export default class CalculationChain {
  constructor(instance) {
    /**
     * Change sheetNo1!A1 's value will result in re-calculating sheetNo2!B1,
     * i.e. sheetNo2!B1 depends on sheetNo1!A1
     * {
     *     sheetNo1: {
     *         'A1': {
     *             sheetNo2: [
     *                 'B1', ...
     *             ]
     *         }
     *     }
     * }
     */
    this.excelInstance = instance;

    this.data = {cellValue: {}, rangeValue: {}};

    // init parser
    this.parser = new FormulaParser();
    this.depParser = new FormulaParser();
    this.depData = {cellValue: [], rangeValue: []};
    this.depCurrSheetNo = null;
    this.state = {};
    this.initParser();
  }

  addCell(currSheet, row, col, formula) {
    // this.state.currSheet = currSheet;
    // this.state.currCell = colCache.encode(row + 1, col + 1);
    this.state.curr = {sheet: currSheet, row, col};
    this.parser.parse(formula);
  }

  removeCell(sheetNo, row, col, oldFormula) {
    // parse dependencies
    const depData = this.parseDependency(sheetNo, oldFormula);

    if (depData.cellValue) {
      for (let i = 0; i < depData.cellValue.length; i++) {
        const dependency = depData.cellValue[i];
        const updates = this.data.cellValue[dependency.sheet][dependency.label];
        this.data.cellValue[dependency.sheet][dependency.label] =
          updates.filter(update => sheetNo !== update.sheet || row !== update.row || col !== update.col);
      }
    }

    if (depData.rangeValue) {
      for (let i = 0; i < depData.rangeValue.length; i++) {
        const dependency = depData.rangeValue[i];
        const updates = this.data.rangeValue[dependency.sheet][dependency.rowRange][dependency.colRange];
        this.data.rangeValue[dependency.sheet][dependency.rowRange][dependency.colRange] =
          updates.filter(update => sheetNo !== update.sheet || row !== update.row || col !== update.col);
      }
    }
  }

  change(currSheet, row, col) {
    const {excelInstance} = this;
    const {sheetNames} = excelInstance.global;

    // change currSheet temporarily for correct formula calculation
    const currSheetBackup = excelInstance.currentSheetName;
    excelInstance.parser.changeCurrSheetName(sheetNames[currSheet]);

    // calculation in order
    const calculations = [];
    // check cellValue
    if (currSheet in this.data.cellValue) {
      const rowCol = colCache.encode(row + 1, col + 1);
      if (rowCol in this.data.cellValue[currSheet]) {
        const needToUpdate = this.data.cellValue[currSheet][rowCol];
        for (let idx = 0; idx < needToUpdate.length; idx++) {
          const curr = needToUpdate[idx];
          calculations.push(curr);
          this.evaluateFormula(curr.sheet, curr.row, curr.col);
        }
      }
    }

    // check rangeValue
    if (currSheet in this.data.rangeValue) {
      const rows = Object.keys(this.data.rangeValue[currSheet]);
      for (let i = 0; i < rows.length; i++) {
        if (this.isInRange(rows[i], row)) {
          const cols = Object.keys(this.data.rangeValue[currSheet][rows[i]]);
          for (let j = 0; j < cols.length; j++) {
            if (this.isInRange(cols[j], col)) {
              const needToUpdate = this.data.rangeValue[currSheet][rows[i]][cols[j]];
              for (let idx = 0; idx < needToUpdate.length; idx++) {
                const curr = needToUpdate[idx];
                calculations.push(curr);
                this.evaluateFormula(curr.sheet, curr.row, curr.col);
              }
            }
          }
        }
      }
    }
    // do calculation in next level
    for (let i = 0; i < calculations.length; i++) {
      const curr = calculations[i];
      this.change(curr.sheet, curr.row, curr.col);
    }
    // revert currSheet
    excelInstance.parser.changeCurrSheetName(currSheetBackup);
  }

  initParser() {
    const {excelInstance} = this;
    const {sheetNames, getDefinedName} = excelInstance.global;

    this.parser.on('callCellValue', (cellCoord, done) => {
      let sheetNo;
      if ('sheet' in cellCoord) {
        sheetNo = sheetNames.indexOf(cellCoord.sheet);
        if (sheetNo === -1)
          console.error('Sheet name does not exist: ' + cellCoord.sheet)
      } else {
        sheetNo = this.state.curr.sheet;
      }
      if (!(sheetNo in this.data.cellValue)) {
        this.data.cellValue[sheetNo] = {}
      }
      const rowCol = cellCoord.label.replace(/\$/g, '');
      if (!(rowCol in this.data.cellValue[sheetNo])) {
        this.data.cellValue[sheetNo][rowCol] = []
      }
      this.data.cellValue[sheetNo][rowCol].push(this.state.curr);

      done(0);
    });

    this.parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
      let sheetNo;
      if ('sheet' in startCellCoord) {
        sheetNo = sheetNames.indexOf(startCellCoord.sheet);
      } else {
        sheetNo = this.state.curr.sheet;
      }
      // data structure: sheetNo -> row range -> col range -> list of cells need to update
      // check if sheet exist as a key
      if (!(sheetNo in this.data.rangeValue)) {
        this.data.rangeValue[sheetNo] = {}
      }
      const rowRange = startCellCoord.row.index + ':' + endCellCoord.row.index;
      if (!(rowRange in this.data.rangeValue[sheetNo])) {
        this.data.rangeValue[sheetNo][rowRange] = {}
      }

      const colRange = startCellCoord.column.index + ':' + endCellCoord.column.index;
      if (!(colRange in this.data.rangeValue[sheetNo][rowRange])) {
        this.data.rangeValue[sheetNo][rowRange][colRange] = []
      }
      this.data.rangeValue[sheetNo][rowRange][colRange].push(this.state.curr);

      done(0)
    });

    this.depParser.on('callCellValue', (cellCoord, done) => {
      const sheetNo = cellCoord.sheet ? sheetNames.indexOf(cellCoord.sheet) : this.depCurrSheetNo;
      this.depData.cellValue.push({
        sheet: sheetNo,
        label: cellCoord.label.replace(/\$/g, ''),
      });
      done(0);
    });

    this.depParser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
      const sheetNo = startCellCoord.sheet ? sheetNames.indexOf(startCellCoord.sheet) : this.depCurrSheetNo;
      const rowRange = startCellCoord.row.index + ':' + endCellCoord.row.index;
      const colRange = startCellCoord.column.index + ':' + endCellCoord.column.index;
      this.depData.rangeValue.push({
        sheet: sheetNo,
        rowRange,
        colRange
      });
      done(0);
    });

    // this.parser.on('callVariable', function(name, done) {
    //     // speedup lookup
    //     if (name.toUpperCase() === 'TRUE') {
    //         return true;
    //     }
    //     else if (name.toUpperCase() === 'FALSE') {
    //         return false;
    //     }
    //     else if (name.toUpperCase() === 'NULL') {
    //         return null;
    //     }
    //     let variable = gui.getDefinedName(name);
    //     if (variable.length === 1){
    //         variable = variable[0];
    //     }
    //     done(variable);
    // });


  }

  // internals
  /**
   * Test if the val is in range
   * @param range e.g. 1:10
   * @param val e.g. 3
   */
  isInRange = (range, val) => {
    const test = range.match(/([0-9]+):([0-9]+)/);
    return parseInt(test[1]) <= parseInt(val) && parseInt(val) <= parseInt(test[2]);
  };

  // re-evaluate formula
  evaluateFormula = (orderNo, row, col) => {
    const data = this.excelInstance.getDataAtSheetAndCell(row, col, orderNo);
    if (!data.hasOwnProperty('formula')) {
      console.log('Skipped: evaluateFormula(): cell provided is not a formula');
      return
    }

    const calculated = this.excelInstance.parser.parseNewFormula(data.formula, false);
    this.excelInstance.setDataAtSheetAndCell(row, col, calculated, orderNo);
    return data;
  };

  parseDependency = (currSheetNo, formula) => {
    this.depData = {cellValue: [], rangeValue: []};
    this.depCurrSheetNo = currSheetNo;
    this.depParser.parse(formula);
    return this.depData;
  };
}




