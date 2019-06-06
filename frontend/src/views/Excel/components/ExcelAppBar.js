import React, {Component} from "react";
import {
  AppBar,
  InputBase,
  Button,
  Grid,
  withStyles,
} from "@material-ui/core";
import PropTypes from "prop-types";
import {FileTableOutline} from "mdi-material-ui";


export function ToolBarDivider() {
  return <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>;
}

const styles = theme => ({
  input: {
    color: '#808080',
    margin: 2,
    padding: 2,
    paddingLeft: 10,
    border: '2px solid #fff0',
    borderRadius: 3,
    '&:hover': {
      border: '2px solid #dedede',
    },
    '&:focus': {
      color: '#000',
      border: '2px solid #87bbff',
    }
  },
  icon: {
    color: '#22a463',
    height: 38,
    width: 38,
    margin: 12,
  },
  button: {
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    textTransform: 'initial'
  }
});

class ExcelAppBar extends Component {

  constructor(props) {
    super(props);
    this.excel = props.context;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.props.fileName !== nextProps.fileName;
  }

  get hotInstance() {
    return this.excel.hotInstance;
  }

  render() {
    const {classes, onFileNameChange, fileName} = this.props;
    return (
      <AppBar position="static" color="default">
        <Grid container direction={"row"} justify={"flex-start"} alignItems={"flex-start"}>
          <Grid item xs={"auto"}>
            <FileTableOutline className={classes.icon}/>
          </Grid>
          <Grid item xs>
            <Grid container direction={"column"}>
              <Grid item xs={12}>
                <InputBase fullWidth
                           classes={{input: classes.input}}
                           value={fileName}
                           onChange={onFileNameChange}/>
              </Grid>
              <Grid container>
                <Button size="small" className={classes.button}>
                  File
                </Button>
                <Button size="small" className={classes.button}>
                  Edit
                </Button>
                <Button size="small" className={classes.button}>
                  View
                </Button>
                <Button size="small" className={classes.button}>
                  Help
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AppBar>
    )
  }
}

ExcelAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ExcelAppBar);
