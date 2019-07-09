import React, {Component} from 'react';
import MUIDataTable from "mui-datatables";
import AttCatManager from "../../controller/attCatManager";
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
} from "@material-ui/core";
import {withStyles} from "@material-ui/core/es";
import PropTypes from "prop-types";

import CustomToolbar from "./components/CustomToolbar";


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
    this.workbookManager = new AttCatManager(props);
    this.state = {
      loading: true, openSetId: false, newValue: '',
    };
    this.showMessage = this.props.showMessage;
    this.getData();
  }

  getData() {
    this.workbookManager.get(this.mode === 'att')
      .then(data => {
        if (!data)
          return;
        this.setState({loading: false, data});
      })
  }

  // add dialog
  handleNewValue = name => event => {
    this.setState({[name]: event.target.value})
  };

  handleClickOpen = () => {
    this.setState({openSetId: true});
  };

  handleClose = () => {
    this.setState({openSetId: false});
  };

  handelAdd = () => {
    this.setState({openSetId: false});
    const newValue = document.querySelector('#description').value;
    this.workbookManager.add(this.mode === 'att', newValue)
      .then(data => {
        if (data.success) {
          this.showMessage(data.message, 'success');
        }
        else {
          this.showMessage(data.message, 'error')
        }
        this.getData();
      })
      .catch(err => {
        try {
          this.showMessage(err.response.data.message, 'error')
        }
        catch (e) {
          this.showMessage(err.message, 'error')
        }
      });
  };

  handleDeleteRows = (rowsDeleted) => {
    const ids = [];
    const indices = Object.keys(rowsDeleted.lookup);
    for (let i = 0; i < indices.length; i++) {
      ids.push(this.state.data[indices[i]][0])
    }
    return this.workbookManager.delete(this.mode === 'att', ids)
      .then(data => {
        if (data.success) {
          // remove from data array
          let newData = this.state.data.slice(0);
          newData = newData.filter(curr => !ids.includes(curr[0]));
          this.setState({data: newData});

          this.showMessage(data.message, 'success')
        }
        else {
          this.showMessage(data.message, 'error')
        }
      })
      .catch(err => {
        try {
          this.showMessage(err.response.data.message, 'error')
        }
        catch (e) {
          this.showMessage(err.message, 'error')
        }
      });
  };

  /**
   * Override default behaviour to prevent some re-renders
   * @param nextProps
   * @param nextState
   * @param nextContent
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContent) {
    return !(this.state.loading === nextState.loading
      && this.state.openSetId === nextState.openSetId
      && this.state.data.length === nextState.data.length);
  }

  render() {
    const {loading, data} = this.state;
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

    const columns = [idTitle, "name", "Description"];

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
          open={this.state.openSetId}
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

      </div>
    )
  }
}

AttCat.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AttCat);
