import {Component, PureComponent} from "react";
import React from "react";
import {VariableSizeGrid} from 'react-window';
import RichText from "xlsx-populate/lib/worksheets/RichText";
import {SSF} from 'fast-formula-parser';
import {argbToRgb, colorToRgb} from "../helpers";

const borderStyle2Width = {thin: 1, medium: 2, thick: 3};

const supported = {
  horizontalAlignment: ['left', 'right', 'center', 'justify'],
  verticalAlignment: ['top', 'center', 'bottom']
};

const defaultStyle = {
  borderRight: '1px solid #ccc',
  borderBottom: '1px solid #ccc',
  padding: '0 4px 0 4px',
  lineHeight: 'normal',
  textAlign: 'left',
  whiteSpace: 'pre',
  overflow: 'visible',
};

let excel;

class Cell extends Component {

  /**
   * @param {Sheet} sheet
   * @param {Cell} cell
   */
  static getCellStyles(sheet, cell) {
    const style = {};
    let rowHeight = cell.row().height;
    rowHeight = rowHeight ? 24 : rowHeight / 0.6;

    if (!sheet.gridLinesVisible()) {
      style.borderRight = '1px solid #0000';
      style.borderBottom = '1px solid #0000';
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
      style.color = '#' + argbToRgb(fontColor);
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
    const horizontalAlignment = cell.getStyle('horizontalAlignment');
    if (horizontalAlignment && supported.horizontalAlignment.includes(horizontalAlignment)) {
      style.textAlign = horizontalAlignment;
    } else {
      // default
      style.textAlign = 'left';
    }

    // verticalAlignment
    const verticalAlignment = cell.getStyle('verticalAlignment');
    if (verticalAlignment && supported.verticalAlignment.includes(verticalAlignment)) {
      switch (verticalAlignment) {
        case 'top':
          style.verticalAlign = 'top';
          break;
        case 'center':
          style.verticalAlign = 'middle';
          break;
        case 'bottom':
          style.verticalAlign = 'bottom';
          break;
        default:
          break;
      }
    }

    // font text wrap
    const wrapText = cell.getStyle('wrapText');
    if (wrapText) {
      style.wordWrap = 'break-word';
      style.whiteSpace = 'pre-wrap';
    }

    // TODO: textRotation
    const textRotation = cell.getStyle('textRotation');
    if (typeof textRotation === 'number') {
      style.display = 'block';
      style.transform = 'rotate(-' + textRotation + 'deg)';
    }

    return style;
  }

  dataValidation(dataValidation, cell, value, style) {
    return (
      <div style={style}>
        <div>
          {value}
          <div className={"dropdownArrow"} style={{top: style.height / 2 - 5}}
               onClick={event => excel.showDropdown(event, cell)}>
            {String.fromCharCode(9660)}
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {data, rowIndex, columnIndex, style} = this.props;
    const cell = data.getCell(rowIndex + 1, columnIndex + 1);
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
    if (style.width === 0 || style.height === 0) {
      value = null;
      mergedStyle = Object.assign({}, style);
    } else {
      mergedStyle = Object.assign({}, defaultStyle, style, Cell.getCellStyles(data, cell));
    }

    // text overflow
    if (value != null && value !== '') {
      mergedStyle.zIndex = columnIndex + 1;
    }

    // render data validation
    const dataValidation = cell.dataValidation();
    if (dataValidation && dataValidation.type === 'list') {
      return this.dataValidation(dataValidation, cell, value, mergedStyle);
    }

    // render hyperlink


    // render normal cell
    if (rowIndex === 0) {
      mergedStyle.zIndex = 1000;
      mergedStyle.position = 'fixed';
    }
    return (
      <div style={mergedStyle} onClick={() => {
        console.log(`Clicked ${rowIndex}, ${columnIndex}`)
      }}>
        <span style={{pointerEvents: 'none'}}>
        {value}
        </span>
      </div>
    )
  }
}

/**
 * @typedef {Object}
 * @property {Excel} excel
 *
 */
class Worksheets extends Component {

  constructor(props) {
    super(props);
    excel = this.excel = props.context;
    this.sheetContainerRef = React.createRef();
    this.excel.sheetContainerRef = this.sheetContainerRef;
    this.state = {
      sheetWidth: this.excel.state.sheetWidth,
      sheetHeight: this.excel.state.sheetHeight,
    };
    this.history = {
      currentSheetIdx: props.context.currentSheetIdx,
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.history.currentSheetIdx !== nextProps.context.currentSheetIdx
      || this.history.initialFileName !== nextProps.context.initialFileName
      || this.state !== nextState;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.history.currentSheetIdx = this.props.context.currentSheetIdx;
    this.history.initialFileName = this.props.context.initialFileName;
    this.reset();
  }

  reset() {
    this.sheetContainerRef.current.resetAfterIndices({columnIndex: 0, rowIndex: 0});
    this.sheetContainerRef.current.scrollTo({scrollLeft: 0, scrollTop: 0});
  }

  render() {
    const sheet = this.excel.sheet;
    const range = sheet.usedRange();
    const rowHeight = index => {
      const row = sheet.row(index + 1);
      if (row.hidden()) return 0;
      const height = row.height();
      return height === undefined ? 24 : height / 0.6;
    };
    const colWidth = index => {
      const col = sheet.column(index + 1);
      if (col.hidden()) return 0;
      const height = col.width();
      return height === undefined ? 80 : height / 0.11;
    };

    return (
      <VariableSizeGrid
        ref={this.sheetContainerRef}
        columnCount={range._maxColumnNumber + 5}
        rowCount={range._maxRowNumber + 10}
        width={this.excel.state.sheetWidth}
        height={this.excel.state.sheetHeight}
        rowHeight={rowHeight}
        columnWidth={colWidth}
        overscanRowsCount={10}
        overscanColumnsCount={5}
        estimatedColumnWidth={80}
        estimatedRowHeight={24}
        itemData={sheet}>
        {Cell}
      </VariableSizeGrid>
    )
  }
}

export default Worksheets;
