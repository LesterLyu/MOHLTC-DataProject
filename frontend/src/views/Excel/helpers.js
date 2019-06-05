import colCache from './col-cache';
import RichTexts from "xlsx-populate/lib/worksheets/RichText";
import XlsxPopulate from "xlsx-populate";

const FormulaError = XlsxPopulate.FormulaError;
// import {Parser as FormulaParser} from 'hot-formula-parser/src';
export {colCache, FormulaError, XlsxPopulate};

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
  if (typeof cell.formula() === 'string') {
    return 'formula';
  } else if (cell.value() instanceof RichTexts) {
    return 'richtext';
  } else if (cell.value() instanceof Date) {
    return 'date';
  } else if (cell.value() === undefined || cell.value() === null || typeof cell.value() === 'string') {
    return 'text';
  } else {
    return typeof cell.value(); // number, date ...
  }
}

/**
 * Read sheet
 * @param {Sheet} sheet
 * @return {Object}
 */
export function readSheet(sheet) {
  const data = [], styles = {};
  const rowHeights = [];
  const colWidths = [];
  const mergeCells = [];
  const sharedFormulas = [];

  const usedRange = sheet.usedRange();
  // default number of empty sheet
  let numRows = 50, numCols = 13;
  if (usedRange) {
    numRows = usedRange.endCell().rowNumber() - usedRange.startCell().rowNumber() + 1 + 5;
    numCols = usedRange.endCell().columnNumber() - usedRange.startCell().columnNumber() + 1 + 5;
  }

  // set parent shared formula cell to normal formula cell, this may not be necessary
  for (let i = 0; i < sharedFormulas.length; i++) {
    const cell = sharedFormulas[i];
    const oldValue = cell.value();
    cell.formula(cell.formula())._value = oldValue;
  }

  // add extra rows and columns
  data[numRows - 1] = [];
  if (!data[0]) {
    data[0] = [];
  }
  if (data[0].length < numCols) {
    data[0][numCols - 1] = undefined;
  }

  // rowHeights and colWidths
  for (let row = 1; row <= numRows; row++) {
    const height = sheet.row(row).height();
    rowHeights.push(height === undefined ? 24 : height / 0.6);
  }
  for (let col = 1; col <= numCols; col++) {
    const width = sheet.column(col).width();
    colWidths.push(width === undefined ? 80 : width / 0.11);
  }

  // mergeCells
  const mergeCellNames = Object.keys(sheet._mergeCells);
  mergeCellNames.forEach(range => {
    const decode = colCache.decode(range);
    mergeCells.push({
      row: decode.top - 1,
      col: decode.left - 1,
      rowspan: decode.bottom - decode.top + 1,
      colspan: decode.right - decode.left + 1
    })
  });

  return {data, styles, rowHeights, colWidths, mergeCells};
}

export default {calculateRealSelections, shallowCompare, argbToRgb, }
