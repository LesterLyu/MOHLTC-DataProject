import React, {Component} from 'react';
import MUIDataTable from "mui-datatables";
import WorkbookManager from "../../controller/workbookManager";
import {
  LinearProgress,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Snackbar,
} from "@material-ui/core";
import {withStyles} from "@material-ui/core/es";
import PropTypes from "prop-types";

import CustomToolbar from "./components/CustomToolbar";
import CustomSnackbarContent from "./components/CustomSnackbarContent";


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 10,
    // paddingTop: theme.spacing.unit * 2,
    // paddingBottom: theme.spacing.unit * 2,
  },
});

class AttCat extends Component {

  constructor(props) {
    super(props);
    this.mode = this.props.params.mode; // can be att or cat
    this.workbookManager = new WorkbookManager(props);
    this.queue = [];
    this.state = {
      loading: true, openDialog: false, openSnackbar: false, newValue: '',
      messageInfo: {}
    };
    this.getData();
  }

  getData() {
    this.workbookManager.get(this.mode)
      .then(data => {
        if (!data)
          return;
        this.setState({loading: false, data});
      })
  }

  // Snackbar methods
  showMessage = (message, variant) => {
    this.queue.push({
      message,
      variant,
      key: new Date().getTime(),
    });

    if (this.state.openSnackbar) {
      // immediately begin dismissing current message
      // to start showing new one
      this.setState({openSnackbar: false});
    } else {
      this.processQueue();
    }
  };

  processQueue = () => {
    if (this.queue.length > 0) {
      this.setState({
        messageInfo: this.queue.shift(),
        openSnackbar: true,
      });
    }
  };

  handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({openSnackbar: false});
  };

  handleExitedSnackbar = () => {
    this.processQueue();
  };


  // add dialog
  handleNewValue = name => event => {
    this.setState({[name]: event.target.value})
  };

  handleClickOpen = () => {
    this.setState({openDialog: true});
  };

  handleClose = () => {
    this.setState({openDialog: false});
  };

  handelAdd = () => {
    this.setState({openDialog: false});
    const newValue = document.querySelector('#description').value;
    this.workbookManager.add(this.mode, newValue)
      .then(data => {
        if (data.success) {
          this.showMessage(data.message, 'success')
        }
        else {
          this.showMessage(data.message, 'error')
        }
        this.getData();
        // this.setState({newValue: ''});
      })
      .catch(err => {
        try {
          this.showMessage(err.response.data.message, 'error')
        }
        catch (e) {
          this.showMessage(err)
        }
      });
  };

  handleDeleteRows = (rowsDeleted) => {
    const ids = [];
    const indices = Object.keys(rowsDeleted.lookup);
    for (let i = 0; i < indices.length; i++) {
      ids.push(this.state.data[indices[i]][0])
    }
    return this.workbookManager.delete(this.mode, ids)
      .then(data => {
        if (data.success) {
          // const data =
          // To-DO remove from data array
          this.showMessage(data.message, 'success')
        }
        else {
          this.showMessage(data.message, 'error')
        }
        // return true;
        // this.setState({newValue: ''});
      })
      .catch(err => {
        try {
          this.showMessage(err.response.data.message, 'error')
        }
        catch (e) {
          this.showMessage(err)
        }
      });
  };

  render() {
    const {classes} = this.props;
    const {loading, data, messageInfo} = this.state;
    const idTitle = this.mode === 'att' ? 'Attribute ID' : 'Category ID';
    const key = this.mode === 'att' ? 'attribute' : 'category';
    const title = this.mode === 'att' ? 'All Attributes' : 'All Categories';

    const options = {
      filter: false,
      selectableRows: true,
      responsive: "scroll",
      rowsPerPage: 10,
      customToolbar: () => {
        return (
          <CustomToolbar addClick={this.handleClickOpen}/>
        );
      },
      onRowsDelete: this.handleDeleteRows,
    };

    const columns = [idTitle, "Description"];

    if (loading) {
      return (
        <div className="animated fadeIn">
          <h3>Loading...</h3><br/>
          <LinearProgress variant="indeterminate"/>
        </div>
      );
    }
    return (
      <div className="animated fadeIn">
        <Grid container>
          <Grid item xs={12} md={10} lg={8} xl={6}>
            <MUIDataTable
              title={title}
              data={data}
              columns={columns}
              options={options}
            />
          </Grid>
        </Grid>

        <Dialog
          open={this.state.openDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{"Add " + key}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the description below.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="description"
              label="Description"
              type="text"
              // value={this.state.newValue}
              // onChange={this.handleNewValue('newValue')}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handelAdd} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.openSnackbar}
          autoHideDuration={6000}
          onClose={this.handleCloseSnackbar}
          onExited={this.handleExitedSnackbar}
        >
          <CustomSnackbarContent
            onClose={this.handleCloseSnackbar}
            variant={messageInfo.variant}
            message={messageInfo.message}
          />
        </Snackbar>
      </div>
    )
  }
}

AttCat.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AttCat);
