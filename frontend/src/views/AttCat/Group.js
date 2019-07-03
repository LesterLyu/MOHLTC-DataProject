import React, {Component} from 'react';
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
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 10,
    // paddingTop: theme.spacing.unit * 2,
    // paddingBottom: theme.spacing.unit * 2,
  },
});

class AttCatGroup extends Component {

  constructor(props) {
    super(props);
    this.mode = this.props.params.mode; // can be att or cat
    this.attCatManager = new AttCatManager(props);
    this.state = {
      loading: true,
      treeData: [],
    };
    this.showMessage = this.props.showMessage;
    this.attCatManager.getAttributeGroup().then(data => {
      console.log('set', data);
      this.setState({
        loading: false,
        treeData: data
      })
    })
  }


  render() {
    if (this.state.loading) {
      return (
        <div>
          <h3>Loading...</h3><br/>
          <LinearProgress variant="indeterminate"/>
        </div>
      );
    }
    return (
      <div style={{height: 400}}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={treeData => {
            this.setState({treeData});
            this.attCatManager.updateAttributeGroup(treeData);
          }}
        />
      </div>
    )
  }
}

AttCatGroup.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AttCatGroup);
