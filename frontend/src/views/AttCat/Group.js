import React, {Component} from 'react';
import AttCatManager from "../../controller/attCatManager";
import {
  Grid,
  Button,
  AppBar,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import {withStyles} from "@material-ui/core/es";
import PropTypes from "prop-types";
import SortableTree, {toggleExpandedForAll, addNodeUnderParent, removeNodeAtPath} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import {UnfoldLess, UnfoldMore, Add, Search, NavigateBefore, NavigateNext, Delete} from "@material-ui/icons";
import {ToolBarDivider} from "../Excel/components/ExcelToolBarUser";
import Loading from '../components/Loading';

const styles = theme => ({
  button: {
    minWidth: 40,
  },
  leftIcon: {
    paddingRight: 5,
  },
  tree: {
    height: 'calc(100vh - 170px)',
    paddingTop: 10,
    overflow: "auto"
  },
  search: {
    paddingLeft: 10,
  }
});

class AttCatGroup extends Component {

  constructor(props) {
    super(props);
    this.mode = this.props.params.mode; // can be att or cat
    this.attCatManager = new AttCatManager(props);
    this.state = {
      loading: true,
      treeData: [],
      searchQuery: '',
      searchFocusOffset: 0,
      searchFoundCount: null,
      dialog: false,
      dialogValue: '',
    };
    this.showMessage = this.props.showMessage;
    this.attCatManager.getGroup(this.mode === 'att').then(data => {
      console.log('set', data);
      this.setState({
        loading: false,
        treeData: data
      })
    })
  }

  /**
   * Save to backend.
   * @param treeData
   */
  save = async treeData => {
    if (!treeData) treeData = this.state.treeData;
    try {
      await this.attCatManager.updateGroup(this.mode === 'att', treeData);
      return true;
    } catch (err) {
      this.props.showMessage(err.response.data.message, 'error');
      return false;
    }
  };

  delete = (_id, path) => () => {
    this.attCatManager.removeAttributeGroup(this.mode === 'att', _id)
      .then(res => {
        const treeData = removeNodeAtPath({treeData: this.state.treeData, path, getNodeKey: this.getNodeKey});
        this.showMessage(res.message, 'success');
        this.setState({treeData});
      })
      .catch(err => {
        console.log(err);
        this.props.showMessage(err.response ? err.response.data.message : err.message, 'error');
      })
  };

  getNodeKey = ({node, treeIndex}) => {
    return node._id;
  };

  add = events => {
    this.setState({dialog: true});
  };

  expand = expanded => {
    this.setState({treeData: toggleExpandedForAll({treeData: this.state.treeData, expanded})})
  };

  onSearchValueChange = event => {
    this.setState({searchQuery: event.target.value})
  };

  selectPrevMatch = () => {
    const {searchFocusOffset, searchFoundCount} = this.state;
    this.setState({
      searchFocusOffset:
        searchFocusOffset !== null
          ? (searchFoundCount + searchFocusOffset - 1) % searchFoundCount
          : searchFoundCount - 1,
    });
  };

  selectNextMatch = () => {
    const {searchFocusOffset, searchFoundCount} = this.state;
    this.setState({
      searchFocusOffset:
        searchFocusOffset !== null
          ? (searchFocusOffset + 1) % searchFoundCount
          : 0,
    });
  };

  handleCloseDialog = () => {
    this.setState({dialog: false})
  };

  handleDialogAdd = () => {
    const dialogValue = this.state.dialogValue;
    this.setState({dialog: false, dialogValue: ''});
    this.attCatManager.generateObjectId()
      .then(ids => {
        const {treeData} = addNodeUnderParent({
          treeData: this.state.treeData, newNode: {
            title: dialogValue,
            _id: ids[0]
          }
        });
        this.save(treeData).then(success => {
          if (success) this.setState({treeData});
        })
      })
  };

  onDialogValueChange = event => {
    this.setState({dialogValue: event.target.value})
  };

  dialog = () => {
    return (
      <Dialog open={this.state.dialog} onClose={this.handleCloseDialog} aria-labelledby="add-dialog">
        <DialogTitle id="form-dialog-title">Add Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the group name:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            value={this.state.dialogValue}
            onChange={this.onDialogValueChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleDialogAdd} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    )
  };

  render() {
    const {classes} = this.props;
    const {searchFocusOffset, searchQuery} = this.state;
    if (this.state.loading) {
      return <Loading/>;
    }
    return (
      <Paper>
        <AppBar position="static" color="default" style={{}}>
          <Grid container className={classes.root}>
            <Button aria-label="Add" className={classes.button}
                    onClick={this.add}>
              <Add fontSize="small"/>
            </Button>
            <ToolBarDivider/>
            <Button aria-label="Collapse All" className={classes.button}
                    onClick={() => this.expand(false)}>
              <UnfoldLess fontSize="small" className={classes.leftIcon}/>
              Collapse All
            </Button>
            <Button aria-label="Expand All" className={classes.button}
                    onClick={() => this.expand(true)}>
              <UnfoldMore fontSize="small" className={classes.leftIcon}/>
              Expand All
            </Button>
            <ToolBarDivider/>
            <TextField
              className={classes.search}
              value={this.state.searchQuery}
              onChange={this.onSearchValueChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search/>
                  </InputAdornment>
                ),
              }}
            />
            <Button aria-label="Expand All" className={classes.button}
                    onClick={this.selectPrevMatch}>
              <NavigateBefore fontSize="small"/>
            </Button>
            <Button aria-label="Expand All" className={classes.button}
                    onClick={this.selectNextMatch}>
              <NavigateNext fontSize="small"/>
            </Button>
          </Grid>
        </AppBar>
        <div className={classes.tree}>
          <SortableTree
            treeData={this.state.treeData}
            onChange={treeData => {
              this.setState({treeData});
            }}
            onMoveNode={data => {
              this.save();
            }}
            getNodeKey={this.getNodeKey}
            searchQuery={searchQuery}
            searchFocusOffset={searchFocusOffset}
            searchFinishCallback={matches => {
              this.setState({
                searchFoundCount: matches.length,
                searchFocusOffset:
                  matches.length > 0 ? searchFocusOffset % matches.length : 0,
              })
            }}
            generateNodeProps={({node, path}) => {
              return {
                buttons: [
                  <IconButton aria-label="Delete this group" onClick={this.delete(node._id, path)}>
                    <Delete fontSize="small"/>
                  </IconButton>
                ]
              };
            }}
          />
        </div>
        {this.dialog()}
      </Paper>
    )
  }
}

AttCatGroup.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AttCatGroup);
