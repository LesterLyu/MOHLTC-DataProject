import React, {Component} from 'react';
import MUIDataTable from "mui-datatables";
import AttCatManager from "../../controller/attCatManager";
import {
  LinearProgress,
  Grid,
  Fade
} from "@material-ui/core";
import {withStyles} from "@material-ui/core";
import PropTypes from "prop-types";
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';

import CustomToolbar from "./components/CustomToolbar";
import CustomToolbarSelect from "./components/CustomToolbarSelect";
import AddDialog from "./components/AddDialog";
import AssignDialog from './components/AssignDialog';

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
    this.attCatManager = new AttCatManager(props);
    this.state = {
      loading: true, showAddDialog: false, showAssignDialog: false,
    };
    this.showMessage = this.props.showMessage;
    this.addDialogRef = React.createRef();
    this.assignDialogRef = React.createRef();
    this.getData();
  }

  getData() {
    this.attCatManager.get(this.mode === 'att')
      .then(data => {
        if (!data)
          return;
        this.setState({loading: false, data});
      })
  }

  // AddDialog methods
  openAddDialog = () => {
    this.attCatManager.generateId(this.mode === 'att')
      .then(id => {
        this.addDialogRef.current.setId(id);
      });
    this.setState({showAddDialog: true});
  };

  closeAddDialog = () => {
    this.setState({showAddDialog: false});
  };

  handleAdd = (id, name, description) => {
    this.setState({showAddDialog: false});
    this.attCatManager.add(this.mode === 'att', id, name, description)
      .then(data => {
        if (data.success) {
          this.showMessage(data.message, 'success');
        } else {
          this.showMessage(data.message, 'error')
        }
        this.getData();
      })
      .catch(err => {
        try {
          this.showMessage(err.response.data.message, 'error')
        } catch (e) {
          this.showMessage(err.message, 'error')
        }
      });
  };

  // Assign Dialog methods
  openAssignDialog = (selectedRows) => {
    const data = {};
    const indices = Object.keys(selectedRows.lookup);
    for (let i = 0; i < indices.length; i++) {
      // id => groups
      const item = this.state.data[indices[i]];
      data[item[0]] = item[4];
    }
    // check if every att/cat contains the same group
    const ids = Object.keys(data);
    const first = data[ids[0]];
    const groupSize = first.length;
    const haveSameGroups = ids.every(id => groupSize === data[id].length
      && data[id].every(group => first.includes(group)));

    this.attCatManager.getGroup(this.mode === 'att', 'label')
      .then(treeData => {
        this.assignDialogRef.current.setData(treeData, haveSameGroups ? first : []);
      });
    this.toAssignIds = ids;
    this.toAssignIndices = indices;
    this.assignDialogRef.current.open();
  };

  handleAssign = (groups) => {
    // this.props.showMessage('Saving...', 'info');
    this.attCatManager.assignGroups(this.mode === 'att', {ids: this.toAssignIds, groups})
      .then(data => this.props.showMessage(data.message, 'success'))
      .catch(err => this.props.showMessage(err.response.data.message, 'error'));

    const data = this.state.data;
    for (let i = 0; i < this.toAssignIndices.length; i++) {
      data[this.toAssignIndices[i]][4] = groups;
    }

    this.toAssignIds = null;
    this.toAssignIndices = null;
    this.assignDialogRef.current.close();
  };

  handleDeleteRows = (rowsDeleted) => {
    const ids = [];
    const indices = Object.keys(rowsDeleted.lookup);
    for (let i = 0; i < indices.length; i++) {
      ids.push(this.state.data[indices[i]][0])
    }
    return this.attCatManager.delete(this.mode === 'att', ids)
      .then(data => {
        if (data.success) {
          // remove from data array
          let newData = this.state.data.slice(0);
          newData = newData.filter(curr => !ids.includes(curr[0]));
          this.setState({data: newData});

          this.showMessage(data.message, 'success')
        } else {
          this.showMessage(data.message, 'error')
        }
      })
      .catch(err => {
        try {
          this.showMessage(err.response.data.message, 'error')
        } catch (e) {
          this.showMessage(err.message, 'error')
        }
      });
  };

  getMuiTheme = () => createMuiTheme({
    overrides: {
      MUIDataTable: {
        responsiveScroll: {
          maxHeight: 'calc(100vh - 270px)'
        }
      }
    }
  });

  /**
   * Override default behaviour to prevent some re-renders
   * @param nextProps
   * @param nextState
   * @param nextContent
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContent) {
    return !(this.state.loading === nextState.loading
      && this.state.showAddDialog === nextState.showAddDialog
      && this.state.showAssignDialog === nextState.showAssignDialog
      && this.state.data.length === nextState.data.length
      && this.state.id === nextState.id);
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
          <CustomToolbar addClick={this.openAddDialog}/>
        );
      },
      customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
        return (
          <CustomToolbarSelect selectedRows={selectedRows} onRowsDelete={this.handleDeleteRows}
                               openAssignDialog={this.openAssignDialog}/>
        )
      },
      onRowsDelete: this.handleDeleteRows,
    };

    const columns = [idTitle, "Name", "Description"];

    if (loading) {
      return (
        <div>
          <h3>Loading...</h3><br/>
          <LinearProgress variant="indeterminate"/>
        </div>
      );
    }
    return (
      <React.Fragment>
        <Fade in={true}>
          <Grid container>
            <Grid item xs={12} md={12} lg={10} xl={8}>
              <MuiThemeProvider theme={this.getMuiTheme()}>
                <MUIDataTable
                  title={title}
                  data={data}
                  columns={columns}
                  options={options}
                />
              </MuiThemeProvider>
            </Grid>
          </Grid>
        </Fade>
        <AddDialog
          ref={this.addDialogRef}
          open={this.state.showAddDialog}
          onClose={this.closeAddDialog}
          handelAdd={this.handleAdd}
          title={"Add " + key}
          showMessage={this.props.showMessage}
        />
        <AssignDialog
          ref={this.assignDialogRef}
          onSave={this.handleAssign}
        />
      </React.Fragment>
    )
  }
}

AttCat.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AttCat);
