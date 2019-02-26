import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Handsontable from 'handsontable';
import {argbToRgb, colorToRgb} from './helpers';
import colCache from './col-cache';
import SSF from 'ssf'
import RichTexts from 'xlsx-populate/lib/RichTexts';


const SPAN_TEMPLATE = document.createElement('span');
SPAN_TEMPLATE.style.pointerEvents = 'none';
let excelInstance, global;

const supported = {
  horizontalAlignment: ['left', 'right', 'center', 'justify'],
  verticalAlignment: ['top', 'center', 'bottom']
};

const borderStyle2Width = {thin: 1, medium: 2, thick: 3};

class CellCache {
  constructor() {
    this.storage = {}; // sheetId -> row -> col -> td element
  }

  set(td, sheetId, row, col) {
    if (!this.storage[sheetId]) {
      this.storage[sheetId] = {};
    }
    if (!this.storage[sheetId][row]) {
      this.storage[sheetId][row] = {};
    }
    this.storage[sheetId][row][col] = td.cloneNode(true);
  }

  get(sheetId, row, col) {
    if (!this.storage[sheetId] || !this.storage[sheetId][row] || !this.storage[sheetId][row][col]) {
      return null;
    }
    return this.storage[sheetId][row][col];
  }
}

export default class Renderer {
  constructor(instance) {
    excelInstance = instance;
    global = instance.state.global;
    this.cellCache = new CellCache();
    this.changes = {}; // sheetId -> row -> col -> boolean
  }

  setChanges(sheetId, row, col, update) {
    if (!this.changes[sheetId]) {
      this.changes[sheetId] = {};
    }
    if (!this.changes[sheetId][row]) {
      this.changes[sheetId][row] = {};
    }
    this.changes[sheetId][row][col] = update;
  }

  /**
   * Return true if the cell needs update, otherwise return the old td element.
   * @param sheetId
   * @param row
   * @param col
   * @return {boolean|Node}
   */
  shouldCellUpdate(sheetId, row, col) {
    const td = this.cellCache.get(sheetId, row, col);
    if (!td) {
      return true;
    }
    if (!this.changes[sheetId] || !this.changes[sheetId][row] || !this.changes[sheetId][row][col]) {
      return td;
    } else {
      return true;
    }
  }

  cellNeedUpdate(sheetId, row, col) {
    this.setChanges(sheetId, row, col, true);
    console.log('cellNeedUpdate', sheetId, row, col)
  }

  cellUpdated(sheetId, row, col) {
    this.setChanges(sheetId, row, col, undefined);
  }

  cellRendererNG = (instance, td, row, col, prop, value, cellProperties) => {
    if (!excelInstance.workbook) {
      console.warn('Renderer.cellRendererNG workbook is not yet initialized.');
      return;
    }
    // let update = this.shouldCellUpdate(excelInstance.currentSheetIdx, row, col);
    // if (typeof update === 'object') {
    //   td.classList = update.classList;
    //   td.innerHTML = update.innerHTML;
    //   td.style = update.style;
    //   return;
    // }
    // console.log('rerender ', excelInstance.currentSheetIdx, row, col);
    const {workbook} = excelInstance;
    const worksheet = workbook.sheet(excelInstance.currentSheetIdx);
    const cell = worksheet.cell(row + 1, col + 1);

    if (cell.formula()) {
      value = {formula: cell.formula(), result: cell._value};
    } else {
      value = cell.value();
    }

    let rowHeight = worksheet.row(row + 1).height();
    rowHeight = rowHeight === undefined ? 24 : rowHeight / 0.6;

    let colWidth = worksheet.column(col + 1).width();
    // noinspection JSValidateTypes
    colWidth = colWidth === undefined ? 80 : colWidth / 0.11;

    const fontStyle = {
      bold: cell.style('bold'),
      italic: cell.style('italic'),
      underline: cell.style('underline'),
      size: cell.style('fontSize'),
      name: cell.style('fontFamily'),
      color: colorToRgb(cell.style('fontColor')),
      strikethrough: cell.style('strikethrough'),
      rowHeight,
    };

    // grid lines
    if (!worksheet.gridLinesVisible()) {
      if (td.style.borderRight === '')
        td.style.borderRight = '1px solid #0000';
      if (td.style.borderBottom === '')
        td.style.borderBottom = '1px solid #0000';
    }

    let result = calcResult(value, typeof value === 'object' ? undefined : cell.style('numberFormat'));

    // rich text
    if (value instanceof RichTexts) {
      const mainSpan = document.createElement('span');
      for (let i = 0; i < value.length(); i++) {
        const rt = value.get(i);
        const span = document.createElement('span');
        Handsontable.dom.fastInnerText(span, rt.value());

        setFontStyle(span, Object.assign({}, fontStyle, {
          bold: rt.style('bold'),
          italic: rt.style('italic'),
          underline: rt.style('underline'),
          size: rt.style('fontSize'),
          name: rt.style('fontFamily'),
          color: colorToRgb(rt.style('fontColor')),
          strikethrough: rt.style('strikethrough'),
        }));
        mainSpan.appendChild(span);
      }
      // removeFontStyle(td);
      result = mainSpan.innerHTML;
    }

    // wrap the value, this fix the clicking issue for overflowed text
    const span = SPAN_TEMPLATE.cloneNode(false);
    Handsontable.dom.fastInnerHTML(span, result);
    Handsontable.dom.fastInnerHTML(td, '');
    td.appendChild(span);

    // text overflow if right cell is empty
    const rightCell = worksheet.cell(row + 1, col + 2).value();
    if (rightCell === '' || rightCell === null || rightCell === undefined) {
      td.classList.add('lOverflow');
    }

    // top and left borders first, since border can be applied to empty cells with empty styles
    let row_temp = row + 1, col_temp = col + 1;

    // check if bottom cell has top border
    const bottomCell = worksheet.cell(row_temp + 1, col + 1);
    const topBorder = bottomCell.style('topBorder');
    if (topBorder) {
      const color = colorToRgb(topBorder.color) || '000';
      td.style.borderBottom = `${borderStyle2Width[topBorder.style]}px solid #${color}`;
    }
    // check if right cell has left border
    const leftBorder = worksheet.cell(row + 1, col_temp + 1).style('leftBorder');
    if (leftBorder) {
      const color = colorToRgb(leftBorder.color) || '000';
      td.style.borderRight = `${borderStyle2Width[leftBorder.style]}px solid #${color}`;
    }

    // TO-DO: if the cell has no styles, then don't do any style calculations
    // if (Object.keys(style).length === 0) {
    //   // apply default styles
    //   td.classList.add('htBottom');
    //   td.classList.add('lAlignLeft');
    //   return;
    // }
    td.classList.add('htBottom');
    td.classList.add('lAlignLeft');

    // right and bottom borders
    const borders = cell.style('border');
    if (Object.keys(borders).length !== 0) {
      for (let key in borders) {
        if ((key === 'right' || key === 'bottom') && borders[key]) {
          const upper = key.charAt(0).toUpperCase() + key.slice(1);
          const border = borders[key];
          const color = colorToRgb(border.color) || '000';
          td.style['border' + upper] = `${borderStyle2Width[border.style]}px solid #${color}`;
        }
      }
    }
    if (!(value instanceof RichTexts)) {
      setFontStyle(td, fontStyle);
    }

    const fill = cell.style('fill');
    if (fill) {
      if (fill.type === 'solid') {
        td.style.background = '#' + colorToRgb(fill.color);
      }
    }

    // horizontalAlignment
    const horizontalAlignment = cell.style('horizontalAlignment');
    if (horizontalAlignment && supported.horizontalAlignment.includes(horizontalAlignment)) {
      td.style.textAlign = horizontalAlignment;
    } else {
      // default
      td.style.textAlign = 'left';
    }

    // verticalAlignment
    const verticalAlignment = cell.style('verticalAlignment');
    if (verticalAlignment && supported.verticalAlignment.includes(verticalAlignment)) {
      switch (verticalAlignment) {
        case 'top':
          td.classList.remove('htBottom');
          td.classList.add('htTop');
          break;
        case 'center':
          td.classList.remove('htBottom');
          td.classList.add('htMiddle');
          break;
        case 'bottom':
          td.classList.add('htBottom');
          break;
        default:
          break;
      }
    }

    // font text wrap
    const wrapText = cell.style('wrapText');
    if (wrapText) {
      td.style.wordWrap = 'break-word';
      td.style.whiteSpace = 'pre-wrap';
    }

    // textRotation
    const textRotation = cell.style('textRotation');
    if (typeof textRotation === 'number') {
      span.style.display = 'block';
      span.style.transform = 'rotate(-' + textRotation + 'deg)';
    }

    // set cache

    // console.log('cellUpdated', excelInstance.currentSheetIdx, row, col, 'result=', result);
    // this.cellUpdated(excelInstance.currentSheetIdx, row, col);
    // this.cellCache.set(td, excelInstance.currentSheetIdx, row, col);
  };

  cellRendererForCreateExcel(instance, td, row, col, prop, value, cellProperties) {
    if (excelInstance.workbook) {
      const styles = excelInstance.currentSheet.styles;
      const rowStyle = styles[row];
      const style = rowStyle ? (rowStyle[col] ? rowStyle[col] : {}) : {};
      const rowHeights = excelInstance.currentSheet.rowHeights;
      const colWidths = excelInstance.currentSheet.colWidths;

      const rowHeight = rowHeights[row];
      const colWidth = colWidths[col];

      let result = calcResult(value, style.numberFormat);

      // wrap the value, this fix the clicking issue for overflowed text
      const span = SPAN_TEMPLATE.cloneNode(false);
      Handsontable.dom.fastInnerHTML(span, result);
      Handsontable.dom.fastInnerHTML(td, '');
      td.appendChild(span);

      // text overflow if right cell is empty
      const rightCell = instance.getDataAtCell(row, col + 1);
      if (rightCell === '' || rightCell === null || rightCell === undefined ||
        ((typeof rightCell === 'object' && 'formula' in rightCell) &&
          (rightCell.result === '' || rightCell.result === null || rightCell.result === undefined))) {
        td.classList.add('lOverflow');
      }

      // top and left borders first, since border can be applied to empty cells with empty styles

      let row_temp = row + 1, col_temp = col + 1;
      while (rowHeights[row_temp] <= 0.1) {
        row_temp++;
      }
      while (colWidths[col_temp] <= 0.1) {
        col_temp++;
      }
      // check if bottom cell has top border
      const bottomCellStyle = styles[row_temp] ? (typeof styles[row_temp][col] === 'object' ? styles[row_temp][col] : {}) : {};
      if ('border' in bottomCellStyle && bottomCellStyle.border.top) {
        const color = bottomCellStyle.border.top.color || '000';
        td.style.borderBottom = `${borderStyle2Width[bottomCellStyle.border.top.style]}px solid #${color}`;
      }
      // check if right cell has left border
      const rightCellStyle = styles[row] ? (typeof styles[row][col_temp] === 'object' ? styles[row][col_temp] : {}) : {};
      if ('border' in rightCellStyle && rightCellStyle.border.left) {
        const color = rightCellStyle.border.left.color || '000';
        td.style.borderRight = `${borderStyle2Width[rightCellStyle.border.left.style]}px solid #${color}`;
      }

      // if the cell has no styles, then don't do any style calculations
      if (Object.keys(style).length === 0) {
        // apply default styles
        td.classList.add('htBottom');
        td.classList.add('lAlignLeft');
        return;
      }

      // right and bottom borders
      if (style.border) {
        for (let key in style.border) {
          if ((key === 'right' || key === 'bottom') && style.border[key]) {
            const upper = key.charAt(0).toUpperCase() + key.slice(1);
            const border = style.border[key];
            const color = border.color || '000';
            td.style['border' + upper] = `${borderStyle2Width[border.style]}px solid #${color}`;
          }
        }
      }

      setFontStyle(td, {
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
        size: style.fontSize,
        name: style.fontFamily,
        color: style.fontColor,
        strikethrough: style.strikethrough,
        rowHeight,
      });


      if (style.fill) {
        if (style.fill.type === 'solid') {
          td.style.background = '#' + style.fill.color.rgb;
        }
      }

      // horizontalAlignment
      if (style.horizontalAlignment && supported.horizontalAlignment.includes(style.horizontalAlignment)) {
        td.style.textAlign = style.horizontalAlignment;
      } else {
        // default
        td.style.textAlign = 'left';
      }

      // verticalAlignment
      if (style.verticalAlignment && supported.verticalAlignment.includes(style.verticalAlignment)) {
        switch (style.verticalAlignment) {
          case 'top':
            td.classList.add('htTop');
            break;
          case 'center':
            td.classList.add('htMiddle');
            break;
          case 'bottom':
            td.classList.add('htBottom');
            break;
        }
      } else {
        //default
        td.classList.add('htBottom');
      }

      // font text wrap
      if (style.wrapText) {
        td.style.wordWrap = 'break-word';
        td.style.whiteSpace = 'pre-wrap';
      }

      // textRotation
      if (typeof style.textRotation === 'number') {
        span.style.display = 'block';
        span.style.transform = 'rotate(-' + style.textRotation + 'deg)';
      }


    }
  }

  /**
   * Text and formula renderer
   * @param instance
   * @param td
   * @param row
   * @param col
   * @param prop
   * @param value
   * @param cellProperties
   */
  cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    // Handsontable.renderers.TextRenderer.apply(this, arguments);
    const sheet = global.workbookData.sheets[global.currentSheetIdx];
    if (sheet && sheet.views) {
      // grid lines
      const showGridLines = sheet.views[0].showGridLines;
      if (!showGridLines) {
        td.style.borderColor = 'rgba(0,0,0,0)';
      }

      // check if this row/col should be hidden
      if (sheet.col.hidden.includes(col)) {
        td.style.display = 'none';
        return;
      }

      if (sheet.row.hidden.includes(row)) {
        td.style.display = 'none';
        if (td.parentNode) {
          td.parentNode.style.display = 'none';
        }
        return;
      } else {
        if (td.parentNode) {
          td.parentNode.style.display = '';
        }
      }
    }

    let style = sheet.style[row] ? (sheet.style[row][col] || {}) : {};
    // const rowStyle = sheet.row.style[row] || {};
    // const colStyle = sheet.col.style[row] || {};

    // style = styleDecider(style, rowStyle, colStyle);

    // render formula
    let result = calcResult(value, style.numFmt);

    // rich text
    if (value && Array.isArray(value.richText)) {
      const mainSpan = document.createElement('span');
      for (let i = 0; i < value.richText.length; i++) {
        const rt = value.richText[i];
        const span = document.createElement('span');
        Handsontable.dom.fastInnerText(span, rt.text);
        if (rt.font) {
          setFontStyle(span, rt.font);
        } else if (style.font) {
          setFontStyle(span, style.font);
        }
        mainSpan.appendChild(span);
      }
      // removeFontStyle(td);
      result = mainSpan.innerHTML;
    }

    // wrap the value, this fix the clicking issue for overflowed text
    const span = SPAN_TEMPLATE.cloneNode(false);
    // span.innerHTML = result;
    Handsontable.dom.fastInnerHTML(span, result);
    Handsontable.dom.fastInnerHTML(td, '');
    td.appendChild(span);

    // text overflow if right cell is empty
    const rightCell = instance.getDataAtCell(row, col + 1);
    if (rightCell === '' || rightCell === null || rightCell === undefined ||
      ((typeof rightCell === 'object' && 'formula' in rightCell) &&
        (rightCell.result === '' || rightCell.result === null || rightCell.result === undefined))) {
      td.style.overflow = 'visible';
      td.style.textOverflow = 'clip';
    }

    // default alignment
    td.classList.add('htBottom');

    // styles
    // alignment
    if (style.alignment) {
      if (style.alignment.hasOwnProperty('horizontal')) {
        td.style.textAlign = style.alignment.horizontal;
      }
      if (style.alignment.hasOwnProperty('vertical')) {

        switch (style.alignment.vertical) {
          case 'top':
            td.classList.remove('htBottom');
            td.classList.add('htTop');
            break;
          case 'middle':
            td.classList.remove('htBottom');
            td.classList.add('htMiddle');
            break;
          default:
            break;
        }
      }

      // font text wrap
      if (style.alignment.wrapText) {
        td.style.wrapText = 'break-word';
        td.style.whiteSpace = 'pre-wrap';
      }

      // textRotation
      if (typeof style.alignment.textRotation === 'number') {
        span.style.display = 'block';
        span.style.transform = 'rotate(-' + style.alignment.textRotation + 'deg)';
      }
    }

    // set font style if cell is not a richText
    if (style.font && !(value && Array.isArray(value.richText))) {
      setFontStyle(td, style.font);
    }

    // background
    if (style.fill) {
      if (style.fill.fgColor) {
        td.style.background = '#' + argbToRgb(style.fill.fgColor);
      }
    }

    // borders
    // check if bottom cell has top border
    if (sheet.style[row + 1] && sheet.style[row + 1][col]) {
      const bottomCell = sheet.style[row + 1][col];
      if ('border' in bottomCell && 'top' in bottomCell.border) {
        const color = argbToRgb(bottomCell.border.top.color) || '000';
        td.style.borderBottom = '1px solid #' + color;
      }
    }
    // check if right cell has left border
    if (sheet.style[row] && sheet.style[row][col + 1]) {
      const rightCell = sheet.style[row][col + 1];
      if ('border' in rightCell && 'left' in rightCell.border) {
        const color = argbToRgb(rightCell.border.left.color) || '000';
        td.style.borderRight = '1px solid #' + color;
      }
    }

    if (style.border) {
      for (var key in style.border) {
        if ((key === 'right' || key === 'bottom') && style.border.hasOwnProperty(key)) {
          var upper = key.charAt(0).toUpperCase() + key.slice(1);
          var border = style.border[key];
          const color = argbToRgb(border.color) || '000';
          td.style['border' + upper] = '1px solid #' + color;
        }
      }
    }

    result = span.innerHTML;

    // hyperlink
    const hyperlinks = global.hyperlinks[global.currentSheetIdx] || {};
    const address = colCache.encode(row + 1, col + 1);
    const hyperlink = hyperlinks[address];
    if (hyperlink) {
      const a = document.createElement('a');
      if (hyperlink.mode === 'internal') {
        a.href = window.location.href;
        a.onclick = (event) => {
          excelInstance.switchSheet(hyperlink.sheetName);
          // a trick to move mouse out of window, to fix hyperlink performance bug
          // eventFire($('ol')[0], 'mousedown');
          // gui.showSheet(hyperlink.sheetName);
        };
      } else {
        a.target = '_black';
        a.href = hyperlink.target;
      }

      Handsontable.dom.fastInnerHTML(a, result);
      Handsontable.dom.fastInnerText(td, '');
      td.appendChild(a);
    }
  }

}


function setFontStyle(element, font) {
  if (font.color) {
    element.style.color = '#' + argbToRgb(font.color);
  }
  if (font.bold) {
    element.style.fontWeight = 'bold';
  } else {
    element.style.fontWeight = '';
  }
  if (font.italic) {
    element.style.fontStyle = 'italic';
  } else {
    element.style.fontStyle = '';
  }
  if ('size' in font) {
    element.style.fontSize = font.size + 'pt';
    if (font.rowHeight !== undefined) {
      if (font.rowHeight < font.size * 0.75) {
        element.style.overflow = 'hidden';
      } else {
        element.style.lineHeight = 'normal';
      }
    }

  }
  if (font.name) {
    element.style.fontFamily = font.name;
  }
  if (font.underline) {
    element.style.textDecoration = 'underline';
  } else {
    element.style.textDecoration = '';
  }
  if (font.strikethrough) {
    if (element.style.textDecoration)
      element.style.textDecoration += ' line-through';
    else
      element.style.textDecoration = 'line-through';
  }
}

function calcResult(cellValue, numFmt) {
  let result = cellValue;
  if (cellValue && typeof cellValue === 'object' && cellValue.hasOwnProperty('formula')) {
    if (cellValue.result && cellValue.result.error) {
      result = cellValue.result.error;
    } else {
      result = cellValue.result;

    }
  }
  result = result === null || result === undefined ? '' : result;
  if (numFmt !== null && numFmt !== undefined) {
    result = SSF.format(numFmt, result);
  }
  return result;
}

/**
 * https://github.com/guyonroche/exceljs#styles
 *
 * When a style is applied to a row or column, it will be applied to all currently existing cells
 * in that row or column. Also, any new cell that is created will inherit its initial styles from
 * the row and column it belongs to.
 *
 * If a cell's row and column both define a specific style (e.g. font), the cell will use the row
 * style over the column style. However if the row and column define different styles
 * (e.g. column.numFmt and row.font), the cell will inherit the font from the row and the numFmt
 * from the column.
 * @param cellStyle
 * @param rowStyle
 * @param colStyle
 * @returns {*}
 */
// function styleDecider(cellStyle, rowStyle, colStyle) {
//   const style = Object.assign({}, colStyle, rowStyle, cellStyle);
//
//   // special case, numFmt: cell > col > row
//   if (!('numFmt' in cellStyle)) {
//     if ('numFmt' in colStyle) {
//       style.numFmt = colStyle.numFmt;
//     }
//     else if ('numFmt' in rowStyle) {
//       style.numFmt = rowStyle.numFmt;
//     }
//   }
//
//   return style;
// }
