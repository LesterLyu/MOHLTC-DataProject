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
    this.rowCount = null;
    this.columnCount = null;
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
    if (this.history.currentSheetIdx !== this.props.context.currentSheetIdx
      || this.history.initialFileName !== this.props.context.initialFileName) {
      this.reset();
    }
    this.history.currentSheetIdx = this.props.context.currentSheetIdx;
    this.history.initialFileName = this.props.context.initialFileName;
  }

  componentDidMount() {
    this.history.currentSheetIdx = this.props.context.currentSheetIdx;
    this.history.initialFileName = this.props.context.initialFileName;
    this.selectActiveCell();
  }

  reset() {
    // reset selections
    this.selections.reset();
    // re-render sheet
    this.sheetContainerRef.current.resetAfterIndices({columnIndex: 0, rowIndex: 0});
    // reset scrolling position
    this.sheetContainerRef.current.scrollTo({scrollLeft: 0, scrollTop: 0});
   this.selectActiveCell();
  }

  selectActiveCell() {
    try {
      const activeCell = this.excel.sheet.activeCell();
      const row = activeCell.rowNumber(), col = activeCell.columnNumber();
      this.selections.setSelections([row, col, row, col]);
    } catch (e) {
      console.log(e);
      this.selections.setSelections([1, 1, 1, 1], undefined, false);
    }
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

  /**
   *
   * @param row
   * @param col
   * @param cellStyle
   * @param {MouseEvent} e
   */
  onMouseDown = (row, col, cellStyle, e) => {
    console.log(`Mouse down: ${row}, ${col}, button: ${e.button}`);
    // 2 = right click; 1 = left click.
    if (e.button === 0) {
      this.isMouseDown = true;
      this.startCell = [row, col, row, col];
      this.selections.setSelections(this.startCell, [row, col]);
    } else if (e.button === 2) {
      // this.selections.setSelections([row, col, row, col]);
    }

  };

  onMouseUp = (row, col, cellStyle, e) => {
    // console.log(`Mouse up: ${row}, ${col}`);
    if (e.button === 0) {
      this.isMouseDown = false;
    }
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
    this.excel.showEditor(row, col, cellStyle);
  };

  /**
   *
   * @param row
   * @param col
   * @param cellStyle
   * @param {KeyboardEvent} e
   */
  onKeyDown = (row, col, cellStyle, e) => {
    // need to retrieve the index again, since the given index may be wrong.
    row = this.selections.startCell[0];
    col = this.selections.startCell[1];
    const cell = this.excel.sheet.getCell(row, col);
    cellStyle = Object.assign({}, this.sheetContainerRef.current._getItemStyle(row, col), Cell.getCellStyles(cell));
    const typed = !!e.key.match(/^\S$/);
    if (typed && !e.ctrlKey && !e.altKey)
      this.excel.showEditor(row, col, cellStyle, typed);
    else {
      if (e.key === 'Delete') {
        this.selections.forEach((row, col) => {
          this.excel.sheet.getCell(row, col).clear();
        });
        this.excel.renderCurrentSheet();
      } else if (e.key === 'Backspace') {
        this.excel.showEditor(row, col, cellStyle, true);
      } else if (e.key === 'ArrowUp') {
        this.selections.move(-1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        const merged = cell.merged();
        if (merged) this.selections.move(merged.to.row + 1 - row, 0);
        else this.selections.move(1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        this.selections.move(0, -1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        const merged = cell.merged();
        if (merged) this.selections.move(0, merged.to.col + 1 - col);
        else this.selections.move(0, 1);
        e.preventDefault();
      }
    }

    console.log(e.key);
  };

  render() {
    const sheet = this.excel.sheet;
    const range = sheet.usedRange();
    const columnCount = this.columnCount = range ? range._maxColumnNumber + 5 : 30;
    const rowCount = this.rowCount = range ? range._maxRowNumber + 10 : 200;
    const rowHeight = Worksheets.rowHeight(sheet);
    const colWidth = Worksheets.colWidth(sheet);

    const panes = sheet.panes();
    let freezeRowCount = 0, freezeColumnCount = 0;
    if (panes && panes.state === 'frozen') {
      freezeRowCount = panes.ySplit;
      freezeColumnCount = panes.xSplit;
    }
    console.log('render sheets');
    this.selections = new Selections({
      freezeRowCount,
      freezeColumnCount,
      gridRef: this.sheetContainerRef,
      sheet
    });

    return (
      <VariableSizeGrid
        onContextMenu={e => console.log(e)}
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
          onContextMenu: this.excel.onContextMenu,
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
