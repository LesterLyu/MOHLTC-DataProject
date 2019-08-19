import React, {Component} from 'react';
import {Card} from "@material-ui/core";

import {
  init, getCellType, generateNewSheetName, indexOfBySheetName,
  getSheetNames, hooks
} from './utils';

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

class Excel extends Component {

  constructor(props) {
    super(props);
    this.mode = props.params.mode;
    this.packageName = this.props.match.params.packageName;
    console.log('mode:', props.params.mode);
    // TODO: disable some cell editing for user (formula editing...)
    window.excel = this;
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
        const result = await navigator.permissions.query({name: "clipboard-read"});
        console.log('clipboard ' + result.state);

        // console.log(await navigator.clipboard.read())
        this.setState({contextMenu: null})
      },
    };

    // request permission

    // add hooks
    hooks.add("afterSelection", (row, col, row2, col2, startRow, startCol) => {
      if (row !== row2 && col !== col2) {
        this.sheet.activeCell(this.sheet.range(row, col, row2, col2));
      } else {
        this.sheet.activeCell(startRow, startCol);
      }
    });
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

  get sheetNames() {
    return getSheetNames(this.workbook);
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
      return true;
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
      return false;
    }
    // check if it is formula now
    if (isFormula) {
      updates = cell.setFormula(formula);
    } else {
      updates = cell.setValue(rawValue);
    }
    console.log(`Updated ${updates.length + 1} cells.`);
    return true;
  };

  /**
   * Save as setData() but calls renderCurrentSheet().
   * @param params
   */
  setDataAndRender(...params) {
    this.setData(...params);
    this.renderCurrentSheet();
  }

  switchSheet(sheetNameOrIndex) {
    if (typeof sheetNameOrIndex === 'string') {
      this.currentSheetIdx = indexOfBySheetName(this.workbook, sheetNameOrIndex);
    } else if (typeof sheetNameOrIndex === 'number') {
      this.currentSheetIdx = sheetNameOrIndex;
    }
  }

  addSheet = async () => {
    const newSheetName = generateNewSheetName(this.workbook);
    const sheet = await this.workbook.addSheet(newSheetName);
    sheet.row(200).cell(26).setValue('');
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
    const success = this.setData(this.currentSheetIdx, dropdownCell.rowNumber() - 1, dropdownCell.columnNumber() - 1, selected.value);
    if (success) {
      this.handleCloseDropdown();
      this.renderCurrentSheet();
    } else {
      this.showDataValidationDialog();
    }
  };

  handleCloseDropdown = () => {
    this.setState({openDropdown: null, dropdownCell: null});
  };

  showEditor = (rowIndex, columnIndex, style, typed) => {
    const cell = this.sheet.getCell(rowIndex, columnIndex);
    const panes = cell.sheet().panes();
    let freezeRowCount = 0, freezeColumnCount = 0,
      top = this.outerRef.current.offsetTop - this.sheetContainerRef.current.state.scrollTop + style.top,
      left = this.outerRef.current.offsetLeft - this.sheetContainerRef.current.state.scrollLeft + style.left;
    if (panes && panes.state === 'frozen') {
      // fix positions.
      freezeRowCount = panes.ySplit;
      freezeColumnCount = panes.xSplit;

      if (rowIndex <= freezeRowCount && columnIndex <= freezeColumnCount) {
        // top-left
        left += this.sheetContainerRef.current.state.scrollLeft;
        top += this.sheetContainerRef.current.state.scrollTop;
      } else if (rowIndex <= freezeRowCount && columnIndex > freezeColumnCount) {
        // top-right
        top += this.sheetContainerRef.current.state.scrollTop;
      } else if (rowIndex > freezeRowCount && columnIndex <= freezeColumnCount) {
        // bottom-left
        top += parseFloat(this.outerRef.current.previousSibling.style.height);
        left += this.sheetContainerRef.current.state.scrollLeft;
      }
    }

    this.editor.prepare(cell, style, typed);
    this.setState({
      openEditor: {top, left}, editorCell: cell
    });
  };

  handleCloseEditor = input => {
    /**
     * @type {Cell|undefined}
     */
    const cell = this.state.editorCell;
    const success = this.setData(this.currentSheetIdx, cell.rowNumber() - 1, cell.columnNumber() - 1, input);

    if (success) {
      this.setState({openEditor: null, editorCell: null});
      this.renderCurrentSheet();
    } else {
      this.showDataValidationDialog();
    }
  };

  showDataValidationDialog = () => {
    this.setState({openDataValidationDialog: true});
  };

  handleCloseDataValidationDialog = () => {
    this.handleCloseDropdown();
    this.setState({openDataValidationDialog: false, openEditor: null, editorCell: null});
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
          const {workbook, fileName} = data;
          this.workbook = workbook;
          this.setState({
            fileName,
            currentSheetIdx: 0,
            sheetWidth,
            sheetHeight,
            loadingMessage: '', loaded: true
          });
        })
    } else if (this.mode === 'user') {
      const {name, packageName} = this.props.match.params;
      this.excelManager.readWorkbookFromDatabase(name, packageName, false)
        .then(data => {
          if (!data) return;
          const {workbook, fileName} = data;
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
    const height = this.mode === 'user' ? 'calc(100vh - 55px - 45.8px - 50px - 100px)'
      : 'calc(100vh - 55px - 45.8px - 50px - 35px - 50px - 58px)';
    if (!this.isLoaded) {
      return (
        <div style={{height}}
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
    } else if (this.mode === 'user') {
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

export default Excel;
