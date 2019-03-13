import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@material-ui/core";
import React, {Component} from "react";
import Select from 'react-select';

class SetIdDialog extends Component {

  render() {

    return (
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
    )
  }
}
