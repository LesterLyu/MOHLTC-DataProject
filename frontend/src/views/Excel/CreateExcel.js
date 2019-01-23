import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'handsontable/dist/handsontable.full.css';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Tabs, Tab, Card, LinearProgress, IconButton, Grid} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';

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
  addSheetButton: {
    padding: '7px 7px 7px 7px'
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
      sheetNames: ['Sheet1', 'Sheet2'],
      sheets: [
        {
          merges: [],
          tabColor: undefined,
          data: [[1, 2, 3], [], [], [], [], []],
          name: 'Sheet1',
          state: 'visible',
          views: []
        },
        {
          merges: [],
          tabColor: undefined,
          data: [[]],
          name: 'Sheet2',
          state: 'visible',
          views: []
        }
      ]
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

  switchSheet(sheetName) {
    this.currentSheetIdx = this.state.sheetNames.indexOf(sheetName);
  }

  getDefinedName(definedName) {

  }

  getDataAtSheetAndCell(row, col, sheetNo, sheetName) {

  }

  setDataAtSheetAndCell(row, col, val, sheetNo, sheetName) {

  }

  getSheet(idx) {
    return this.global.sheets[idx];
  }

  getSheetByName(sheetName) {
    return this.getSheet(this.global.sheetNames.indexOf(sheetName))
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
        data: sheet.data,
      };
      list.push(<Worksheet
        mode="admin"
        width={this.state.sheetWidth}
        height={this.state.sheetHeight}
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
            <div style={{height: 'calc(100vh - 55px - 45.8px - 50px - 35px - 25px)'}} ref={this.sheetContainerRef}>
              {this.worksheets()}
            </div>
            <AppBar position="static" color="default">
              <Grid container className={classes.root}>
                <Grid item xs={"auto"} id="addSheetButton" >
                  <IconButton aria-label="Add Sheet" className={classes.addSheetButton} onClick={() => console.log('1')}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item xs={"auto"}>
                  <Tabs
                    classes={{root: classes.tabsRoot, indicator: classes.indicator, scrollButtons: classes.scrollButtons}}
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
