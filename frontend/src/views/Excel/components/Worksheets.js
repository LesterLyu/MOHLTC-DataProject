import {Component} from "react";
import React from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";

import Worksheet from './Worksheet'

import Handsontable from 'handsontable';

const {addClass, removeClass} = Handsontable.dom;

const styles = theme => ({});

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
        dataSchema: {},
        outsideClickDeselects: false,
        mergeCells: sheet.mergeCells,
        contextMenu: {
          items: {
            copy : {},
            mergeCells: {},
            '---------': {},
            hideRow: {
              name: 'Hide Row',
              hidden() {
                return !this.selection.isSelectedByRowHeader();
              },
              callback: () => {
                const { from, to } = excel.hotInstance.getSelectedRangeLast();
                const start = Math.min(from.row, to.row);
                const end = Math.max(from.row, to.row);
                const rowHeights = excel.currentSheet.rowHeights;
               for (let i = start; i <= end; i++) {
                 rowHeights[i] = 0;
                }
                excel.hotInstance.render();
                setTimeout(() => {
                  for (let i = start; i <= end; i++) {
                    excel.workbook.sheet(excel.currentSheetIdx).row(i + 1).height(0);
                  }
                })
              }
            },
            hideColumn: {
              name: 'Hide Column',
              hidden() {
                return !this.selection.isSelectedByColumnHeader();
              },
              callback: () => {
                const { from, to } = excel.hotInstance.getSelectedRangeLast();
                const start = Math.min(from.col, to.col);
                const end = Math.max(from.col, to.col);
                const colWidths = excel.currentSheet.colWidths;
                for (let i = start; i <= end; i++) {
                  colWidths[i] = 0;
                }
                excel.hotInstance.render();
                setTimeout(() => {
                  for (let i = start; i <= end; i++) {
                    excel.workbook.sheet(excel.currentSheetIdx).column(i + 1).width(0);
                  }
                })
              }
            },

          }

        },
        afterChange: (changes, source) => {
          // console.log(changes, source);
          if (source === 'edit') {
            if (changes) {
              for (let i = 0; i < changes.length; i++) {
                let row = changes[0][0], col = changes[0][1], oldData = changes[0][2], newData = changes[0][3];
                // excel.renderer.cellNeedUpdate(currentSheetIdx, row, col);
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
        afterRowResize: (row, height, isDoubleClick) => {
          height = Math.max(0, height);
          console.log('save row height:', row, height);
          const rowHeights = excel.currentSheet.rowHeights;
          rowHeights[row] = height;
          // fix bug where row height is not properly updated on the table
          excel.renderCurrentSheet();
          setTimeout(() => {
            // excel.hotInstance.getPlugin('ManualRowResize').setManualSize(row, height);
            excel.workbook.sheet(currentSheetIdx).row(row + 1).height(height * 0.6)
          });
          return height;
        },
        afterColumnResize: (col, width, isDoubleClick) => {
          width = Math.max(0, width);
          const colWidths = excel.currentSheet.colWidths;
          colWidths[col] = width;
          console.log('save col width:', col, width);
          if (width === 0) {
            excel.renderCurrentSheet();
          }

          setTimeout(() => {
            excel.workbook.sheet(currentSheetIdx).column(col + 1).width(width * 0.11)
          });
          return width;
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
        // support hidden row and smaller row height
        afterGetRowHeader: (row, th) => {
          // check if row height is 0 (hidden)
          const sheetRow = this.excel.sheet.row(row + 1);
          const rowHeight = sheetRow.hidden() ? 0 : (sheetRow.height() === undefined ? 24 : sheetRow.height() / 0.6);
          const tr = th.parentNode;

          if (tr) {
            if (rowHeight === 0) {
              addClass(tr, 'hide');
            } else {
              removeClass(tr, 'hide');
              // hard fix to display height smaller than 23px
              if (rowHeight < 23) {
                tr.style.height = rowHeight - 1 + 'px';
                tr.style.lineHeight = rowHeight - 1 + 'px';
              } else {

              }
            }
          }
        },
        // support hidden column
        modifyColWidth: (width, col) => {
          const sheetCol= this.excel.sheet.column(col + 1);
          const colWidth = sheetCol.hidden() ? 0 : (sheetCol.width() === undefined ? 80 : sheetCol.width() / 0.11);

          if (colWidth === 0) {
            return 0.1;
          }
          return width;
        }
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
        renderer={excel.renderer.cellRendererNG}
        editor={excel.editor.FormulaEditorNG}
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
      <div style={{overflow: 'hidden'}} ref={this.sheetContainerRef}>
        {this.worksheets()}
      </div>
    )
  }
}

Worksheets.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Worksheets);
