import React, {Component} from "react";
import PropTypes from 'prop-types';
import {withStyles} from "@material-ui/core/es/styles";
import {
  Grid,
  Divider,
  Paper,
  Typography, LinearProgress,
} from '@material-ui/core';
import './workbooks.css'

// custom components
import SheetCard from './components/SheetCard';
// custom controller
import WorkbookManager from '../../controller/workbookManager'

// david's dialog
// import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

// david's dialog


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
});

class Workbooks extends Component {
  constructor(props) {
    super(props);
    this.mode = this.props.params.mode; // can be user or admin
    this.state = {
      loading: true
      ,
      // david
      currentWorkbook: null,
      openAlertDialog: false,
    }
    ;
    this.workbookManager = new WorkbookManager(this.props);
  }

  filledWorkbooks() {
    const list = [];
    const filledWorkbooks = this.workbooks[0];
    for (let i = 0; i < filledWorkbooks.length; i++) {
      const name = filledWorkbooks[i].name;
      list.push(
        <Grid key={i} item>
          <SheetCard fileName={name} deleteCb={this.deleteWorkbookForUser} editHref={'/workbooks/fill/' + name}/>
        </Grid>
      )
    }
    return list;
  }

  unFilledWorkbooks() {
    const list = [];
    const workbooks = this.workbooks[1];
    for (let i = 0; i < workbooks.length; i++) {
      const name = workbooks[i].name;
      list.push(
        <Grid key={i} item>
          <SheetCard fileName={name} editHref={'/workbooks/fill/' + name}/>
        </Grid>
      )
    }
    return list;
  }

  allWorkbooks() {
    const list = [];
    const workbooks = this.workbooks;
    for (let i = 0; i < workbooks.length; i++) {
      const name = workbooks[i].name;
      list.push(
        <Grid key={i} item>
          <SheetCard fileName={name} deleteCb={this.deleteWorkbookForAdmin} editHref={'/workbooks/template/' + name}/>
        </Grid>
      )
    }
    return list;
  }

  // david
  handleAlertDialogCancel = () => {
    this.setState({openAlertDialog: false});
  };
  handleAlertDialogDelete = () => {
    this.setState({openAlertDialog: false});
    let workbook = this.state.currentWorkbook;
    if (!workbook) {
      return;
    }
    // continue to delete workbook
    this.workbookManager.deleteWorkbookForAdmin(workbook).then((data) => {
      if (!data) {
        this.props.showMessage('Something Error', 'error');
      } else {
        console.log("debugging: " + data.message);
        // FIXME: reload workbooks
        // Finally, return message about result and reload data from database
        this.componentDidMount();
        this.props.showMessage(data.message, 'success');
      }
    });
  };

  deleteWorkbookForUser(workbook) {
    console.log('user delete workbook ', workbook);
  }

  deleteWorkbookForAdmin = (workbook) => {
    // david
    // FIXME: firstly delete item from list, refresh workbooks list and ask for confirmation to delete
    this.setState({
      currentWorkbook: workbook,
      openAlertDialog: true,
    });
    // Second, if confirmed, delete workbook from database
    // if not, cancel the previous action
  };

  componentDidMount() {
    if (this.mode === 'user') {
      this.workbookManager.getAllWorkbooksForUser()
        .then(data => {
          if (!data)
            return;
          this.workbooks = data;
          this.setState({loading: false});
        })
    } else if (this.mode === 'admin') {
      this.workbookManager.getAllWorkbooksForAdmin()
        .then(data => {
          if (!data)
            return;
          this.workbooks = data;
          this.setState({loading: false});
        })
    }
  }
  ;

  render() {
    const {classes} = this.props;
    const {loading} = this.state;
    if (loading) {
      return (
        <div className="animated fadeIn">
          <h3>Loading...</h3><br/>
          <LinearProgress variant="indeterminate"/>
        </div>
      );
    } else if (this.mode === 'user') {
      return (
        <div className="animated fadeIn">
          <Paper className={classes.root} elevation={1}>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Empty Workbooks
                </Typography>
              </Grid>
              {this.unFilledWorkbooks()}
            </Grid>
            <br/>
            <Divider/><br/>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Filled Workbooks
                </Typography>
              </Grid>
              {this.filledWorkbooks()}
            </Grid>

          </Paper>
        </div>
      )
    } else if (this.mode === 'admin') {
      return (
        <div className="animated fadeIn">
          <Paper className={classes.root} elevation={1}>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  All Workbooks
                </Typography>
              </Grid>
              {this.allWorkbooks()}
            </Grid>
          </Paper>

          // david
          <Dialog
            open={this.state.openAlertDialog}
            TransitionComponent={Transition}
            keepMounted
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle id="alert-dialog-slide-title">
              {"Confirm delete ?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                Are you sure you want to delete <strong>{this.state.currentWorkbook}</strong>? <br/>
                This process cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleAlertDialogCancel} color="primary">
                Cancel
              </Button>
              <Button onClick={this.handleAlertDialogDelete} color="primary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )
    } else {
      return (
        <Typography variant="h6" gutterBottom>
          Error: Illegal params.
        </Typography>
      )

    }

  }

}

Workbooks.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Workbooks);
