import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'handsontable/dist/handsontable.full.css';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Card, LinearProgress, IconButton, Grid, Button, Toolbar} from "@material-ui/core";
import {
  Add as AddIcon,
} from '@material-ui/icons';

import {init, generateTableData, generateTableStyle, argbToRgb, Parser, CalculationChain, createArray} from './helpers';
import Renderer from './renderer';
import Editor from './editor';
import tinycolor from 'tinycolor2';
import './style.css';
import WorkbookManager from "../../controller/workbookManager";
import Worksheet from './components/Worksheet'
import ExcelToolBar from './components/ExcelToolBar';

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
    width: 25,
  },
  addSheetButton: {
    padding: 7,
  }
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
      currentSheetIdx: 0,
    };
    this.global = {
      sheetNames: ['Sheet1'],
      sheets: [
        defaultSheet(),
      ]
    };

    this.workbookManager = new WorkbookManager(props);

    this.parser = new Parser(this);
    this.calculationChain = new CalculationChain(this);
    this.renderer = new Renderer(this);
    this.editor = new Editor(this);
    this.currentSheetName = 'Sheet1'; // for calculation
    init(this); // init helper functions
    this.sheetContainerRef = React.createRef();
    this.sheetRef = React.createRef();

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

  get hotInstance() {
    return this.sheetRef.current ? this.sheetRef.current.hotInstance : null;
  }

  getDefinedName(definedName) {

  }

  getDataAtSheetAndCell(row, col, sheetNo, sheetName) {
    const global = this.global;
    if (sheetNo !== null) {
      return global.sheets[sheetNo].data[row][col];
    } else if (sheetName !== null) {
      return global.sheets[global.sheetNames.indexOf(sheetName)].data[row][col];
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

  switchSheet(sheetName) {
    this.currentSheetName = sheetName;
    this.currentSheetIdx = this.global.sheetNames.indexOf(sheetName);
  }

  handleChange = (event, value) => {
    this.currentSheetName = this.global.sheetNames[value];
    this.setState({currentSheetIdx: value});
  };

  workbookTabs() {
    const {classes} = this.props;
    const sheetNames = this.global.sheetNames;
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
    const sheets = this.global.sheets;
    const {currentSheetIdx} = this.state;
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
                const cell = this.workbook.sheet(this.currentSheetIdx).cell(row + 1, col + 1);
                if (newData == null || newData === '') {
                  cell.value(null);
                } else if (typeof newData === 'string' || typeof newData === 'number' || typeof newData === 'boolean') {
                  cell.value(newData);
                } else if (newData.formula) {
                  cell.value(newData.result);
                  cell.formula(newData.formula);
                }
              }
            }
          }
        },
        modifyRowHeight: (height, row) => {
          const rowHeights = this.currentSheet.rowHeights;
          if (rowHeights[row] !== height) {
            rowHeights[row] = height;
            setImmediate(() => {
              this.workbook.sheet(this.currentSheetIdx).row(row + 1).height(height * 0.6)
            });
          }
        },
        modifyColWidth: (width, col) => {
          const colWidths = this.currentSheet.colWidths;
          if (colWidths[col] !== width) {
            colWidths[col] = width;
            setImmediate(() => {
              this.workbook.sheet(this.currentSheetIdx).column(col + 1).width(width * 0.11)
            });
          }
        },
        afterMergeCells: (cellRange, mergeParent, auto) => {
          const mergeCells = this.currentSheet.mergeCells;
          // find mergeCell, if found, do nothing
          for (let i = 0; i < mergeCells.length; i++) {
            const mergeCell = mergeCells[i];
            if (mergeCell.row === cellRange.from.row && mergeCell.col === cellRange.from.col) {
              return;
            }
          }
          mergeCells.push(mergeParent);
          setImmediate(() => {
             this.workbook.sheet(this.currentSheetIdx).range(
              cellRange.from.row + 1, cellRange.from.col + 1, cellRange.to.row + 1, cellRange.to.col + 1
            ).merged(true);
          });
        },
        afterUnmergeCells: (cellRange, auto) => {
          const mergeCells = this.currentSheet.mergeCells;
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
            this.workbook.sheet(this.currentSheetIdx).range(
              mergeCell.row + 1, mergeCell.col + 1, mergeCell.row + mergeCell.rowspan, mergeCell.col + mergeCell.colspan
            ).merged(false);
          });
        },
      };
      console.log('container size: ', settings.width, settings.height)
      list.push(<Worksheet
        mode="admin"
        renderer={this.renderer.cellRendererForCreateExcel}
        editor={this.editor.FormulaEditor}
        key={idx} id={'worksheet-' + idx}
        hide={currentSheetIdx !== idx}
        global={this.global}
        context={this}
        forwardedRef={this.sheetRef}
        settings={settings}/>
      )
    }
    return list;
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
    this.setState({
      sheetWidth: this.sheetContainerRef.current.offsetWidth,
      sheetHeight: this.sheetContainerRef.current.offsetHeight
    });
    this.setState({loadingMessage: '', loaded: true});

    this.workbookManager.createWorkbookLocal()
      .then(workbook => {
        this.workbook = workbook;
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

  renderCurrentSheet() {
    this.sheetRef.current.hotInstance.render();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // this._enableHiddenRow();
  }

  render() {
    const {classes} = this.props;
    const {currentSheetIdx} = this.state;
    if (!this.isLoaded) {
      return (
        <div className="animated fadeIn" style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 25px)'}}
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
            <div style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 25px)'}} ref={this.sheetContainerRef}>
              {this.worksheets()}
            </div>
            <AppBar position="static" color="default">
              <Grid container className={classes.root}>
                <Grid item xs={"auto"} id="addSheetButton">
                  <IconButton aria-label="Add Sheet" className={classes.addSheetButton}
                              onClick={this.addSheet}>
                    <AddIcon fontSize="small"/>
                  </IconButton>
                </Grid>
                <Grid item xs={"auto"}>
                  <Tabs
                    classes={{
                      root: classes.tabsRoot,
                      indicator: classes.indicator,
                      scrollButtons: classes.scrollButtons
                    }}
                    value={currentSheetIdx}
                    onChange={this.handleChange}
                    variant="scrollable"
                    scrollButtons="auto">

                    {this.workbookTabs()}
                  </Tabs>

                </Grid>
              </Grid>
            </AppBar>
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
