import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'handsontable/dist/handsontable.full.css';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Card, LinearProgress} from "@material-ui/core";

import {init, unzip, preProcess, argbToRgb, Parser, CalculationChain} from './helpers';
import Renderer from './renderer';
import Editor from './editor';
import tinycolor from 'tinycolor2';
import './style.css';
import WorkbookManager from "../../controller/workbookManager";
import Worksheet from './components/Worksheet'

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  tabRoot: {
    minHeight: '30px',
    textTransform: 'initial',
    padding: '0',
    fontFamily: 'inherit',
    fontSize: '0.8125rem',
    minWidth: 72,
    // background: '#ffffff',
    '&:hover': {
      color: '#33c2ff',
      opacity: 1,
    },
    '&:focus': {
      color: '#40a9ff',
    },
  },
  tabSelected: {
    // background: '#1890ff1f',
    color: '#1890ff',
  },
  labelContainer: {
    // padding: '6px 12px',
    width: '100%',
    boxSizing: 'border-box'
  },
  tabsRoot: {
    minHeight: '30px'
    // borderBottom: '1px solid #e8e8e8',
  },
  indicator: {
    height: '35px',
    backgroundColor: 'rgba(24, 144, 255, 0.15)',
  },
  scrollButtons: {
    width: 20,
  },

});


class Excel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      completed: 5,
      sheetHeight: 0,
      sheetWidth: 0,
      loadingMessage: 'Loading...',
      loaded: false,
      global: {
        sheetNames: [],
        workbookData: {},
        currentSheetIdx: 0,
      }
    };

    this.workbookManager = new WorkbookManager(props);

    this.parser = new Parser(this);
    this.calculationChain = new CalculationChain(this);
    this.renderer = new Renderer(this);
    this.editor = new Editor(this);
    this.currentSheetName = null; // for calculation
    init(this); // init helper functions
    this.sheetContainerRef = React.createRef();
    this.sheetRef = React.createRef();

    window.excel = this;

  }

  get isLoaded() {
    return this.state.loaded;
  }

  get currentSheet() {
    return this.state.global.workbookData.sheets[this.state.global.currentSheetIdx];
  }

  get currDisplaySheetName() {
    return this.state.global.sheetNames[this.state.global.currentSheetIdx];
  }

  get currentSheetIdx() {
    return this.state.global.currentSheetIdx;
  }

  set currentSheetIdx(currentSheetIdx) {
    this.setState({global: Object.assign(this.state.global, {currentSheetIdx})})
  }

  switchSheet(sheetName) {
    this.currentSheetIdx = this.state.global.sheetNames.indexOf(sheetName);
  }

  getDefinedName(definedName) {
    const definedNames = this.state.global.definedNames;
    if (!(definedName in definedNames)) {
      console.error('Cannot find defined name: ' + definedName);
      return;
    }
    const currName = definedNames[definedName];
    let result = [];
    for (let i = 0; i < currName.length; i++) {
      const cell = this.getSheetByName(currName[i].sheetName).data[currName[i].row - 1][currName[i].col - 1];
      if (cell === null) {
      }
      else if (typeof cell === 'object' && 'result' in cell) {
        result.push(cell.result);
      }
      else {
        result.push(cell);
      }
    }
    return result;
  }

  getDataAtSheetAndCell(row, col, sheetNo, sheetName) {
    const global = this.state.global;
    if (sheetNo !== null) {
      return global.workbookData.sheets[sheetNo].data[row][col];
    }
    else if (sheetName !== null) {
      return global.workbookData.sheets[global.sheetNames.indexOf(sheetName)].data[row][col];
    }
    else {
      console.error('At least one of sheetNo or sheetName should be provides.')
    }
  }

  setDataAtSheetAndCell(row, col, val, sheetNo, sheetName) {
    // console.log('setdata', row, col, val, sheetNo, sheetName);
    const global = this.state.global;
    if (sheetNo !== null) {
      global.workbookData.sheets[sheetNo].data[row][col] = val;
    }
    else if (sheetName !== null) {
      global.workbookData.sheets[this.sheetNames.indexOf(sheetName)].data[row][col] = val;
    }
    else {
      console.error('At least one of sheetNo or sheetName should be provides.');
    }
  }

  getSheet(idx) {
    return this.state.global.workbookData.sheets[idx];
  }

  getSheetByName(sheetName) {
    return this.getSheet(this.state.global.sheetNames.indexOf(sheetName))
  }

  handleChange = (event, value) => {
    this.currentSheetName = this.state.global.sheetNames[value];
    this.setState({global: Object.assign(this.state.global, {currentSheetIdx: value})});
  };

  workbookTabs() {
    const {classes} = this.props;
    const sheetNames = this.state.global.sheetNames;
    const tabs = [];
    for (let i = 0; i < sheetNames.length; i++) {

      const rgb = tinycolor(argbToRgb(this.getSheet(i).tabColor) || 'f5f5f5');

      tabs.push(<Tab
        classes={{root: classes.tabRoot, selected: classes.tabSelected, labelContainer: classes.labelContainer}}
        style={{borderBottom: '3px solid ' + rgb}}
        // className={this.props.classes.tab}
        key={sheetNames[i]}
        label={sheetNames[i]}/>)
    }
    return tabs;
  }

  worksheets() {
    const SCALE = 7; // scale up the column width and row height
    const sheets = this.state.global.workbookData.sheets;
    const {currentSheetIdx} = this.state.global;
    const list = [];

    for (let idx = 0; idx < Object.keys(sheets).length; idx++) {
      const sheetNo = Object.keys(sheets)[idx];
      const sheet = sheets[sheetNo];
      // calculate width and height
      const rowHeights = sheet.row.height.map(function (x) {
        const height = Math.round(x * SCALE / 5.5385);
        return height > 23 ? height : 23;
      });
      const colWidths = sheet.col.width.map(function (x) {
        return Math.round(x * SCALE);
      });
      // check frozen view
      let fixedRowsTop = 0, fixedColumnsLeft = 0;
      if (sheet.views && sheet.views[0].state === 'frozen') {
        fixedRowsTop = sheet.views[0].ySplit;
        fixedColumnsLeft = sheet.views[0].xSplit;
      }

      const settings = {
        rowHeights: rowHeights,
        colWidths: colWidths,
        mergeCells: sheets[sheetNo].merges,
        fixedRowsTop,
        fixedColumnsLeft,
        data: sheets[sheetNo].data,
        width: this.state.sheetWidth,
        height: this.state.sheetHeight,
      };

      list.push(<Worksheet
        settings={settings}
        renderer={this.renderer.cellRenderer}
        editor={this.editor.FormulaEditor}
        key={idx} id={'worksheet-' + sheetNo}
        hide={currentSheetIdx !== parseInt(sheetNo)}
        global={this.state.global}
        context={this}
        forwardedRef={this.sheetRef}/>
      )
    }
    return list;
  }

  _enableHiddenRow() {
    // enable hidden row that does not have frozen view.
    const global = this.state.global;
    if (this.isLoaded) {
      const extra = global.workbookData.sheets[this.state.global.currentSheetIdx];
      const trs = document.querySelector('#worksheet-' + this.state.global.currentSheetIdx + ' .ht_clone_left .htCore tbody').children;
      for (let i = 0; i < extra.row.hidden.length; i++) {
        const row = extra.row.hidden[i];
        if (trs && trs[row]) {
          trs[row].style.display = 'none';
        }
      }
    }
  }

  componentDidMount() {
    this.setState({
      sheetWidth: this.sheetContainerRef.current.offsetWidth,
      sheetHeight: this.sheetContainerRef.current.offsetHeight
    });
    this.setState({loadingMessage: 'Downloading...', completed: 5});

    this.workbookManager.getWorkbook(this.props.match.params.name)
      .then(response => {
        if (!response) {
          return;
        }
        this.setState((prevState) => {
          return {loadingMessage: 'Unzipping...', completed: 40}
        });

        console.log(response.data);
        let rawExtra, rawData;
        setTimeout(() => {
          // unzip extra
          rawExtra = unzip(response.data.workbook.extra);
          rawData = response.data.workbook.data;
        }, 1);

        this.setState({loadingMessage: 'Processing...', completed: 70});

        // process
        setTimeout(() => {
          const global = preProcess(rawData, rawExtra);
          console.log(global)
          this.setState({global: Object.assign(this.state.global, global), loadingMessage: '', loaded: true});
        }, 2)
      });

    window.addEventListener('resize', () => {
      if (this.sheetContainerRef.current) {
        this.setState({
          sheetWidth: this.sheetContainerRef.current.offsetWidth,
          sheetHeight: this.sheetContainerRef.current.offsetHeight
        })
      }
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._enableHiddenRow();
  }

  render() {
    const {classes} = this.props;
    const {currentSheetIdx} = this.state.global;
    if (!this.isLoaded) {
      return (
        <div className="animated fadeIn" style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 25px)'}}
             ref={this.sheetContainerRef}>
          <h3>{this.state.loadingMessage}</h3><br/>

          <LinearProgress variant="determinate" value={this.state.completed}/>
        </div>
      );
    }
    else {
      return (
        <div className="animated fadeIn">
          <Card xs={12}>
            {this.state.loadingMessage}
            <div style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 25px)'}} ref={this.sheetContainerRef}>
              {this.worksheets()}
            </div>

            <div className={classes.root}>

              <AppBar position="static" color="default">
                <Tabs
                  classes={{root: classes.tabsRoot, indicator: classes.indicator, scrollButtons: classes.scrollButtons}}
                  value={currentSheetIdx}
                  onChange={this.handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {this.workbookTabs()}

                </Tabs>
              </AppBar>


            </div>
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
