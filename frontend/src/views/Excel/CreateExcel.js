import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'handsontable/dist/handsontable.full.css';
import {withStyles} from '@material-ui/core/styles';
import {
  Card,
  LinearProgress,
} from "@material-ui/core";

import {init, generateTableData, generateTableStyle, createArray} from './helpers';
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
const excelWorker = new Worker('../../controller/excel.worker', { type: 'module' });

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
    // for calculation
    this.currentSheetName = 'Sheet1';
    this.parser = new Parser(this);
    this.calculationChain = new CalculationChain(this);
    // this.parser.changeCurrSheetName()

    this.workbookManager = new WorkbookManager(props);

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

  getDefinedName(definedName) {

  }

  getDataAtSheetAndCell(row, col, sheetNo, sheetName) {
    const global = this.global;
    if (sheetNo !== null) {
      const rowData = global.sheets[sheetNo].data[row];
      return rowData ? rowData[col] : null;
    } else if (sheetName !== null) {
      const rowData = global.sheets[global.sheetNames.indexOf(sheetName)].data[row];
      return rowData ? rowData[col] : null;
    } else {
      console.error('At least one of sheetNo or sheetName should be provides.')
    }
  }

  setDataAtSheetAndCell(row, col, val, sheetNo, sheetName) {
    const global = this.global;
    if (sheetNo !== null) {
      global.sheets[sheetNo].data[row][col] = val;
    } else if (sheetName !== null) {
      global.sheets[this.sheetNames.indexOf(sheetName)].data[row][col] = val;
    } else {
      console.error('At least one of sheetNo or sheetName should be provides.');
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
    this.setState({loadingMessage: '', loaded: true});
    this.workbookManager.createWorkbookLocal()
      .then(workbook => {
        this.workbook = workbook;
      });
    this.setState({
      sheetWidth: this.sheetContainerRef.current.offsetWidth,
      sheetHeight: this.sheetContainerRef.current.offsetHeight
    });

    excelWorker.postMessage(1);
    excelWorker.onmessage = function (event) {console.log(event.data)};
  }

  renderCurrentSheet() {
    this.sheetRef.current.hotInstance.render();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.loaded && this.sheetRef) {
      this.hooks.forEach(hook => {
        if (!this.hotInstance.hasHook(hook.name))
          this.hotInstance.addHook(hook.name, hook.f);
      });
    }
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
