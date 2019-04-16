import colCache from './col-cache';
import RichTexts from "xlsx-populate/lib/RichText";
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
