import React, {Component} from "react";
import {
  AppBar,
  Button,
  Grid,
  withStyles,
} from "@material-ui/core";
import {
  SaveAlt, CloudUploadOutlined, Save,
} from "@material-ui/icons";
import PropTypes from "prop-types";


export function ToolBarDivider() {
  return <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>;
}

const styles = theme => ({
  button: {
    minWidth: 40,
  }
});

class ExcelToolBar extends Component {

  constructor(props) {
    super(props);
    this.excel = props.context;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state !== nextState;
  }

  get hotInstance() {
    return this.excel.hotInstance;
  }

  downloadWorkbook = () => {
    this.excel.excelManager.downloadWorkbook(this.excel.workbook, this.excel.state.fileName)
      .then(() => {
        console.log('downloaded')
      })
  };

  uploadWorkbook = () => {
    // TODO: validate uploaded workbook
    this.excel.excelManager.readWorkbookLocal((workbook) => {
      this.excel.workbook = workbook;
      this.excel.currentSheetIdx = 0;
      this.excel.forceUpdate();
      this.excel.renderCurrentSheet();
    })
  };

  saveWorkbook = () => {
    this.excel.excelManager.saveWorkbookUser(this.excel.workbook);
  };

  render() {
    const {classes} = this.props;

    return (
      <>
        <AppBar position="static" color="default" style={{}}>
          <Grid container className={classes.root}>
            <Button aria-label="Save" className={classes.button}
                    onClick={() => this.saveWorkbook()}>
              <Save fontSize="small"/>
            </Button>
            <ToolBarDivider/>
            <Button aria-label="Download" className={classes.button}
                    onClick={() => this.uploadWorkbook()}>
              <CloudUploadOutlined fontSize="small"/>
            </Button>
            <Button aria-label="Download" className={classes.button}
                    onClick={() => this.downloadWorkbook()}>
              <SaveAlt fontSize="small"/>
            </Button>
          </Grid>
        </AppBar>
      </>
    )
  }
}

ExcelToolBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ExcelToolBar);
