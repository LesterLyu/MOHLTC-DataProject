import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Paper, Grid, Typography, Button
} from '@material-ui/core';
import {adminGetPackage, userGetPackage} from "../../controller/package";
import PackageCard from './components/Card';
import Loading from "../components/Loading";
import {buildErrorParams} from "../../controller/common";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

export default function PackageView(props) {
  const {params, showMessage} = props;
  const admin = params.mode === 'admin';
  const packageName = props.match.params.name;
  const classes = useStyles();
  const [values, setValues] = React.useState({
    data: null,
  });

  useEffect(() => {
    (admin ? adminGetPackage : userGetPackage)(packageName)
      .then(data => setValues(values => ({...values, data})))
      .catch(e => showMessage(...buildErrorParams(e)))

  }, [packageName, admin, showMessage]);

  const allWorkbooks = () => {
    const list = [];
    if (values.data == null) return <Loading message="Loading Package..."/>;
    const {workbooks} = values.data;
    for (let i = 0; i < workbooks.length; i++) {
      const name = workbooks[i].name;
      list.push(
        <Grid key={i} item>
          <PackageCard type="excel" fileName={name} editHref={'/packages/' + packageName + '/' + name}/>
        </Grid>
      )
    }
    return list;
  };

  return (
    <Paper className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {packageName}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {values.data ? ('Note: ' + values.data.adminNotes) : ''}
          </Typography>
        </Grid>
        {allWorkbooks()}
      </Grid>
      <br/>
      {admin ? null : <Button variant="contained" color="primary">Submit</Button>}
    </Paper>)
}
