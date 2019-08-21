import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Paper, Grid, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Fade
} from '@material-ui/core';
import {adminGetPackages, userGetPackages, adminDeletePackage} from "../../controller/package";
import PackageCard from './components/Card';
import Loading from "../components/Loading";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

export default function CreatePackage(props) {
  const {params} = props;
  const classes = useStyles();
  const [values, setValues] = React.useState({
    packages: null,
    dialog: false,
    chooseDialog: false,
    selectedName: null,
  });

  useEffect(() => {
    if (values.packages === null) {
      if (params.mode === 'admin') {
        adminGetPackages().then(packages => setValues(values => ({...values, packages})));
      } else if (params.mode === 'user') {
        userGetPackages().then(packages => setValues(values => ({...values, packages})));
      }
    }
  });

  const allPackages = () => {
    const list = [];
    const {packages} = values;
    if (packages == null) return <Loading message="Loading Packages..."/>;
    for (let i = 0; i < packages.length; i++) {
      const name = packages[i].name;
      list.push(
        <Grid key={i} item>
          <PackageCard type="package" fileName={name} deleteCb={params.mode === 'admin' ? openDialog : undefined}
                       editHref={params.mode === 'admin' ? '/admin/packages/' + name : '/packages/' + name}/>
        </Grid>
      )
    }
    return list;
  };

  const closeDialog = () => setValues(values => ({...values, dialog: false, selectedName: null}));
  const closeChooseDialog = () => setValues(values => ({...values, chooseDialog: false}));
  const openDialog = name => setValues(values => ({...values, dialog: true, selectedName: name}));

  const handleConfirmDelete = () => {
    const name = values.selectedName;
    if (params.mode === 'admin') {
      adminDeletePackage(name).then(res => {
        closeDialog();
        setValues(values => ({...values, packages: values.packages.filter(p => p.name !== name)}));
        props.showMessage(res.message, 'success');
      }).catch(e => props.showMessage(e.toString() + '\nDetails: ' + e.response.data.message, 'error'));

    } else if (params.mode === 'user') {
      userGetPackages().then(packages => setValues(values => ({...values, packages})));
    }
  };

  const dialog = () => {
    return (
      <Dialog
        open={values.dialog}
        keepMounted
        onClose={closeDialog}
      >
        <DialogTitle>
          {"Confirm delete ?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{values.selectedName}</strong>? <br/>
            This process cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  };

  const chooseOrganizationDialog = () => {
    return (
      <Dialog
        open={values.chooseDialog}
        keepMounted
        onClose={closeChooseDialog}
      >
        <DialogTitle>
          {"Choose One"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose one organization:
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeChooseDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  };

  return (
    <Fade in>
      <Paper className={classes.container}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              All Packages
            </Typography>
          </Grid>
          {allPackages()}
        </Grid>
        <br/>
        {dialog()}
        {chooseOrganizationDialog()}
      </Paper>
    </Fade>)
}
