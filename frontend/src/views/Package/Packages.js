import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Paper,
  Grid,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fade,
} from '@material-ui/core';
import {
  adminGetPackages, userGetPackages, adminDeletePackage
} from "../../controller/package";
import PackageCard from './components/Card';
import Loading from "../components/Loading";
import PackagePicker from "./components/Picker";

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
    picker: null,
    selectedName: null,
    organizations: [],
    pickedPackage: null
  });

  useEffect(() => {
    if (params.mode === 'admin') {
      adminGetPackages().then(packages => setValues(values => ({...values, packages})));
    } else if (params.mode === 'user') {
      userGetPackages().then(packages => setValues(values => ({...values, packages})));
    }
  }, [params.mode]);

  const allPackages = () => {
    const list = [];
    const {packages} = values;
    if (packages == null) return <Loading message="Loading Packages..."/>;
    for (let i = 0; i < packages.length; i++) {
      const name = packages[i].name;
      list.push(
        <Grid key={i} item>
          <PackageCard type="package" fileName={name} deleteCb={params.mode === 'admin' ? openDialog : undefined}
                       onOpen={onOpen} openParams={[packages[i]]}
          />
        </Grid>
      )
    }
    return list;
  };

  const onOpen = (name, pack) => e => {
    if (params.mode === "admin") {
      // props.history.push('/admin/packages/' + name);
      openPicker(pack, e.target);
    }
    else
      props.history.push('/packages/' + name);
  };

  const closeDialog = () => setValues(values => ({...values, dialog: false, selectedName: null}));
  const closePicker = () => setValues(values => ({...values, picker: null}));
  const openDialog = name => setValues(values => ({...values, dialog: true, selectedName: name}));

  const openPicker = (pack, anchorEl) => {
    const organizations = pack.organizations.map(org => org.name);
    if (organizations.length === 0) {
      console.log('No organizations');
    } else if (organizations.length === 1) {
      props.history.push('/admin/packages/' + pack.name + '/' + organizations[0]);
    } else {
      setValues(values => ({...values, organizations, picker: anchorEl, pickedPackage: pack}))
    }
  };

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

  const handlePick = (org) => {
    props.history.push('/admin/packages/view/' + values.pickedPackage.name + '/' + org);
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
        <PackagePicker
          anchorEl={values.picker}
          onClose={closePicker}
          onSelect={handlePick}
          options={values.organizations}
          title={'Pick an organization'}
        />
      </Paper>
    </Fade>)
}
