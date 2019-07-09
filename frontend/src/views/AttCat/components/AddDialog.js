import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Paper
} from "@material-ui/core";
import Draggable from 'react-draggable';

function PaperComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

class AddDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      id: 'gathering ID...',
      name: '',
      description: '',
    };
  }

  setId = id => {
    this.setState({id})
  };

  handleChange = name => e => {
    this.setState({[name]: e.target.value});
  };

  onClickAdd = () => {
    if (isNaN(this.state.id) || Number(this.state.id).toString() !== this.state.id + '') {
      this.props.showMessage('ID must be an integer', 'error');
    } else if (this.state.name === '') {
      this.props.showMessage('Name cannot be empty', 'error');
    } else {
      this.setState({
        name: '',
        description: '',
      });
      this.props.handelAdd(this.state.id, this.state.name, this.state.description);
    }
  };

  render() {
    const {open, handleClose, title} = this.props;
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby={title}
      >
        <DialogTitle style={{cursor: 'move'}}>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the ID, name below.
          </DialogContentText>
          <TextField
            margin="dense"
            label="ID"
            type="text"
            value={this.state.id}
            required
            onChange={this.handleChange('id')}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            required
            value={this.state.name}
            onChange={this.handleChange('name')}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            value={this.state.description}
            onChange={this.handleChange('description')}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.onClickAdd} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default AddDialog;
