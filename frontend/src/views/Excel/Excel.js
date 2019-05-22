import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {
  Card,
  LinearProgress,
} from "@material-ui/core";

import {
  init, generateTableData, generateTableStyle, createArray, colCache, getCellType,
} from './helpers';

import Renderer from './renderer';
import Editor from './editor';
import './style.css';
import WorkbookManager from "../../controller/workbookManager";
import Sheets from './components/Sheets'
import ExcelAppBar from './components/ExcelAppBar';
import ExcelToolBar from './components/ExcelToolBar';
import ExcelToolBarUser from './components/ExcelToolBarUser';
import ExcelBottomBar from './components/ExcelBottomBar';
import FormulaBar from "./components/FormulaBar";
import SetIdDialog from "./components/SetIdDialog";
import Dropdown from './components/Dropdown';
import DataValidationDialog from './components/DataValidationDialog';
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
    this.mode = props.params.mode;
    console.log('mode:', props.params.mode);
    // TODO: disable some cell editing for user (formula editing...)
    window.excel = this;
    this.state = {
      completed: 5,
      sheetHeight: 0,
      sheetWidth: 0,
      loadingMessage: 'Loading...',
      loaded: false,
      currentSheetIdx: 0,
      openSetId: null,
      openDropdown: null,
      openDataValidationDialog: false,
      dropdownCell: null,
      setIdCell: null,
      fileName: 'Untitled workbook'
    };
    this.global = {
      sheetNames: ['Sheet1'],
      sheets: [
        defaultSheet(),
      ],
      current: {}
    };
    this.initialFileName = null; // uploaded file name
    this.workbookManager = new WorkbookManager(props);

    this.renderer = new Renderer(this);
    this.editor = new Editor(this);
    init(this); // init helper functions
    this.sheetContainerRef = React.createRef();
    this.sheetRef = React.createRef();
    this.hooks = [];

    // set ID dialog
    this.attOptions = [];
    this.catOptions = [];

    // error dialog
    this.errorDialog = {};
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
    if (currentSheetIdx === -1) {
      this.props.showMessage('Reference does not exist.', 'warning');
      return;
    }
    this.setState({currentSheetIdx})
  }

  /**
   * @return {Handsontable}
   */
  get hotInstance() {
    return this.sheetRef.current ? this.sheetRef.current.hotInstance : null;
  }

  /**
   * @return {{cell: Cell, td: HTMLElement}}
   */
  get selected() {
    const selected = this.hotInstance.getSelected();
    return {
      cell: this.sheet.getCell(selected[0][0] + 1, selected[0][1] + 1),
      td: this.hotInstance.getCell(selected[0][0], selected[0][1])
    };
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

    const cell = this.workbook.sheet(sheetNo).getCell(row + 1, col + 1);
    return cell == null ? undefined : cell.getValue();
  }

  getCell(sheetNo, row, col) {
    if (sheetNo === undefined) console.error('getCell: sheetNo should be provides.');
    return this.workbook.sheet(sheetNo).getCell(row + 1, col + 1);
  }

  /**
   * Update a cell's data without render it.
   * Cell's value and formula will be overrode.
   * @param {number | null | undefined} sheetNo - null or undefined if uses current sheet number
   * @param {number} row
   * @param {number} col
   * @param {string|number} rawValue - can be any excel data type
   * @param {'internal'| 'edit'} [source] - 'internal' means internal update, i.e. formula updates
   *                                      'edit' means edit by the user
   */
  setData(sheetNo, row, col, rawValue, source) {
    sheetNo = sheetNo === null || sheetNo === undefined ? this.currentSheetIdx : sheetNo;
    const sheet = this.workbook.sheet(sheetNo);
    const cell = sheet.getCell(row + 1, col + 1);
    let updates;

    // I don't want you to update rich text.
    if (getCellType(cell) === 'richtext') {
      console.warn('setData: An update to rich text has been blocked.');
      return;
    }
    const isFormula = typeof rawValue === 'string' && rawValue.charAt(0) === '=' && rawValue.length > 1;
    let formula;
    if (isFormula) formula = rawValue.slice(1);
    const validation = this.sheet._dataValidations.validate(cell, isFormula ? formula : rawValue, isFormula);
    if (!validation.result) {
      // validation failed
      this.errorDialog = {
        errorMessage: validation.dataValidation.error,
        errorTitle: validation.dataValidation.errorTitle,
        errorStyle: validation.dataValidation.errorStyle,
      };
      this.setState({openDataValidationDialog: true});
      return false;
    }
    // check if it is formula now
    if (isFormula) {
      updates = cell.setFormula(formula);
    } else {
      updates = cell.setValue(rawValue);
    }

    this.renderCell(row, col);
    // add to next render list
    updates.forEach(ref => {
      if (ref.sheet === this.currentSheetName) {
        this.renderCell(ref.row - 1, ref.col - 1);
      }
    });
    console.log(`Updated ${updates.length + 1} cells.`)
  };

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

  setId = () => {
    const {td, cell} = this.selected;
    console.log('td', td);
    this.setState({openSetId: td, setIdCell: cell});
  };

  handleSetId = (att = {}, cat = {}) => {
    console.log(`Set ID`, att, cat);
    const cell = this.state.setIdCell;
    const attCell = this.sheet.getCell(1, cell.columnNumber());
    const catCell = this.sheet.getCell(cell.rowNumber(), 1);
    if (attCell.getValue() !== att.value || attCell.getFormula() != null
      || catCell.getValue() !== cat.value || catCell.getFormula() != null) {
      this.props.showMessage('Content is overridden.', "info");
    }
    this.setData(null, 0, cell.columnNumber() - 1, att.value || '');
    this.setData(null, cell.rowNumber() - 1, 0, cat.value || '');
    this.setState({openSetId: null, setIdCell: null});
  };

  handleCloseSetId = () => {
    this.setState({openSetId: null, setIdCell: null});
  };

  /**
   * For data validation
   * @param event
   * @param cell
   */
  showDropdown = (event, cell) => {
    const td = event.target.parentNode.parentNode;
    this.setState({openDropdown: td, dropdownCell: cell});
  };

  handleChangeDropdown = selected => {
    /**
     * @type {Cell|undefined}
     */
    const dropdownCell = this.state.dropdownCell;
    this.setData(this.currentSheetIdx, dropdownCell.rowNumber() - 1, dropdownCell.columnNumber() - 1, selected.value);
    this.setState({openDropdown: null, dropdownCell: null});
  };

  handleCloseDropdown = () => {
    this.setState({openDropdown: null, dropdownCell: null});
  };

  showDataValidationDialog = () => {
    this.setState({openDataValidationDialog: true});
  };

  handleCloseDataValidationDialog = () => {
    this.setState({openDataValidationDialog: false});
  };

  handleRetryDataValidationDialog = () => {
    this.setState({openDataValidationDialog: false});
  };

  componentDidMount() {
    const sheetWidth = this.sheetContainerRef.current.offsetWidth;
    const sheetHeight = this.sheetContainerRef.current.offsetHeight;

    this.workbookManager.get('att').then(atts => this.attOptions = atts);
    this.workbookManager.get('cat').then(cats => this.catOptions = cats);

    if (this.mode === 'admin create') {
      // create local workbook storage
      this.workbookManager.createWorkbookLocal()
        .then(workbook => {
          this.currentSheetName = 'Sheet1';
          this.workbook = workbook;
          this.setState({
            sheetWidth,
            sheetHeight,
            loadingMessage: '', loaded: true
          });
        });
    } else if (this.mode === 'admin edit') {
      const {name} = this.props.match.params;
      this.workbookManager.readWorkbookFromDatabase(name)
        .then(data => {
          const {sheets, sheetNames, workbook, fileName} = data;
          this.global.sheetNames = sheetNames;
          this.global.sheets = sheets;
          this.workbook = workbook;
          this.setState({
            fileName,
            currentSheetIdx: 0,
            sheetWidth,
            sheetHeight,
            loadingMessage: '', loaded: true
          });
        })
    }
    if (this.mode === 'user edit') {
      const {name} = this.props.match.params;
      this.workbookManager.readWorkbookFromDatabase(name, false)
        .then(data => {
          const {sheets, sheetNames, workbook, fileName} = data;
          this.global.sheetNames = sheetNames;
          this.global.sheets = sheets;
          this.workbook = workbook;
          this.setState({
            fileName,
            currentSheetIdx: 0,
            sheetWidth,
            sheetHeight,
            loadingMessage: '', loaded: true
          });
        })
    }
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

  onFileNameChange = (event) => {
    this.setState({fileName: event.target.value})
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.loaded && this.sheetRef) {
      this.hooks.forEach(hook => {
        // HandsonTable: adding the same hook twice is now silently ignored, no need to check if hook is added.
        // this.hotInstance.addHook(hook.name, hook.f);
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state.sheetWidth !== nextState.sheetWidth
      || this.state.sheetHeight !== nextState.sheetHeight
      || this.state.loadingMessage !== nextState.loadingMessage
      || this.state.loaded !== nextState.loaded
      || this.state.currentSheetIdx !== nextState.currentSheetIdx
      || this.state.openSetId !== nextState.openSetId
      || this.state.openDropdown !== nextState.openDropdown
      || this.state.fileName !== nextState.fileName
      || this.state.openDataValidationDialog !== nextState.openDataValidationDialog
  }

  common() {
    return (
      <>
        <Dropdown
          anchorEl={this.state.openDropdown}
          cell={this.state.dropdownCell}
          handleClose={this.handleCloseDropdown}
          handleChange={this.handleChangeDropdown}
        />
        <DataValidationDialog
          open={this.state.openDataValidationDialog}
          errorMessage={this.errorDialog.errorMessage}
          errorTitle={this.errorDialog.errorTitle}
          errorStyle={this.errorDialog.errorStyle}
          handleRetry={this.handleRetryDataValidationDialog}
          handleClose={this.handleCloseDataValidationDialog}
        />
      </>
    )
  }

  render() {
    console.log('render create excel');
    if (!this.isLoaded) {
      return (
        <div className="animated fadeIn" style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 50px - 58px)'}}
             ref={this.sheetContainerRef}>
          <h3>{this.state.loadingMessage}</h3><br/>

          <LinearProgress variant="indeterminate"/>
        </div>
      );
    } else if (this.mode === 'admin create' || this.mode === 'admin edit') {
      return (
        <div className="animated fadeIn">
          <Card xs={12}>
            {this.state.loadingMessage}
            <ExcelAppBar fileName={this.state.fileName} onFileNameChange={this.onFileNameChange} context={this}/>
            <ExcelToolBar context={this}/>
            <FormulaBar context={this}/>
            <Sheets context={this} sheetIdx={this.currentSheetIdx}/>
            <ExcelBottomBar context={this}/>
          </Card>
          <SetIdDialog
            anchorEl={this.state.openSetId}
            cell={this.state.setIdCell}
            catOptions={this.catOptions}
            attOptions={this.attOptions}
            handleSetId={this.handleSetId}
            handleClose={this.handleCloseSetId}
          />
          {this.common()}
        </div>
      );
    } else if (this.mode === 'user edit') {
      return (
        <div className="animated fadeIn">
          <Card xs={12}>
            <ExcelAppBar fileName={this.state.fileName} onFileNameChange={this.onFileNameChange} context={this}/>
            <ExcelToolBarUser context={this}/>
            <Sheets context={this}/>
            <ExcelBottomBar context={this}/>
          </Card>
          {this.common()}
        </div>)
    }
  }
}

Excel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Excel);
