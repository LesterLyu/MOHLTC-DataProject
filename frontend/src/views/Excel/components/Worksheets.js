import {Component} from "react";
import React from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";

import Worksheet from './Worksheet'

const styles = theme => ({});

class Worksheets extends Component {

  constructor(props) {
    super(props);
    this.excel = props.context;
    this.sheetContainerRef = React.createRef();
    this.state = {
      sheetWidth: this.excel.state.sheetWidth,
      sheetHeight: this.excel.state.sheetHeight,
    };
    this.history = {
      current: null,
      currentSheetIdx: props.context.currentSheetIdx,
    }

  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.history.current !== nextProps.context.global.current
      || this.history.currentSheetIdx !== nextProps.context.global.currentSheetIdx
      || this.state !== nextState;
  }

  componentDidMount() {
    this.history.current = this.props.context.global.current;
    window.addEventListener('resize', () => {
      if (this.sheetContainerRef.current) {
        this.setState({
          sheetWidth: this.sheetContainerRef.current.offsetWidth,
          sheetHeight: this.sheetContainerRef.current.offsetHeight
        })
      }
    })
  }

  worksheets() {
    const {excel} = this;
    const {current, sheets} = excel.global;
    const {currentSheetIdx} = excel;
    const list = [];

    for (let idx = 0; idx < sheets.length; idx++) {
      const sheet = sheets[idx];
      const settings = {
        startCols: 26,
        startRows: 200,
        width: this.state.sheetWidth,
        height: this.state.sheetHeight,
        rowHeights: sheet.rowHeights,
        colWidths: sheet.colWidths,
        data: sheet.data,
        outsideClickDeselects: false,
        mergeCells: sheet.mergeCells,
        afterChange: (changes, source) => {
          // console.log(changes, source);
          if (source === 'edit') {
            if (changes) {
              for (let i = 0; i < changes.length; i++) {
                let row = changes[0][0], col = changes[0][1], oldData = changes[0][2], newData = changes[0][3];
                const cell = excel.workbook.sheet(currentSheetIdx).cell(row + 1, col + 1);
                if (newData == null || newData === '') {
                  cell.value(null);
                  // remove chain
                  if (oldData && oldData.formula) {
                    excel.calculationChain.removeCell(currentSheetIdx, row, col, oldData.formula);
                  }
                } else if (typeof newData === 'string' || typeof newData === 'number' || typeof newData === 'boolean') {
                  cell.value(newData);
                  // remove chain
                  if (oldData && oldData.formula) {
                    excel.calculationChain.removeCell(currentSheetIdx, row, col, oldData.formula);
                  }
                } else if (newData.formula) {
                  if (!oldData || !oldData.formula) {
                    excel.calculationChain.addCell(currentSheetIdx, row, col, newData.formula);
                  }
                  cell.value(newData.result);
                  cell.formula(newData.formula);
                }
                if (oldData !== newData) {
                  excel.calculationChain.change(currentSheetIdx, row, col);
                  excel.renderCurrentSheet();
                }
              }
            }
          }
        },
        modifyRowHeight: (height, row) => {
          const rowHeights = excel.currentSheet.rowHeights;
          if (rowHeights[row] !== height) {
            rowHeights[row] = height;
            setImmediate(() => {
              excel.workbook.sheet(currentSheetIdx).row(row + 1).height(height * 0.6)
            });
          }
        },
        modifyColWidth: (width, col) => {
          const colWidths = excel.currentSheet.colWidths;
          if (colWidths[col] !== width) {
            colWidths[col] = width;
            setImmediate(() => {
              excel. workbook.sheet(currentSheetIdx).column(col + 1).width(width * 0.11)
            });
          }
        },
        afterMergeCells: (cellRange, mergeParent, auto) => {
          const mergeCells = excel.currentSheet.mergeCells;
          // find mergeCell, if found, do nothing
          for (let i = 0; i < mergeCells.length; i++) {
            const mergeCell = mergeCells[i];
            if (mergeCell.row === cellRange.from.row && mergeCell.col === cellRange.from.col) {
              return;
            }
          }
          mergeCells.push(mergeParent);
          setImmediate(() => {
            excel.workbook.sheet(currentSheetIdx).range(
              cellRange.from.row + 1, cellRange.from.col + 1, cellRange.to.row + 1, cellRange.to.col + 1
            ).merged(true);
          });
        },
        afterUnmergeCells: (cellRange, auto) => {
          const mergeCells = excel.currentSheet.mergeCells;
          let i, mergeCell;
          // find mergeCell
          for (i = 0; i < mergeCells.length; i++) {
            mergeCell = mergeCells[i];
            if (mergeCell.row === cellRange.from.row && mergeCell.col === cellRange.from.col) {
              break;
            }
          }
          mergeCells.splice(i, 1);
          setImmediate(() => {
            excel.workbook.sheet(currentSheetIdx).range(
              mergeCell.row + 1, mergeCell.col + 1, mergeCell.row + mergeCell.rowspan, mergeCell.col + mergeCell.colspan
            ).merged(false);
          });
        },
        // afterSelection: (row, col, row2, col2) => {
        //   excel.global.current = Object.assign({}, excel.global.current, {
        //     sheetName: excel.currentSheetName,
        //     sheetIdx: excel.currentSheetIdx,
        //     formulaOrValue: excel.getDataAtSheetAndCell(row, col, excel.currentSheetIdx),
        //     row, col, row2, col2,
        //   });
        // },
      };
      console.log('container size: ', settings.width, settings.height)
      list.push(<Worksheet
        mode="admin"
        renderer={excel.renderer.cellRendererForCreateExcel}
        editor={excel.editor.FormulaEditor}
        key={idx} id={'worksheet-' + idx}
        hide={currentSheetIdx !== idx}
        global={excel.global}
        context={excel}
        forwardedRef={excel.sheetRef}
        settings={settings}/>
      )
    }
    return list;
  }

  render() {
    return (
      <div style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 50px)'}} ref={this.sheetContainerRef}>
        {this.worksheets()}
      </div>
    )
  }
}

Worksheets.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Worksheets);
