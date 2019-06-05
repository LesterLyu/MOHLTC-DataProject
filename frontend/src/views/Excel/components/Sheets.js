import {Component} from "react";
import React from "react";
import {VariableSizeGrid} from 'react-window';
import Cell from './Cell';
import Selections from './Selections';

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
    this.excel.outerRef = this.outerRef = React.createRef();
    this.state = {
      sheetWidth: this.excel.state.sheetWidth,
      sheetHeight: this.excel.state.sheetHeight,
    };
    this.history = {
      currentSheetIdx: props.context.currentSheetIdx,
    };
    this.isMouseDown = false;
    this.startCell = [];
    this.selections = null;
    window.Cell = Cell;
  }

  get grid() {
    return this.sheetContainerRef.current;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.history.currentSheetIdx !== nextProps.context.currentSheetIdx
      || this.history.initialFileName !== nextProps.context.initialFileName
      || this.state !== nextState;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.history.currentSheetIdx !== this.props.context.currentSheetIdx) {
      this.reset();
    }
    this.history.currentSheetIdx = this.props.context.currentSheetIdx;
    this.history.initialFileName = this.props.context.initialFileName;
  }

  componentDidMount() {

  }

  reset() {
    // reset selections
    this.selections.reset();
    // re-render sheet
    this.sheetContainerRef.current.resetAfterIndices({columnIndex: 0, rowIndex: 0});
    // reset scrolling position
    this.sheetContainerRef.current.scrollTo({scrollLeft: 0, scrollTop: 0});
    this.selections.setSelections([1, 1, 1, 1]);
  }

  /**
   * 0-based index
   * @param sheet
   * @return {Function}
   */
  static rowHeight = sheet => index => {
    if (index === 0) return 24;
    const row = sheet.row(index);
    if (row.hidden()) return 0;
    const height = row.height();
    return height === undefined ? 24 : height / 0.6;
  };

  /**
   * 0-based index
   * @param sheet
   * @return {Function}
   */
  static colWidth = sheet => index => {
    if (index === 0) return 40;
    const col = sheet.column(index);
    if (col.hidden()) return 0;
    const height = col.width();
    return height === undefined ? 80 : height / 0.11;
  };

  onMouseDown = (row, col, cellStyle) => {
    // console.log(`Mouse down: ${row}, ${col}`);
    this.isMouseDown = true;
    this.startCell = [row, col, row, col];
    this.selections.setSelections(this.startCell);
  };

  onMouseUp = (row, col, cellStyle) => {
    // console.log(`Mouse up: ${row}, ${col}`);
    this.isMouseDown = false;
  };

  onMouseOver = (row, col, cellStyle) => {
    if (this.isMouseDown) {
      // console.log(`Mouse over: ${row}, ${col}`);
      this.selections.setSelections([
        Math.min(row, this.startCell[0]),
        Math.min(col, this.startCell[1]),
        Math.max(row, this.startCell[0]),
        Math.max(col, this.startCell[1]),
      ]);
    }
  };

  onMouseDoubleClick = (row, col, cellStyle, e) => {
    this.excel.showEditor(row, col, cellStyle, e);
  };

  onKeyDown = (row, col, cellStyle, e) => {
    console.log(e.key);
  };

  render() {
    const sheet = this.excel.sheet;
    const range = sheet.usedRange();
    const columnCount = range ? range._maxColumnNumber + 5 : 30;
    const rowCount = range ? range._maxRowNumber + 10 : 200;
    const rowHeight = Worksheets.rowHeight(sheet);
    const colWidth = Worksheets.colWidth(sheet);

    const panes = sheet.panes();
    let freezeRowCount = 0, freezeColumnCount = 0;
    if (panes && panes.state === 'frozen') {
      freezeRowCount = panes.ySplit;
      freezeColumnCount = panes.xSplit;
    }

    this.selections = new Selections({
      freezeRowCount,
      freezeColumnCount,
      gridRef: this.sheetContainerRef,
      sheet
    });

    return (
      <VariableSizeGrid
        ref={this.sheetContainerRef}
        outerRef={this.outerRef}
        columnCount={columnCount}
        rowCount={rowCount}
        width={this.excel.state.sheetWidth}
        height={this.excel.state.sheetHeight}
        rowHeight={rowHeight}
        columnWidth={colWidth}
        overscanRowCount={0}
        overscanColumnCount={0}
        estimatedColumnWidth={80}
        estimatedRowHeight={24}
        itemData={{
          sheet,
          onMouseDown: this.onMouseDown,
          onMouseUp: this.onMouseUp,
          onMouseOver: this.onMouseOver,
          onMouseDoubleClick: this.onMouseDoubleClick,
          onKeyDown: this.onKeyDown,
          selections: this.selections,
        }}
        freezeRowCount={freezeRowCount + 1} // add one for header
        freezeColumnCount={freezeColumnCount + 1} // add one for header
        extraTopLeftElement={this.selections.renderTopLeft()}
        extraTopRightElement={this.selections.renderTopRight()}
        extraBottomLeftElement={this.selections.renderBottomLeft()}
        extraBottomRightElement={this.selections.renderBottomRight()}>
        {Cell}
      </VariableSizeGrid>
    )
  }
}

export default Worksheets;
