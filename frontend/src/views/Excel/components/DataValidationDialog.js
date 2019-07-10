import React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';

class DataValidationDialog extends React.Component {

  /**
   * @param {{errorMessage, errorStyle, errorTitle, open, handleRetry, handleClose}} props
   */
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  render() {
    let {errorMessage, errorStyle, errorTitle, open, handleRetry, handleClose} = this.props;
    if (!errorMessage)
      errorMessage = "The value doesn't match the data validation restrictions defined for this cell.";
    if (!errorTitle)
      errorTitle = 'Error';
    // errorStyle can be 'stop', 'information', 'warning'
    if (!errorStyle)
      errorStyle = 'stop';
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{errorTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRetry} color="primary">
            Retry
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DataValidationDialog;
