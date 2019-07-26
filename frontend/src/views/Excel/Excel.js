import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {
  Card,
  LinearProgress,
} from "@material-ui/core";

import helpers, {
  init, generateTableData, generateTableStyle, createArray, getCellType, hooks
} from './helpers';

import './style.css';
import ExcelManager from "../../controller/excelManager";
import AttCatManager from "../../controller/attCatManager";
import Sheets from './components/Sheets'
import ExcelAppBar from './components/ExcelAppBar';
import ExcelToolBar from './components/ExcelToolBar';
import ExcelToolBarUser from './components/ExcelToolBarUser';
import ExcelBottomBar from './components/ExcelBottomBar';
import FormulaBar from "./components/FormulaBar";
import SetIdDialog from "./components/SetIdDialog";
import Dropdown from './components/Dropdown';
import DataValidationDialog from './components/DataValidationDialog';
import CellEditor from './components/Editor';
import Loading from "../components/Loading";
import RightClickMenu from "./components/RightClickMenu";

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

class Excel extends Component {

  constructor(props) {
    super(props);
    this.mode = props.params.mode;
    console.log('mode:', props.params.mode);
    // TODO: disable some cell editing for user (formula editing...)
    window.excel = this;
    window.helpers = helpers;
    this.state = {
      completed: 5,
      sheetHeight: 0,
      sheetWidth: 0,
      loadingMessage: 'Loading Workbook...',
      loaded: false,
      currentSheetIdx: 0,
      openSetId: null,
      openDropdown: null,
      openDataValidationDialog: false,
      openEditor: null,
      dropdownCell: null,
      setIdCell: null,
      editorCell: null,
      fileName: 'Untitled workbook',
      contextMenu: null,
    };
    this.global = {
      sheetNames: ['Sheet1'],
      sheets: [
        defaultSheet(),
      ],
      current: {}
    };
    this.initialFileName = 'Untitled workbook'; // uploaded file name
    this.excelManager = new ExcelManager(props);
    this.attCatManager = new AttCatManager(props);

    init(this); // init helper functions
    this.sheetContainerRef = React.createRef();
    this.sheetRef = React.createRef();
    this.editorRef = React.createRef();

    // set ID dialog
    this.attOptions = [];
    this.catOptions = [];

    // error dialog
    this.errorDialog = {};

    // right click menu
    this.menu = {
      'Set ID': (anchorEl) => {
        console.log('SET ID');
        this.setId(anchorEl);
      },
      'div1': null,
      'Copy \t\t\t Ctrl+C': () => {
        this.setState({contextMenu: null})
      },
      'Paste \t\t\t Ctrl+V': async () => {
        const result = await navigator.permissions.query({name: "clipboard-read"})
        console.log('clipboard ' + result.state);

        // console.log(await navigator.clipboard.read())
        this.setState({contextMenu: null})
      },
    }

    // request permission

  }

  get editor() {
    return this.editorRef.current;
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
   * @return {*[]}
   */
  get selected() {
    return this.sheetRef.current.selections.data;
  }

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
   */
  setData(sheetNo, row, col, rawValue) {
    sheetNo = sheetNo == null ? this.currentSheetIdx : sheetNo;
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

  setId = (anchorEl) => {
    const cell = this.selected;
    this.setState({contextMenu: null, openSetId: anchorEl, setIdCell: cell});
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
    this.handleCloseDropdown();
  };

  handleCloseDropdown = () => {
    this.setState({openDropdown: null, dropdownCell: null});
  };

  showEditor = (rowIndex, columnIndex, style, typed) => {
    const cell = this.sheet.getCell(rowIndex, columnIndex);
    this.editor.prepare(cell, style, typed);
    this.setState({
      openEditor: {
        top: this.outerRef.current.offsetTop + style.top,
        left: this.outerRef.current.offsetLeft + style.left,
      }, editorCell: cell
    });
  };

  handleCloseEditor = input => {
    /**
     * @type {Cell|undefined}
     */
    const cell = this.state.editorCell;
    this.setData(this.currentSheetIdx, cell.rowNumber() - 1, cell.columnNumber() - 1, input);
    this.sheetContainerRef.current.resetAfterIndices({columnIndex: 0, rowIndex: 0});
    this.setState({openEditor: null, editorCell: null});
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

  /**
   * Right click menu
   * @param row
   * @param col
   * @param cellStyle
   * @param e
   */
  onContextMenu = (row, col, cellStyle, e) => {
    e.preventDefault();
    const selections = this.sheetRef.current.selections;
    const contain = selections.contains(row, col);
    if (!contain) {
      selections.setSelections([row, col, row, col])
    }
    this.setState({contextMenu: {selections, top: e.clientY, left: e.clientX, anchorEl: e.target}})
  };

  componentDidMount() {
    const sheetWidth = this.sheetContainerRef.current.offsetWidth;
    const sheetHeight = this.sheetContainerRef.current.offsetHeight;

    this.attCatManager.get(true).then(atts => this.attOptions = atts);
    this.attCatManager.get(false).then(cats => this.catOptions = cats);

    if (this.mode === 'admin create') {
      // create local workbook storage
      this.excelManager.createWorkbookLocal()
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
      this.excelManager.readWorkbookFromDatabase(name)
        .then(data => {
          if (!data) return;
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
      this.excelManager.readWorkbookFromDatabase(name, false)
        .then(data => {
          if (!data) return;
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

  renderCurrentSheet() {
    this.sheetContainerRef.current.resetAfterIndices({columnIndex: 0, rowIndex: 0});
  }

  onFileNameChange = (event) => {
    this.setState({fileName: event.target.value})
  };

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
      || this.state.openEditor !== nextState.openEditor
      || this.state.contextMenu !== nextState.contextMenu
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
        <CellEditor
          ref={this.editorRef}
          config={this.state.openEditor}
          cell={this.state.editorCell}
          handleClose={this.handleCloseEditor}
        />
        <DataValidationDialog
          open={this.state.openDataValidationDialog}
          errorMessage={this.errorDialog.errorMessage}
          errorTitle={this.errorDialog.errorTitle}
          errorStyle={this.errorDialog.errorStyle}
          handleRetry={this.handleRetryDataValidationDialog}
          handleClose={this.handleCloseDataValidationDialog}
        />
        <RightClickMenu
          handleClose={() => this.setState({contextMenu: null})}
          config={this.state.contextMenu}
          items={this.menu}
        />
      </>
    )
  }

  render() {
    console.log('render create excel');
    if (!this.isLoaded) {
      return (
        <div style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 50px - 58px)'}}
             ref={this.sheetContainerRef}>
          <Loading message={this.state.loadingMessage}/>
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
            <Sheets ref={this.sheetRef} context={this} sheetIdx={this.currentSheetIdx}/>
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
            <Sheets ref={this.sheetRef} context={this}/>
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
