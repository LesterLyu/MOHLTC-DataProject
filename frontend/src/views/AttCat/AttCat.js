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
      loading: true, openSetId: false,
    };
    this.showMessage = this.props.showMessage;
    this.dialogRef = React.createRef();
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

  handleClickOpen = () => {
    this.attCatManager.generateId(this.mode === 'att')
      .then(id => {
        this.dialogRef.current.setId(id);
      });
    this.setState({openSetId: true});
  };

  handleClose = () => {
    this.setState({openSetId: false});
  };

  handelAdd = (id, name, description) => {
    this.setState({openSetId: false});
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
      && this.state.openSetId === nextState.openSetId
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
          <CustomToolbar addClick={this.handleClickOpen}/>
        );
      },
      customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
        return (
          <CustomToolbarSelect selectedRows={selectedRows} onRowsDelete={this.handleDeleteRows}/>
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
          ref={this.dialogRef}
          open={this.state.openSetId}
          handleClose={this.handleClose}
          handelAdd={this.handelAdd}
          title={"Add " + key}
          showMessage={this.props.showMessage}
        />
      </React.Fragment>
    )
  }
}

AttCat.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AttCat);
