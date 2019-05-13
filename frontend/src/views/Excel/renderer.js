import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Handsontable from 'handsontable/dist/handsontable.full';
import {argbToRgb, colorToRgb, FormulaError} from './helpers';
import colCache from './col-cache';
import FormulaParser from 'fast-formula-parser';
import RichText from 'xlsx-populate/lib/worksheets/RichText';

const SSF = FormulaParser.SSF;

const SPAN_TEMPLATE = document.createElement('span');
SPAN_TEMPLATE.style.pointerEvents = 'none';
let excelInstance;

const supported = {
  horizontalAlignment: ['left', 'right', 'center', 'justify'],
  verticalAlignment: ['top', 'center', 'bottom']
};

const borderStyle2Width = {thin: 1, medium: 2, thick: 3};

export default class Renderer {
  constructor(instance) {
    excelInstance = instance;
    excelInstance.SSF = SSF;
    this.global = instance.state.global;
    this.changes = {}; // sheetId -> row -> col -> boolean
    this.log = [];
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
   * Return true if the cell does not need render. i.e. inner merge cells
   * @param sheetId
   * @param row
   * @param col
   * @return {boolean}
   */
  shouldCellSkipRender(sheetId, row, col) {
    const merges = excelInstance.global.sheets[sheetId].mergeCells;
    for (let i = 0; i < merges.length; i++) {
      // {row: 0, col: 1, rowspan: 4, colspan: 2}
      const merge = merges[i];
      // the top-left cell should be rendered
      if (row === merge.row && col === merge.col) {
        return false;
      }
      // cells other than the top-left cell should be skipped
      if (merge.row <= row && row < merge.row + merge.rowspan && merge.col <= col && col < merge.col + merge.colspan) {
        return true;
      }
    }
    return false;
  }

  cellNeedUpdate(sheetId, row, col) {
    this.setChanges(sheetId, row, col, true);
    console.log('cellNeedUpdate', sheetId, row, col)
  }

  cellUpdated(sheetId, row, col) {
    this.setChanges(sheetId, row, col, undefined);
    console.log('cellUpdated', sheetId, row, col)
  }

  cellRendererNG = (instance, td, row, col, prop, value, cellProperties) => {
    if (!this.log[row]) this.log[row] = [];
    if (!this.log[row][col]) this.log[row][col] = 0;
    this.log[row][col]++;
    if (!excelInstance.workbook) {
      console.warn('Renderer.cellRendererNG workbook is not yet initialized.');
      return;
    }
    // TO-DO render borders

    if (this.shouldCellSkipRender(excelInstance.currentSheetIdx, row, col)) {
      // console.log('in merge cells, skipped render.');
      return;
    }
    // console.log('rerender ', excelInstance.currentSheetIdx, row, col);
    const {workbook} = excelInstance;
    const worksheet = workbook.sheet(excelInstance.currentSheetIdx);

    const cell = worksheet.getCell(row + 1, col + 1);

    value = cell.getValue();

    let rowHeight = worksheet.row(row + 1).height();
    rowHeight = rowHeight === undefined ? 24 : rowHeight / 0.6;

    let colWidth = worksheet.column(col + 1).width();
    // noinspection JSValidateTypes
    colWidth = colWidth === undefined ? 80 : colWidth / 0.11;

    if (rowHeight === 0 || colWidth === 0 || cell.row().hidden() || cell.column().hidden()) {
      return;
    }

    // if the cell contains formula errors
    if (value instanceof FormulaError) {
      const span = SPAN_TEMPLATE.cloneNode(false);
      Handsontable.dom.fastInnerHTML(td, value.error());
      return;
    }

    // clear borders in case of single cell rerender
    td.style.borderRight = '';
    td.style.borderBottom = '';

    // grid lines
    if (!worksheet.gridLinesVisible()) {
      if (td.style.borderRight === '')
        td.style.borderRight = '1px solid #0000';
      if (td.style.borderBottom === '')
        td.style.borderBottom = '1px solid #0000';
    }

    if (!worksheet.hasCell(row + 1, col + 1)) {
      return;
    }

    let result = calcResult(value, typeof value === 'object' ? undefined : cell.getStyle('numberFormat'));

    const fontStyle = {
      bold: cell.getStyle('bold'),
      italic: cell.getStyle('italic'),
      underline: cell.getStyle('underline'),
      size: cell.getStyle('fontSize'),
      name: cell.getStyle('fontFamily'),
      color: colorToRgb(cell.getStyle('fontColor')),
      strikethrough: cell.getStyle('strikethrough'),
      rowHeight,
    };

    // rich text
    if (value instanceof RichText) {
      const mainSpan = document.createElement('span');
      for (let i = 0; i < value.length; i++) {
        const rt = value.get(i);
        const span = document.createElement('span');
        Handsontable.dom.fastInnerText(span, rt.value() !== undefined ? rt.value() : '');

        let rtStyle = {
          bold: rt.style('bold'),
          italic: rt.style('italic'),
          underline: rt.style('underline'),
          size: rt.style('fontSize'),
          name: rt.style('fontFamily'),
          color: colorToRgb(rt.style('fontColor')),
          strikethrough: rt.style('strikethrough'),
        };
        // remove undefined field
        Object.keys(rtStyle).forEach(key => rtStyle[key] === undefined && delete rtStyle[key]);
        rtStyle = Object.assign({}, fontStyle, rtStyle);
        setFontStyle(span, rtStyle);
        span.style.lineHeight = rtStyle.size + 'pt';
        mainSpan.appendChild(span);
        // td.style. = rowHeight + 'px';
      }

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
    if (!(value instanceof RichText)) {
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

    const hyperlink = cell.sheet()._hyperlinks.get(cell.address());
    if (hyperlink) {
      const location = hyperlink.attributes.location;
      const a = document.createElement('a');
      a.href = window.location.href;

      if (location) {
        a.onclick = (event) => {
          const sheet = cell.sheet()._hyperlinks.parse(location).sheet;
          if (sheet)
            excelInstance.switchSheet(sheet);
        };
      } else {
        a.target = '_black';
        a.href = cell.hyperlink();
      }
      Handsontable.dom.fastInnerHTML(a, result);
      Handsontable.dom.fastInnerText(td, '');
      td.appendChild(a);
    }
    const dataValidation = cell.dataValidation();
    if (dataValidation && dataValidation.type === 'list') {
      // add a dropdown button
      const arrow = document.createElement('div');
      arrow.className = 'dropdownArrow';
      arrow.style.top = (rowHeight - 10) / 2 + 'px';
      arrow.appendChild(document.createTextNode(String.fromCharCode(9660)));
      arrow.onclick = (event) => {
        excelInstance.showDropdown(event, cell);
      };

      // wrap all element into container
      const container = document.createElement('div');
      td.childNodes.forEach(node => container.appendChild(node.cloneNode(true)));
      container.appendChild(arrow);
      Handsontable.dom.fastInnerText(td, '');
      td.appendChild(container);
    }
  };
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
  result = result === null || result === undefined ? '' : result;
  if (numFmt !== null && numFmt !== undefined) {
    result = SSF.format(numFmt.replace('\\', ''), result);
  }
  return result;
}
