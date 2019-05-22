import {Component, PureComponent} from "react";
import React from "react";
import {VariableSizeGrid} from 'react-window';
import RichText from "xlsx-populate/lib/worksheets/RichText";
import {argbToRgb, colorToRgb} from "../helpers";

const defaultStyle = {
  borderRight: '1px solid #ccc',
  borderBottom: '1px solid #ccc',
  padding: '0 4px 0 4px',
  lineHeight: 'normal',
  textAlign: 'left',
};

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

    return style;
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

    const mergedStyle = Object.assign({}, defaultStyle, style, Cell.getCellStyles(data, cell));
    return (
      <div style={mergedStyle}>
        {value}
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
    this.excel = props.context;
    this.sheetContainerRef = React.createRef();
    this.excel.sheetContainerRef = this.sheetContainerRef;
    this.state = {
      sheetWidth: this.excel.state.sheetWidth,
      sheetHeight: this.excel.state.sheetHeight,
    };
    this.history = {
      currentSheetIdx: props.context.currentSheetIdx,
    }

  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.history.currentSheetIdx !== nextProps.context.currentSheetIdx
      || this.history.initialFileName !== nextProps.context.initialFileName
      || this.state !== nextState;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.history.currentSheetIdx = this.props.context.currentSheetIdx;
    this.history.initialFileName = this.props.context.initialFileName;
  }

  render() {
    const sheet = this.excel.sheet;
    const range = sheet.usedRange();
    const rowHeight = index => {
      const height = sheet.row(index + 1).height();
      return height === undefined ? 24 : height / 0.6;
    };
    const colWidth = index => {
      const height = sheet.column(index + 1).width();
      return height === undefined ? 80 : height / 0.11;
    };

    return (
      <div style={{overflow: 'hidden'}} ref={this.sheetContainerRef}>
        <VariableSizeGrid
          columnCount={range._maxColumnNumber + 5}
          rowCount={range._maxRowNumber + 10}
          width={this.excel.state.sheetWidth}
          height={this.excel.state.sheetHeight}
          rowHeight={rowHeight}
          columnWidth={colWidth}
          overscanRowsCount={10}
          overscanColumnsCount={5}
          itemData={sheet}
        >
          {Cell}
        </VariableSizeGrid>
      </div>
    )
  }
}

export default Worksheets;
