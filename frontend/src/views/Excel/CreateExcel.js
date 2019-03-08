import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'handsontable/dist/handsontable.full.css';
import {withStyles} from '@material-ui/core/styles';
import {
  Card,
  LinearProgress,
} from "@material-ui/core";

import {
  init, generateTableData, generateTableStyle, createArray, colCache, getCellType,
  saveFormulaResultToCell
} from './helpers';
import Parser from './calculations/formulaParser'
import CalculationChain from './calculations/chain'
import Renderer from './renderer';
import Editor from './editor';
import './style.css';
import WorkbookManager from "../../controller/workbookManager";
import Worksheets from './components/Worksheets'
import ExcelToolBar from './components/ExcelToolBar';
import ExcelBottomBar from './components/ExcelBottomBar';
import FormulaBar from "./components/FormulaBar";
// const excelWorker = new Worker('../../controller/excel.worker', { type: 'module' });
window.colCache = colCache;

function defaultSheet() {
  return {
    tabColor: undefined,
    data: generateTableData(200, 26),
    styles: generateTableStyle(200, 26),
    name: 'Sheet1',
    state: 'visible',
    views: [],
    mergeCells: [],
    rowHeights: createArray(24, 200),
    colWidths: createArray(80, 26),
  };
}

const styles = theme => ({});

/**
 * @typedef {Array.<SheetStore>} WorkbookStore
 */

/**
 * @typedef {Object} SheetStore
 * @property {Array.<Array.<string|object>>} data
 * @property {string} name
 * @property {string} state
 * @property {Array.<Array.<object|undefined|null>>} styles
 * @property {Array.<Array.<number>>} colWidths
 * @property {Array.<Array.<number>>} rowHeights
 * @property {string|undefined|null} tabColor
 * @property {Object} views
 */

/**
 * @typedef {Object} Excel
 * @property {Object} global sheets data
 * @property {Handsontable} hotInstance
 * @property {Workbook} workbook
 * @property {string} currentSheetName
 * @property {SheetStore} currentSheet
 * @property {number} currentSheetIdx
 */
class Excel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      completed: 5,
      sheetHeight: 0,
      sheetWidth: 0,
      loadingMessage: 'Loading...',
      loaded: false,
      currentSheetIdx: 0,
    };
    this.global = {
      sheetNames: ['Sheet1'],
      sheets: [
        defaultSheet(),
      ],
      current: {}
    };
    this.workbookManager = new WorkbookManager(props);
    // for calculation
    this.currentSheetName = 'Sheet1';
    this.parser = new Parser(this);
    this.calculationChain = new CalculationChain(this);
    // this.parser.changeCurrSheetName()

    this.renderer = new Renderer(this);
    this.editor = new Editor(this);
    init(this); // init helper functions
    this.sheetContainerRef = React.createRef();
    this.sheetRef = React.createRef();
    this.hooks = [];

    window.excel = this;

  }

  get isLoaded() {
    return this.state.loaded;
  }

  /**
   *
   * @return {Sheet}
   */
  get sheet() {
    return this.workbook.sheet(this.currentSheetIdx);
  }

  /**
   * Get current sheet data
   * @return {SheetStore}
   */
  get currentSheet() {
    return this.global.sheets[this.state.currentSheetIdx];
  }

  get currDisplaySheetName() {
    return this.global.sheetNames[this.state.currentSheetIdx];
  }

  get currentSheetIdx() {
    return this.state.currentSheetIdx;
  }

  set currentSheetIdx(currentSheetIdx) {
    this.setState({currentSheetIdx})
  }

  /**
   * @return {Handsontable}
   */
  get hotInstance() {
    return this.sheetRef.current ? this.sheetRef.current.hotInstance : null;
  }

  addHook = (name, f) => {
    this.hooks.push({name, f});
  };

  getDefinedName = (definedName) => {
    const ref = this.workbook.definedName(definedName);
    if (ref) {
      return ref.value();
    }
  };

  getDataAtSheetAndCell(row, col, sheetNo, sheetName) {
    sheetNo = sheetNo === null ? this.global.sheetNames.indexOf(sheetName) : sheetNo;
    if (sheetNo === undefined) console.error('At least one of sheetNo or sheetName should be provides.');
    const cell = this.workbook.sheet(sheetNo).cell(row + 1, col + 1);
    return cell.value();
  }

  getCell(sheetNo, row, col) {
    if (sheetNo === undefined) console.error('getCell: sheetNo should be provides.');
    return this.workbook.sheet(sheetNo).cell(row + 1, col + 1);
  }

  /**
   * Update a cell's data without render it.
   * Cell's value and formula will be overrode.
   * @param {number | null | undefined} sheetNo - null or undefined if uses current sheet number
   * @param {number} row
   * @param {number} col
   * @param {string|number} rawValue - can be any excel data type
   * @param {'internal'| 'edit'} source - 'internal' means internal update, i.e. formula updates
   *                                      'edit' means edit by the user
   */
  setData(sheetNo, row, col, rawValue, source) {
    sheetNo = sheetNo === null || sheetNo === undefined ? this.currentSheetIdx : sheetNo;
    const cell = this.workbook.sheet(sheetNo).cell(row + 1, col + 1);
    const oldValue = cell.value(), oldFormula = cell.formula();

    // I don't want you to update rich text.
    if (getCellType(cell) === 'richtext') {
      console.warn('setData: An update to rich text has been blocked.');
      return;
    }
    // check if it is formula now
    if (typeof rawValue === 'string' && rawValue.charAt(0) === '=') {
      const res = this.parser.parseNewFormula(rawValue);
      console.log(res);
      saveFormulaResultToCell(cell, res);
    } else {
      cell.value(rawValue);
    }

    // add to next render list
    this.renderer.cellNeedUpdate(this.currentSheetIdx, row, col);

    if (source !== 'internal') {
      this.afterChangeByUser(cell, oldValue, oldFormula);
    }
  }

  /**
   * Update a cell's data and render it.
   * Cell's value and formula will be overrode.
   * @param {number | null | undefined} sheetNo - null or undefined if uses current sheet number
   * @param {number} row
   * @param {number} col
   * @param {string} rawValue - can be any excel data type
   * @param {'internal'| 'edit'} source - 'internal' means internal update, i.e. formula updates
   *                                      'edit' means edit by the user
   */
  setDataAndRender(...params) {
    this.setData(...params);
    this.renderCurrentSheet();
  }

  /**
   * Should be called after every change to a cell by the user
   * @param cell
   * @param oldValue
   * @param oldFormula
   */
  afterChangeByUser(cell, oldValue, oldFormula) {
    const row = cell.rowNumber() - 1, col = cell.columnNumber() - 1;

    // if the old cell contains formula, we remove the formula dependencies in our calculation chain.
    if (typeof oldFormula === 'string') {
      this.calculationChain.removeCell(this.currentSheetIdx, row, col, oldFormula);
    }

    // if the new cell contains formula, we update the formula dependency in our calculation chain.
    if (typeof cell.formula() === 'string') {
      this.calculationChain.addCell(this.currentSheetIdx, row, col, cell.formula());
    }

    // request recalculation for formulas if cell value changes
    if (cell.value() !== oldValue) {
      this.calculationChain.change(this.currentSheetIdx, row, col);
    }
  }

  getSheet(idx) {
    return this.global.sheets[idx];
  }

  getSheetByName(sheetName) {
    return this.getSheet(this.global.sheetNames.indexOf(sheetName))
  }

  switchSheet(sheetNameOrIndex) {
    if (typeof sheetNameOrIndex === 'string') {
      this.currentSheetName = sheetNameOrIndex;
      this.currentSheetIdx = this.global.sheetNames.indexOf(sheetNameOrIndex);
    } else if (typeof sheetNameOrIndex === 'number') {
      this.currentSheetName = this.global.sheetNames[sheetNameOrIndex];
      this.currentSheetIdx = sheetNameOrIndex;
    }
    this.parser.changeCurrSheetName(this.currentSheetName);
  }

  addSheet = () => {
    // generate new name
    let newSheetNumber = this.global.sheetNames.length + 1;
    for (let i = 0; i < this.global.sheetNames.length; i++) {
      const name = this.global.sheetNames[i];
      const match = name.match(/^Sheet(\d+)$/);
      if (match) {
        if (newSheetNumber <= match[1]) {
          newSheetNumber++;
        }
      }
    }
    const newSheetName = 'Sheet' + newSheetNumber;
    const newSheet = Object.assign(defaultSheet(), {name: newSheetName});
    this.global.sheets.push(newSheet);
    this.global.sheetNames.push(newSheetName);
    this.workbook.addSheet(newSheetName);
    this.switchSheet(newSheetName);
  };


  componentDidMount() {
    const sheetWidth = this.sheetContainerRef.current.offsetWidth;
    const sheetHeight = this.sheetContainerRef.current.offsetHeight;
    // create local workbook storage
    this.workbookManager.createWorkbookLocal()
      .then(workbook => {
        this.workbook = workbook;
        this.setState({
          sheetWidth,
          sheetHeight,
          loadingMessage: '', loaded: true
        });
      });

    //
    // excelWorker.postMessage(1);
    // excelWorker.onmessage = function (event) {console.log(event.data)};
  }

  renderCell(row, col) {
    const renderer = this.renderer.cellRendererNG;
    const cellProperties = this.hotInstance.getCellMeta(row, col);
    let cellElement;
    // in test mode, handsontable is unable to get views.
    try {
      cellElement = this.hotInstance.getCell(row, col);
    } catch (e) {
    }
    // this cell is not rendered into the dom.
    if (!cellElement) return;

    renderer(this.hotInstance, cellElement, row, col, null, null, cellProperties);
  }

  renderCurrentSheet() {
    const changes = this.renderer.changes;
    for (let sheetId in changes) {
      if (!changes.hasOwnProperty(sheetId)) continue;
      const rows = changes[sheetId];
      // go through rows
      for (let rowNumber in rows) {
        if (!rows.hasOwnProperty(rowNumber)) continue;
        const row = rows[rowNumber];
        // go through cell
        for (let colNumber in row) {
          if (!row.hasOwnProperty(colNumber)) continue;
          if (row[colNumber]) {
            this.renderCell(parseInt(rowNumber), parseInt(colNumber));
            this.renderer.cellUpdated(sheetId, rowNumber, colNumber);
          }
        }
      }
    }
    // this.sheetRef.current.hotInstance.render();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.loaded && this.sheetRef) {
      this.hooks.forEach(hook => {
        if (!this.hotInstance.hasHook(hook.name))
          this.hotInstance.addHook(hook.name, hook.f);
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state.sheetWidth !== nextState.sheetWidth
      || this.state.sheetHeight !== nextState.sheetHeight
      || this.state.loadingMessage !== nextState.loadingMessage
      || this.state.loaded !== nextState.loaded
      || this.state.currentSheetIdx !== nextState.currentSheetIdx
  }

  render() {
    console.log('render create excel')
    if (!this.isLoaded) {
      return (
        <div className="animated fadeIn" style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 50px)'}}
             ref={this.sheetContainerRef}>
          <h3>{this.state.loadingMessage}</h3><br/>

          <LinearProgress variant="determinate" value={this.state.completed}/>
        </div>
      );
    } else {
      return (
        <div className="animated fadeIn">
          <Card xs={12}>
            {this.state.loadingMessage}
            <ExcelToolBar context={this}/>
            <FormulaBar context={this}/>
            <Worksheets context={this}/>
            <ExcelBottomBar context={this}/>
          </Card>
        </div>
      );
    }
  }
}

Excel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Excel);
