import XlsxPopulate, {RichText, FormulaError, FormulaParser} from "xlsx-populate";

const {SSF} = FormulaParser;
export {FormulaError, XlsxPopulate, RichText, FormulaParser, SSF};


export let excelInstance;

export function init(instance) {
  excelInstance = instance;
}

/**
 * Internal functions
 */

export const shallowCompare = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key =>
    obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
  );

/**
 * Calculate the real range selections.
 * Note: using 1-based indexing
 * @param {Sheet} sheet - Sheet of the selections.
 * @param {number} startRow - From mouse down event.
 * @param {number} startCol - From mouse down event.
 * @param {number} endRow - From mouse up event.
 * @param {number} endCol - From mouse up event.
 */
export const calculateRealSelections = (sheet, startRow, startCol, endRow, endCol) => {
  const selections = [startRow, startCol, endRow, endCol];
  // check outer cells and adjust selections
  for (let i = startCol; i <= endCol; i++) {
    // iterate through first row
    const topCellMerged = sheet.getCell(startRow, i).merged();
    if (topCellMerged && topCellMerged.from.row < selections[0]) {
      selections[0] = topCellMerged.from.row;
    }

    // iterate through last row
    const botCellMerged = sheet.getCell(endRow, i).merged();
    if (botCellMerged && botCellMerged.to.row > selections[2]) {
      selections[2] = botCellMerged.to.row;
    }
  }

  for (let i = startRow; i <= endRow; i++) {
    // iterate through first col
    const leftCellMerged = sheet.getCell(i, startCol).merged();
    if (leftCellMerged && leftCellMerged.from.col < selections[1]) {
      selections[1] = leftCellMerged.from.col;
    }

    // iterate through last col
    const rightCellMerged = sheet.getCell(i, endCol).merged();
    if (rightCellMerged && rightCellMerged.to.col > selections[3]) {
      selections[3] = rightCellMerged.to.col;
    }
  }
  return selections;
};

export function argbToRgb(color) {
  if (typeof color === 'string') {
    return color;
  }
  if (color && color.rgb) {
    return color.rgb.length === 6 ? color.rgb : color.rgb.substring(2);
  }

  if (color === undefined || color.argb === undefined)
    return undefined;
  return color.argb.substring(2);
}

export function generateTableData(rowNum, colNum) {
  const res = [];
  for (let i = 0; i < rowNum; i++) {
    if (i === 0) {
      const firstRow = [];
      for (let j = 0; j < colNum; j++) {
        firstRow.push(null);
      }
      res.push(firstRow)
    } else {
      res.push([])
    }
  }
  return res;
}

export function generateTableStyle(rowNum, colNum) {
  const res = {};
  for (let i = 0; i < rowNum; i++) {
    res[i] = {};
    for (let j = 0; j < colNum; j++) {
      res[i][j] = {};
    }
  }
  return res;
}

export function createArray(value, length) {
  const res = [];
  for (let i = 0; i < length; i++) {
    res.push(value);
  }
  return res;
}

export function colorToRgb(color) {
  if (!color)
    return undefined;
  if (color.rgb) {
    if (color.rgb === 'System Foreground') {
      // TO-DO
      return '000000';
    } else if (color.rgb === 'System Background') {
      return 'ffffff'
    }
    return color.rgb.length === 6 ? color.rgb : color.rgb.substring(2);
  }

  if (color.theme !== undefined) {
    return excelInstance.workbook.theme().themeColor(color.theme, color.tint)
  }
}

/**
 * Get cell current data type
 * @param cell
 * @return {'formula', 'richtext', 'date', 'text', 'number'}
 */
export function getCellType(cell) {
  if (!cell)
    return undefined;
  else if (typeof cell.formula() === 'string') {
    return 'formula';
  } else if (cell.value() instanceof RichText) {
    return 'richtext';
  } else if (cell.value() instanceof Date) {
    return 'date';
  } else if (cell.value() === undefined || cell.value() === null || typeof cell.value() === 'string') {
    return 'text';
  } else {
    return typeof cell.value(); // number, date ...
  }
}

export default {calculateRealSelections, shallowCompare, argbToRgb,}

class Hooks {
  constructor() {
    this.hooks = {};
  }

  /**
   * Add a hook.
   * @param {string} hookName
   * @param {function[]|function} cbs - callback(s)
   */
  add(hookName, cbs) {
    let hook = this.hooks[hookName];
    if (!hook) hook = this.hooks[hookName] = [];
    if (Array.isArray(cbs)) {
      cbs.forEach(cb => {
        hook.push(cb);
      })
    } else {
      hook.push(cbs);
    }
  }

  /**
   * Call a hook.
   * @param hookName
   * @param args
   */
  invoke(hookName, ...args) {
    const cbs = this.hooks[hookName];
    if (cbs) cbs.forEach(cb => cb(...args));
  }
}

export const hooks = new Hooks();

/**
 * Generate a new sheet name, used when creating new sheet.
 * @param {Workbook} workbook
 */
export function generateNewSheetName(workbook) {
  const sheets = workbook.sheets();
  let newSheetNumber = sheets.length + 1;
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].name();
    const match = name.match(/^Sheet(\d+)$/);
    if (match) {
      if (newSheetNumber <= match[1]) {
        newSheetNumber++;
      }
    }
  }
  return 'Sheet' + newSheetNumber;
}

/**
 * Returns the index of the sheet name.
 * Otherwise, it returns -1, indicating that no element passed the test.
 * @param {Workbook} workbook
 * @param {string} sheetName
 * @return {*}
 */
export function indexOfBySheetName(workbook, sheetName) {
  if (!workbook) return -1;
  const sheets = workbook.sheets();
  return sheets.findIndex(sheet => sheet.name() === sheetName);
}

export function getSheetNames(workbook) {
  if (!workbook) return [];
  return workbook.sheets().map(sheet => sheet.name());
}
