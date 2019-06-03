import React, {PureComponent} from "react";
import {colorToRgb} from "../helpers";
import RichText from "xlsx-populate/lib/worksheets/RichText";
import ac from "xlsx-populate/lib/addressConverter";
import {SSF} from "fast-formula-parser";
import Worksheets from "./Sheets";

const borderStyle2Width = {thin: 1, medium: 2, thick: 3};

const supported = {
  horizontalAlignment: {left: 'start', right: 'end', center: 'center', justify: 'safe'},
  verticalAlignment: {
    top: 'start',
    center: 'center',
    bottom: 'end',
  }
};

const defaultStyle = {
  borderRight: '1px solid #ccc',
  borderBottom: '1px solid #ccc',
  padding: '0 4px 0 4px',
  lineHeight: 'normal',
  textAlign: 'left',
  whiteSpace: 'pre',
  overflow: 'visible',
  display: 'flex',
};

let excel;

class Cell extends PureComponent {

  constructor(props) {
    super(props);
    excel = window.excel;
  }

  /**
   * @param {Sheet} sheet
   * @param {Cell} cell
   */
  static getCellStyles(sheet, cell) {
    let style = {};
    let rowHeight = cell.row().height;
    rowHeight = rowHeight ? 24 : rowHeight / 0.6;

    const hideGridLines = !sheet.gridLinesVisible();
    if (hideGridLines) {
      style.borderRight = null;
      style.borderBottom = null;
    }
    if (cell.getStyle('bold')) {
      style.fontWeight = 'bold';
    }
    if (cell.getStyle('italic')) {
      style.fontStyle = 'italic';
    }
    if (cell.getStyle('underline')) {
      style.textDecoration = 'underline';
    }
    if (cell.getStyle('strikethrough')) {
      if (style.textDecoration)
        style.textDecoration += ' line-through';
      else
        style.textDecoration = 'line-through';
    }
    const fontSize = cell.getStyle('fontSize');
    if (fontSize != null) {
      style.fontSize = fontSize + 'pt';
      if (rowHeight < fontSize * 0.75) {
        style.overflow = 'hidden';
      }
    }
    const fontFamily = cell.getStyle('fontFamily');
    if (fontFamily) {
      style.fontFamily = fontFamily;
    }
    const fontColor = cell.getStyle('fontColor');
    if (fontColor) {
      style.color = '#' + colorToRgb(fontColor);
    }
    const fill = cell.getStyle('fill');
    if (fill) {
      if (fill.type === 'solid') {
        style.background = '#' + colorToRgb(fill.color);
      }
    }

    // top and left borders first, since border can be applied to empty cells with empty styles
    let rowNum = cell.rowNumber(), colNum = cell.columnNumber();

    // check if bottom cell has top border
    const bottomCell = sheet.getCell(rowNum + 1, colNum);
    const topBorder = bottomCell.getStyle('topBorder');
    if (topBorder) {
      const color = colorToRgb(topBorder.color) || '000';
      style.borderBottom = `${borderStyle2Width[topBorder.style]}px solid #${color}`;
    }

    // check if right cell has left border
    const leftBorder = sheet.getCell(rowNum, colNum + 1).getStyle('leftBorder');
    if (leftBorder) {
      const color = colorToRgb(leftBorder.color) || '000';
      style.borderRight = `${borderStyle2Width[leftBorder.style]}px solid #${color}`;
    }

    // right and bottom borders
    const rightBorder = cell.getStyle('rightBorder');
    const bottomBorder = cell.getStyle('bottomBorder');
    if (rightBorder) {
      const color = colorToRgb(rightBorder.color) || '000';
      style.borderRight = `${borderStyle2Width[rightBorder.style]}px solid #${color}`;
    }
    if (bottomBorder) {
      const color = colorToRgb(bottomBorder.color) || '000';
      style.borderBottom = `${borderStyle2Width[bottomBorder.style]}px solid #${color}`;
    }

    // horizontalAlignment
    const horizontalAlignment = supported.horizontalAlignment[cell.getStyle('horizontalAlignment')];
    if (horizontalAlignment) {
      style.justifyContent = horizontalAlignment;
    } else {
      // default
      style.justifyContent = 'left';
    }

    // verticalAlignment
    const verticalAlignment = supported.verticalAlignment[cell.getStyle('verticalAlignment')];
    if (verticalAlignment) {
      style.alignItems = verticalAlignment;
    }

    // font text wrap
    const wrapText = cell.getStyle('wrapText');
    if (wrapText) {
      style.wordWrap = 'break-word';
      style.whiteSpace = 'pre-wrap';
    }

    // TODO: textRotation
    // const textRotation = cell.getStyle('textRotation');
    // if (typeof textRotation === 'number') {
    //   style.display = 'block';
    //   style.transform = 'rotate(-' + textRotation + 'deg)';
    // }

    // merged cell
    const merged = cell.merged();
    if (merged) {
      // show the primary cell
      if (merged.from.row === cell.rowNumber() && merged.from.col === cell.columnNumber()) {
        style.height = style.width = 0;
        for (let row = merged.from.row; row <= merged.to.row; row++) {
          style.height += Worksheets.rowHeight(sheet)(row);
        }
        for (let col = merged.from.col; col <= merged.to.col; col++) {
          style.width += Worksheets.colWidth(sheet)(col);
        }
      } else {
        // hide this cell
        style = {height: 0, width: 0, display: 'none'};
      }
    }

    return style;
  }

  /**
   *
   * @param {Cell} cell
   * @param {{}} initStyle
   * @return {{mergedStyle: *, value: *}}
   */
  static getCellValueAndStyle(cell, initStyle) {
    let value = cell.getValue();
    if (value != null) {
      if (value.error) {
        value = value.error();
      } else if (value instanceof RichText) {
        value = value.text();
      }
    }
    if (value == null) value = '';
    const numFmt = cell.getStyle('numberFormat');
    if (numFmt !== null && numFmt !== undefined) {
      value = SSF.format(numFmt.replace('\\', ''), value);
    }
    // do not render the cell if the cell's row or column is hidden
    let mergedStyle;
    if (initStyle.width === 0 || initStyle.height === 0) {
      value = null;
      mergedStyle = Object.assign({}, initStyle);
    } else {
      mergedStyle = Object.assign({}, defaultStyle, initStyle, Cell.getCellStyles(cell.sheet(), cell));
    }
    // text overflow
    if (value != null && value !== '') {
      mergedStyle.zIndex = cell.columnNumber();
    }
    return {mergedStyle, value};
  }

  renderColumnHeader(index, style) {
    const value = ac.columnNumberToName(index);
    return (
      <div style={style} className={"sheet-header"} onClick={() => {
        console.log(`Clicked Column header ${value}`)
      }}>
        {value}
      </div>
    )
  }

  renderRowHeader(index, style) {
    return (
      <div style={style} className={"sheet-header"} onClick={() => {
        console.log(`Clicked Row header ${index}`)
      }}>
        {index}
      </div>
    )
  }


  renderDataValidation(dataValidation, cell, value, style) {
    style.display = null;
    return (
      <div>
        {value}
        <div className={"dropdownArrow"} style={{top: style.height / 2 - 5}}
             onClick={event => excel.showDropdown(event, cell)}>
          {String.fromCharCode(9660)}
        </div>
      </div>
    )
  }

  renderHyperlink(hyperlink, cell, value, style) {
    // TODO: FIX
    const innerStyle = {
      cursor: 'pointer'
    };
    const location = hyperlink.attributes.location;
    return location ? (
      <div style={innerStyle} onClick={() => {
        const sheet = cell.sheet()._hyperlinks.parse(location).sheet;
        if (sheet)
          excel.switchSheet(sheet);
      }}>
        {value}
      </div>
    ) : (
      <div style={innerStyle} onClick={() => window.open(cell.hyperlink(), '_blank')}>
        {value}
      </div>
    )
  }

  renderNormalCell(value) {
    return (
      <span style={{pointerEvents: 'none'}}>
          {value}
        </span>
    )
  }

  render() {
    const {data, rowIndex, columnIndex, style} = this.props;
    const {sheet, onMouseDown, onMouseUp, onMouseOver, onMouseClick} = data;
    let innerContent = null;

    // render row/column header
    if (rowIndex === 0) {
      // render column header:  A B C
      return this.renderColumnHeader(columnIndex, style);
    }
    if (columnIndex === 0) {
      // render row header: 1 2 3
      return this.renderRowHeader(rowIndex, style);
    }

    const cell = sheet.getCell(rowIndex, columnIndex);
    const {value, mergedStyle} = Cell.getCellValueAndStyle(cell, style);

    // render data validation
    const dataValidation = cell.dataValidation();
    if (dataValidation && dataValidation.type === 'list') {
      innerContent = this.renderDataValidation(dataValidation, cell, value, mergedStyle);
    }

    // render hyperlink
    const hyperlink = cell.sheet()._hyperlinks.get(cell.address());
    if (hyperlink) {
      innerContent = this.renderHyperlink(hyperlink, cell, value, mergedStyle);
    }

    // render normal cell
    if (!dataValidation && !hyperlink) {
      innerContent = this.renderNormalCell(value);
    }

    return (
      <div style={mergedStyle} className={"not-selectable"}
           onClick={(e) => onMouseClick(rowIndex, columnIndex, mergedStyle, e)}
           onMouseDown={(e) => onMouseDown(rowIndex, columnIndex, mergedStyle, e)}
           onPointerEnter={(e) => onMouseOver(rowIndex, columnIndex, mergedStyle, e)}
           onMouseUp={(e) => onMouseUp(rowIndex, columnIndex, mergedStyle, e)}>
        {innerContent}
      </div>
    )
  }
}

export default Cell;
