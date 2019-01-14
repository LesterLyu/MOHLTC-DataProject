import React, {Component} from 'react';
import MaterialTable from 'material-table'
import WorkbookManager from "../../controller/workbookManager";
import {LinearProgress, Grid} from "@material-ui/core";

class AttCat extends Component {

  constructor(props) {
    super(props);
    this.mode = this.props.params.mode; // can be att or cat
    this.workbookManager = new WorkbookManager(props);
    this.state = {loading: true};
    if (this.mode === 'att') {
      this.workbookManager.getAttributes()
        .then(data => {
          if (!data)
            return;
          this.setState({loading: false, data});
        })
    }
    else if (this.mode === 'cat') {
      this.workbookManager.getCategories()
        .then(data => {
          if (!data)
            return;
          this.setState({loading: false, data});
        })
    }
  }

  render() {
    const {loading, data} = this.state;
    const idTitle = this.mode === 'att' ? 'Attribute' : 'Category';
    const key = this.mode === 'att' ? 'attribute' : 'category';
    const title = this.mode === 'att' ? 'All Attributes' : 'All Category';

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
          <Grid item xs={12} md={8}>
            <MaterialTable
              columns={[
                {title: idTitle + ' ID', field: 'id'},
                {title: 'Description', field: key},
              ]}
              data={data}
              title={title}
            />
          </Grid>
        </Grid>

      </div>
    )
  }
}

export default AttCat;
