import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper
} from "@material-ui/core";
import Draggable from 'react-draggable';
import DropdownTreeSelect from "react-dropdown-tree-select";
import 'react-dropdown-tree-select/dist/styles.css'
import "./assignTree.css";

function PaperComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const forEachNode = (tree, cb) => {
  tree.forEach(child => {
    cb(child);
    if (Array.isArray(child.children))
      forEachNode(child.children, cb);
  });
};

class AssignDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      open: false
    };
    this.selectedNodes = [];
  }

  open = () => {
    this.setState({open: true});
  };

  close = () => {
    this.setState({open: false, treeData: []});
  };

  /**
   * @param {{}} treeData
   * @param {Array} groups
   */
  setData = (treeData, groups) => {
    forEachNode(treeData, node => {
      if (groups.includes(node._id)) {
        node.checked = true;
      }
      node.value = node._id;
    });
    this.setState({treeData});
  };

  handleChange = (currentNode, selectedNodes) => {
    this.selectedNodes = selectedNodes;
  };

  save = () => {
    const {onSave} = this.props;
    const groups = this.selectedNodes.map(node => node.value);
    onSave(groups);
  };

  render() {
    return (
      <Dialog
        open={this.state.open}
        onClose={this.close}
        PaperComponent={PaperComponent}
        aria-labelledby={'Assign groups'}
        fullWidth={true}
      >
        <DialogTitle style={{cursor: 'move'}}>{'Assign groups'}</DialogTitle>
        <DialogContent style={{maxHeight: '90vh', minHeight: '50vh'}}>
          <DialogContentText>
            Select the groups you want:
          </DialogContentText>
          <DropdownTreeSelect mode={"hierarchical"} showDropdown={"always"} data={this.state.treeData}
                              onChange={this.handleChange} className="mdl-demo"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.close} color="primary">
            Cancel
          </Button>
          <Button onClick={this.save} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default AssignDialog;
