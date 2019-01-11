import React, {Component} from "react";
import PropTypes from 'prop-types';
import {withStyles} from "@material-ui/core/es/styles";
import {
  Grid,
  Divider,
  Paper,
  Typography, LinearProgress,
} from '@material-ui/core';
import './workbooks.css'

// custom components
import SheetCard from './components/SheetCard';
// custom controller
import WorkbookManager from '../../controller/workbookManager'

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
});

class Workbooks extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
    WorkbookManager.getAllWorkbooks()
      .then(data => {
        this.workbooks = data;
        this.setState({loading: false});
      })
  }

  filledWorkbooks() {
    const list = [];
    const filledWorkbooks = this.workbooks[0].filledWorkbooks;
    for (let i = 0; i < filledWorkbooks.length; i++) {
      const name = filledWorkbooks[i].name;
      list.push(
        <Grid key={i} item>
          <SheetCard fileName={name} editHref={'/workbooks/fill/' + name}/>
        </Grid>
      )
    }
    return list;
  }

  unFilledWorkbooks() {
    const list = [];
    const workbooks = this.workbooks[1].workbooks;
    for (let i = 0; i < workbooks.length; i++) {
      const name = workbooks[i].name;
      list.push(
        <Grid key={i} item>
          <SheetCard fileName={name} editHref={'/workbooks/fill/' + name}/>
        </Grid>
      )
    }
    return list;
  }

  render() {
    const {classes} = this.props;
    const {loading} = this.state;
    if (loading) {
      return (
        <div className="animated fadeIn">
          <h3>Loading...</h3><br/>
          <LinearProgress variant="indeterminate"/>
        </div>
      );
    }
    else {
      return (
        <div className="animated fadeIn">
          <Paper className={classes.root} elevation={1}>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Empty Workbooks
                </Typography>
              </Grid>
              {this.unFilledWorkbooks()}
            </Grid>
            <br/>
            <Divider/><br/>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Filled Workbooks
                </Typography>
              </Grid>
              {this.filledWorkbooks()}
            </Grid>
          </Paper>
        </div>
      )
    }
  }

}

Workbooks.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Workbooks);
